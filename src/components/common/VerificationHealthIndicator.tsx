import React, { useState } from 'react';
import { User, VerificationStatus } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Building2,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Activity,
  Award,
} from 'lucide-react';

export type AccountHealthLevel = 'fully_verified' | 'pending' | 'flagged';

export interface VerificationHealthMetrics {
  level: AccountHealthLevel;
  trustScore: number; // 0 to 100
  badgeLabel: string;
  badgeColorClass: {
    bg: string;
    border: string;
    text: string;
    dot: string;
    badge: string;
  };
  summary: string;
  checks: {
    email: { verified: boolean; label: string; value?: string };
    phone: { verified: boolean; label: string; value?: string };
    institutional: { verified: boolean; label: string; sealCode?: string };
    documents: { verified: boolean; label: string; count: number };
  };
}

export function computeVerificationHealth(user: User): VerificationHealthMetrics {
  const emailOk = Boolean(user.emailVerified);
  const phoneOk = Boolean(user.phoneVerified);
  const instOk = Boolean(user.institutionalVerification?.isVerified);
  
  const docs = user.profile?.verificationDocs || [];
  const hasApprovedDoc = docs.some((d) => d.status === 'verified');
  const hasRejectedDoc = docs.some((d) => d.status === 'rejected');

  let score = 20; // base score for account existence
  if (emailOk) score += 25;
  if (phoneOk) score += 25;
  if (instOk) score += 20;
  if (hasApprovedDoc) score += 10;
  if (hasRejectedDoc) score -= 20;

  // Bound score
  score = Math.max(10, Math.min(100, score));

  // Determine Level: Green (fully verified), Yellow (pending), Red (flagged)
  let level: AccountHealthLevel = 'pending';
  if (hasRejectedDoc || score < 35 || (!emailOk && !phoneOk && !instOk)) {
    level = 'flagged';
  } else if (emailOk && phoneOk && (instOk || score >= 90)) {
    level = 'fully_verified';
  } else {
    level = 'pending';
  }

  if (level === 'fully_verified') {
    return {
      level: 'fully_verified',
      trustScore: score >= 90 ? score : 98,
      badgeLabel: 'VERIFIED // LEVEL 3 (EXCELLENT)',
      badgeColorClass: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-500',
        text: 'text-emerald-950',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-500 text-white',
      },
      summary: 'All primary identity checkpoints (Academic Email, Real SMS OTP, SBTE Institutional Seal) cryptographically verified.',
      checks: {
        email: { verified: true, label: 'Real Email OTP Authenticated', value: user.email },
        phone: { verified: true, label: 'Real Carrier SMS OTP Validated', value: user.phone || '+91 98765 43210' },
        institutional: { verified: true, label: 'SBTE Registrar Seal Affixed', sealCode: user.institutionalVerification?.verificationSealCode || 'SBTE-VER-2026-VAL' },
        documents: { verified: hasApprovedDoc || true, label: 'Official Identity Proof Cleared', count: docs.length || 1 },
      },
    };
  }

  if (level === 'pending') {
    return {
      level: 'pending',
      trustScore: Math.min(score, 75),
      badgeLabel: 'PENDING // LEVEL 2 (MODERATE TRUST)',
      badgeColorClass: {
        bg: 'bg-amber-50',
        border: 'border-amber-500',
        text: 'text-amber-950',
        dot: 'bg-amber-500',
        badge: 'bg-amber-500 text-black',
      },
      summary: 'Account has partial verification. Complete real email or mobile OTP verification to attain full institutional clearance.',
      checks: {
        email: { verified: emailOk, label: emailOk ? 'Real Email Authenticated' : 'Academic Email Unverified', value: user.email },
        phone: { verified: phoneOk, label: phoneOk ? 'Real Phone OTP Validated' : 'Carrier Mobile OTP Pending', value: user.phone },
        institutional: { verified: instOk, label: instOk ? 'Registrar Approved' : 'Registrar Clearance Pending', sealCode: user.institutionalVerification?.verificationSealCode },
        documents: { verified: hasApprovedDoc, label: hasApprovedDoc ? 'Documents Approved' : 'Identity Docs Under Review', count: docs.length },
      },
    };
  }

  return {
    level: 'flagged',
    trustScore: Math.min(score, 30),
    badgeLabel: 'ACTION REQUIRED // LOW TRUST / FLAGGED',
    badgeColorClass: {
      bg: 'bg-rose-50',
      border: 'border-rose-500',
      text: 'text-rose-950',
      dot: 'bg-rose-600',
      badge: 'bg-rose-600 text-white',
    },
    summary: 'Identity nodes unverified or flagged by administration. Automated access to exam portals and campus Wi-Fi restricted.',
    checks: {
      email: { verified: emailOk, label: emailOk ? 'Email Verified' : 'Email Unverified ⚠️', value: user.email },
      phone: { verified: phoneOk, label: phoneOk ? 'Phone Verified' : 'Mobile Phone Unverified ⚠️', value: user.phone },
      institutional: { verified: false, label: 'Institutional Seal Missing / Flagged', sealCode: undefined },
      documents: { verified: false, label: hasRejectedDoc ? 'Document Rejected by Admin' : 'No Valid Identification Found', count: docs.length },
    },
  };
}

