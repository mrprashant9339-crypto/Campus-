import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  FileText,
  AlertTriangle,
  UserCheck,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  Check,
  X,
  Search,
} from 'lucide-react';

export const HODDashboard: React.FC = () => {
  const { currentUser, currentCollege, verifications, reviewVerification } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'faculty' | 'endorsements' | 'analytics'>('overview');
  const [filterBranch, setFilterBranch] = useState<string>('ME');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedEndorsementIds, setApprovedEndorsementIds] = useState<string[]>([]);

  const facultyMembers = [
    {
      id: 'fac-01',
      name: 'Mr. Suresh Prasad',
      designation: 'Assistant Professor',
      subject: 'Thermodynamics & Heat Engines (ME301)',
      batches: 'ME 3rd Sem (Sec A & B)',
      workload: '18 hrs/week',
      status: 'Active',
      pendingVerifications: 3,
    },
    {
      id: 'fac-02',
      name: 'Prof. Rita Verma',
      designation: 'Associate Professor',
      subject: 'Theory of Machines & Kinematics (ME303)',
      batches: 'ME 3rd Sem (Sec A)',
      workload: '16 hrs/week',
      status: 'Active',
      pendingVerifications: 1,
    },
    {
      id: 'fac-03',
      name: 'Dr. Anand Kishore',
      designation: 'Assistant Professor',
      subject: 'Fluid Mechanics & Hydraulic Machinery (ME302)',
      batches: 'ME 3rd Sem (Sec A)',
      workload: '16 hrs/week',
      status: 'Active',
      pendingVerifications: 2,
    },
    {
      id: 'fac-04',
      name: 'Er. Rajesh Ranjan',
      designation: 'Lecturer',
      subject: 'Manufacturing Processes & Machine Tools (ME304)',
      batches: 'ME 3rd Sem (Sec B)',
      workload: '14 hrs/week',
      status: 'On Leave',
      pendingVerifications: 0,
    },
    {
      id: 'fac-05',
      name: 'Prof. Sunil Kumar',
      designation: 'Assistant Professor',
      subject: 'Mechanical Engineering Drawing CAD (ME305)',
      batches: 'ME 3rd Sem & 5th Sem',
      workload: '20 hrs/week',
      status: 'Active',
      pendingVerifications: 4,
    },
  ];

  const pendingEndorsementRequests = [
    {
      id: 'end-req-101',
      studentName: 'Prashant Kumar',
      rollNo: 'ME2024001',
      subject: 'Thermodynamics & Heat Engines',
      competency: 'Rankine & Brayton Cycle Efficiency Derivations',
      requestedTo: 'Mr. Suresh Prasad (Faculty)',
      submittedAt: 'Today, 09:15 AM',
      sampleFile: 'Thermodynamics_Brayton_Derivation.pdf',
    },
    {
      id: 'end-req-102',
      studentName: 'Aman Verma',
      rollNo: 'ME2024003',
      subject: 'Manufacturing Processes',
      competency: 'CNC G-Code Lathe Facing & Turning Tolerance',
      requestedTo: 'Er. Rajesh Ranjan',
      submittedAt: 'Yesterday, 04:30 PM',
      sampleFile: 'CNC_Lathe_GCode_Log.nc',
    },
    {
      id: 'end-req-103',
      studentName: 'Rahul Singh',
      rollNo: 'ME2024002',
      subject: 'Fluid Mechanics',
      competency: 'Venturimeter Discharge Coefficient Measurement',
      requestedTo: 'Dr. Anand Kishore',
      submittedAt: '08 Oct 2026',
      sampleFile: 'Venturi_Discharge_Report.pdf',
    },
  ];

  const handleApproveHODEndorsement = (id: string) => {
    setApprovedEndorsementIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Department Header */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 rounded-none shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-[#2563eb]/10 text-[#2563eb] px-2 py-0.5 font-bold">
                DEPARTMENT LEADERSHIP DESK // SBTE NODE
              </span>
              <span className="text-[10px] font-mono text-[#666]">AUTONOMOUS DEPT #03</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Department of Mechanical Engineering
            </h1>
            <p className="text-sm text-[#666] mt-1">
              HOD: <span className="font-semibold text-[#141414]">{currentUser.fullName}</span> ·{' '}
              {currentCollege.name} ({currentCollege.code})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Accredited Curriculum · SBTE 2026–27
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(20,20,20,0.06)]">
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Active Faculty Roster</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">14 Faculty</div>
            <div className="text-[11px] text-[#2563eb] font-mono mt-1">5 Associate · 9 Lecturers</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Enrolled Scholars</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">380 Students</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">87.4% Avg Attendance</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Pending Endorsements</div>
            <div className="text-2xl font-serif font-bold text-amber-600 mt-0.5">
              {pendingEndorsementRequests.length - approvedEndorsementIds.length} Requests
            </div>
            <div className="text-[11px] text-[#666] font-mono mt-1">Awaiting Dept Attestation</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Laboratories Active</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">6 Labs</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">CAD, Fluids, Thermal, CNC</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'overview', label: '01 // Department Overview' },
          { id: 'faculty', label: '02 // Faculty Workload & Allocation' },
          { id: 'endorsements', label: '03 // Endorsement Approvals' },
          { id: 'analytics', label: '04 // SBTE Syllabus & Attendance' },
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

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Department Action Items */}
            <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-base text-[#141414] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  High-Priority Department Tasks
                </h3>
                <span className="text-[11px] font-mono text-[#666]">Sem 3 & Sem 5 Cycle</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#F8F7F4] border-l-4 border-l-[#2563eb] flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#141414]">
                      SBTE Mid-Term Practical Evaluation Roster
                    </div>
                    <div className="text-[11px] text-[#666] mt-0.5">
                      Verify external examiner appointments and fluid mechanics viva schedule for 3rd semester.
                    </div>
                  </div>
                  <button className="btn-pill text-[10px] px-2 py-1 bg-[#2563eb] text-white">
                    Approve Roster
                  </button>
                </div>

                <div className="p-3.5 bg-[#F8F7F4] border-l-4 border-l-amber-500 flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#141414]">
                      Attendance Shortage Audit (Sub-75% Notice)
                    </div>
                    <div className="text-[11px] text-[#666] mt-0.5">
                      12 students flagged under 75% in Manufacturing Processes. Warning notices generated.
                    </div>
                  </div>
                  <button className="btn-pill text-[10px] px-2 py-1 bg-white border border-[rgba(20,20,20,0.2)]">
                    Review List
                  </button>
                </div>

                <div className="p-3.5 bg-[#F8F7F4] border-l-4 border-l-emerald-500 flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#141414]">
                      AICTE Skill Endorsement Matrix Attestation
                    </div>
                    <div className="text-[11px] text-[#666] mt-0.5">
                      Validate faculty endorsements for SolidWorks CAD & CNC Machine Operations.
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('endorsements')}
                    className="btn-pill text-[10px] px-2 py-1 bg-white border border-[rgba(20,20,20,0.2)]"
                  >
                    View Queue
                  </button>
                </div>
              </div>
            </div>

            {/* Department Courses & Syllabus Progress */}
            <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
              <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
                Current Semester Curricula Coverage (3rd Sem)
              </h3>
              <div className="space-y-3">
                {[
                  { code: 'ME301', name: 'Thermodynamics & Heat Engines', progress: 78, faculty: 'Mr. Suresh Prasad' },
                  { code: 'ME302', name: 'Fluid Mechanics & Hydraulic Machinery', progress: 72, faculty: 'Dr. Anand Kishore' },
                  { code: 'ME303', name: 'Theory of Machines & Kinematics', progress: 65, faculty: 'Prof. Rita Verma' },
                  { code: 'ME304', name: 'Manufacturing Processes & Machine Tools', progress: 70, faculty: 'Er. Rajesh Ranjan' },
                  { code: 'ME305', name: 'Mechanical Engineering Drawing CAD Practical', progress: 85, faculty: 'Prof. Sunil Kumar' },
                ].map((c) => (
                  <div key={c.code} className="p-3 border border-[rgba(20,20,20,0.06)] bg-[#F8F7F4]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono font-bold text-[#141414]">{c.code} — {c.name}</span>
                      <span className="font-mono text-[#2563eb] font-bold">{c.progress}% completed</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5">
                      <div className="bg-[#2563eb] h-1.5" style={{ width: `${c.progress}%` }}></div>
                    </div>
                    <div className="text-[10px] text-[#666] font-mono mt-1">Instructor: {c.faculty}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Department Leadership & Committee */}
          <div className="space-y-6">
            <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
              <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
                Department Leadership Council
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
                  <div className="font-bold text-[#141414]">Prof. Anil Kumar Singh</div>
                  <div className="text-[11px] text-[#666]">Head of Department (HOD)</div>
                  <div className="text-[10px] font-mono text-[#2563eb] mt-1">Direct: hod.me@gpp.ac.in</div>
                </div>
                <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
                  <div className="font-bold text-[#141414]">Mr. Suresh Prasad</div>
                  <div className="text-[11px] text-[#666]">Academic Coordinator & Senior Faculty</div>
                  <div className="text-[10px] font-mono text-[#2563eb] mt-1">suresh@gpp.ac.in</div>
                </div>
                <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
                  <div className="font-bold text-[#141414]">Ranjeet Paswan</div>
                  <div className="text-[11px] text-[#666]">Chief Workshop & Lab Superintendent</div>
                  <div className="text-[10px] font-mono text-[#2563eb] mt-1">lab.tech@gpp.ac.in</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
              <h3 className="font-serif font-bold text-base text-[#141414] mb-2">
                SBTE Department Orders
              </h3>
              <div className="text-xs text-[#666] space-y-2">
                <p>• Notification SBTE-2026/ME-88: Industrial internship verification mandates 120 credit hours.</p>
                <p>• Department labs must upload weekly maintenance certifications to the State Technical Portal.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Faculty Workload & Allocation */}
      {activeTab === 'faculty' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#141414]">
                Department Faculty Workload Roster
              </h3>
              <p className="text-xs text-[#666]">
                Assigned courses, weekly lecture practical hours, and pending academic verifications.
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search faculty..."
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
                  <th className="p-3">Faculty Name</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Assigned Module</th>
                  <th className="p-3">Weekly Hours</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,20,20,0.06)]">
                {facultyMembers
                  .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((fac) => (
                    <tr key={fac.id} className="hover:bg-[#F8F7F4]/50">
                      <td className="p-3 font-semibold text-[#141414]">
                        {fac.name}
                        {fac.pendingVerifications > 0 && (
                          <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                            {fac.pendingVerifications} Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[#666]">{fac.designation}</td>
                      <td className="p-3 font-mono text-[#141414]">{fac.subject}</td>
                      <td className="p-3 font-mono text-[#666]">{fac.workload}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-semibold ${
                            fac.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {fac.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button className="text-[11px] text-[#2563eb] font-semibold hover:underline">
                          View Log
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Endorsement Approvals */}
      {activeTab === 'endorsements' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <div className="mb-4">
            <h3 className="font-serif font-bold text-lg text-[#141414]">
              HOD Academic Competency & Endorsement Approvals
            </h3>
            <p className="text-xs text-[#666]">
              Endorsements approved here receive the official Department & HOD attestation seal on the student's digital ledger.
            </p>
          </div>

          <div className="space-y-4">
            {pendingEndorsementRequests.map((req) => {
              const isApproved = approvedEndorsementIds.includes(req.id);
              return (
                <div
                  key={req.id}
                  className={`p-4 border transition ${
                    isApproved ? 'bg-emerald-50/50 border-emerald-300' : 'bg-[#F8F7F4] border-[rgba(20,20,20,0.08)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#141414]">{req.studentName}</span>
                        <span className="font-mono text-xs text-[#666] bg-white px-2 py-0.5 border border-[rgba(20,20,20,0.1)]">
                          Roll: {req.rollNo}
                        </span>
                        <span className="text-[10px] font-mono text-[#2563eb]">{req.submittedAt}</span>
                      </div>
                      <div className="text-xs text-[#141414] mt-1.5 font-medium">
                        Subject: <span className="font-bold">{req.subject}</span>
                      </div>
                      <div className="text-xs text-[#666] mt-0.5">
                        Competency: <span className="text-slate-900 font-semibold">{req.competency}</span>
                      </div>
                      <div className="text-[11px] text-[#666] font-mono mt-1">
                        Assigned Reviewer: {req.requestedTo} · Evidence: {req.sampleFile}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          HOD Verified & Stamped
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveHODEndorsement(req.id)}
                            className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white flex items-center gap-1.5 font-bold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve & Seal
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

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
            <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
              Section-Wise Attendance Breakdown
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center p-2 bg-[#F8F7F4]">
                <span>Section A (Roll 001 - 060)</span>
                <span className="font-bold text-emerald-700">89.2% Compliant</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#F8F7F4]">
                <span>Section B (Roll 061 - 120)</span>
                <span className="font-bold text-emerald-700">85.6% Compliant</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-[#F8F7F4]">
                <span>5th Semester Batch A</span>
                <span className="font-bold text-amber-700">76.4% Compliant</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
            <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
              Skill Endorsement Quality Index
            </h3>
            <div className="space-y-3 text-xs">
              <p className="text-[#666]">
                Average endorsements per student in Mechanical Engineering: <span className="font-bold text-[#141414]">4.2 verified skills</span>.
              </p>
              <p className="text-[#666]">
                Highest attested competency: <span className="font-bold text-[#2563eb]">SolidWorks CAD (84% of cohort)</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
