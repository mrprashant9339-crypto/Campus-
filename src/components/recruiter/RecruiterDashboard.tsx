import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  Search,
  CheckCircle2,
  Filter,
  Download,
  Calendar,
  Award,
  ExternalLink,
  Check,
  UserCheck,
  Building,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { currentUser, currentCollege } = useApp();
  const [activeTab, setActiveTab] = useState<'talent' | 'drives' | 'shortlist'>('talent');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [shortlistedStudentIds, setShortlistedStudentIds] = useState<string[]>([]);

  const candidates = [
    {
      id: 'cand-01',
      name: 'Prashant Kumar',
      rollNo: 'ME2024001',
      college: 'Government Polytechnic Patna-7',
      branch: 'Mechanical Engineering (3rd Sem)',
      cgpa: 8.74,
      attendance: 84.5,
      verifiedSkills: ['SolidWorks CAD', 'Thermodynamic Calculations', 'Python for Engineering', 'CNC Programming'],
      featuredProject: 'Solar-Powered Automated Seed Sowing Rover',
      badges: ['CAD Specialist (Silver)', 'Research Lead (Diamond)', 'Top Contributor (Gold)'],
      resumeLink: 'https://drive.google.com/file/d/prashant-kumar-sbte-resume.pdf',
      verificationStatus: 'SBTE Verified Candidate ✓',
    },
    {
      id: 'cand-02',
      name: 'Sneha Kumari',
      rollNo: 'CSE2024005',
      college: 'Government Polytechnic Patna-7',
      branch: 'Computer Science & Engineering',
      cgpa: 9.10,
      attendance: 91.0,
      verifiedSkills: ['Python for Engineering', 'Fullstack Web', 'Cloud Architecture'],
      featuredProject: 'Campus Weather & Telemetry Mesh Node',
      badges: ['Hackathon Winner (Gold)', 'Top Contributor (Gold)'],
      resumeLink: 'https://drive.google.com/file/d/sneha-cse-resume.pdf',
      verificationStatus: 'SBTE Verified Candidate ✓',
    },
    {
      id: 'cand-03',
      name: 'Rahul Singh',
      rollNo: 'CE2024002',
      college: 'Government Polytechnic Patna-7',
      branch: 'Civil Engineering',
      cgpa: 8.52,
      attendance: 86.1,
      verifiedSkills: ['Total Station Surveying', 'AutoCAD Civil 2D', 'Concrete Compressive Testing'],
      featuredProject: 'Fly-Ash Concrete Mix Ratio Optimization',
      badges: ['Peer Mentor (Bronze)'],
      resumeLink: 'https://drive.google.com/file/d/rahul-civil-resume.pdf',
      verificationStatus: 'SBTE Verified Candidate ✓',
    },
  ];

  const handleToggleShortlist = (id: string) => {
    if (shortlistedStudentIds.includes(id)) {
      setShortlistedStudentIds(shortlistedStudentIds.filter((item) => item !== id));
    } else {
      setShortlistedStudentIds([...shortlistedStudentIds, id]);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = selectedSkill === 'All' || c.verifiedSkills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold border border-indigo-200">
                INDUSTRY RECRUITMENT & TALENT DISCOVERY DESK
              </span>
              <span className="text-[10px] font-mono text-[#666]">L&T CONSTRUCTION DET CELL</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Partner Desk: {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              Hiring Diploma Engineers (Batch 2026) across{' '}
              <span className="font-semibold text-[#141414]">{currentCollege.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified SBTE Talent Mesh Access Active
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(20,20,20,0.06)]">
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Verified Candidates</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">380 Students</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">100% Identity Verified</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Shortlisted for DET</div>
            <div className="text-2xl font-serif font-bold text-[#2563eb] mt-0.5">
              {shortlistedStudentIds.length} Profiles
            </div>
            <div className="text-[11px] text-[#2563eb] font-mono mt-1">Technical Interview Queue</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Active Campus Drives</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">2 Drives</div>
            <div className="text-[11px] text-[#666] font-mono mt-1">DET Mechanical & DET Civil</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Avg Polytechnic CGPA</div>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">8.62 / 10</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">Top 5% in Bihar SBTE</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'talent', label: '01 // Verified Student Portfolios & Skills' },
          { id: 'shortlist', label: `02 // Shortlisted Candidates (${shortlistedStudentIds.length})` },
          { id: 'drives', label: '03 // Placement Drive Postings' },
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

      {/* Tab 1: Talent Discovery */}
      {activeTab === 'talent' && (
        <div className="space-y-4">
          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name, branch, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#666]">Filter Skill:</span>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="text-xs bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] px-2 py-1.5"
              >
                <option value="All">All Competencies</option>
                <option value="SolidWorks CAD">SolidWorks CAD</option>
                <option value="Python for Engineering">Python for Engineering</option>
                <option value="CNC Programming">CNC Programming</option>
                <option value="Total Station Surveying">Total Station Surveying</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((c) => {
              const isShortlisted = shortlistedStudentIds.includes(c.id);
              return (
                <div key={c.id} className="bg-white border border-[rgba(20,20,20,0.08)] p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-base text-[#141414]">{c.name}</div>
                      <div className="text-xs text-[#2563eb] font-semibold">{c.branch}</div>
                      <div className="text-[10px] font-mono text-[#666]">{c.college} · Roll: {c.rollNo}</div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-200 font-bold">
                      CGPA {c.cgpa}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-[#666] uppercase mb-1">Verified Competencies:</div>
                    <div className="flex flex-wrap gap-1">
                      {c.verifiedSkills.map((s) => (
                        <span key={s} className="text-[10px] bg-[#F8F7F4] border px-2 py-0.5 font-mono text-[#141414]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] text-xs">
                    <span className="font-bold text-[#141414]">Featured Capstone: </span>
                    <span className="text-[#666]">{c.featuredProject}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(20,20,20,0.06)]">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">{c.verificationStatus}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleShortlist(c.id)}
                        className={`btn-pill text-xs px-3 py-1.5 font-bold cursor-pointer transition ${
                          isShortlisted ? 'bg-emerald-700 text-white' : 'bg-[#2563eb] text-white'
                        }`}
                      >
                        {isShortlisted ? '✓ Shortlisted' : '+ Shortlist Candidate'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Shortlist */}
      {activeTab === 'shortlist' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-lg text-[#141414] mb-3">
            Shortlisted Candidates for Technical Round
          </h3>
          {shortlistedStudentIds.length === 0 ? (
            <p className="text-xs text-[#666]">No candidates shortlisted yet. Browse candidates in Tab 01.</p>
          ) : (
            <div className="space-y-3">
              {candidates
                .filter((c) => shortlistedStudentIds.includes(c.id))
                .map((c) => (
                  <div key={c.id} className="p-3.5 bg-[#F8F7F4] border flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#141414]">{c.name} — {c.branch}</div>
                      <div className="text-[11px] text-[#666]">CGPA: {c.cgpa} · Attendance: {c.attendance}%</div>
                    </div>
                    <button
                      onClick={() => handleToggleShortlist(c.id)}
                      className="text-[11px] text-[#dc2626] font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Drives */}
      {activeTab === 'drives' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#141414]">
            Active Campus Recruitment Drives
          </h3>
          <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] space-y-1">
            <div className="font-bold text-sm text-[#141414]">
              Diploma Engineer Trainee (DET) — Mechanical & Production 2026 Batch
            </div>
            <div className="text-xs text-[#666]">
              Package: ₹3.60 LPA - ₹4.20 LPA + Accommodation · Location: Kanchipuram / Hazira Heavy Engg Works
            </div>
            <div className="text-[11px] font-mono text-[#2563eb] pt-1">
              Registered Applicants: 48 Verified Students · Written Test Date: 20 Nov 2026
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
