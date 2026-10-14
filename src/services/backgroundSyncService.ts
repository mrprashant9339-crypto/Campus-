import {
  createPostInFirestore,
  updatePostLikesInFirestore,
  saveNoteToFirestore,
  incrementNoteDownloadInFirestore,
  saveEventToFirestore,
  saveAnnouncementToFirestore,
  saveVerificationRequestToFirestore,
  saveUserToFirestore,
  saveUserVerificationToFirestore,
  saveSyncAuditRecordToFirestore,
} from '../firebase/service';

export type SyncActionType =
  | 'CREATE_POST'
  | 'LIKE_POST'
  | 'UPLOAD_NOTE'
  | 'INCREMENT_NOTE_DOWNLOAD'
  | 'REGISTER_EVENT'
  | 'BROADCAST_ANNOUNCEMENT'
  | 'SUBMIT_VERIFICATION'
  | 'UPDATE_PROFILE'
  | 'ATTENDANCE_RECORD';

export interface PendingSyncAction {
  id: string;
  type: SyncActionType;
  payload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  maxRetries: number;
  error?: string;
  lastAttemptAt?: string;
  description: string;
  userId?: string;
  collegeId?: string;
}

export interface SyncServiceStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  syncedCount: number;
  lastSyncAt: string | null;
}

const STORAGE_QUEUE_KEY = 'aavrit_background_sync_queue';
const STORAGE_HISTORY_KEY = 'aavrit_background_sync_history';

class BackgroundSyncService {
  private queue: PendingSyncAction[] = [];
  private history: PendingSyncAction[] = [];
  private listeners: Set<() => void> = new Set();
  private isSyncing = false;
  private lastSyncAt: string | null = null;
  private isSimulatedOffline = false;

  constructor() {
    this.loadState();
    this.initEventListeners();
  }

  private loadState() {
    try {
      if (typeof window !== 'undefined') {
        const storedQueue = localStorage.getItem(STORAGE_QUEUE_KEY);
        if (storedQueue) {
          this.queue = JSON.parse(storedQueue);
        }
        const storedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
        if (storedHistory) {
          this.history = JSON.parse(storedHistory);
        }
        this.lastSyncAt = localStorage.getItem('aavrit_last_sync_time') || null;
      }
    } catch (e) {
      console.warn('Could not load background sync queue from localStorage:', e);
      this.queue = [];
      this.history = [];
    }
  }

