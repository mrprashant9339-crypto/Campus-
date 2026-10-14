import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Note } from '../../types';
import {
  BookOpen,
  Search,
  Download,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  FileText,
  UploadCloud,
  Sparkles,
  Eye,
  X,
  Wifi,
  WifiOff,
  Database,
  Check,
} from 'lucide-react';

export const NotesBrowser: React.FC = () => {
  const {
    notes,
    uploadNote,
    incrementDownload,
    currentCollege,
    currentUser,
    currentRole,
    setIsCopilotOpen,
    isOffline,
    toggleOfflineSimulation,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [bookmarkedNotes, setBookmarkedNotes] = useState<Record<string, boolean>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Upload modal form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('Thermodynamics');
  const [uploadUnit, setUploadUnit] = useState('Unit 3');
  const [uploadType, setUploadType] = useState<'notes' | 'pyq' | 'lab' | 'reference'>('notes');
  const [uploadDesc, setUploadDesc] = useState('');

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesSem = selectedSemester === 'all' || n.semester === selectedSemester;
    const matchesType = selectedType === 'all' || n.type === selectedType;

    return matchesSearch && matchesSem && matchesType;
  });

  const handleDownload = (note: Note) => {
    incrementDownload(note.id);
    setDownloadToast(`✓ Dispatched "${note.title}" (${note.fileSize}) to local device storage.`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 4500);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    uploadNote({
      collegeId: currentCollege.id,
      title: uploadTitle,
      subjectName: uploadSubject,
      subjectCode: 'ME301',
      branchCode: 'ME',
      semester: 3,
      unit: uploadUnit,
      type: uploadType,
      fileSize: '3.4 MB',
      tags: [uploadSubject.toLowerCase(), uploadType, 'me301'],
      description: uploadDesc || 'Faculty syllabus-aligned instructional resource module.',
      isOfficial: currentRole === 'teacher' || currentRole === 'hod',
      uploaderId: currentUser.id,
      uploaderName: currentUser.fullName,
      uploaderRole: currentRole,
    });

    setUploadTitle('');
    setUploadDesc('');
    setShowUploadModal(false);
    setDownloadToast(`✓ Successfully ingested "${uploadTitle}" into scholarly repository.`);
    setTimeout(() => setDownloadToast(null), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="p-4 border border-[#2563eb] bg-white flex items-center justify-between text-xs text-[#2563eb] shadow-sm animate-in fade-in slide-in-from-top-2">
          <span>{downloadToast}</span>
          <button
            onClick={() => setDownloadToast(null)}
            className="text-[10px] font-mono text-[#141414] underline cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Offline Persistence & Campus Mesh Banner */}
      <div className="p-4 border border-[rgba(20,20,20,0.08)] bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 flex items-center justify-center shrink-0 border ${
              isOffline
                ? 'border-[#dc2626] text-[#dc2626] bg-[#dc2626]/10'
                : 'border-[#2563eb] text-[#2563eb] bg-[#2563eb]/5'
            }`}
          >
            {isOffline ? <WifiOff className="w-4 h-4 animate-pulse" /> : <Wifi className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#141414]">
                {isOffline ? 'CAMPUS WI-FI OFFLINE' : 'CAMPUS MESH ONLINE'}
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 border uppercase ${
                  isOffline
                    ? 'border-[#dc2626] text-[#dc2626] bg-[#dc2626]/5'
                    : 'border-[#2563eb] text-[#2563eb] bg-[#2563eb]/5'
                }`}
              >
                FIRESTORE INDEXEDDB PERSISTENCE ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#141414]/60 mt-0.5">
              {isOffline
                ? `Local cached mode active: Accessing ${notes.length} indexed lecture notes and PYQs directly from browser storage.`
                : 'Synchronized with Firebase Firestore. All documents mirrored locally for zero-latency campus offline browsing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={toggleOfflineSimulation}
            className={`btn-pill text-[9px] py-1.5 px-3 ${
              isOffline ? 'warning' : 'alt'
            }`}
            title="Toggle simulated campus Wi-Fi outage to verify offline persistence"
          >
            {isOffline ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>RESTORE WI-FI</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-[#dc2626]" />
                <span>SIMULATE OUTAGE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Header Panel */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="label text-[9px]">SCHOLARLY VAULT // SECTION 16</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight mt-0.5">
            Academic Transcripts & PYQ Vault
          </h1>
          <p className="text-xs text-[#141414]/60 mt-1">
            Faculty-certified syllabus modules, lecture derivations, previous year question papers & lab manuals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="btn-pill alt text-[10px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>AI COPILOT</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-pill accent text-[10px]"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>UPLOAD ARTIFACT</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#141414]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title, theorem, unit (e.g. Clausius, ME301, 2024)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] text-xs text-[#141414] pl-9 pr-4 py-2.5 focus:border-[#2563eb] outline-none"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] text-xs text-[#141414] px-3 py-2 outline-none focus:border-[#2563eb]"
            >
              <option value="all">ALL SEMESTERS</option>
              <option value={1}>SEMESTER 1</option>
              <option value={2}>SEMESTER 2</option>
              <option value={3}>SEMESTER 3</option>
              <option value={4}>SEMESTER 4</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] text-xs text-[#141414] px-3 py-2 outline-none focus:border-[#2563eb]"
            >
              <option value="all">ALL CATEGORIES</option>
              <option value="notes">LECTURE NOTES</option>
              <option value="pyq">PYQ PAPERS</option>
              <option value="lab">LAB MANUALS</option>
              <option value="reference">REFERENCE TEXTS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="p-5 bg-white border border-[rgba(20,20,20,0.08)] shadow-sm hover:border-[#2563eb] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-[#F8F7F4] border border-[#2563eb]/40 text-[#2563eb]">
                  {note.subjectName} ({note.subjectCode})
                </span>
                {note.unit && (
                  <span className="text-[9px] font-mono px-2 py-0.5 bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] text-[#141414]/70">
                    {note.unit}
                  </span>
                )}
                {note.isOfficial && (
                  <span className="inline-flex items-center gap-1 text-[9px] text-[#2563eb] border border-[#2563eb]/40 bg-[#2563eb]/5 px-2 py-0.5 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-[#2563eb]" />
                    <span>FACULTY VERIFIED</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[9px] text-[#141414]/70 bg-[#F8F7F4] px-2 py-0.5 border border-[rgba(20,20,20,0.1)]">
                  <Database className="w-3 h-3 text-[#2563eb]" />
                  <span>OFFLINE CACHED</span>
                </span>
                <span className="text-[9px] font-mono uppercase bg-[#F8F7F4] text-[#141414]/60 px-1.5 py-0.5 border border-[rgba(20,20,20,0.1)]">
                  {note.type}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#141414] tracking-tight leading-snug">
                {note.title}
              </h3>
              <p className="text-xs text-[#141414]/70 line-clamp-1 font-sans">
                {note.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#141414]/50 pt-1 font-mono">
                <span>AUTHOR: {note.uploaderName.toUpperCase()}</span>
                <span>•</span>
                <span>SIZE: {note.fileSize}</span>
                <span>•</span>
                <span>DOWNLOADS: {note.downloadCount}</span>
                <span>•</span>
                <span>DATE: {note.createdAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() =>
                  setBookmarkedNotes({
                    ...bookmarkedNotes,
                    [note.id]: !bookmarkedNotes[note.id],
                  })
                }
                title="Bookmark note"
                className="p-2 border border-[rgba(20,20,20,0.12)] bg-[#F8F7F4] text-[#141414]/60 hover:text-[#2563eb] hover:border-[#2563eb] transition cursor-pointer"
              >
                {bookmarkedNotes[note.id] ? (
                  <BookmarkCheck className="w-4 h-4 text-[#2563eb]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setSelectedNote(note)}
                className="btn-pill alt text-[10px] py-1.5 px-3"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>INSPECT</span>
              </button>

              <button
                onClick={() => handleDownload(note)}
                className="btn-pill accent text-[10px] py-1.5 px-3"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PULL PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Note Detail / PDF Viewer Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[rgba(20,20,20,0.15)] max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(20,20,20,0.08)] bg-[#F8F7F4]">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#2563eb] border border-[#2563eb]/30 px-2 py-0.5 bg-white font-mono">
                  {selectedNote.subjectName} • {selectedNote.type.toUpperCase()}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#141414] mt-1">
                  {selectedNote.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 text-[#141414]/60 hover:text-[#dc2626] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="h-60 bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] flex flex-col items-center justify-center text-[#141414] p-6 relative">
                <FileText className="w-12 h-12 text-[#2563eb] mb-2" />
                <h4 className="font-serif text-base font-bold text-center">
                  PDF Artifact Telemetry Stream
                </h4>
                <p className="text-xs text-[#141414]/60 text-center mt-1 font-mono">
                  {selectedNote.title} • {selectedNote.fileSize}
                </p>
                <div className="mt-3 px-3 py-1 bg-white border border-[#2563eb]/30 text-[10px] text-[#2563eb] font-mono">
                  AES-256 ISOLATED CAMPUS REPOSITORY
                </div>
              </div>

              <div>
                <span className="label text-[9px] block mb-1">FACULTY ABSTRACT</span>
                <p className="text-xs text-[#141414]/80 leading-relaxed font-sans">
                  {selectedNote.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedNote.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] text-[#141414]/70 px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[rgba(20,20,20,0.08)] bg-[#F8F7F4] flex items-center justify-between">
              <div className="text-[10px] text-[#141414]/60 font-mono">
                UPLOADED BY: <strong className="text-[#141414]">{selectedNote.uploaderName.toUpperCase()}</strong> ({selectedNote.uploaderRole.toUpperCase()})
              </div>
              <button
                onClick={() => handleDownload(selectedNote)}
                className="btn-pill accent text-[10px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD ARTIFACT ({selectedNote.fileSize})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Note Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[rgba(20,20,20,0.15)] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(20,20,20,0.08)]">
              <div>
                <span className="label text-[9px]">VAULT INGESTION</span>
                <h3 className="font-serif text-xl font-bold text-[#141414]">
                  Publish Academic Material
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#141414]/60 hover:text-[#dc2626] cursor-pointer"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="label text-[9px] block mb-1">MATERIAL TITLE</label>
                <input
                  type="text"
                  placeholder="E.g., Thermodynamics Unit 3 Gas Laws & Cycles"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] text-[#141414] p-2 focus:border-[#2563eb] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-[9px] block mb-1">SUBJECT</label>
                  <select
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] text-[#141414] p-2 focus:border-[#2563eb] outline-none"
                  >
                    <option>Thermodynamics</option>
                    <option>Engineering Mechanics</option>
                    <option>Strength of Materials</option>
                    <option>Manufacturing Processes</option>
                    <option>Machine Drawing</option>
                  </select>
                </div>

                <div>
                  <label className="label text-[9px] block mb-1">TYPE</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] text-[#141414] p-2 focus:border-[#2563eb] outline-none"
                  >
                    <option value="notes">Lecture Notes</option>
                    <option value="pyq">PYQ Exam Paper</option>
                    <option value="lab">Lab Manual</option>
                    <option value="reference">Reference Material</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-[9px] block mb-1">DESCRIPTION / SYLLABUS TOPICS</label>
                <textarea
                  rows={2}
                  placeholder="Outline key formulas, derivation steps, unit chapters..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] text-[#141414] p-2 focus:border-[#2563eb] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-pill alt flex-1"
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="btn-pill accent flex-1"
                >
                  INGEST ARTIFACT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
