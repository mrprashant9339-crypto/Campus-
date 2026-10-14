import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  FileText,
  Search,
  Check,
  Award,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

export const GuestFacultyDashboard: React.FC = () => {
  const { currentUser, currentCollege } = useApp();
  const [activeTab, setActiveTab] = useState<'schedule' | 'sessions' | 'evaluations'>('schedule');
  const [markedSessionId, setMarkedSessionId] = useState<string | null>(null);

  const guestContract = {
    visitingTitle: 'Visiting Professor & Industry Fellow',
    specialization: 'Advanced Industrial Automation & Mechatronics',
    contractPeriod: '15 Jul 2026 – 15 Dec 2026 (Autumn Semester)',
    totalApprovedHours: 40,
    deliveredHours: 24,
    honorariumPerSession: '₹2,500 / 2-Hour Practical Seminar',
    hostDepartment: 'Department of Mechanical Engineering',
    hodLiaison: 'Prof. Anil Kumar Singh (HOD Mechanical)',
  };

  const upcomingLectures = [
    {
      id: 'lec-01',
      title: 'PLC Ladder Logic & Electro-Pneumatics in Automated Manufacturing',
      date: 'Tomorrow, 11:00 AM – 01:00 PM',
      venue: 'Automation & Mechatronics Lab Block 2',
      targetBatch: 'ME 3rd & 5th Semester Scholars',
      status: 'Confirmed by HOD',
    },
    {
      id: 'lec-02',
      title: 'Robotic Arm Kinematics & Inverse Kinematics Simulation',
      date: '18 Oct 2026, 02:00 PM – 04:00 PM',
      venue: 'Central CAD Lab Room 102',
      targetBatch: 'ME 3rd Sem Robotics Society Cadre',
      status: 'Scheduled',
    },
  ];

  const handleMarkSessionAttendance = (id: string) => {
    setMarkedSessionId(id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-50 text-amber-800 px-2 py-0.5 font-bold border border-amber-200">
                GUEST FACULTY & VISITING PROFESSOR DESK // TIME-BOUND CREDENTIALS
              </span>
              <span className="text-[10px] font-mono text-[#666]">AUTUMN 2026 TERM</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Welcome, {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              {guestContract.visitingTitle} · {guestContract.hostDepartment} at{' '}
              <span className="font-semibold text-[#141414]">{currentCollege.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-purple-50 text-purple-700 px-3 py-1.5 border border-purple-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Time-Bound Teaching Authorization Active
            </span>
          </div>
        </div>

        {/* Contract & Engagement Snapshot */}
        <div className="mt-5 p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.08)] grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Contract Tenure</div>
            <div className="font-bold text-[#141414] mt-0.5">{guestContract.contractPeriod}</div>
            <div className="text-[10px] text-emerald-600 font-mono">Approved by SBTE & Principal</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Hours Delivered</div>
            <div className="font-bold text-lg text-[#2563eb] mt-0.5">
              {guestContract.deliveredHours} / {guestContract.totalApprovedHours} Hours
            </div>
            <div className="text-[10px] text-[#666] font-mono">60% of contracted syllabus</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Host Department</div>
            <div className="font-bold text-[#141414] mt-0.5">{guestContract.hostDepartment}</div>
            <div className="text-[10px] text-[#666] font-mono">Liaison: {guestContract.hodLiaison}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#666] uppercase">Next Guest Masterclass</div>
            <div className="font-bold text-sm text-[#141414] mt-0.5">Tomorrow, 11:00 AM</div>
            <div className="text-[10px] text-purple-600 font-mono">Automation Lab Block 2</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'schedule', label: '01 // Lecture & Masterclass Schedule' },
          { id: 'sessions', label: '02 // Guest Practical Attendance' },
          { id: 'evaluations', label: '03 // Student Competency Evaluation' },
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

      {/* Tab 1: Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5 space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#141414]">
            Autumn 2026 Guest Sessions Roster
          </h3>
          <div className="space-y-3">
            {upcomingLectures.map((lec) => (
              <div key={lec.id} className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-[#141414]">{lec.title}</div>
                  <div className="text-xs text-[#2563eb] font-semibold mt-0.5">{lec.date}</div>
                  <div className="text-[11px] text-[#666] font-mono mt-1">
                    Venue: {lec.venue} · Target: {lec.targetBatch}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 border border-emerald-200">
                  {lec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Guest Attendance */}
      {activeTab === 'sessions' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-2">
            Mark Guest Seminar Attendance
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Directly submits student attendance hours to HOD and Academic Dean office for session honorarium signoff.
          </p>

          <div className="p-4 bg-[#F8F7F4] border flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#141414]">Session #12: PLC Ladder Logic Practical Workshop</div>
              <div className="text-[11px] text-[#666] mt-0.5">38 Enrolled Mechanical Students registered for masterclass</div>
            </div>

            {markedSessionId === 'sess-12' ? (
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                36 Students Present (Attendance Stamped)
              </span>
            ) : (
              <button
                onClick={() => handleMarkSessionAttendance('sess-12')}
                className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white font-bold cursor-pointer"
              >
                Mark Attendance
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Evaluations */}
      {activeTab === 'evaluations' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
            Guest Faculty Skill Endorsements
          </h3>
          <p className="text-xs text-[#666] mb-3">
            Visiting industry professors can endorse exceptional students in specialized competencies (PLC, Robotics, Advanced Sensors).
          </p>
          <div className="p-3.5 bg-[#F8F7F4] border text-xs">
            <span className="font-bold text-[#141414]">Recent Attestation: </span>
            <span className="text-[#666]">Endorsed Prashant Kumar in "Arduino Embedded C & Motor Drivers" on 15 Sep 2024.</span>
          </div>
        </div>
      )}
    </div>
  );
};