  private saveState() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(this.queue));
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(this.history.slice(0, 50)));
        if (this.lastSyncAt) {
          localStorage.setItem('aavrit_last_sync_time', this.lastSyncAt);
        }
      }
    } catch (e) {
      console.warn('Could not save background sync queue to localStorage:', e);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Sync listener error:', err);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private initEventListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('BackgroundSyncService: Native browser online event detected. Initiating auto-sync.');
      this.processSyncQueue();
    });

    // Background interval check for queued retries
    setInterval(() => {
      if (this.isOnline() && this.getPendingCount() > 0 && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 45000);
  }

  public setSimulatedOffline(isSimulated: boolean) {
    this.isSimulatedOffline = isSimulated;
    if (!isSimulated && this.isOnline()) {
      // Reconnected!
      setTimeout(() => {
        this.processSyncQueue();
      }, 300);
    }
    this.notifyListeners();
  }

  public isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine && !this.isSimulatedOffline;
  }

  public getPendingActions(): PendingSyncAction[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter((item) => item.status === 'pending' || item.status === 'failed').length;
  }

  public getSyncedHistory(): PendingSyncAction[] {
    return [...this.history];
  }

  public getStatus(): SyncServiceStatus {
    const pending = this.queue.filter((i) => i.status === 'pending').length;
    const failed = this.queue.filter((i) => i.status === 'failed').length;
    return {
      isOnline: this.isOnline(),
      isSyncing: this.isSyncing,
      pendingCount: pending,
      failedCount: failed,
      syncedCount: this.history.length,
      lastSyncAt: this.lastSyncAt,
    };
  }

  /**
   * Enqueues an action to be dispatched to Firebase Firestore.
   * If online, will attempt auto-sync shortly; if offline, stays securely in local queue.
   */
  public enqueueAction(
    type: SyncActionType,
    payload: any,
    meta: {
      description: string;
      userId?: string;
      collegeId?: string;
    }
  ): PendingSyncAction {
    const action: PendingSyncAction = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      maxRetries: 5,
      description: meta.description,
      userId: meta.userId,
      collegeId: meta.collegeId,
    };

    this.queue.unshift(action);
    this.saveState();

    // Try service worker background sync registration if available in browser
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((reg: any) => {
          if (reg?.sync?.register) {
            return reg.sync.register('aavrit-firestore-background-sync');
          }
        })
        .catch(() => {});
    }

    // If online, immediately process the queue
    if (this.isOnline()) {
      setTimeout(() => {
        this.processSyncQueue();
      }, 100);
    }

    return action;
  }

  /**
   * Pushes all pending offline actions to Firebase Firestore in sequence.
   */
  public async processSyncQueue(): Promise<{ total: number; succeeded: number; failed: number }> {
    if (this.isSyncing) {
      return { total: this.queue.length, succeeded: 0, failed: 0 };
    }

    const itemsToProcess = this.queue.filter(
      (action) => action.status === 'pending' || action.status === 'failed'
    );

    if (itemsToProcess.length === 0) {
      return { total: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    let succeeded = 0;
    let failed = 0;

    for (const action of itemsToProcess) {
      action.status = 'syncing';
      action.lastAttemptAt = new Date().toISOString();
      this.saveState();

      try {
        await this.dispatchToFirebase(action);
        action.status = 'synced';
        succeeded++;

        // Move to history log
        this.queue = this.queue.filter((q) => q.id !== action.id);
        this.history.unshift({
          ...action,
          status: 'synced',
        });
      } catch (err: any) {
        console.warn(`Sync action ${action.id} (${action.type}) failed:`, err);
        action.retryCount++;
        action.error = err?.message || 'Firebase transmission error';
        action.status = action.retryCount >= action.maxRetries ? 'failed' : 'pending';
        failed++;
      }
    }

    this.isSyncing = false;
    this.lastSyncAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Record background sync summary to Firestore if at least 1 succeeded
    if (succeeded > 0) {
      saveSyncAuditRecordToFirestore({
        totalActionsSynced: succeeded,
        processedAt: new Date().toISOString(),
        clientOnline: true,
      }).catch(() => {});
    }

    this.saveState();
    return { total: itemsToProcess.length, succeeded, failed };
  }

  /**
   * Routes a pending action to its respective Firebase Firestore function.
   */
  private async dispatchToFirebase(action: PendingSyncAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_POST':
        await createPostInFirestore(action.payload);
        break;

      case 'LIKE_POST':
        await updatePostLikesInFirestore(action.payload.postId, action.payload.likesCount);
        break;

      case 'UPLOAD_NOTE':
        await saveNoteToFirestore(action.payload);
        break;

      case 'INCREMENT_NOTE_DOWNLOAD':
        await incrementNoteDownloadInFirestore(action.payload.noteId, action.payload.count);
        break;

      case 'REGISTER_EVENT':
        await saveEventToFirestore(action.payload);
        break;

      case 'BROADCAST_ANNOUNCEMENT':
        await saveAnnouncementToFirestore(action.payload);
        break;

      case 'SUBMIT_VERIFICATION':
        await saveVerificationRequestToFirestore(action.payload);
        break;

      case 'UPDATE_PROFILE':
        await saveUserToFirestore(action.payload);
        break;

      case 'ATTENDANCE_RECORD':
        // Save attendance record to Firestore
        await saveSyncAuditRecordToFirestore({
          type: 'attendance_record',
          record: action.payload,
        });
        break;

      default:
        console.warn('Unknown background sync action type:', (action as any).type);
    }
  }

  public notifyConnectionRestored() {
    console.log('BackgroundSyncService: Connection manually marked restored. Triggering queue push.');
    this.processSyncQueue();
  }

  public async retryAction(actionId: string): Promise<boolean> {
    const action = this.queue.find((a) => a.id === actionId);
    if (!action) return false;

    action.status = 'syncing';
    this.saveState();

    try {
      await this.dispatchToFirebase(action);
      action.status = 'synced';
      this.queue = this.queue.filter((q) => q.id !== action.id);
      this.history.unshift({
        ...action,
        status: 'synced',
      });
      this.saveState();
      return true;
    } catch (err: any) {
      action.status = 'failed';
      action.error = err?.message || 'Manual retry failed';
      this.saveState();
      return false;
    }
  }

  public removeAction(actionId: string) {
    this.queue = this.queue.filter((a) => a.id !== actionId);
    this.saveState();
  }

  public clearSyncedHistory() {
    this.history = [];
    this.saveState();
  }
}

export const backgroundSyncService = new BackgroundSyncService();
