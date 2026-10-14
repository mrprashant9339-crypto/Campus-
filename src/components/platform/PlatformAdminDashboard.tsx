import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Building,
  Users,
  CheckCircle2,
  Sliders,
  Activity,
  Lock,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const PlatformAdminDashboard: React.FC = () => {
  const { colleges, auditLogs } = useApp();

  const [featureFlags, setFeatureFlags] = useState<Record<string, Record<string, boolean>>>({
    'col-gpp-01': { ai: true, messaging: true, events: true, qrAttendance: true, interCollegeNetwork: true },
    'col-nit-02': { ai: true, messaging: true, events: true, qrAttendance: true, interCollegeNetwork: true },
    'col-iit-03': { ai: true, messaging: true, events: true, qrAttendance: true, interCollegeNetwork: true },
  });

  const toggleFlag = (collegeId: string, flag: string) => {
    setFeatureFlags((prev) => ({
      ...prev,
      [collegeId]: {
        ...prev[collegeId],
        [flag]: !prev[collegeId]?.[flag],
      },
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Root Admin Header (PA-01) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300">
            AAVRIT PLATFORM ROOT OPERATIONS
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5">
            Network Operations & Super Admin (PA-01)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Central governance across all verified university & polytechnic tenants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Cluster Healthy (p95: 240ms)</span>
          </span>
        </div>
      </div>

      {/* PA-01 Network KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Colleges</span>
          <div className="text-2xl font-black text-slate-900 mt-2">47 Tenants</div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
            100% Isolated Schemas
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Enrolled Users</span>
          <div className="text-2xl font-black text-slate-900 mt-2">62,340</div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
            41.2K Monthly Active
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Identity Verified %</span>
          <div className="text-2xl font-black text-slate-900 mt-2">78%</div>
          <span className="text-[11px] font-bold text-indigo-600 mt-1 inline-block">
            SLA: &lt; 24h review
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">System Error Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-2">0.03%</div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
            TLS 1.3 Strict Enforced
          </span>
        </div>
      </div>

      {/* Feature Flags per College Tenant (PA-07) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Tenant Feature Flags Management (PA-07)
            </h3>
            <p className="text-xs text-slate-500">
              Selectively enable/disable capabilities per institution
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
            Dynamic Runtime Toggles
          </span>
        </div>

        <div className="space-y-4">
          {colleges.map((col) => (
            <div key={col.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {col.name} ({col.code})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Plan: <span className="uppercase font-bold text-indigo-600">{col.plan}</span> • {col.city}, {col.state}
                  </p>
                </div>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                  ✓ Verified Tenant
                </span>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold">
                {[
                  { key: 'ai', label: 'Campus AI Copilot' },
                  { key: 'messaging', label: 'Academic Messaging' },
                  { key: 'qrAttendance', label: 'QR Attendance Sessions' },
                  { key: 'interCollegeNetwork', label: 'Layer B Inter-College Network' },
                ].map((f) => {
                  const isEnabled = featureFlags[col.id]?.[f.key] !== false;
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleFlag(col.id, f.key)}
                      className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                        isEnabled
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      <span>{isEnabled ? '✓ Enabled:' : '✗ Disabled:'}</span>
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Audit Ledger (PA-04) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Cross-Tenant Immutable Hash-Chain Logs (PA-04)
            </h3>
            <p className="text-xs text-slate-500">
              Cryptographically linked audit record for compliance and legal accountability
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-600 font-bold">
            Root Authority Chain
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {auditLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-3 bg-slate-950 text-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="font-bold">{log.action}</span>
                <span className="text-[10px] text-slate-400">{log.timestamp}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Tenant: {log.collegeName} • Actor: {log.actorName} ({log.actorRole})
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Hash: {log.hash}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
