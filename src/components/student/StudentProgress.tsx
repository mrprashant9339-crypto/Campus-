import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Hash,
} from 'lucide-react';

export const StudentProgress: React.FC = () => {
  const { currentUser, attendanceSession, markMyAttendance } = useApp();

  const [inputCode, setInputCode] = useState('X7K-2P9');
  const [markStatus, setMarkStatus] = useState<string | null>(null);

  const metrics = [
    { label: 'Academic Performance Index', value: 82, text: '82.0%' },
    { label: 'Assignments Completed & Validated', value: 70, text: '70.0%' },
    { label: 'Classroom Attendance Ratio', value: 90, text: '90.4%' },
    { label: 'Workshop & Practical Logs', value: 60, text: '60.0%' },
    { label: 'Technical Laboratory Credits', value: 50, text: '50.0%' },
  ];

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = markMyAttendance(inputCode);
    if (success) {
      setMarkStatus('success');
    } else {
      setMarkStatus('error');
    }
  };

  const isAlreadyMarked = attendanceSession?.markedStudents.some(
    (s) => s.studentId === currentUser.id
  );

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      {/* Warning Box */}
      <div className="warning-text bg-[#fff5f5] border border-[#dc2626]">
        <span className="text-[10px] uppercase tracking-widest text-[#dc2626] font-bold block mb-1 font-mono">
          [STATUTORY SBTE DIRECTIVE 14(B)]
        </span>
        State Diploma Board requires minimum 75.0% aggregate attendance across all registered laboratory and lecture components to generate examination admit card.
      </div>

      {/* Header Ledger Summary */}
      <div className="p-6 border border-[rgba(20,20,20,0.08)] bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="label text-[9px]">ACADEMIC REGISTER // FORM S-20</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight mt-0.5">
            Attendance Ledger & Scholarly Record
          </h2>
          <p className="text-xs text-[#141414]/60 mt-1">
            Official institutional transcript for Roll {currentUser.membership.rollNumber || 'ME2024001'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-accent">SBTE COMPLIANT</span>
        </div>
      </div>

      {/* Numerical Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-[rgba(20,20,20,0.08)]">
        {/* Overall Academic Index */}
        <div className="p-6 border border-[rgba(20,20,20,0.08)] bg-white shadow-sm flex flex-col items-center justify-center text-center">
          <span className="label text-[9px]">COMPOSITE INDEX</span>
          <div className="font-serif text-5xl sm:text-6xl font-bold text-[#2563eb] my-2">
            82.0%
          </div>
          <div className="text-[10px] text-[#141414]/60 font-mono">RANK: TIER 01 · TOP 10%</div>
        </div>

        {/* Breakdown bars */}
        <div className="md:col-span-2 p-6 border border-[rgba(20,20,20,0.08)] bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,20,0.08)]">
            <span className="label text-[9px]">INSTITUTIONAL METRIC BREAKDOWN</span>
            <span className="text-[9px] text-[#2563eb] font-mono font-semibold">[AUDIT PASS]</span>
          </div>
          <div className="space-y-3.5">
            {metrics.map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1 font-sans">
                  <span className="text-[#141414]/80">{m.label}</span>
                  <span className="font-semibold text-[#2563eb] font-mono">{m.text}</span>
                </div>
                <div className="w-full bg-[#F8F7F4] h-2 border border-[rgba(20,20,20,0.1)]">
                  <div
                    className="bg-[#2563eb] h-full transition-all duration-500"
                    style={{ width: `${m.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Classroom Attendance Session Scanner Box */}
      <div className="border border-[#2563eb]/40 p-6 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(20,20,20,0.08)]">
          <div>
            <span className="label text-[9px]">LIVE TELEMETRY WINDOW</span>
            <h3 className="font-serif text-xl font-bold text-[#141414] mt-0.5">
              Thermodynamics (ME301) — Faculty: Mr. Suresh Prasad
            </h3>
            <p className="text-xs text-[#141414]/60 font-sans mt-1">
              Lecture Room 204 · Gateway session expires in 12 minutes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono bg-[#2563eb] text-white font-semibold px-2 py-0.5">
              ACTIVE GATEWAY
            </span>
          </div>
        </div>

        {isAlreadyMarked ? (
          <div className="p-4 border border-[#2563eb] bg-[#2563eb]/5 text-[#2563eb] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2563eb]" />
              <div>
                <div className="font-serif text-base font-bold">Attendance Record Cryptographically Sealed</div>
                <div className="font-mono text-xs opacity-80">
                  Hash: 9f8e-3a1b-c742-ee01 recorded in institutional ledger log.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAttendanceSubmit} className="space-y-3">
            <span className="label text-[9px] block">
              ENTER SESSION PASSCODE OR SCAN INSTRUCTOR TELEMETRY CODE
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. X7K-2P9"
                className="font-mono font-semibold text-sm tracking-widest px-4 py-2 border border-[rgba(20,20,20,0.15)] bg-[#F8F7F4] text-[#2563eb] uppercase max-w-xs focus:border-[#2563eb] outline-none"
              />
              <button type="submit" className="btn-pill accent">
                ENDORSE ATTENDANCE
              </button>
            </div>
            {markStatus === 'success' && (
              <p className="font-mono text-xs text-[#2563eb]">✓ Attendance verified and written to ledger.</p>
            )}
            {markStatus === 'error' && (
              <p className="font-mono text-xs text-[#dc2626]">✕ Passcode mismatch. Please verify with classroom instructor.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
