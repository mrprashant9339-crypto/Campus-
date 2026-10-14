import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  StopCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export const LiveAttendanceModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { attendanceSession, endAttendanceSession, currentCollege } = useApp();
  const [copied, setCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(285);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !attendanceSession) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const copyCode = () => {
    navigator.clipboard.writeText(attendanceSession.sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markedCount = attendanceSession.markedStudents.length;
  const totalCount = attendanceSession.totalStudents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Live Classroom Attendance Session (T-07)
              </h3>
              <p className="text-[11px] text-emerald-200">
                {attendanceSession.subjectName} • {attendanceSession.sectionName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Live Counter Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl text-center relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE CLASSROOM SESSION
              </span>
              <span className="font-mono text-amber-300 font-bold">
                ⏱ {timeFormatted} remaining
              </span>
            </div>

            <div className="text-4xl font-black tracking-tight text-white my-2">
              {markedCount} / {totalCount} Marked
            </div>
            <div className="text-xs text-indigo-200">
              {Math.round((markedCount / totalCount) * 100)}% Attendance rate today
            </div>

            {/* QR Projection Display */}
            <div className="my-5 p-4 bg-white rounded-xl inline-block shadow-inner mx-auto">
              <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                <rect x="5" y="5" width="28" height="28" fill="#0F172A" />
                <rect x="9" y="9" width="20" height="20" fill="white" />
                <rect x="13" y="13" width="12" height="12" fill="#0F172A" />
                <rect x="67" y="5" width="28" height="28" fill="#0F172A" />
                <rect x="71" y="9" width="20" height="20" fill="white" />
                <rect x="75" y="13" width="12" height="12" fill="#0F172A" />
                <rect x="5" y="67" width="28" height="28" fill="#0F172A" />
                <rect x="9" y="71" width="20" height="20" fill="white" />
                <rect x="13" y="75" width="12" height="12" fill="#0F172A" />
                <rect x="38" y="10" width="8" height="8" fill="#059669" />
                <rect x="50" y="24" width="8" height="8" fill="#0F172A" />
                <rect x="10" y="44" width="8" height="8" fill="#0F172A" />
                <rect x="24" y="40" width="8" height="8" fill="#059669" />
                <rect x="38" y="44" width="8" height="8" fill="#0F172A" />
                <rect x="50" y="40" width="8" height="8" fill="#059669" />
                <rect x="64" y="44" width="8" height="8" fill="#0F172A" />
                <rect x="78" y="40" width="8" height="8" fill="#0F172A" />
                <rect x="38" y="64" width="8" height="8" fill="#0F172A" />
                <rect x="50" y="78" width="8" height="8" fill="#059669" />
                <rect x="64" y="64" width="8" height="8" fill="#0F172A" />
                <rect x="78" y="78" width="8" height="8" fill="#0F172A" />
              </svg>
            </div>

            {/* Session code for projector */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-indigo-300">Session Code:</span>
              <span className="font-mono text-lg font-black tracking-widest text-emerald-400 bg-white/10 px-3 py-1 rounded-lg border border-white/20">
                {attendanceSession.sessionCode}
              </span>
              <button
                onClick={copyCode}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Real-time Marked List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Real-Time Verified Roll Log ({markedCount})
              </h4>
              <span className="text-[11px] text-emerald-600 font-bold">
                ✓ Geo-fenced & Proximity Verified
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              {attendanceSession.markedStudents.map((stu, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">{stu.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Roll: {stu.rollNumber}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{stu.markedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              endAttendanceSession();
              onClose();
              alert('Attendance session closed. Permanent record committed to attendance ledger.');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <StopCircle className="w-4 h-4" />
            <span>End Attendance Session</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
          >
            Keep Running in Background
          </button>
        </div>
      </div>
    </div>
  );
};
