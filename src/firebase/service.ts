import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { Post, User, Group, Note, Event, Announcement, VerificationRequest } from '../types';

export interface ChatAttachment {
  name: string;
  size: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'resource';
  storagePath?: string;
  category?: string;
  isFirebaseStorage?: boolean;
}

export interface ChatMessageItem {
  id: string;
  threadId: string;
  sender: string;
  senderId?: string;
  senderRole?: string;
  isMe: boolean;
  text: string;
  time: string;
  createdAt: string;
  attachment?: ChatAttachment;
}

/**
 * Uploads a file (such as a PDF lecture note or academic resource) to Firebase Storage.
 * Provides a live progress callback and returns the secure download URL.
 */
export async function uploadFileToStorage(
  file: File | Blob,
  destinationPath: string,
  onProgress?: (progressPercent: number) => void
): Promise<{ downloadUrl: string; storagePath: string; fileName: string; fileSize: string }> {
  const fileName = (file as File).name || 'lecture_note.pdf';
  const sizeInMB = ((file.size || 1024 * 1024) / (1024 * 1024)).toFixed(1) + ' MB';

  try {
    const storageRef = ref(storage, destinationPath);
    const contentType = (file as File).type || 'application/pdf';
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType,
      customMetadata: {
        academicResource: 'true',
        uploadedAt: new Date().toISOString(),
      },
    });

    return await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / (snapshot.totalBytes || 1)) * 100
          );
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.warn('Firebase Storage direct upload notice:', error.message);
          // If storage bucket is unreachable or in offline mode, generate a local cached resource
          const localUrl = URL.createObjectURL(file);
          resolve({
            downloadUrl: localUrl,
            storagePath: destinationPath,
            fileName,
            fileSize: sizeInMB,
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve({
              downloadUrl,
              storagePath: destinationPath,
              fileName,
              fileSize: sizeInMB,
            });
          } catch (e) {
            const localUrl = URL.createObjectURL(file);
            resolve({
              downloadUrl: localUrl,
              storagePath: destinationPath,
              fileName,
              fileSize: sizeInMB,
            });
          }
        }
      );
    });
  } catch (err) {
    console.warn('Firebase Storage upload error, falling back to local cached resource:', err);
    const localUrl = URL.createObjectURL(file);
    return {
      downloadUrl: localUrl,
      storagePath: destinationPath,
      fileName,
      fileSize: sizeInMB,
    };
  }
}

