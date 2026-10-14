import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Phone,
  Building,
  UserCheck,
  Award,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { UserRole } from '../../types';

export const InstitutionalVerificationHeaderBanner: React.FC = () => {
  const { currentUser, currentCollege, openPhoneOtpVerification } = useApp();

  const isVerified =
    currentUser.phoneVerified ||
    currentUser.institutionalVerification?.isVerified ||
    currentUser.profile?.verificationBadgeStatus === 'verified';

  const role = currentUser.membership.role;

  const getRoleBadgeInfo = (r: UserRole) => {
    switch (r) {
      case 'college_admin':
        return {
          title: 'PRINCIPAL / COLLEGE ADMIN',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
          seal: 'SBTE-PRINCIPAL-VAL',
          level: 'Executive Clearance Level 1',
        };
      case 'hod':
        return {
          title: 'HOD / DEPARTMENT HEAD',
          badgeClass: 'bg-blue-950 text-blue-300 border-blue-500/40',
          seal: 'SBTE-HOD-CLEARANCE',
          level: 'Academic Clearance Level 2',
        };
      case 'teacher':
        return {
          title: 'VERIFIED FACULTY / PROFESSOR',
          badgeClass: 'bg-teal-950 text-teal-300 border-teal-500/40',
          seal: 'SBTE-FACULTY-ROSTER',
          level: 'Faculty Clearance Level 2',
        };
      case 'student':
        return {
          title: 'VERIFIED SBTE STUDENT',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-500/40',
          seal: 'SBTE-STUDENT-ENROLL',
          level: 'Enrolled Scholar Clearance Level 3',
        };
      case 'platform_admin':
        return {
          title: 'ROOT PLATFORM OPERATOR',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-500/40',
          seal: 'DSTTE-ROOT-AUTHORITY',
          level: 'Master Consortium Root Clearance',
        };
      case 'alumni':
        return {
          title: 'VERIFIED ALUMNI MEMBER',
          badgeClass: 'bg-purple-950 text-purple-300 border-purple-500/40',
          seal: 'POLYTECHNIC-ALUMNI-PASS',
          level: 'Community Mentorship Clearance',
        };
      case 'parent':
        return {
          title: 'VERIFIED GUARDIAN / PARENT',
          badgeClass: 'bg-sky-950 text-sky-300 border-sky-500/40',
          seal: 'WARD-GUARDIAN-LEDGER',
          level: 'Direct Ward Monitoring Clearance',
        };
      case 'librarian':
        return {
          title: 'CHIEF LIBRARIAN',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
          seal: 'CAMPUS-LIBRARY-VAL',
          level: 'Resource Administrator Clearance',
        };
      case 'lab_assistant':
        return {
          title: 'WORKSHOP & LAB TECHNICIAN',
          badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
          seal: 'WORKSHOP-APPARATUS-AUTH',
          level: 'Practical Laboratory Clearance',
        };
      case 'accountant':
        return {
          title: 'FINANCE & TREASURY OFFICER',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
          seal: 'TREASURY-ACCOUNTS-AUTH',
          level: 'Statutory Bursar Clearance',
        };
      case 'warden':
        return {
          title: 'HOSTEL WARDEN',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-500/40',
          seal: 'RESIDENTIAL-WELFARE-AUTH',
          level: 'Hostel Curfew Clearance',
        };
      case 'recruiter':
        return {
          title: 'OFFICIAL INDUSTRY RECRUITER',
          badgeClass: 'bg-violet-950 text-violet-300 border-violet-500/40',
          seal: 'DET-PLACEMENT-PARTNER',
          level: 'Verified Talent Scout Clearance',
        };
      case 'guest_faculty':
        return {
          title: 'VISITING PROFESSOR / GUEST',
          badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
          seal: 'GUEST-SYLLABUS-PASS',
          level: 'Time-Bound Academic Clearance',
        };
      default:
        return {
          title: 'AUTHENTICATED CAMPUS USER',
          badgeClass: 'bg-slate-900 text-slate-300 border-slate-700',
          seal: 'AAVRIT-TENANT-OK',
          level: 'Standard Clearance',
        };
    }
  };

  const badgeInfo = getRoleBadgeInfo(role);

  return (
    <div className="bg-[#111111] text-white border-b border-[#333333] px-4 sm:px-8 py-2 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono">
      {/* Left: Identity and Government / SBTE Verification Stamp */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <div className="w-5 h-5 bg-[#10B981] text-black font-bold flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-[#cc0000] text-white flex items-center justify-center shrink-0">
              <Lock className="w-3 h-3" />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm tracking-wide text-white uppercase">
              {currentUser.fullName}
            </span>
            <span
              className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-white text-black font-bold uppercase"
            >
              {badgeInfo.title}
            </span>
            <span className="text-[#666666] hidden sm:inline">//</span>
            <span className="text-[10px] text-[#999999] font-mono hidden sm:inline">
              NODE: <strong className="text-white">{currentCollege.code}</strong> ({currentCollege.name})
            </span>
          </div>
        </div>
      </div>

      {/* Right: Phone & OTP Verification Status Stamp + Fraud Protection Seal */}
      <div className="flex items-center gap-3 flex-wrap self-end md:self-auto">
        {currentUser.phoneVerified ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 border border-[#10B981] bg-[#10B981]/10 text-[#10B981] font-mono text-[9px]">
            <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />
            <span>
              PHONE {currentUser.phone || '+91 98765 33445'} // OTP VERIFIED ✓
            </span>
          </div>
        ) : (
          <button
            onClick={() => openPhoneOtpVerification(role)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#e0ddd5] text-black font-mono font-bold text-[9px] cursor-pointer transition uppercase"
            title="Click to authenticate via real Phone Number & SMS OTP"
          >
            <Smartphone className="w-3 h-3 text-black animate-pulse" />
            <span>VERIFY PHONE (OTP)</span>
          </button>
        )}

        <div className="hidden lg:flex items-center gap-1 text-[9px] font-mono text-[#888888] border-l border-[#333333] pl-3">
          <span className="text-[#666666]">SEAL:</span>
          <span className="text-white font-bold">{badgeInfo.seal}</span>
        </div>
      </div>
    </div>
  );
};
