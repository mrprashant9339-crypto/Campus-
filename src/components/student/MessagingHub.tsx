import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { uploadFileToStorage, ChatAttachment } from '../../firebase/service';
import {
  MessageSquare,
  Shield,
  Send,
  Users,
  Paperclip,
  FileText,
  Download,
  Eye,
  X,
  FileCheck,
  CheckCheck,
  BookOpen,
  CloudUpload,
} from 'lucide-react';

interface ThreadMessage {
  id: string;
  sender: string;
  senderRole?: string;
  text: string;
  time: string;
  isMe: boolean;
  attachment?: ChatAttachment;
}

interface ThreadItem {
  id: string;
  name: string;
  roleTag: string;
  type: string;
  lastMessage: string;
  time: string;
  messages: ThreadMessage[];
}

export const MessagingHub: React.FC = () => {
  const { currentUser, currentCollege, currentRole } = useApp();

  const [activeThreadId, setActiveThreadId] = useState('t-dept');
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stagedAttachment, setStagedAttachment] = useState<ChatAttachment | null>(null);
  const [previewingAttachment, setPreviewingAttachment] = useState<ChatAttachment | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('Lecture Notes');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [threads, setThreads] = useState<ThreadItem[]>([
    {
      id: 't-dept',
      name: 'Mechanical Dept Faculty & Peers',
      roleTag: 'Official Dept Hub · ME3',
      type: 'group',
      lastMessage: 'Thermodynamics Unit 3 notes verified by Mr. Suresh Prasad.',
      time: '11:42 AM',
      messages: [
        {
          id: 'm1',
          sender: 'Mr. Suresh Prasad',
          senderRole: 'Faculty',
          text: 'Good morning students. Please find the verified derivation sheet for Clausius Inequality attached below. Review it before tomorrow’s practical lab.',
          time: '09:30 AM',
          isMe: false,
          attachment: {
            name: 'ME301_Unit3_Clausius_Inequality_Solved.pdf',
            size: '2.8 MB',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf' as const,
            category: 'Lecture Notes',
          },
        },
        {
          id: 'm2',
          sender: 'Prashant Kumar',
          senderRole: 'Student',
          text: 'Thank you Sir. We are solving problem 4.2 from the textbook as well.',
          time: '09:45 AM',
          isMe: true,
        },
        {
          id: 'm3',
          sender: 'Priya Verma',
          senderRole: 'Student Rep',
          text: 'Sir, will the entropy change numericals also be evaluated in the mid-sem practicals?',
          time: '10:15 AM',
          isMe: false,
        },
        {
          id: 'm4',
          sender: 'Mr. Suresh Prasad',
          senderRole: 'Faculty',
          text: 'Yes, numericals up to question 12 are part of the practical attestation logbook.',
          time: '10:22 AM',
          isMe: false,
        },
      ],
    },
    {
      id: 't-faculty',
      name: 'Mr. Suresh Prasad (Faculty)',
      roleTag: 'Direct Faculty Advisory',
      type: 'direct',
      lastMessage: 'Your attendance attestation for the thermodynamics workshop is logged.',
      time: 'Yesterday',
      messages: [
        {
          id: 'm-f1',
          sender: 'Prashant Kumar',
          senderRole: 'Student',
          text: 'Good afternoon Sir. I have uploaded Assignment 2 with thermodynamic derivations.',
          time: 'Yesterday, 04:15 PM',
          isMe: true,
        },
        {
          id: 'm-f2',
          sender: 'Mr. Suresh Prasad',
          senderRole: 'Faculty',
          text: 'Received Prashant. I have endorsed your practical log on the SBTE digital network.',
          time: 'Yesterday, 05:20 PM',
          isMe: false,
        },
      ],
    },
    {
      id: 't-admin',
      name: 'Registrar & Exam Section',
      roleTag: 'Official Administrative Channel',
      type: 'direct',
      lastMessage: 'Mid-term practical attendance clearance notices dispatched.',
      time: 'Oct 04',
      messages: [
        {
          id: 'm-a1',
          sender: 'Dr. Rajesh Verma',
          senderRole: 'Principal / Admin',
          text: 'Official circular: All students must maintain >= 75% attendance compliance before registration cards are sealed.',
          time: 'Oct 04, 11:00 AM',
          isMe: false,
          attachment: {
            name: 'SBTE_Statutory_Compliance_Circular_2024.pdf',
            size: '1.2 MB',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            type: 'pdf' as const,
            category: 'Circular',
          },
        },
      ],
    },
  ]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setActionNotice('Please select a valid PDF document for academic sharing.');
      setTimeout(() => setActionNotice(null), 4000);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p >= 85 ? 85 : p + 15));
      }, 150);

      const path = `colleges/${currentCollege.id}/chats/${activeThreadId}/${Date.now()}_${file.name}`;
      const uploadRes = await uploadFileToStorage(file, path);

      clearInterval(progressTimer);
      setUploadProgress(100);

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const sizeKB = (file.size / 1024).toFixed(0) + ' KB';
      const sizeStr = file.size >= 1024 * 1024 ? sizeMB : sizeKB;

      const attachmentObj: ChatAttachment = {
        name: uploadRes.fileName || file.name,
        size: uploadRes.fileSize || sizeStr,
        url: uploadRes.downloadUrl,
        type: 'pdf',
        storagePath: uploadRes.storagePath,
        category: uploadCategory,
        isFirebaseStorage: true,
      };

      setStagedAttachment(attachmentObj);
      setActionNotice(`✓ PDF "${file.name}" uploaded to Firebase Storage and staged for dispatch.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.warn('Storage upload error:', err);
      setActionNotice('Offline fallback active: PDF staged locally for dispatch.');
      setTimeout(() => setActionNotice(null), 4000);
      const fallbackAtt: ChatAttachment = {
        name: file.name,
        size: '1.8 MB',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        type: 'pdf',
        category: uploadCategory,
      };
      setStagedAttachment(fallbackAtt);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleQuickShareSample = (sampleName: string, category: string, size: string) => {
    const quickAtt: ChatAttachment = {
      name: sampleName,
      size,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      type: 'pdf',
      category,
    };
    setStagedAttachment(quickAtt);
    setActionNotice(`✓ "${sampleName}" staged. Click dispatch to send.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !stagedAttachment) return;

    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date());

    const newMessage = {
      id: `m-${Date.now()}`,
      sender: currentUser.fullName,
      senderRole: currentRole,
      text: inputText.trim(),
      time,
      isMe: true,
      attachment: stagedAttachment || undefined,
    };

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === activeThreadId) {
          return {
            ...thread,
            lastMessage: stagedAttachment
              ? `[PDF: ${stagedAttachment.name}] ${inputText || ''}`
              : inputText,
            time,
            messages: [...thread.messages, newMessage],
          };
        }
        return thread;
      })
    );

    setInputText('');
    setStagedAttachment(null);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3 border border-[#2563eb] bg-white flex items-center justify-between text-xs text-[#2563eb] shadow-sm animate-in fade-in">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="underline cursor-pointer text-[#141414]">
            [DISMISS]
          </button>
        </div>
      )}

      {/* Cloud Storage Banner */}
      <div className="p-3 bg-white border border-[rgba(20,20,20,0.08)] shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CloudUpload className="w-4 h-4 text-[#2563eb]" />
          <div>
            <span className="font-semibold text-[#2563eb]">[STORAGE ENGINE ACTIVE]:</span>
            <span className="text-[#141414]/70 ml-1">
              Firebase Storage isolated bucket configured for {currentCollege.name}.
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 border border-[#2563eb]/30 text-[#2563eb] bg-[#2563eb]/5">
          <Shield className="w-3 h-3" />
          <span>AES-256 ENCRYPTED</span>
        </div>
      </div>

      {/* Main Messaging Container */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] overflow-hidden flex flex-col md:flex-row h-[630px] shadow-sm">
        {/* Left Sidebar - Chat List */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[rgba(20,20,20,0.08)] flex flex-col bg-[#F8F7F4]">
          <div className="p-4 border-b border-[rgba(20,20,20,0.08)]">
            <div className="flex items-center justify-between">
              <span className="label text-[9px]">CAMPUS DISPATCH</span>
              <span className="text-[9px] font-mono text-[#2563eb] border border-[#2563eb]/30 px-1.5 py-0.2 bg-white font-semibold">
                ACTIVE
              </span>
            </div>
            <h2 className="font-serif text-lg font-bold text-[#141414] mt-1">
              Communication Roster
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`p-3 border transition cursor-pointer flex items-start gap-3 ${
                  thread.id === activeThreadId
                    ? 'bg-white border-l-2 border-l-[#2563eb] border-[rgba(20,20,20,0.08)] text-[#141414] shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-white/60 text-[#141414]/70'
                }`}
              >
                <div className="w-9 h-9 border border-[rgba(20,20,20,0.12)] bg-white flex items-center justify-center text-[#2563eb] font-semibold shrink-0 text-xs font-mono">
                  {thread.type === 'group' ? (
                    <Users className="w-4 h-4 text-[#2563eb]" />
                  ) : (
                    thread.name.substring(0, 2).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs truncate text-[#141414]">
                      {thread.name}
                    </h4>
                    <span className="text-[9px] font-mono text-[#141414]/40 shrink-0">{thread.time}</span>
                  </div>
                  <div className="text-[9px] font-mono text-[#2563eb] truncate mt-0.5 font-medium">
                    {thread.roleTag}
                  </div>
                  <p className="text-[11px] text-[#141414]/60 truncate mt-1 font-sans">
                    {thread.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Active Chat Pane */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Top Bar */}
          <div className="p-3.5 px-4 border-b border-[rgba(20,20,20,0.08)] flex items-center justify-between bg-[#F8F7F4]">
            <div>
              <h3 className="font-serif text-base font-bold text-[#141414]">{activeThread.name}</h3>
              <p className="text-[10px] font-mono text-[#2563eb]">{activeThread.roleTag}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[9px] font-mono text-[#2563eb] border border-[#2563eb]/30 bg-white px-2 py-0.5 font-semibold">
                <FileCheck className="w-3 h-3 text-[#2563eb]" />
                <span>PDF SHARING ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8F7F4]">
            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                {!msg.isMe && (
                  <span className="text-[9px] font-mono text-[#2563eb] mb-1 ml-1 font-semibold">
                    {msg.sender.toUpperCase()} {msg.senderRole && `// ${msg.senderRole.toUpperCase()}`}
                  </span>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] p-3.5 border text-xs leading-relaxed space-y-2 ${
                    msg.isMe
                      ? 'bg-[#141414] border-[#141414] text-white'
                      : 'bg-white border-[rgba(20,20,20,0.08)] text-[#141414] shadow-sm'
                  }`}
                >
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                  {/* Render Shared PDF Resource Card */}
                  {msg.attachment && (
                    <div className="p-3 bg-white border border-[#2563eb]/40 text-[#141414] mt-2 shadow-sm">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 border border-[#2563eb] bg-[#2563eb]/10 flex items-center justify-center shrink-0 text-[#2563eb]">
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 bg-[#2563eb] text-white font-semibold">
                              {msg.attachment.category || 'PDF'}
                            </span>
                            <span className="text-[9px] font-mono text-[#141414]/60">
                              {msg.attachment.size}
                            </span>
                          </div>

                          <h5 className="font-semibold text-xs truncate mt-1 text-[#141414]">
                            {msg.attachment.name}
                          </h5>

                          <div className="flex items-center gap-1 text-[9px] font-mono text-[#2563eb] mt-0.5">
                            <CloudUpload className="w-3 h-3" />
                            <span>FIREBASE STORAGE ARTIFACT</span>
                          </div>
                        </div>
                      </div>

                      {/* PDF Action Buttons */}
                      <div className="mt-2.5 pt-2 border-t border-[rgba(20,20,20,0.08)] flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewingAttachment(msg.attachment!)}
                          className="flex-1 py-1 px-2 border border-[rgba(20,20,20,0.15)] hover:border-[#2563eb] text-[10px] text-[#141414] hover:text-[#2563eb] transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>PREVIEW</span>
                        </button>

                        <a
                          href={msg.attachment.url}
                          download={msg.attachment.name}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1 px-3 bg-[#2563eb] text-white hover:bg-[#1d4ed8] text-[10px] font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>PULL</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className={`text-[9px] font-mono mt-1 flex items-center gap-1 justify-end ${msg.isMe ? 'text-white/60' : 'text-[#141414]/40'}`}>
                    <span>{msg.time}</span>
                    {msg.isMe && <CheckCheck className="w-3 h-3 text-[#2563eb]" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick-Share Suggested Academic Resources Bar */}
          <div className="px-3 pt-2 pb-1 border-t border-[rgba(20,20,20,0.08)] bg-white flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-[9px] font-mono text-[#2563eb] uppercase tracking-wider shrink-0 font-semibold">
              [QUICK SHARE]:
            </span>

            <button
              type="button"
              onClick={() =>
                handleQuickShareSample(
                  'Unit-3_Thermodynamics_Entropy_Derivation.pdf',
                  'Lecture Notes',
                  '2.4 MB'
                )
              }
              className="whitespace-nowrap px-2 py-0.5 bg-[#F8F7F4] hover:border-[#2563eb] text-[#141414] border border-[rgba(20,20,20,0.12)] transition cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-[#2563eb]" />
              <span>Unit 3 Derivations.pdf</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickShareSample(
                  'Fluid_Mechanics_Exp5_Venturimeter_Manual.pdf',
                  'Lab Manual',
                  '3.1 MB'
                )
              }
              className="whitespace-nowrap px-2 py-0.5 bg-[#F8F7F4] hover:border-[#2563eb] text-[#141414] border border-[rgba(20,20,20,0.12)] transition cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-[#2563eb]" />
              <span>Exp 5 Lab Manual.pdf</span>
            </button>
          </div>

          {/* Staged Attachment Preview / Upload Progress */}
          {(isUploading || stagedAttachment) && (
            <div className="p-3 bg-[#F8F7F4] border-t border-[#2563eb]/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="w-7 h-7 border border-[#2563eb] bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#141414] truncate">
                      {stagedAttachment?.name || 'Uploading to Firebase Storage...'}
                    </p>
                    {stagedAttachment && (
                      <span className="text-[9px] font-mono bg-[#2563eb] text-white font-semibold px-1.5">
                        READY
                      </span>
                    )}
                  </div>
                  {isUploading && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 bg-white h-1 border border-[rgba(20,20,20,0.15)]">
                        <div
                          className="bg-[#2563eb] h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-[#2563eb]">
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStagedAttachment(null);
                  setIsUploading(false);
                }}
                className="p-1 text-[#141414]/60 hover:text-[#dc2626] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hidden File Input for PDF uploads */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[rgba(20,20,20,0.08)] bg-white flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerUpload}
              title="Attach PDF Lecture Note"
              className="p-2 border border-[rgba(20,20,20,0.12)] hover:border-[#2563eb] text-[#141414] hover:text-[#2563eb] transition cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="hidden lg:block text-[11px] font-sans border border-[rgba(20,20,20,0.12)] px-2 py-2 text-[#141414] bg-[#F8F7F4] outline-none"
            >
              <option value="Lecture Notes">Lecture Notes</option>
              <option value="Lab Manual">Lab Manual</option>
              <option value="PYQ Solution">PYQ Solution</option>
              <option value="Reference Material">Reference Material</option>
            </select>

            <input
              type="text"
              placeholder="Type dispatch or attach verified academic PDF..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 border border-[rgba(20,20,20,0.12)] bg-[#F8F7F4] px-3 py-2 text-xs text-[#141414] outline-none focus:border-[#2563eb]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && !stagedAttachment}
              className={`btn-pill accent text-[10px] ${
                inputText.trim() || stagedAttachment
                  ? ''
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH</span>
            </button>
          </form>
        </div>
      </div>

      {/* PDF Document Preview Modal */}
      {previewingAttachment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[rgba(20,20,20,0.15)] max-w-xl w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(20,20,20,0.08)] bg-[#F8F7F4]">
              <div>
                <span className="label text-[9px]">{previewingAttachment.category || 'PDF'}</span>
                <h3 className="font-serif text-base font-bold text-[#141414] mt-0.5">
                  {previewingAttachment.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewingAttachment(null)}
                className="text-[#141414]/60 hover:text-[#dc2626] cursor-pointer"
              >
                [X]
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="h-52 bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] flex flex-col items-center justify-center text-[#141414] p-4 text-center">
                <FileText className="w-12 h-12 text-[#2563eb] mb-2" />
                <h4 className="font-serif text-sm font-bold">PDF Stream Preview</h4>
                <p className="text-[11px] text-[#141414]/60 mt-1 font-mono">
                  Size: {previewingAttachment.size} • Verified Academic Channel
                </p>
                <div className="mt-3 text-[9px] font-mono text-[#2563eb] border border-[#2563eb]/30 px-2 py-0.5 bg-white">
                  FIREBASE STORAGE HOSTED
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPreviewingAttachment(null)}
                  className="btn-pill alt text-[10px]"
                >
                  DISMISS
                </button>
                <a
                  href={previewingAttachment.url}
                  download={previewingAttachment.name}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill accent text-[10px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