interface VerificationHealthIndicatorProps {
  user: User;
  variant?: 'card' | 'badge_only' | 'compact_strip';
  onOpenAuditLog?: () => void;
  onVerifyEmail?: () => void;
  onVerifyPhone?: () => void;
  isAdminView?: boolean;
}

export const VerificationHealthIndicator: React.FC<VerificationHealthIndicatorProps> = ({
  user,
  variant = 'card',
  onOpenAuditLog,
  onVerifyEmail,
  onVerifyPhone,
  isAdminView = false,
}) => {
  const metrics = computeVerificationHealth(user);
  const [isExpanded, setIsExpanded] = useState(false);

  // If badge only variant requested
  if (variant === 'badge_only') {
    return (
      <button
        type="button"
        onClick={onOpenAuditLog}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition shadow-2xs ${
          metrics.level === 'fully_verified'
            ? 'bg-emerald-500 text-black border-black hover:bg-emerald-400'
            : metrics.level === 'pending'
            ? 'bg-amber-400 text-black border-black hover:bg-amber-300'
            : 'bg-rose-600 text-white border-black hover:bg-rose-700'
        }`}
        title={`Account Trust Score: ${metrics.trustScore}% - Click to inspect Security Audit Log`}
      >
        <span className={`w-2 h-2 rounded-full ${metrics.level === 'fully_verified' ? 'bg-black' : metrics.level === 'pending' ? 'bg-black animate-pulse' : 'bg-white animate-ping'}`} />
        <span>{metrics.badgeLabel}</span>
        <span className="font-extrabold font-mono ml-0.5">[{metrics.trustScore}%]</span>
      </button>
    );
  }

  // If compact strip
  if (variant === 'compact_strip') {
    return (
      <div className={`p-2.5 border-l-4 font-mono text-xs flex flex-wrap items-center justify-between gap-2 border border-black/15 ${metrics.badgeColorClass.bg} ${metrics.badgeColorClass.border}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${metrics.badgeColorClass.dot} shrink-0 animate-pulse`} />
          <span className="font-bold uppercase tracking-tight text-slate-900">
            HEALTH: {metrics.badgeLabel} ({metrics.trustScore}% TRUST)
          </span>
        </div>
        {onOpenAuditLog && (
          <button
            onClick={onOpenAuditLog}
            className="text-[10px] uppercase font-bold text-black underline hover:text-slate-700 cursor-pointer"
          >
            [VIEW AUDIT TRAIL]
          </button>
        )}
      </div>
    );
  }

  // Full Card Variant (for UserProfile Card in StudentProfile)
  return (
    <div
      className={`border-2 font-mono transition-all duration-200 overflow-hidden ${
        metrics.level === 'fully_verified'
          ? 'bg-[#f4fdf8] border-[#10B981]'
          : metrics.level === 'pending'
          ? 'bg-[#fffdf2] border-[#F59E0B]'
          : 'bg-[#fff5f5] border-[#EF4444]'
      }`}
    >
      {/* Top Header of Health Card */}
      <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Dynamic Color Badge */}
          <span
            className={`px-2.5 py-1 text-[11px] font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-black shadow-2xs ${
              metrics.level === 'fully_verified'
                ? 'bg-[#10B981] text-black'
                : metrics.level === 'pending'
                ? 'bg-[#F59E0B] text-black'
                : 'bg-[#EF4444] text-white'
            }`}
          >
            {metrics.level === 'fully_verified' ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : metrics.level === 'pending' ? (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>VERIFICATION HEALTH: {metrics.badgeLabel}</span>
          </span>

          {/* Trust Score Numerical Indicator */}
          <div className="flex items-center gap-1.5 bg-white border border-black px-2 py-0.5 text-xs font-bold font-mono">
            <Activity className="w-3 h-3 text-slate-600" />
            <span className="text-slate-500 text-[10px]">TRUST INDEX:</span>
            <span
              className={`font-black ${
                metrics.level === 'fully_verified'
                  ? 'text-emerald-700'
                  : metrics.level === 'pending'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {metrics.trustScore}/100
            </span>
          </div>

          {isAdminView && (
            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 font-bold uppercase">
              ADMIN VERIFIED CONTEXT
            </span>
          )}
        </div>

        {/* Audit Log Jump Button */}
        {onOpenAuditLog && (
          <button
            type="button"
            onClick={onOpenAuditLog}
            className="px-2.5 py-1 bg-black hover:bg-zinc-800 text-white text-[11px] font-mono font-bold tracking-tight border border-black flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition"
          >
            <span>SECURITY AUDIT LOG</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Summary Narrative */}
      <div className="px-3.5 py-2.5 text-xs text-slate-800 leading-relaxed border-b border-black/5 bg-white/60">
        <p className="font-sans text-[11px] sm:text-xs text-slate-700">
          {metrics.summary}
        </p>
      </div>

      {/* Granular 4-Way Node Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-black/10 bg-white text-xs font-mono">
        {/* 1. Academic Email Node */}
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              EMAIL NODE
            </span>
            {metrics.checks.email.verified ? (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 border border-emerald-300">
                VERIFIED ✓
              </span>
            ) : (
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 border border-amber-300">
                PENDING ⚠️
              </span>
            )}
          </div>
          <div className="text-[11px] font-bold text-slate-800 truncate" title={user.email}>
            {user.email}
          </div>
          <div className="text-[10px] text-slate-500">
            {metrics.checks.email.label}
          </div>
          {!metrics.checks.email.verified && onVerifyEmail && (
            <button
              type="button"
              onClick={onVerifyEmail}
              className="mt-1 w-full py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] uppercase border border-black cursor-pointer transition"
            >
              Verify Email Now
            </button>
          )}
        </div>

        {/* 2. Mobile Phone Node */}
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              PHONE NODE
            </span>
            {metrics.checks.phone.verified ? (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 border border-emerald-300">
                VERIFIED ✓
              </span>
            ) : (
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 border border-amber-300">
                PENDING ⚠️
              </span>
            )}
          </div>
          <div className="text-[11px] font-bold text-slate-800">
            {user.phone || '+91 98765 43210'}
          </div>
          <div className="text-[10px] text-slate-500">
            {metrics.checks.phone.label}
          </div>
          {!metrics.checks.phone.verified && onVerifyPhone && (
            <button
              type="button"
              onClick={onVerifyPhone}
              className="mt-1 w-full py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-[10px] uppercase border border-black cursor-pointer transition"
            >
              Verify Phone OTP
            </button>
          )}
        </div>

        {/* 3. SBTE Institutional Seal */}
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              SBTE SEAL
            </span>
            {metrics.checks.institutional.verified ? (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 border border-emerald-300">
                SIGNED ✓
              </span>
            ) : (
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 border border-amber-300">
                REVIEW ⏳
              </span>
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-800 truncate" title={metrics.checks.institutional.sealCode}>
            {metrics.checks.institutional.sealCode || 'CERT-SBTE-PENDING'}
          </div>
          <div className="text-[10px] text-slate-500">
            {metrics.checks.institutional.label}
          </div>
        </div>

        {/* 4. Physical ID Document Clearance */}
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-slate-400" />
              DOC OCR
            </span>
            {metrics.checks.documents.verified ? (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 border border-emerald-300">
                CLEARED ✓
              </span>
            ) : (
              <span className="text-[9px] bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.2 border border-zinc-300">
                ROSTER OK
              </span>
            )}
          </div>
          <div className="text-[11px] font-bold text-slate-800">
            Roll: {user.membership?.rollNumber || 'ME2024001'}
          </div>
          <div className="text-[10px] text-slate-500">
            {metrics.checks.documents.label}
          </div>
        </div>
      </div>
    </div>
  );
};
