import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseAttendance } from '../../types';
import { INITIAL_COURSE_ATTENDANCE } from '../../mockAcademicData';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  BookOpen,
  QrCode,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Calculator,
  Info,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  X,
  Sliders,
} from 'lucide-react';

interface SmartAttendanceWidgetProps {
  onOpenLiveScanner?: () => void;
}

export const SmartAttendanceWidget: React.FC<SmartAttendanceWidgetProps> = ({ onOpenLiveScanner }) => {
  const { setActiveNavTab } = useApp();
  const [courses, setCourses] = useState<CourseAttendance[]>(INITIAL_COURSE_ATTENDANCE);
  const [filter, setFilter] = useState<'all' | 'at_risk' | 'safe' | 'labs'>('all');
  const [expandedCourseCode, setExpandedCourseCode] = useState<string | null>('ME303');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [selectedMedicalCourse, setSelectedMedicalCourse] = useState<CourseAttendance | null>(null);
  const [medicalFileName, setMedicalFileName] = useState('Medical_Fitness_Certificate_Oct2024.pdf');
  const [medicalSubmitted, setMedicalSubmitted] = useState(false);

  // Simulator State
  const [simSelectedCode, setSimSelectedCode] = useState<string>('ME303');
  const [simAdditionalAttended, setSimAdditionalAttended] = useState<number>(5);
  const [simAdditionalConducted, setSimAdditionalConducted] = useState<number>(5);

  // Aggregated calculations
  const totalAttended = useMemo(() => courses.reduce((acc, c) => acc + c.attended, 0), [courses]);
  const totalConducted = useMemo(() => courses.reduce((acc, c) => acc + c.total, 0), [courses]);
  const aggregatePercentage = useMemo(
    () => (totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 0),
    [totalAttended, totalConducted]
  );

  const atRiskCourses = useMemo(
    () => courses.filter((c) => c.percentage < c.mandatoryThreshold),
    [courses]
  );
  const safeCourses = useMemo(
    () => courses.filter((c) => c.percentage >= c.mandatoryThreshold),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    switch (filter) {
      case 'at_risk':
        return atRiskCourses;
      case 'safe':
        return safeCourses;
      case 'labs':
        return courses.filter((c) => c.category === 'lab');
      default:
        return courses;
    }
  }, [filter, courses, atRiskCourses, safeCourses]);

  const activeSimCourse = courses.find((c) => c.courseCode === simSelectedCode) || courses[0];
  const projectedAttended = activeSimCourse.attended + simAdditionalAttended;
  const projectedTotal = activeSimCourse.total + simAdditionalConducted;
  const projectedPercentage = projectedTotal > 0 ? (projectedAttended / projectedTotal) * 100 : 0;

  const handleMedicalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMedicalSubmitted(true);
    setTimeout(() => {
      // Exemption applied: add 2 attendance sessions to the course
      if (selectedMedicalCourse) {
        setCourses((prev) =>
          prev.map((c) => {
            if (c.courseCode === selectedMedicalCourse.courseCode) {
              const newAttended = Math.min(c.total, c.attended + 2);
              const newPct = (newAttended / c.total) * 100;
              return {
                ...c,
                attended: newAttended,
                percentage: parseFloat(newPct.toFixed(1)),
                status: newPct >= c.mandatoryThreshold ? 'safe' : 'warning',
                requiredConsecutiveClasses: Math.max(
                  0,
                  Math.ceil((0.75 * c.total - newAttended) / 0.25)
                ),
              };
            }
            return c;
          })
        );
      }
      setTimeout(() => {
        setIsMedicalModalOpen(false);
        setMedicalSubmitted(false);
      }, 1400);
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500" />

      {/* Header & Overall Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Smart Attendance Analytics
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              SBTE 75% Cutoff
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Real-time biometric & QR attendance log with predictive detention risk warnings
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200/80 transition cursor-pointer"
            title="Calculate how many classes to attend to reach 75%"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Attendance Doctor</span>
          </button>
          <button
            onClick={() => {
              if (onOpenLiveScanner) {
                onOpenLiveScanner();
              } else {
                setActiveNavTab('progress');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>Mark Live QR</span>
          </button>
        </div>
      </div>

      {/* Aggregate Score Bar & Summary Pills */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-xl p-4 border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Semester Aggregate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-black ${
                    aggregatePercentage >= 75 ? 'text-indigo-900' : 'text-rose-600'
                  }`}
                >
                  {aggregatePercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ({totalAttended}/{totalConducted} classes)
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:block">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Benchmark Cutoff
              </span>
              <span className="text-sm font-extrabold text-slate-700">75.0% Mandatory</span>
            </div>
          </div>

          {/* Quick status counter tags */}
          <div className="flex items-center gap-2">
            {atRiskCourses.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span>{atRiskCourses.length} Below 75% Cutoff</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{safeCourses.length} in Safe Zone</span>
            </span>
          </div>
        </div>

        {/* Global Progress Bar with 75% threshold marker */}
        <div className="space-y-1">
          <div className="relative w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, aggregatePercentage)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                aggregatePercentage >= 75
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-600'
              }`}
            />
            {/* 75% threshold notch */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
              style={{ left: '75%' }}
              title="75% Mandatory Cutoff"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium">
            <span>0%</span>
            <span className="text-slate-600 font-bold" style={{ marginLeft: 'auto', marginRight: '24%' }}>
              ▲ 75% Mandatory Threshold
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Highlight Banner if any class is below threshold */}
      {atRiskCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 bg-gradient-to-r from-rose-50 to-amber-50/60 border border-rose-300 rounded-xl flex items-start gap-3 text-xs shadow-xs"
        >
          <div className="p-2 bg-rose-500 text-white rounded-lg shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-rose-900">
                Action Required: Attendance Below Threshold
              </h4>
              <span className="text-[10px] font-bold uppercase bg-rose-200/90 text-rose-800 px-2 py-0.5 rounded">
                Examination Risk
              </span>
            </div>
            <p className="text-rose-800 mt-0.5 text-[11px] leading-relaxed">
              {atRiskCourses.map((c) => `${c.courseCode} (${c.percentage}%)`).join(' and ')} are
              currently below the mandatory 75% requirement. You must attend consecutive upcoming
              lectures or file medical leave certificates to prevent admit card withholding.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setFilter('at_risk')}
                className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
              >
                Focus on At-Risk Classes ({atRiskCourses.length}) →
              </button>
              <span className="text-rose-300">•</span>
              <button
                onClick={() => {
                  setSelectedMedicalCourse(atRiskCourses[0]);
                  setIsMedicalModalOpen(true);
                }}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Submit Medical Exemption Slip
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex border border-slate-200 rounded-xl p-0.5 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              filter === 'all'
                ? 'bg-white shadow-xs text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilter('at_risk')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              filter === 'at_risk'
                ? 'bg-white shadow-xs text-rose-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>Below 75% ({atRiskCourses.length})</span>
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              filter === 'safe'
                ? 'bg-white shadow-xs text-emerald-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Safe Zone ({safeCourses.length})
          </button>
          <button
            onClick={() => setFilter('labs')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              filter === 'labs'
                ? 'bg-white shadow-xs text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Labs (2)
          </button>
        </div>

        <button
          onClick={() => setExpandedCourseCode(expandedCourseCode ? null : courses[0].courseCode)}
          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <span>{expandedCourseCode ? 'Collapse Logs' : 'Expand Logs'}</span>
          {expandedCourseCode ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Course Attendance List */}
      <div className="space-y-3">
        {filteredCourses.map((course) => {
          const isBelowThreshold = course.percentage < course.mandatoryThreshold;
          const isNearThreshold =
            !isBelowThreshold && course.percentage >= 75 && course.percentage <= 80;
          const isExpanded = expandedCourseCode === course.courseCode;

          return (
            <motion.div
              layout
              key={course.courseCode}
              className={`rounded-xl border transition-all ${
                isBelowThreshold
                  ? 'border-rose-300 bg-rose-50/20 shadow-xs'
                  : isNearThreshold
                  ? 'border-amber-200 bg-amber-50/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } p-4 space-y-3`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {course.courseCode}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {course.courseName}
                    </h4>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        course.category === 'lab'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {course.category === 'lab' ? 'Practical Lab' : 'Theory'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Faculty: <span className="font-semibold text-slate-700">{course.facultyName}</span> • Updated {course.lastUpdated}
                  </p>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className={`text-base font-black ${
                          isBelowThreshold
                            ? 'text-rose-600'
                            : isNearThreshold
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {course.percentage}%
                      </span>
                      {isBelowThreshold ? (
                        <span className="p-1 rounded bg-rose-100 text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                        </span>
                      ) : (
                        <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                      {course.attended} of {course.total} Attended
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar with 75% Mandatory threshold line */}
              <div className="space-y-1">
                <div className="relative w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, course.percentage)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      isBelowThreshold
                        ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                        : isNearThreshold
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                  />
                  {/* Threshold notch */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10 opacity-70"
                    style={{ left: '75%' }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>
                    Missed: <strong className="text-slate-700">{course.total - course.attended}</strong> classes
                  </span>
                  <span className="font-mono text-slate-400">
                    Threshold: <strong className="text-slate-700">75%</strong>
                  </span>
                </div>
              </div>

              {/* Smart Predictive Insight Pill */}
              <div
                className={`p-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isBelowThreshold
                    ? 'bg-rose-100/70 text-rose-900 border border-rose-200'
                    : isNearThreshold
                    ? 'bg-amber-100/70 text-amber-900 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isBelowThreshold ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="font-medium text-[11px] leading-snug">
                    {isBelowThreshold ? (
                      <>
                        <strong>Critical:</strong> Must attend next{' '}
                        <span className="font-bold underline text-rose-950">
                          {course.requiredConsecutiveClasses} consecutive lectures
                        </span>{' '}
                        to safely clear the 75% cutoff.
                      </>
                    ) : course.missableClasses > 0 ? (
                      <>
                        <strong>Safe buffer:</strong> Can afford to miss up to{' '}
                        <span className="font-bold underline text-emerald-950">
                          {course.missableClasses} lectures
                        </span>{' '}
                        without slipping below 75%.
                      </>
                    ) : (
                      <>
                        <strong>Near limit:</strong> Cannot afford to miss the next lecture.
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isBelowThreshold && (
                    <button
                      onClick={() => {
                        setSelectedMedicalCourse(course);
                        setIsMedicalModalOpen(true);
                      }}
                      className="text-[10px] font-bold bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 px-2 py-1 rounded-lg cursor-pointer"
                    >
                      Medical Slip Exemption
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setExpandedCourseCode(isExpanded ? null : course.courseCode)
                    }
                    className="text-[10px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Records' : 'View Records'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Recent Attendance Records */}
              <AnimatePresence>
                {isExpanded && course.recentRecords && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 border-t border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Recent Class Attendance History:</span>
                      <span className="text-[10px] text-slate-400">Verified by Biometric/Portal</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {course.recentRecords.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                        >
                          <div className="truncate mr-2">
                            <span className="font-mono text-[10px] text-slate-400 block">
                              {rec.date}
                            </span>
                            <span className="font-semibold text-slate-800 text-[11px] truncate block">
                              {rec.topic || 'Classroom Lecture'}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                              rec.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rec.status === 'present' ? '✓ Present' : '✕ Absent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Attendance Simulator Modal ("Attendance Doctor") */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calculator className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">
                  Attendance Recovery Doctor & Simulator
                </h3>
              </div>
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select any course to simulate future attendance outcomes and test exactly how many
              consecutive classes you need to reach or stay above the 75% threshold.
            </p>

            {/* Course Picker */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Select Subject to Simulate:
              </label>
              <select
                value={simSelectedCode}
                onChange={(e) => setSimSelectedCode(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800"
              >
                {courses.map((c) => (
                  <option key={c.courseCode} value={c.courseCode}>
                    {c.courseCode} — {c.courseName} ({c.percentage}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Current vs Projected Comparison */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Current Status
                </span>
                <span className="text-lg font-black text-slate-800">
                  {activeSimCourse.percentage}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {activeSimCourse.attended}/{activeSimCourse.total} attended
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Projected Status
                </span>
                <span
                  className={`text-lg font-black ${
                    projectedPercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {projectedPercentage.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {projectedAttended}/{projectedTotal} attended
                </span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Next Upcoming Classes Held:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    +{simAdditionalConducted}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simAdditionalConducted}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSimAdditionalConducted(val);
                    if (simAdditionalAttended > val) setSimAdditionalAttended(val);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-700">Classes You Plan to Attend:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    +{simAdditionalAttended}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={simAdditionalConducted}
                  value={simAdditionalAttended}
                  onChange={(e) => setSimAdditionalAttended(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Projection verdict */}
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                projectedPercentage >= 75
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {projectedPercentage >= 75 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    🎉 You will clear the mandatory 75% cutoff and be eligible for examination hall ticket!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    ⚠️ Still below 75% cutoff! You need at least{' '}
                    <strong>
                      {Math.max(
                        0,
                        Math.ceil((0.75 * projectedTotal - projectedAttended) / 0.25)
                      )}{' '}
                      more
                    </strong>{' '}
                    additional attended lectures.
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSimulatorOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Done & Close Simulator
            </button>
          </motion.div>
        </div>
      )}

      {/* Medical Slip Exemption Request Modal */}
      {isMedicalModalOpen && selectedMedicalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-800">
                  Medical Leave Attendance Exemption
                </h3>
              </div>
              <button
                onClick={() => setIsMedicalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Submit your authorized Government Hospital or Registered Medical Practitioner slip for{' '}
              <strong>{selectedMedicalCourse.courseName} ({selectedMedicalCourse.courseCode})</strong>.
              Upon verification, excused absences are credited back to your mandatory attendance index.
            </p>

            {medicalSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-xs text-emerald-900">
                  Medical Exemption Granted (+2 Sessions Added)
                </h4>
                <p className="text-[11px] text-emerald-700">
                  HOD Mechanical Engineering approved your request. Course attendance updated!
                </p>
              </div>
            ) : (
              <form onSubmit={handleMedicalSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Upload Scanned Medical Certificate (PDF/JPG)
                  </label>
                  <div className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl text-center space-y-1.5">
                    <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto" />
                    <input
                      type="text"
                      value={medicalFileName}
                      onChange={(e) => setMedicalFileName(e.target.value)}
                      className="w-full text-center text-xs font-mono font-bold bg-white border border-slate-300 rounded p-1"
                    />
                    <p className="text-[10px] text-slate-400">
                      Must contain doctor registration stamp and diagnosis dates
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMedicalModalOpen(false)}
                    className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Submit for Dean Approval
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
