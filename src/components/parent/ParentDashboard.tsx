import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  Calendar,
  Clock,
  Download,
  Receipt,
  MessageCircle,
  TrendingUp,
  CreditCard,
  Send,
  Check,
} from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { currentUser, currentCollege } = useApp();
  const [activeTab, setActiveTab] = useState<'ward_overview' | 'attendance' | 'marks' | 'fees'>('ward_overview');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDays, setLeaveDays] = useState('2');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);

  const ward = {
    name: 'Prashant Kumar',
    rollNumber: 'ME2024001',
    sbteRegNo: 'SBTE/2023/ME/0984',
    college: currentCollege.name,
    department: 'Mechanical Engineering',
    semester: '3rd Semester (Batch 2023–2026)',
    section: 'Section A',
    overallAttendance: 84.5,
    cgpa: 8.74,
    mentorName: 'Mr. Suresh Prasad (Assistant Professor)',
    mentorPhone: '+91 98765 11223',
    hostelStatus: 'Day Scholar (Residing in Kankarbagh, Patna)',
  };

  const subjectAttendance = [
    { code: 'ME301', name: 'Thermodynamics & Heat Engines', conducted: 42, attended: 38, pct: 90.4, status: 'Satisfactory' },
    { code: 'ME302', name: 'Fluid Mechanics & Hydraulic Machinery', conducted: 36, attended: 31, pct: 86.1, status: 'Satisfactory' },
    { code: 'ME303', name: 'Theory of Machines & Kinematics', conducted: 40, attended: 28, pct: 70.0, status: 'Shortage Warning' },
    { code: 'ME304', name: 'Manufacturing Processes & Machine Tools', conducted: 39, attended: 28, pct: 71.7, status: 'Shortage Warning' },
    { code: 'ME305', name: 'Mechanical Engineering Drawing (CAD)', conducted: 20, attended: 19, pct: 95.0, status: 'Satisfactory' },
  ];

  const semesterResults = [
    { sem: 'Semester 1 (SBTE Dec 2023)', totalMarks: '612 / 750', sgpa: 8.60, result: 'Pass (First Class with Distinction)' },
    { sem: 'Semester 2 (SBTE May 2024)', totalMarks: '634 / 750', sgpa: 8.88, result: 'Pass (First Class with Distinction)' },
  ];

  const feeLedger = [
    { id: 'REC-301', title: '3rd Semester Institutional Tuition Fee', amount: '₹1,800', date: '20 Jul 2024', status: 'Paid', receiptNumber: 'GPP/FEE/2024/7821' },
    { id: 'REC-302', title: 'SBTE Board Examination Fee (3rd Sem)', amount: '₹1,500', date: 'Due 15 Nov 2024', status: 'Upcoming', receiptNumber: '-' },
    { id: 'REC-201', title: '2nd Semester Exam & Workshop Fee', amount: '₹2,300', date: '10 Feb 2024', status: 'Paid', receiptNumber: 'GPP/FEE/2024/1042' },
  ];

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;
    setLeaveSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-50 text-amber-800 px-2 py-0.5 font-bold border border-amber-200">
                PARENT / GUARDIAN PORTAL // VERIFIED ACCESS
              </span>
              <span className="text-[10px] font-mono text-[#666]">WARD: PRASHANT KUMAR</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Guardian Desk: {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              Direct Academic & Statutory Monitoring for ward at{' '}
              <span className="font-semibold text-[#141414]">{ward.college}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Ward Linkage Active
            </span>
          </div>
        </div>

        {/* Linked Ward Identity Snapshot */}
        <div className="mt-5 p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.08)] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Enrolled Student</div>
            <div className="font-bold text-sm text-[#141414] mt-0.5">{ward.name}</div>
            <div className="text-[11px] font-mono text-[#2563eb]">Roll: {ward.rollNumber}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Branch & Semester</div>
            <div className="font-bold text-[#141414] mt-0.5">{ward.department}</div>
            <div className="text-[11px] text-[#666]">{ward.semester}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Overall Attendance</div>
            <div className="font-bold text-lg text-emerald-700 mt-0.5">{ward.overallAttendance}%</div>
            <div className="text-[10px] text-emerald-600 font-mono">Above SBTE 75% Cutoff</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Academic CGPA</div>
            <div className="font-bold text-lg text-[#141414] mt-0.5">{ward.cgpa} / 10</div>
            <div className="text-[10px] text-emerald-600 font-mono">Rank #2 in Mechanical Dept</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'ward_overview', label: '01 // Ward Progress & Contacts' },
          { id: 'attendance', label: '02 // Real-Time Attendance Ledger' },
          { id: 'marks', label: '03 // Semester Marks & SBTE Result' },
          { id: 'fees', label: '04 // Fee Receipts & Due Dues' },
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

      {/* Tab 1: Overview & Contacts */}
      {activeTab === 'ward_overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5 space-y-4">
            <h3 className="font-serif font-bold text-base text-[#141414]">
              Institutional Faculty Contacts
            </h3>
            <p className="text-xs text-[#666]">
              Contact numbers authorized by the Principal for parent communications:
            </p>

            <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] space-y-1">
              <div className="font-bold text-xs text-[#141414]">{ward.mentorName}</div>
              <div className="text-[11px] text-[#666]">Assigned Faculty Mentor & Thermodynamics Professor</div>
              <div className="text-xs font-mono font-semibold text-[#2563eb] flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5" />
                {ward.mentorPhone} (Calling hours: 4:00 PM – 5:30 PM)
              </div>
            </div>

            <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] space-y-1">
              <div className="font-bold text-xs text-[#141414]">Prof. Anil Kumar Singh</div>
              <div className="text-[11px] text-[#666]">Head of Department (Mechanical Engineering)</div>
              <div className="text-xs font-mono font-semibold text-[#2563eb] flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5" />
                +91 98765 22334 (Dept Office: 10:00 AM – 4:00 PM)
              </div>
            </div>
          </div>

          {/* Submit Leave Application */}
          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
            <h3 className="font-serif font-bold text-base text-[#141414] mb-1">
              Submit Guardian Leave Application
            </h3>
            <p className="text-xs text-[#666] mb-4">
              Directly notify the College Academic Dean and Faculty In-Charge of medical or emergency absence.
            </p>

            {leaveSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Leave Request Dispatched to Mentor Mr. Suresh Prasad!
                </div>
                <p className="text-[11px]">
                  Reason logged for {ward.name}. Formal attendance excuse will be evaluated upon medical slip submission.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeaveSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-[#666] block mb-1">Number of Days</label>
                  <select
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(e.target.value)}
                    className="w-full text-xs bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] p-2"
                  >
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days (Requires Medical Certificate)</option>
                    <option value="5">5+ Days (Requires HOD Approval)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#666] block mb-1">Reason for Absence</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Prashant has high fever and is under doctor's rest..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full text-xs bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] p-2 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-pill text-xs px-4 py-2 bg-[#2563eb] text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Official Guardian Notice
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Ledger */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#141414]">
                Subject-Wise Statutory Attendance Ledger
              </h3>
              <p className="text-xs text-[#666]">
                SBTE rules require a minimum of 75% attendance to appear in semester examinations.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 border">
              Total Held: 177 hrs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] border-b border-[rgba(20,20,20,0.08)] font-mono text-[#666]">
                <tr>
                  <th className="p-3">Course Code & Name</th>
                  <th className="p-3">Conducted</th>
                  <th className="p-3">Attended</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,20,20,0.06)]">
                {subjectAttendance.map((sub) => (
                  <tr key={sub.code} className="hover:bg-[#F8F7F4]/50">
                    <td className="p-3 font-semibold text-[#141414]">
                      {sub.code} — {sub.name}
                    </td>
                    <td className="p-3 font-mono text-[#666]">{sub.conducted} classes</td>
                    <td className="p-3 font-mono text-[#141414] font-bold">{sub.attended} classes</td>
                    <td className="p-3 font-mono font-bold">
                      <span className={sub.pct < 75 ? 'text-amber-600' : 'text-emerald-700'}>
                        {sub.pct}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-semibold ${
                          sub.pct < 75
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Marks & Results */}
      {activeTab === 'marks' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#141414]">
            Official SBTE Examination Results
          </h3>
          <div className="space-y-3">
            {semesterResults.map((r, i) => (
              <div key={i} className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-[#141414]">{r.sem}</div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">{r.result}</div>
                  <div className="text-[11px] font-mono text-[#666] mt-1">Marks: {r.totalMarks} · SGPA: {r.sgpa}</div>
                </div>
                <button className="btn-pill text-xs px-3 py-1.5 bg-white border border-[rgba(20,20,20,0.15)] flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Marksheet PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Fee Ledger */}
      {activeTab === 'fees' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-lg text-[#141414] mb-3">
            Tuition & Examination Fee Transactions
          </h3>
          <div className="space-y-3">
            {feeLedger.map((fee) => (
              <div key={fee.id} className="p-3.5 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#141414]">{fee.title}</div>
                  <div className="text-[11px] text-[#666] font-mono mt-0.5">
                    {fee.amount} · {fee.date} · Receipt: {fee.receiptNumber}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-mono font-bold ${
                    fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {fee.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
