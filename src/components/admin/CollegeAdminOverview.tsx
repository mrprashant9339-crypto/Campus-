import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  AlertTriangle,
  Building2,
  BarChart2,
  Clock,
  Sparkles,
  Search,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';
import { SecurityAuditLog } from '../SecurityAuditLog';

export const CollegeAdminOverview: React.FC = () => {
  const {
    currentCollege,
    verifications,
    reviewVerification,
    currentUser,
    addAnnouncement,
    auditLogs,
    openSecurityAuditLog,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'broadcast' | 'audit'>('overview');
  const [auditSubTab, setAuditSubTab] = useState<'verification_ledger' | 'system_events'>('verification_ledger');
  const [selectedVerifId, setSelectedVerifId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [emergencyTitle, setEmergencyTitle] = useState('');
  const [emergencyBody, setEmergencyBody] = useState('');

  const pendingQueue = verifications.filter((v) => v.status === 'pending');
  const approvedQueue = verifications.filter((v) => v.status === 'approved');

  const handleApprove = (id: string) => {
    reviewVerification(id, 'approved');
    alert('Verification request APPROVED. Digital Campus ID generated and activated.');
  };

  const handleReject = (id: string) => {
    if (!rejectReason) {
      alert('Please specify a rejection reason for student appeal.');
      return;
    }
    reviewVerification(id, 'rejected', rejectReason);
    setSelectedVerifId(null);
    setRejectReason('');
    alert('Verification request REJECTED with feedback notice.');
  };

  const handleEmergencyBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyTitle || !emergencyBody) return;

    addAnnouncement({
      title: emergencyTitle,
      body: emergencyBody,
      priority: 'emergency',
      targetGroup: 'Entire College',
      isPinned: true,
      requiresAck: true,
    });

    setEmergencyTitle('');
    setEmergencyBody('');
    alert('🚨 EMERGENCY BROADCAST PUSHED TO ENTIRE COLLEGE NETWORK.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* College Admin Header (CA-01) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentCollege.logoUrl || '🏛️'}</span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {currentCollege.name} — Control Room
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1">
            College Administrator: <strong>{currentUser.fullName}</strong> • Tenant Code: <strong className="font-mono text-white">{currentCollege.code}</strong>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border border-slate-700 rounded-xl p-1 bg-slate-800 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300'
            }`}
          >
            Overview (CA-01)
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'queue' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <span>Verification Queue</span>
            {pendingQueue.length > 0 && (
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold text-[10px]">
                {pendingQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'broadcast' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300'
            }`}
          >
            Emergency Broadcast
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* CA-01 Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI 4-Card Grid as specified in PRD Section 50 & Wireframe CA-01 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Students Active Today
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">1,240</div>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
                ↑ +12% vs last week
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Attendance Average
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">84%</div>
              <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
                ↑ +3% verified sessions
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assignment Completion
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">76%</div>
              <span className="text-[11px] font-bold text-amber-600 mt-1 inline-block">
                Mid-term submission week
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Campus Events & Fests
              </span>
              <div className="text-2xl font-black text-slate-900 mt-2">42</div>
              <span className="text-[11px] font-bold text-indigo-600 mt-1 inline-block">
                18 active student clubs
              </span>
            </div>
          </div>

          {/* Quick Roster Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Bulk CSV Student & Faculty Import (PRD Additions #4)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload registrar CSV sheets to pre-provision roll numbers, branches, and authorized domain emails.
              </p>
            </div>
            <button
              onClick={() => alert('Simulated CSV bulk-import: 450 student enrollments synced with ERP.')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk CSV Import</span>
            </button>
          </div>
        </div>
      )}

      {/* CA-02 Verification Queue Tab */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Identity Verification Review Queue (CA-02)
              </h3>
              <p className="text-xs text-slate-500">
                Authorized verifier scrutiny with OCR confidence matching
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              {pendingQueue.length} Pending Actions
            </span>
          </div>

          <div className="space-y-3">
            {pendingQueue.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{req.userName}</h4>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      {req.submittedData.rollNumber}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      OCR: {Math.round(req.ocrConfidence * 100)}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Role: <strong className="uppercase">{req.role}</strong> • {req.submittedData.department} (Sem {req.submittedData.semester}, Sec {req.submittedData.section})
                  </p>

                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Doc: {req.docName} ({req.docType})</span>
                    <span>•</span>
                    <span>Submitted: {req.submittedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() =>
                      openSecurityAuditLog({
                        id: req.userId,
                        fullName: req.userName,
                        email: req.userEmail,
                        role: req.role,
                        membership: { role: req.role, departmentName: req.submittedData?.department },
                      } as any)
                    }
                    className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1 cursor-pointer transition"
                    title="Inspect user's granular immutable security audit trail"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Audit Trail</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve ID</span>
                  </button>

                  <button
                    onClick={() => setSelectedVerifId(req.id)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}

            {pendingQueue.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                🎉 Verification queue is empty! All students and teachers are authenticated.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CA-07 Emergency Broadcast Tool */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Campus Emergency Announcement Broadcast Engine (Section 51-D)</span>
          </div>

          <p className="text-xs text-slate-600">
            Emergency broadcasts trigger high-priority alerts with mandatory acknowledgement across all mobile and web clients in the college tenant.
          </p>

          <form onSubmit={handleEmergencyBroadcast} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Emergency Headline</label>
              <input
                type="text"
                placeholder="E.g., Severe Weather Alert: Classes shifted online for 09 Oct"
                value={emergencyTitle}
                onChange={(e) => setEmergencyTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Detailed Circular / Instructions</label>
              <textarea
                rows={3}
                placeholder="Specify security actions, safety hotlines, gate restrictions..."
                value={emergencyBody}
                onChange={(e) => setEmergencyBody(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Emergency Notice Immediately</span>
            </button>
          </form>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuditSubTab('verification_ledger')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer transition ${
                  auditSubTab === 'verification_ledger'
                    ? 'bg-black text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                01 // VERIFICATION SECURITY LEDGER (MONOSPACE)
              </button>
              <button
                onClick={() => setAuditSubTab('system_events')}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer transition ${
                  auditSubTab === 'system_events'
                    ? 'bg-black text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                02 // SYSTEM OPS AUDIT LOG ({auditLogs.length})
              </button>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
              IMMUTABLE CHAIN VERIFIED ✓
            </span>
          </div>

          {auditSubTab === 'verification_ledger' ? (
            <SecurityAuditLog
              targetUser={currentUser}
              variant="standalone"
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Immutable Tamper-Evident Hash Chain Audit Log (Section 3.14 & PRD 1.7)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Append-only cryptographic ledger tracking role grants, verifications, and auth sessions
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold">
                  SHA-256 Chain
                </span>
              </div>

              <div className="space-y-2.5">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 font-mono">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Actor: <strong>{log.actorName}</strong> ({log.actorRole}) • Target: {log.refType}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Hash: {log.hash} • Prev: {log.prevHash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Reason Modal */}
      {selectedVerifId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Reject Verification Request</h3>
            <p className="text-xs text-slate-600">
              Please enter an official explanation. The student will be notified and can re-upload their document.
            </p>
            <textarea
              rows={3}
              placeholder="E.g., Document image is blurry or missing principal seal..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedVerifId(null)}
                className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedVerifId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
