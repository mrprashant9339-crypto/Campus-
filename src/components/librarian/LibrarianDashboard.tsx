import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Upload,
  Download,
  Search,
  Check,
  X,
  Plus,
  BarChart2,
  Layers,
  Clock,
  Shield,
} from 'lucide-react';

export const LibrarianDashboard: React.FC = () => {
  const { currentUser, currentCollege, notes, uploadNote } = useApp();
  const [activeTab, setActiveTab] = useState<'pending_notes' | 'catalog' | 'circulation' | 'stats'>('pending_notes');
  const [approvedNoteIds, setApprovedNoteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookIsbn, setNewBookIsbn] = useState('');

  const [bookCatalog, setBookCatalog] = useState([
    {
      id: 'bk-01',
      title: 'A Textbook of Thermal Engineering (Mechanical)',
      author: 'R.S. Khurmi & J.K. Gupta',
      isbn: '978-8121925730',
      branch: 'Mechanical Engg',
      totalCopies: 45,
      availableCopies: 12,
      rack: 'Shelf M-04',
    },
    {
      id: 'bk-02',
      title: 'Higher Engineering Mathematics',
      author: 'Dr. B.S. Grewal',
      isbn: '978-8174091955',
      branch: 'Common Core',
      totalCopies: 60,
      availableCopies: 18,
      rack: 'Shelf C-01',
    },
    {
      id: 'bk-03',
      title: 'Basic Thermodynamics',
      author: 'P.K. Nag',
      isbn: '978-9352606429',
      branch: 'Mechanical Engg',
      totalCopies: 30,
      availableCopies: 5,
      rack: 'Shelf M-02',
    },
    {
      id: 'bk-04',
      title: 'Surveying & Levelling (Vol 1 & 2)',
      author: 'B.C. Punmia',
      isbn: '978-8170088530',
      branch: 'Civil Engg',
      totalCopies: 40,
      availableCopies: 14,
      rack: 'Shelf CE-08',
    },
  ]);

  const pendingSubmissions = [
    {
      id: 'note-sub-01',
      title: 'Rankine & Refrigeration Cycles Handwritten Formulas',
      author: 'Prashant Kumar (ME 3rd Sem)',
      branch: 'Mechanical Engineering',
      subject: 'Thermodynamics & Heat Engines (ME301)',
      pages: 18,
      fileSize: '4.2 MB',
      uploadedAt: 'Today, 10:15 AM',
      previewFile: 'Thermo_Formula_Sheet_Prashant.pdf',
    },
    {
      id: 'note-sub-02',
      title: 'SBTE Previous 5-Years Solved Papers (2019-2024)',
      author: 'Rahul Singh (CE 3rd Sem)',
      branch: 'Civil Engineering',
      subject: 'Fluid Mechanics & Surveying',
      pages: 42,
      fileSize: '8.6 MB',
      uploadedAt: 'Yesterday, 03:40 PM',
      previewFile: 'SBTE_Surveying_PYQ_Solved.pdf',
    },
  ];

  const handleApproveNote = (id: string, noteTitle: string) => {
    setApprovedNoteIds((prev) => [...prev, id]);
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;
    setBookCatalog([
      ...bookCatalog,
      {
        id: `bk-${Date.now()}`,
        title: newBookTitle,
        author: newBookAuthor || 'Government Polytechnic Press',
        isbn: newBookIsbn || 'SBTE-MANUAL-2026',
        branch: 'Mechanical Engg',
        totalCopies: 20,
        availableCopies: 20,
        rack: 'New Arrivals Rack',
      },
    ]);
    setShowAddBookModal(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookIsbn('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-50 text-amber-800 px-2 py-0.5 font-bold border border-amber-200">
                CENTRAL POLYTECHNIC LIBRARY // E-RESOURCES ADMIN
              </span>
              <span className="text-[10px] font-mono text-[#666]">SBTE REPOSITORY NODE</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Library Desk: {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              Administering Digital Notes Vault & Physical Archives at{' '}
              <span className="font-semibold text-[#141414]">{currentCollege.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddBookModal(true)}
              className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Physical Book to Catalog
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(20,20,20,0.06)]">
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Pending Notes Review</div>
            <div className="text-2xl font-serif font-bold text-amber-600 mt-0.5">
              {pendingSubmissions.length - approvedNoteIds.length} Files
            </div>
            <div className="text-[11px] text-[#2563eb] font-mono mt-1">Student Uploaded Scans</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Cataloged Textbooks</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">175 Titles</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">1,450 Copies on Shelves</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Digital Downloads</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">4,820</div>
            <div className="text-[11px] text-purple-600 font-mono mt-1">This Academic Term</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Circulation Active</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">284 Issued</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">0 Overdue Book Penalties</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'pending_notes', label: '01 // Scholarly Notes Approval Queue' },
          { id: 'catalog', label: '02 // Physical Textbook Catalog' },
          { id: 'circulation', label: '03 // Book Issue & Return Counter' },
          { id: 'stats', label: '04 // Repository Download Metrics' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 font-semibold transition border-b-2 -mb-px cursor-pointer ${
              activeTab === t.id
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-[#666] hover:text-[#141414]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Pending Notes */}
      {activeTab === 'pending_notes' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-1">
            Student Uploaded Academic PDF Submissions
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Verify academic accuracy and SBTE syllabus alignment before publishing to the campus-wide Scholarly Vault.
          </p>

          <div className="space-y-4">
            {pendingSubmissions.map((sub) => {
              const isApproved = approvedNoteIds.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  className={`p-4 border transition ${
                    isApproved ? 'bg-emerald-50/50 border-emerald-300' : 'bg-[#F8F7F4] border-[rgba(20,20,20,0.08)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#141414]">{sub.title}</span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 border">
                          {sub.pages} pgs · {sub.fileSize}
                        </span>
                        <span className="text-[10px] font-mono text-[#2563eb]">{sub.uploadedAt}</span>
                      </div>
                      <div className="text-xs text-[#141414] mt-1.5 font-medium">
                        Subject: <span className="font-bold">{sub.subject}</span> ({sub.branch})
                      </div>
                      <div className="text-xs text-[#666] mt-0.5">
                        Uploaded by: <span className="font-semibold text-slate-800">{sub.author}</span> · File: {sub.previewFile}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Published to Vault
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveNote(sub.id, sub.title)}
                            className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve & Publish
                          </button>
                          <button className="btn-pill text-xs px-3 py-1.5 bg-white border border-[rgba(20,20,20,0.15)] text-[#666] hover:text-[#dc2626]">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Textbook Catalog */}
      {activeTab === 'catalog' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-serif font-bold text-lg text-[#141414]">
              SBTE Prescribed Textbook Catalog
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, author, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] border-b border-[rgba(20,20,20,0.08)] font-mono text-[#666]">
                <tr>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Author(s)</th>
                  <th className="p-3">ISBN / Code</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Available / Total</th>
                  <th className="p-3">Shelf Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,20,20,0.06)]">
                {bookCatalog
                  .filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((bk) => (
                    <tr key={bk.id} className="hover:bg-[#F8F7F4]/50">
                      <td className="p-3 font-semibold text-[#141414]">{bk.title}</td>
                      <td className="p-3 text-[#666]">{bk.author}</td>
                      <td className="p-3 font-mono text-[#666]">{bk.isbn}</td>
                      <td className="p-3 font-mono text-[#141414]">{bk.branch}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        {bk.availableCopies} / {bk.totalCopies}
                      </td>
                      <td className="p-3 font-mono text-[#2563eb]">{bk.rack}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Circulation Counter */}
      {activeTab === 'circulation' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-2">
            Barcode / Student Digital ID Book Circulation Terminal
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Scan student digital QR code or enter roll number to issue / return SBTE curriculum textbooks.
          </p>

          <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.08)] grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Student Roll No (e.g. ME2024001)"
              className="text-xs bg-white border border-[rgba(20,20,20,0.12)] p-2.5"
            />
            <input
              type="text"
              placeholder="Book Accession Barcode (e.g. LIB-TH-049)"
              className="text-xs bg-white border border-[rgba(20,20,20,0.12)] p-2.5"
            />
            <button className="btn-pill text-xs px-4 py-2 bg-[#2563eb] text-white font-bold cursor-pointer">
              Issue Book (14 Days)
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Stats */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
            <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
              Top Downloaded Academic Manuals
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center p-2 bg-[#F8F7F4]">
                <span>Thermodynamics Steam Tables & Mollier Chart</span>
                <span className="font-bold text-[#2563eb]">1,280 downloads</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#F8F7F4]">
                <span>Fluid Mechanics Lab Manual & Calculations</span>
                <span className="font-bold text-[#2563eb]">942 downloads</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#F8F7F4]">
                <span>AutoCAD 3D Mechanical Isometric Guide</span>
                <span className="font-bold text-[#2563eb]">860 downloads</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
            <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
              Library Storage Capacity
            </h3>
            <div className="space-y-2 text-xs">
              <p className="text-[#666]">
                Digital PDF Vault Consumption: <span className="font-bold text-[#141414]">42.8 GB / 250 GB</span> (17% utilized)
              </p>
              <p className="text-[#666]">
                Physical Reading Hall Capacity: <span className="font-bold text-[#141414]">120 Seats</span> (Air Conditioned, High-Speed Campus Wi-Fi)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[rgba(20,20,20,0.12)] p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#141414]">Add Textbook to Catalog</h3>
            <form onSubmit={handleAddBook} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-[#666] block mb-1">Book Title</label>
                <input
                  type="text"
                  placeholder="e.g. Strength of Materials"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] p-2 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-mono text-[#666] block mb-1">Author</label>
                <input
                  type="text"
                  placeholder="e.g. S. Ramamrutham"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] p-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[#666] block mb-1">ISBN / SBTE Code</label>
                <input
                  type="text"
                  placeholder="e.g. 978-8121901079"
                  value={newBookIsbn}
                  onChange={(e) => setNewBookIsbn(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] p-2 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="btn-pill px-3 py-1.5 bg-slate-100 text-[#666]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pill px-3 py-1.5 bg-[#2563eb] text-white font-bold">
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
