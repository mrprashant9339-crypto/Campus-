import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CameraScanner } from './CameraScanner';
import {
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  QrCode,
  BookOpen,
  Camera,
  Fingerprint,
  Settings,
  Building,
  Home,
  Megaphone,
  Check,
} from 'lucide-react';

export const StudentHome: React.FC = () => {
  const {
    currentUser,
    currentCollege,
    assignments,
    announcements,
    acknowledgeAnnouncement,
    submitAssignment,
    setActiveNavTab,
    openDigitalIdWithBiometrics,
    isBiometricEnabled,
    setIsUserSettingsOpen,
    setIsCollegeDashboardOpen,
  } = useApp();

  const userBranchCode =
    (currentUser?.membership?.branchCode as 'ME' | 'CE' | 'CSE' | 'EE') ||
    (currentUser?.profile?.branchCode as 'ME' | 'CE' | 'CSE' | 'EE') ||
    'ME';

  const [bulletinScope, setBulletinScope] = useState<'departmental' | 'hostel' | 'general_academic'>('departmental');

  const filteredHomeAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      if (bulletinScope === 'departmental') {
        const isDept = ann.scopeType === 'departmental' || (!ann.scopeType && ann.branchCode);
        if (!isDept) return false;
        if (ann.branchCode && ann.branchCode !== 'ALL' && ann.branchCode !== userBranchCode) {
          return false;
        }
      } else if (bulletinScope === 'hostel') {
        const isHostel =
          ann.scopeType === 'hostel' ||
          ann.targetGroup.toLowerCase().includes('hostel') ||
          ann.title.toLowerCase().includes('hostel') ||
          ann.title.toLowerCase().includes('mess');
        if (!isHostel) return false;
      } else if (bulletinScope === 'general_academic') {
        const isGeneral =
          ann.scopeType === 'general_academic' ||
          (!ann.branchCode && !ann.scopeType && !ann.targetGroup.toLowerCase().includes('hostel'));
        if (!isGeneral) return false;
      }
      return true;
    }).slice(0, 3);
  }, [announcements, bulletinScope, userBranchCode]);

  const [activeAssignmentToSubmit, setActiveAssignmentToSubmit] = useState<string | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('Prashant_Kumar_ME3A_Thermo_Assgn2.pdf');
  const [submissionNotes, setSubmissionNotes] = useState('Attached solved numericals from Q1 to Q10.');
  const [showSyllabusNotice, setShowSyllabusNotice] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(true);

  const upcomingAsg = assignments[0];

  const handleSubmit = (asgId: string) => {
    submitAssignment(asgId, { fileName: submissionFileName, content: submissionNotes });
    setActiveAssignmentToSubmit(null);
  };

  const handleDownloadSyllabus = () => {
    setShowSyllabusNotice(true);
    setTimeout(() => setShowSyllabusNotice(false), 5000);
  };

  const subjects = [
    { code: 'ME301', name: 'Thermodynamics', conducted: 42, attended: 38, pct: '90.4%', status: 'COMPLIANT', color: '#2563eb' },
    { code: 'ME302', name: 'Fluid Mechanics', conducted: 36, attended: 31, pct: '86.1%', status: 'COMPLIANT', color: '#2563eb' },
    { code: 'ME303', name: 'Theory of Machines', conducted: 40, attended: 28, pct: '70.0%', status: 'DEFICIT', color: '#dc2626' },
    { code: 'ME304', name: 'Manufacturing Tech', conducted: 39, attended: 28, pct: '71.7%', status: 'DEFICIT', color: '#dc2626' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Syllabus Download Toast */}
      {showSyllabusNotice && (
        <div className="p-4 border border-[#111111] bg-white flex items-center justify-between text-xs text-[#111111] shadow-xs font-mono">
          <span>✓ SBTE 3rd Semester Mechanical Syllabus PDF dispatched to downloads directory.</span>
          <button onClick={() => setShowSyllabusNotice(false)} className="underline cursor-pointer hover:text-[#cc0000]">
            [DISMISS]
          </button>
        </div>
      )}

      {/* Variation 12 Alert Box */}
      <div className="alert-box">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <strong>[CRITICAL]</strong> ME303 / ME304 ATTENDANCE BELOW REQUIRED THRESHOLD (75%). ACTION REQUIRED BEFORE FINALS MANDATED BY SBTE PATNA.
          </div>
          <button
            onClick={() => setActiveNavTab('progress')}
            className="px-3 py-1 bg-white text-black font-mono font-bold text-[10px] uppercase shrink-0 hover:bg-[#e0ddd5] transition cursor-pointer"
          >
            AUDIT LEDGER →
          </button>
        </div>
      </div>

      {/* Variation 12 Stat Grid */}
      <div className="stat-grid">
        <div className="card-outline">
          <div className="meta">Global Attendance</div>
          <div className="giant-num">79.6%</div>
          <div className="footer-line" style={{ borderWidth: '1px' }}>
            <span className="meta">UNIT 125/157</span>
            <span className="meta" style={{ color: 'var(--ink)', fontWeight: 700 }}>+8 SURPLUS</span>
          </div>
        </div>

        <div className="card-outline flex flex-col justify-center items-center text-center">
          <div style={{ width: '90px', height: '90px', border: '2px solid var(--ink)', padding: '8px' }}>
            <div style={{ width: '100%', height: '100%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="meta" style={{ margin: '14px 0 10px 0' }}>OPTICAL HANDSHAKE</div>
          <button
            onClick={() => setShowCameraScanner(!showCameraScanner)}
            className="btn-black"
            style={{ padding: '8px 16px', fontSize: '0.72rem', width: 'auto' }}
          >
            {showCameraScanner ? 'DISENGAGE SCAN' : 'ENGAGE SCAN'}
          </button>
        </div>
      </div>

      {/* Action Command Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={openDigitalIdWithBiometrics}
          className="btn-outline !w-auto"
        >
          {isBiometricEnabled ? <Fingerprint className="w-3.5 h-3.5 text-emerald-600" /> : <QrCode className="w-3.5 h-3.5" />}
          <span>ID LEDGER</span>
        </button>
        <button onClick={handleDownloadSyllabus} className="btn-outline !w-auto">
          <Download className="w-3.5 h-3.5" />
          <span>OFFICIAL SYLLABUS</span>
        </button>
        <button onClick={() => setIsUserSettingsOpen(true)} className="btn-outline !w-auto">
          <Settings className="w-3.5 h-3.5" />
          <span>SETTINGS</span>
        </button>
        <button onClick={() => setActiveNavTab('progress')} className="btn-outline !w-auto">
          <span>ATTENDANCE LEDGER</span>
        </button>
        <button onClick={() => setActiveAssignmentToSubmit(upcomingAsg?.id || 'asg-1')} className="btn-outline !w-auto">
          <Upload className="w-3.5 h-3.5" />
          <span>UPLOAD ASSIGNMENT</span>
        </button>
        <button onClick={() => setIsCollegeDashboardOpen(true)} className="btn-outline !w-auto">
          <span>TENANT PROFILE</span>
        </button>
      </div>

      {/* Camera Scanner Component for Instant Event/Attendance Check-in */}
      {showCameraScanner && (
        <div id="optical-camera-scanner-section">
          <CameraScanner onClose={() => setShowCameraScanner(false)} />
        </div>
      )}

      {/* Main Grid: Registration Ledger & Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Left: Registration Ledger Table */}
        <div className="card-outline">
          <div className="flex items-center justify-between pb-3 border-b border-[#e0ddd5] mb-4">
            <div>
              <div className="meta">REGISTRATION LEDGER — SECTOR 3A</div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight mt-0.5">
                Academic Course Roster
              </h3>
            </div>
            <span className="meta px-2 py-0.5 bg-[#111111] text-white font-bold">
              SBTE VALIDATED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="font-mono text-[10px] text-left p-2.5 bg-[#111111] text-white">COURSE_ID</th>
                  <th className="font-mono text-[10px] text-center p-2.5 bg-[#111111] text-white">TOT</th>
                  <th className="font-mono text-[10px] text-center p-2.5 bg-[#111111] text-white">ACT</th>
                  <th className="font-mono text-[10px] text-center p-2.5 bg-[#111111] text-white">PERC</th>
                  <th className="font-mono text-[10px] text-right p-2.5 bg-[#111111] text-white">AUDIT</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.code} className="border-b border-[#e0ddd5] hover:bg-[#faf9f6]">
                    <td className="p-3 text-xs">
                      <div className="font-bold text-[#111111]">{sub.name}</div>
                      <div className="text-[10px] font-mono text-[#666666]">{sub.code}</div>
                    </td>
                    <td className="p-3 text-center text-xs font-mono text-[#666666]">{sub.conducted}</td>
                    <td className="p-3 text-center text-xs font-mono font-bold text-[#111111]">{sub.attended}</td>
                    <td
                      className="p-3 text-center text-xs font-mono font-bold"
                      style={{ color: sub.status === 'DEFICIT' ? 'var(--warning)' : 'var(--ink)' }}
                    >
                      {sub.pct}
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className="font-mono text-[10px] uppercase font-bold"
                        style={{ color: sub.status === 'DEFICIT' ? 'var(--warning)' : 'var(--ink)' }}
                      >
                        {sub.status === 'DEFICIT' ? 'Fail' : 'Pass'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Subcolumn: Campus Bulletins */}
        <div className="space-y-6">
          <div className="card-outline space-y-4">
            <div className="border-b border-[#e0ddd5] pb-3 flex items-center justify-between">
              <div>
                <div className="meta">OFFICIAL GAZETTE // {userBranchCode} BRANCH</div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight mt-0.5">
                  Campus Bulletins
                </h3>
              </div>
              <button
                onClick={() => setActiveNavTab('feed')}
                className="text-[10px] font-mono text-[#111111] font-bold hover:underline cursor-pointer flex items-center gap-1"
                title="Open full bulletin feed with cross-role & branch simulation"
              >
                <span>ALL DISPATCHES</span>
                <span>[→]</span>
              </button>
            </div>

            {/* Scope Toggle Filter Strip */}
            <div className="grid grid-cols-3 gap-1 bg-[#f4f2ec] p-1 border border-[#e0ddd5]">
              <button
                onClick={() => setBulletinScope('departmental')}
                className={`py-1.5 px-2 text-[10px] font-mono font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                  bulletinScope === 'departmental'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#555555] hover:text-[#111111] hover:bg-white/60'
                }`}
                title={`Departmental notices for ${userBranchCode}`}
              >
                <Building className="w-3 h-3" />
                <span>DEPT ({userBranchCode})</span>
              </button>
              <button
                onClick={() => setBulletinScope('hostel')}
                className={`py-1.5 px-2 text-[10px] font-mono font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                  bulletinScope === 'hostel'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#555555] hover:text-[#111111] hover:bg-white/60'
                }`}
                title="Hostel & dining hall directives"
              >
                <Home className="w-3 h-3" />
                <span>HOSTEL</span>
              </button>
              <button
                onClick={() => setBulletinScope('general_academic')}
                className={`py-1.5 px-2 text-[10px] font-mono font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                  bulletinScope === 'general_academic'
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#555555] hover:text-[#111111] hover:bg-white/60'
                }`}
                title="SBTE Bihar statutory & exam circulars"
              >
                <Megaphone className="w-3 h-3" />
                <span>GENERAL</span>
              </button>
            </div>

            {/* Dynamic Announcement Items */}
            <div className="space-y-3 pt-1">
              {filteredHomeAnnouncements.length > 0 ? (
                filteredHomeAnnouncements.map((ann) => {
                  const isUrgent = ann.priority === 'emergency' || ann.priority === 'high';
                  const isAcknowledged = ann.acknowledgedByMe;

                  return (
                    <div key={ann.id} className="border-b border-[#e0ddd5] pb-3 last:border-b-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase ${
                            isUrgent ? 'text-[#cc0000]' : 'text-[#555555]'
                          }`}
                        >
                          {ann.priority === 'emergency'
                            ? '[EMERGENCY DIRECTIVE]'
                            : ann.scopeType === 'departmental'
                            ? `[DEPT // ${ann.branchCode || userBranchCode}]`
                            : ann.scopeType === 'hostel'
                            ? `[HOSTEL // ${ann.hostelBlock || 'RESIDENTIAL'}]`
                            : '[STATUTORY // SBTE BIHAR]'}
                        </span>
                        <span className="text-[9px] font-mono text-[#888888]">{ann.createdAt}</span>
                      </div>

                      <h4 className="font-display text-sm font-bold text-[#111111] uppercase leading-snug">
                        {ann.title}
                      </h4>

                      <p className="text-xs text-[#555555] leading-relaxed line-clamp-2 font-sans">
                        {ann.body}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-[#777777]">
                        <span className="truncate max-w-[200px]">{ann.authorName}</span>
                        {ann.requiresAck && (
                          <div>
                            {isAcknowledged ? (
                              <span className="text-[9px] font-mono text-emerald-700 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>ACKED</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => acknowledgeAnnouncement(ann.id)}
                                className="text-[9px] font-mono text-[#111111] font-bold bg-[#faf9f6] border border-[#111111] px-1.5 py-0.5 hover:bg-[#111111] hover:text-white transition cursor-pointer"
                              >
                                ACK [✓]
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-[#777777] bg-[#faf9f6] border border-[#e0ddd5]">
                  No active bulletins in this scope.
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule & Room Dispatches */}
          <div className="card-outline space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0ddd5]">
              <div>
                <div className="meta">LIVE TELEMETRY</div>
                <h3 className="font-display text-lg font-bold uppercase tracking-tight mt-0.5">
                  Today's Classroom Dispatches
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#666666]">OCTOBER 11, 2026</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#faf9f6] border border-[#e0ddd5] flex items-center justify-between hover:border-[#111111] transition">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono bg-[#111111] text-white font-bold px-1.5 py-0.5">
                      10:00 - 11:00 AM
                    </span>
                    <h4 className="font-bold text-[#111111] text-xs">Thermodynamics (ME301)</h4>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Room 204 · Mr. Suresh Prasad · Clausius Inequality
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCameraScanner(true);
                    document.getElementById('optical-camera-scanner-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-black !w-auto !py-1 !px-2.5 text-[9px]"
                >
                  SCAN QR
                </button>
              </div>

              <div className="p-3 bg-[#faf9f6] border border-[#e0ddd5] flex items-center justify-between hover:border-[#111111] transition">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono border border-[#111111] text-[#111111] px-1.5 py-0.5 font-bold">
                      12:00 - 02:00 PM
                    </span>
                    <h4 className="font-bold text-[#111111] text-xs">Engineering Mechanics Lab (ME302P)</h4>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Workshop Lab 2 · Ms. Priya Sharma · Bell Crank
                  </p>
                </div>
                <span className="text-[10px] text-[#111111] font-mono font-bold">PRACTICAL</span>
              </div>
            </div>
          </div>
          {/* Upcoming Assignment Section */}
          {upcomingAsg && (
            <div className="card-outline space-y-3">
              <div className="flex items-center justify-between">
                <div className="meta">PENDING TASK</div>
                <span className="text-[10px] font-mono text-[#cc0000] font-bold">DUE OCT 18</span>
              </div>
              <h4 className="font-display text-lg font-bold leading-tight text-[#111111] uppercase">
                {upcomingAsg.title}
              </h4>
              <p className="text-xs text-[#555555] leading-relaxed font-sans">
                {upcomingAsg.description}
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setActiveAssignmentToSubmit(upcomingAsg.id)}
                  className="btn-black !text-xs w-full"
                >
                  UPLOAD ASSIGNMENT PDF →
                </button>
              </div>
            </div>
          )}

          {/* Secure Repositories Shortcuts */}
          <div className="card-outline space-y-3">
            <div className="meta">SECURE REPOSITORIES</div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setActiveNavTab('notes')}
                className="p-3 border border-[#111111] bg-[#faf9f6] text-left hover:bg-[#111111] hover:text-white transition group cursor-pointer"
              >
                <div className="font-display text-sm font-bold uppercase text-[#111111] group-hover:text-white">NOTES VAULT</div>
                <div className="text-[9px] font-mono text-[#666666] group-hover:text-[#e0ddd5] mt-0.5">PYQS & LAB MANUALS</div>
              </button>
              <button
                onClick={() => setActiveNavTab('events')}
                className="p-3 border border-[#111111] bg-[#faf9f6] text-left hover:bg-[#111111] hover:text-white transition group cursor-pointer"
              >
                <div className="font-display text-sm font-bold uppercase text-[#111111] group-hover:text-white">SYMPOSIA</div>
                <div className="text-[9px] font-mono text-[#666666] group-hover:text-[#e0ddd5] mt-0.5">STATE CONCLAVES</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Assignment Modal */}
      {activeAssignmentToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[rgba(20,20,20,0.15)] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(20,20,20,0.08)]">
              <div>
                <span className="label text-[9px]">DOCUMENT DISPATCH</span>
                <h3 className="font-serif text-xl font-bold text-[#141414]">
                  Endorse Assignment PDF
                </h3>
              </div>
              <button
                onClick={() => setActiveAssignmentToSubmit(null)}
                className="text-[#141414]/60 hover:text-[#dc2626] font-mono cursor-pointer"
              >
                [X]
              </button>
            </div>

            <div>
              <span className="label text-[9px] block mb-1">TARGET PDF ARTIFACT</span>
              <div className="p-4 border border-dashed border-[rgba(20,20,20,0.2)] bg-[#F8F7F4] text-center space-y-2">
                <Upload className="w-5 h-5 text-[#2563eb] mx-auto" />
                <input
                  type="text"
                  value={submissionFileName}
                  onChange={(e) => setSubmissionFileName(e.target.value)}
                  className="w-full text-center text-xs font-mono bg-white border border-[rgba(20,20,20,0.15)] text-[#141414] p-1.5 focus:border-[#2563eb] outline-none"
                />
                <p className="text-[9px] font-mono text-[#2563eb]">
                  STORED VIA ISOLATED FIREBASE STORAGE BUCKET
                </p>
              </div>
            </div>

            <div>
              <span className="label text-[9px] block mb-1">STUDENT ATTESTATION NOTE</span>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                className="w-full border border-[rgba(20,20,20,0.15)] bg-white text-[#141414] p-2 text-xs font-sans focus:border-[#2563eb] outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setActiveAssignmentToSubmit(null)}
                className="btn-pill alt flex-1"
              >
                ABORT
              </button>
              <button
                onClick={() => handleSubmit(activeAssignmentToSubmit)}
                className="btn-pill accent flex-1"
              >
                DISPATCH PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