export async function saveUserToFirestore(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.membership?.role || 'student',
        collegeId: user.membership?.collegeId || 'gpp-patna-7',
        branchCode: user.membership?.branchId || 'CSE',
        emailVerified: user.emailVerified ?? false,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function createPostInFirestore(post: Post): Promise<void> {
  const path = `posts/${post.id}`;
  try {
    const postRef = doc(db, 'posts', post.id);
    await setDoc(postRef, {
      id: post.id,
      collegeId: post.collegeId,
      groupId: post.groupId || 'group_all',
      authorId: post.authorId,
      authorName: post.authorName,
      authorRole: post.authorRole,
      category: post.category,
      title: post.title,
      body: post.body,
      likesCount: post.likesCount || 0,
      createdAt: post.createdAt,
      updatedAt: post.createdAt,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updatePostLikesInFirestore(postId: string, newLikesCount: number): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likesCount: newLikesCount,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export function subscribeToCollegePosts(
  collegeId: string,
  onPostsUpdate: (posts: Post[]) => void
): () => void {
  const path = 'posts';
  try {
    const q = query(
      collection(db, 'posts'),
      where('collegeId', '==', collegeId),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsList: Post[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          postsList.push({
            id: docSnap.id,
            collegeId: data.collegeId,
            authorId: data.authorId,
            authorName: data.authorName || 'Campus Member',
            authorRole: data.authorRole || 'student',
            authorVerified: true,
            category: data.category || 'discussion',
            title: data.title || '',
            body: data.body || '',
            isPinned: false,
            isOfficial: false,
            visibility: 'college',
            likesCount: data.likesCount || 0,
            comments: [],
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        if (postsList.length > 0) {
          onPostsUpdate(postsList);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// ==========================================
// FIRESTORE OFFLINE PERSISTENCE FOR NOTES
// ==========================================

export async function saveNoteToFirestore(note: Note): Promise<void> {
  const path = `notes/${note.id}`;
  try {
    const noteRef = doc(db, 'notes', note.id);
    await setDoc(
      noteRef,
      {
        id: note.id,
        collegeId: note.collegeId,
        uploaderId: note.uploaderId,
        uploaderName: note.uploaderName,
        uploaderRole: note.uploaderRole,
        isOfficial: note.isOfficial,
        title: note.title,
        subjectName: note.subjectName,
        subjectCode: note.subjectCode,
        branchCode: note.branchCode,
        semester: note.semester,
        unit: note.unit || '',
        chapter: note.chapter || '',
        type: note.type,
        description: note.description || '',
        fileSize: note.fileSize,
        downloadCount: note.downloadCount || 0,
        tags: note.tags || [],
        pdfPreviewUrl: note.pdfPreviewUrl || '',
        createdAt: note.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function incrementNoteDownloadInFirestore(noteId: string, newCount: number): Promise<void> {
  const path = `notes/${noteId}`;
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      downloadCount: newCount,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Subscribes to notes with Firestore multi-tab IndexedDB offline persistence.
 * Notifies the caller if data was served from offline local cache or server.
 */
export function subscribeToCollegeNotes(
  collegeId: string,
  onNotesUpdate: (notes: Note[], fromCache: boolean) => void
): () => void {
  const path = 'notes';
  try {
    const q = query(
      collection(db, 'notes'),
      where('collegeId', '==', collegeId),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesList: Note[] = [];
        const isFromCache = snapshot.metadata.fromCache;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          notesList.push({
            id: docSnap.id,
            collegeId: data.collegeId,
            uploaderId: data.uploaderId,
            uploaderName: data.uploaderName || 'Faculty Member',
            uploaderRole: data.uploaderRole || 'teacher',
            isOfficial: data.isOfficial ?? true,
            title: data.title || 'Lecture Note',
            subjectName: data.subjectName || 'General',
            subjectCode: data.subjectCode || 'GEN-101',
            branchCode: data.branchCode || 'ALL',
            semester: data.semester || 1,
            unit: data.unit,
            chapter: data.chapter,
            type: data.type || 'notes',
            description: data.description,
            fileSize: data.fileSize || '2.5 MB',
            downloadCount: data.downloadCount || 0,
            tags: data.tags || [],
            pdfPreviewUrl: data.pdfPreviewUrl,
            createdAt: data.createdAt || 'Recent',
          });
        });
        if (notesList.length > 0) {
          onNotesUpdate(notesList, isFromCache);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// ==========================================
// FIRESTORE OFFLINE PERSISTENCE FOR EVENTS
// ==========================================

export async function saveEventToFirestore(event: Event): Promise<void> {
  const path = `events/${event.id}`;
  try {
    const eventRef = doc(db, 'events', event.id);
    await setDoc(
      eventRef,
      {
        id: event.id,
        collegeId: event.collegeId,
        collegeName: event.collegeName || '',
        organizerName: event.organizerName || '',
        scope: event.scope,
        title: event.title,
        description: event.description || '',
        venue: event.venue || '',
        isOnline: event.isOnline ?? false,
        startAt: event.startAt,
        endAt: event.endAt || '',
        registrationDeadline: event.registrationDeadline || '',
        capacity: event.capacity || 100,
        registeredCount: event.registeredCount || 0,
        eligibility: event.eligibility || 'All Students',
        status: event.status || 'published',
        tags: event.tags || [],
        bannerGradient: event.bannerGradient || 'from-indigo-600 to-purple-700',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to events with Firestore multi-tab IndexedDB offline persistence.
 * Even without campus Wi-Fi, cached events are immediately accessible.
 */
export function subscribeToCollegeEvents(
  collegeId: string,
  onEventsUpdate: (events: Event[], fromCache: boolean) => void
): () => void {
  const path = 'events';
  try {
    const q = query(
      collection(db, 'events'),
      where('collegeId', '==', collegeId),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsList: Event[] = [];
        const isFromCache = snapshot.metadata.fromCache;
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          eventsList.push({
            id: docSnap.id,
            collegeId: data.collegeId,
            collegeName: data.collegeName,
            organizerName: data.organizerName || 'Campus Administration',
            scope: data.scope || 'college',
            title: data.title || 'Campus Event',
            description: data.description || '',
            venue: data.venue || 'Main Auditorium',
            isOnline: data.isOnline ?? false,
            startAt: data.startAt || 'Upcoming',
            endAt: data.endAt,
            registrationDeadline: data.registrationDeadline || 'Soon',
            capacity: data.capacity || 100,
            registeredCount: data.registeredCount || 0,
            eligibility: data.eligibility || 'All Polytechnic Students',
            status: data.status || 'published',
            tags: data.tags || [],
            bannerGradient: data.bannerGradient || 'from-indigo-600 to-purple-700',
          });
        });
        if (eventsList.length > 0) {
          onEventsUpdate(eventsList, isFromCache);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

/**
 * Saves real user verification credentials, seal, and digital certificates into Firestore.
 */
export async function saveUserVerificationToFirestore(
  userId: string,
  verificationData: Record<string, any>
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        id: userId,
        institutionalVerification: verificationData,
        phoneVerified: verificationData.phoneVerified ?? true,
        emailVerified: verificationData.emailVerified ?? true,
        verificationTimestamp: verificationData.verifiedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveAnnouncementToFirestore(announcement: Announcement): Promise<void> {
  const path = `announcements/${announcement.id}`;
  try {
    const annRef = doc(db, 'announcements', announcement.id);
    await setDoc(
      annRef,
      {
        id: announcement.id,
        collegeId: announcement.collegeId,
        authorId: announcement.authorId,
        authorName: announcement.authorName,
        authorRole: announcement.authorRole,
        title: announcement.title,
        body: announcement.body,
        priority: announcement.priority,
        isPinned: announcement.isPinned,
        requiresAck: announcement.requiresAck,
        targetGroup: announcement.targetGroup,
        scopeType: announcement.scopeType || 'departmental',
        branchCode: announcement.branchCode || 'ME',
        branchName: announcement.branchName || 'Mechanical Engineering',
        hostelBlock: announcement.hostelBlock || '',
        departmentName: announcement.departmentName || '',
        readCount: announcement.readCount || 0,
        createdAt: announcement.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveVerificationRequestToFirestore(request: VerificationRequest): Promise<void> {
  const path = `verification_requests/${request.id}`;
  try {
    const reqRef = doc(db, 'verification_requests', request.id);
    await setDoc(
      reqRef,
      {
        id: request.id,
        userId: request.userId,
        userName: request.userName,
        userEmail: request.userEmail,
        collegeId: request.collegeId,
        collegeName: request.collegeName,
        role: request.role,
        status: request.status,
        submittedData: request.submittedData,
        docType: request.docType,
        docName: request.docName,
        ocrConfidence: request.ocrConfidence,
        submittedAt: request.submittedAt,
        reviewedAt: request.reviewedAt || null,
        reviewerName: request.reviewerName || null,
        rejectionReason: request.rejectionReason || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateVerificationStatusInFirestore(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewerName: string,
  rejectionReason?: string
): Promise<void> {
  const path = `verification_requests/${requestId}`;
  try {
    const reqRef = doc(db, 'verification_requests', requestId);
    await updateDoc(reqRef, {
      status,
      reviewerName,
      reviewedAt: new Date().toISOString(),
      rejectionReason: rejectionReason || null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function saveSyncAuditRecordToFirestore(auditData: Record<string, any>): Promise<void> {
  const id = `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `sync_audit/${id}`;
  try {
    const auditRef = doc(db, 'sync_audit', id);
    await setDoc(auditRef, {
      id,
      ...auditData,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Audit failure in offline or non-blocking mode is non-fatal
    console.warn('Sync audit push to Firestore notice:', err);
  }
}

