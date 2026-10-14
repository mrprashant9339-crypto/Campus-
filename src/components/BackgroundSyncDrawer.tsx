import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wifi,
  WifiOff,
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  X,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { backgroundSyncService, PendingSyncAction } from '../services/backgroundSyncService';

interface BackgroundSyncDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackgroundSyncDrawer: React.FC<BackgroundSyncDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    isOffline,
    toggleOfflineSimulation,
    isFirebaseConnected,
    firebaseUser,
    currentCollege,
  } = useApp();

  const [actions, setActions] = useState<PendingSyncAction[]>(() =>
    backgroundSyncService.getPendingActions()
  );
  const [history, setHistory] = useState<PendingSyncAction[]>(() =>
    backgroundSyncService.getSyncedHistory()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  React.useEffect(() => {
    const unsub = backgroundSyncService.subscribe(() => {
      setActions(backgroundSyncService.getPendingActions());
      setHistory(backgroundSyncService.getSyncedHistory());
      const status = backgroundSyncService.getStatus();
      setIsSyncing(status.isSyncing);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleForceSync = async () => {
    setIsSyncing(true);
    await backgroundSyncService.processSyncQueue();
    setIsSyncing(false);
  };

  const handleRetry = async (id: string) => {
    await backgroundSyncService.retryAction(id);
  };

  const handleRemove = (id: string) => {
    backgroundSyncService.removeAction(id);
  };

  const pendingCount = actions.filter((a) => a.status === 'pending' || a.status === 'failed').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-white border-l border-[#141414]/15 shadow-2xl flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="p-4 bg-[#F8F7F4] border-b border-[#141414]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border border-[#141414]/15 flex items-center justify-center text-[#2563eb]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#141414] font-serif tracking-tight">
                Offline Sync & Firebase Vault
              </div>
              <div className="text-[10px] text-[#141414]/60">
                Tenant: {currentCollege.name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 text-[#141414]/70 hover:text-[#141414] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Network & Persistence Status Card */}
        <div className="p-4 border-b border-[#141414]/10 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#141414]/60">
              Campus Link Status
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 ${
                isOffline
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>{isOffline ? 'OFFLINE CACHING ACTIVE' : 'ONLINE TO FIREBASE'}</span>
            </span>
          </div>

          <div className="text-[11px] text-[#141414]/70 bg-[#F8F7F4] p-2.5 border border-[#141414]/10 space-y-1">
            <div className="flex items-center justify-between">
              <span>Cloud Target:</span>
              <span className="font-bold text-[#141414]">Firestore Multi-Tab Cache</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Firebase Auth User:</span>
              <span className="font-bold text-[#2563eb] max-w-[170px] truncate">
                {firebaseUser ? firebaseUser.email : 'Local Guest Session'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending Action Queue:</span>
              <span className="font-bold text-[#b45309]">{pendingCount} action(s)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleOfflineSimulation}
              className={`flex-1 py-1.5 px-3 border font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                isOffline
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
            >
              {isOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOffline ? 'RESTORE CAMPUS WI-FI' : 'SIMULATE WI-FI OUTAGE'}</span>
            </button>

            <button
              onClick={handleForceSync}
              disabled={isSyncing || pendingCount === 0 || isOffline}
              className={`py-1.5 px-3 border flex items-center justify-center gap-1.5 transition font-semibold cursor-pointer ${
                isSyncing || pendingCount === 0 || isOffline
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-[#141414] text-white hover:bg-[#2563eb] border-[#141414]'
              }`}
              title={isOffline ? 'Cannot push while in simulated offline mode' : 'Push all pending actions now'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'SYNCING...' : 'SYNC NOW'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#141414]/10 bg-[#F8F7F4]">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition ${
              activeTab === 'pending'
                ? 'border-[#2563eb] text-[#2563eb] bg-white'
                : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
            }`}
          >
            Pending Queue ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition ${
              activeTab === 'history'
                ? 'border-[#2563eb] text-[#2563eb] bg-white'
                : 'border-transparent text-[#141414]/60 hover:text-[#141414]'
            }`}
          >
            Synced History ({history.length})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'pending' ? (
            actions.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-[#141414]/50">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <div className="font-bold text-sm text-[#141414]">No Pending Actions</div>
                <p className="text-[11px] max-w-xs mx-auto">
                  All posts, note uploads, and event registrations are synchronized with Firebase Firestore.
                </p>
              </div>
            ) : (
              actions.map((action) => (
                <div
                  key={action.id}
                  className="p-3 bg-white border border-[#141414]/15 rounded shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[#141414] text-[11px]">
                      {action.description || action.type}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                        action.status === 'syncing'
                          ? 'bg-blue-100 text-blue-700 animate-pulse'
                          : action.status === 'failed'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#141414]/60 flex items-center justify-between">
                    <span>Type: {action.type}</span>
                    <span>Queued: {new Date(action.createdAt).toLocaleTimeString()}</span>
                  </div>

                  {action.error && (
                    <div className="text-[10px] text-rose-700 bg-rose-50 p-1.5 border border-rose-200 rounded flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{action.error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleRemove(action.id)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Discard action"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {!isOffline && (
                      <button
                        onClick={() => handleRetry(action.id)}
                        className="px-2 py-0.5 bg-slate-900 text-white hover:bg-[#2563eb] rounded text-[10px] transition"
                      >
                        Push Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-[#141414]/50">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <div className="font-bold">No Sync History Yet</div>
              <p className="text-[11px] mt-1">Actions pushed to Firebase will appear here.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded text-[11px] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-950 truncate max-w-[220px]">
                    {item.description || item.type}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    SYNCED
                  </span>
                </div>
                <div className="text-[10px] text-emerald-800/70 flex items-center justify-between">
                  <span>Type: {item.type}</span>
                  <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8F7F4] border-t border-[#141414]/10 flex items-center justify-between text-[10px] text-[#141414]/60">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Local Persistence Guaranteed</span>
          </span>
          {history.length > 0 && (
            <button
              onClick={() => backgroundSyncService.clearSyncedHistory()}
              className="text-[#cc0000] hover:underline cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
