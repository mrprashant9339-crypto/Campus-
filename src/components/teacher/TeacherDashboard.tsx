import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Clock,
  FileText,
  Megaphone,
  QrCode,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import { CreateAssignmentModal } from './CreateAssignmentModal';
import { SubmissionsReviewModal } from './SubmissionsReviewModal';
import { LiveAttendanceModal } from './LiveAttendanceModal';

export const TeacherDashboard: React.FC = () => {
  const { currentUser, currentCollege, assignments, startAttendanceSession, attendanceSession } = useApp();

  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [activeAsgId, setActiveAsgId] = useState<string>('asg-01');

  const handleLaunchAttendance = () => {
    if (!attendanceSession || !attendanceSession.isActive) {
      startAttendanceSession('Thermodynamics (ME301)', 'ME-3A');
    }
    setIsAttendanceOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Faculty Header (T-01) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍🏫</span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Good morning, {currentUser.fullName}!
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 flex flex-wrap items-center gap-2">
            <span>Faculty • Department of Mechanical Engineering</span>
            <span>•</span>
            <span>{currentCollege.name}</span>
            <span>•</span>
            <span className="text-white font-mono bg-emerald-700/60 px-2 py-0.5 rounded font-bold">
              EMP-ME-402
            </span>
          </p>
        </div>

        {/* Quick Actions (T-01) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAnnouncementOpen(true)}
            className="px-3.5 py-2 bg-white text-emerald-950 font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <Megaphone className="w-4 h-4 text-emerald-700" />
            <span>New Announcement</span>
          </button>
          <button
            onClick={() => setIsAssignmentOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Pending Queue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Classes Schedule) */}
        <div className="md:col-span-2 space-y-6">
          {/* Today's Schedule (T-01) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-800">Today's Teaching Schedule</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                Room 204 Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      10:00 AM
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      Thermodynamics (ME301) — Section A
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Room 204 • 46 Enrolled Students • Topic: Second Law & Clausius Theorem
                  </p>
                </div>

                <button
                  onClick={handleLaunchAttendance}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Launch QR Attendance (T-07)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      02:00 PM
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      Thermodynamics (ME301) — Section B
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Room 205 • 44 Enrolled Students • Problem Solving Session
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-400">Scheduled for Afternoon</span>
              </div>
            </div>
          </div>

          {/* Class Hub (T-03): ME-3A */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">
                  Assigned Classes Hub (T-02 / T-03)
                </h3>
                <p className="text-[11px] text-slate-500">
                  ABAC Scoped: You are assigned to ME-3A & ME-3B
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Semester 3 Mechanical
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">ME-3A Thermodynamics</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    46 Students
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Attendance Avg: <strong>88%</strong></div>
                  <div>Assignments Submitted: <strong>34/46 (74%)</strong></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setActiveAsgId('asg-01');
                      setIsGradingOpen(true);
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Grade Submissions →
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">ME-3B Thermodynamics</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    44 Students
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Attendance Avg: <strong>84%</strong></div>
                  <div>Assignments Submitted: <strong>28/44 (64%)</strong></div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => alert('Class ME-3B roster loaded.')}
                    className="flex-1 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                  >
                    View Roster
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pending Action Queue */}
        <div className="space-y-6">
          {/* Pending Action Items (T-01) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800">
              Faculty Pending Queue (3 Actions)
            </h3>

            <div className="space-y-2.5 text-xs">
              <div
                onClick={() => {
                  setActiveAsgId('asg-01');
                  setIsGradingOpen(true);
                }}
                className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition"
              >
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>12 Submissions to Grade</span>
                  <span className="text-[10px] bg-amber-200 px-1.5 py-0.2 rounded">T-06</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Thermodynamics Assignment 2 • Prashant Kumar, Rahul Singh & others
                </p>
              </div>

              <div
                onClick={() => alert('Group join requests: 2 students added to Thermodynamics subject group.')}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>2 Subject Group Requests</span>
                  <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded">Cohort</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Students requesting access to lecture derivations cohort
                </p>
              </div>

              <div
                onClick={() => handleLaunchAttendance()}
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100/60 transition"
              >
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Live Attendance Ready</span>
                  <span className="text-[10px] bg-emerald-200 px-1.5 py-0.2 rounded">Room 204</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  Generate instant QR token or 6-char projection code
                </p>
              </div>
            </div>
          </div>

          {/* Read Tracking Summary (T-04) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">
              Notice Read Tracking Analytics
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">
                Assignment 2 Extension Notice
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Read Acknowledgements:</span>
                <strong className="text-emerald-700">39 / 46 Students (85%)</strong>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="text-[10px] text-slate-400">
                Unread: 7 students (sent SMS reminder fallback)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
      />
      <CreateAssignmentModal
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
      />
      <LiveAttendanceModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
      />
      <SubmissionsReviewModal
        isOpen={isGradingOpen}
        onClose={() => setIsGradingOpen(false)}
        assignmentId={activeAsgId}
      />
    </div>
  );
};
