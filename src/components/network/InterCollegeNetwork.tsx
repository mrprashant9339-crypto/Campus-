import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Building,
  Trophy,
  Users,
  Search,
  ExternalLink,
  Target,
  Briefcase,
  Share2,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const InterCollegeNetwork: React.FC = () => {
  const { colleges, opportunities, projects, currentCollege, currentUser, setCurrentCollege, setIsCollegeDashboardOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'colleges' | 'opportunities' | 'projects'>('colleges');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');

  const districts = ['ALL', ...Array.from(new Set(colleges.map((c) => c.district).filter(Boolean)))].sort();

  const majorBranches = [
    'ALL',
    'Civil',
    'Mechanical',
    'Electrical',
    'Computer Science',
    'Electronics',
    'Chemical',
    'Automobile',
    'Fire Technology',
    'Textile',
    'Ceramics',
  ];

  const filteredColleges = colleges.filter((col) => {
    const matchesDistrict = selectedDistrict === 'ALL' || col.district === selectedDistrict;
    const matchesBranch =
      selectedBranch === 'ALL' ||
      (col.branches && col.branches.some((b) => b.toLowerCase().includes(selectedBranch.toLowerCase())));
    if (!collegeSearch) return matchesDistrict && matchesBranch;
    const q = collegeSearch.toLowerCase();
    const matchesSearch =
      col.name.toLowerCase().includes(q) ||
      (col.district && col.district.toLowerCase().includes(q)) ||
      (col.instituteCode && col.instituteCode.toLowerCase().includes(q)) ||
      (col.aisheCode && col.aisheCode.toLowerCase().includes(q)) ||
      (col.branches && col.branches.some((b) => b.toLowerCase().includes(q)));
    return matchesDistrict && matchesBranch && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Layer B Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-purple-200">
            LAYER B — INTER-COLLEGE NETWORK
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5">
            Verified Inter-College Collaboration
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-0.5">
            All 46 Bihar Government Polytechnic Institutes • Code 111 to 156 • SBTE Approved Branches
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border border-purple-500/40 rounded-xl p-1 bg-white/10 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('colleges')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'colleges' ? 'bg-white text-indigo-900 font-bold' : 'text-purple-200'
            }`}
          >
            All 46 Institutes ({colleges.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'opportunities' ? 'bg-white text-indigo-900 font-bold' : 'text-purple-200'
            }`}
          >
            Opportunity Hub
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'projects' ? 'bg-white text-indigo-900 font-bold' : 'text-purple-200'
            }`}
          >
            Projects & Teammates
          </button>
        </div>
      </div>

      {/* Tab 1: Partner Colleges Directory */}
      {activeTab === 'colleges' && (
        <div className="space-y-4">
          {/* Consortium Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs shadow-2xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Govt. Institutes</span>
              <strong className="text-base text-slate-900 font-mono">46 Polytechnics</strong>
              <span className="text-[10px] text-emerald-600 block font-semibold">100% State Governed</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Districts Covered</span>
              <strong className="text-base text-indigo-600 font-mono">38 Bihar Districts</strong>
              <span className="text-[10px] text-slate-500 block">Complete State Network</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Annual Intake</span>
              <strong className="text-base text-slate-900 font-mono">18,500+ Seats</strong>
              <span className="text-[10px] text-emerald-600 block font-semibold">BCECEB Allotted</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Diploma Program</span>
              <strong className="text-base text-amber-700 font-mono">3 Years / 6 Sems</strong>
              <span className="text-[10px] text-slate-500 block">AICTE & SBTE Compliant</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Bihar Government Polytechnic Directory (2026-27)
              </h2>
              <p className="text-xs text-slate-500">
                Official list of 46 institutions under State Board of Technical Education (SBTE) Bihar • {filteredColleges.length} matches
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code (111-156), branch, district, name..."
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-slate-50 font-medium focus:outline-none focus:border-indigo-500 w-72"
                />
              </div>
            </div>
          </div>

          {/* District & Branch Filter Bars */}
          <div className="space-y-2.5 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
            {/* Branch Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Branch:
              </span>
              {majorBranches.map((br) => (
                <button
                  key={br}
                  onClick={() => setSelectedBranch(br)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                    selectedBranch === br
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {br}
                </button>
              ))}
            </div>

            {/* District Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1.5 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                District:
              </span>
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(d!)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                    selectedDistrict === d
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredColleges.map((col) => (
              <div
                key={col.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{col.logoUrl || '🏛️'}</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded">
                        CODE {col.instituteCode || col.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SBTE Active</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {col.name}
                    </h3>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                      District: {col.district} • {col.city}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {col.address}
                    </p>
                  </div>

                  {/* Branches Pill List */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      {col.branches?.length || col.departments?.length || 5} Approved SBTE Branches:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(col.branches || col.departments?.map((d: any) => d.name) || []).map((br: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[9px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/60"
                        >
                          {br}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Principal details snapshot */}
                  {col.principalName && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">Principal:</span>
                      <div className="font-bold text-slate-800">{col.principalName}</div>
                      {col.principalPhone && <div className="text-slate-500 font-mono">Ph: {col.principalPhone}</div>}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {col.website ? (
                    <a
                      href={col.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-slate-500 hover:text-indigo-600 flex items-center gap-0.5"
                    >
                      <span>Web Portal</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Portal: SBTE</span>
                  )}

                  <button
                    onClick={() => {
                      setCurrentCollege(col);
                      setIsCollegeDashboardOpen(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Academic Details</span>
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Smart Opportunity Hub (Section 46) */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Verified Opportunity Hub (Internships, Scholarships, Jobs)
          </h2>

          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {opp.type}
                    </span>
                    {opp.sourceVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Source Verified</span>
                      </span>
                    )}
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {opp.stipendOrPrize}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {opp.description}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Organization: <strong>{opp.organization}</strong> • Deadline: {opp.deadline}
                  </p>
                </div>

                <button
                  onClick={() => alert(`Application form opened for ${opp.title}`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                >
                  Apply Directly →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Projects & Inter-College Teammate Finder (Section 47 & 48) */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Inter-College Project Network & Innovation Showcase
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{proj.collegeName}</span>
                    <span className="text-xs text-slate-500">❤️ {proj.likes} Endorsements</span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {proj.solution}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {proj.lookingForRoles && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold uppercase text-purple-800">
                        🤝 Seeking Inter-College Teammates:
                      </div>
                      {proj.lookingForRoles.map((role, i) => (
                        <div key={i} className="text-xs text-purple-900 font-semibold">
                          • {role}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Lead: <strong>{proj.teamLeader}</strong></span>
                  <button
                    onClick={() => alert(`Connect request sent to ${proj.teamLeader}`)}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Request to Join Team →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
