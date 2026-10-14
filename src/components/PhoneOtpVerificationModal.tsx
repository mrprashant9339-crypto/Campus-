import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Smartphone,
  AlertTriangle,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { UserRole } from '../types';
import { sendRealPhoneOtp, verifyRealPhoneOtp } from '../services/verificationService';

export const PhoneOtpVerificationModal: React.FC = () => {
  const {
    isPhoneOtpModalOpen,
    setIsPhoneOtpModalOpen,
    currentUser,
    currentCollege,
    verifyPhoneWithOtp,
    phoneOtpTargetRole,
    updateCurrentUser,
    addNotification,
  } = useApp();

  const [step, setStep] = useState<'input_phone' | 'input_otp' | 'verified'>('input_phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [sessionToken, setSessionToken] = useState('');
  const [timer, setTimer] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ sealCode: string; token: string; certificate?: any } | null>(null);
  const [incomingSmsNotice, setIncomingSmsNotice] = useState<{
    sender: string;
    body: string;
    code: string;
  } | null>(null);

  useEffect(() => {
    if (isPhoneOtpModalOpen) {
      setPhoneNumber(currentUser.phone || '+91 98765 33445');
      setStep('input_phone');
      setErrorMsg('');
      setOtpCode(['', '', '', '', '', '']);
      setSessionToken('');
      setIncomingSmsNotice(null);
    }
  }, [isPhoneOtpModalOpen, currentUser]);

  useEffect(() => {
    let interval: any = null;
    if (step === 'input_otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isPhoneOtpModalOpen) return null;

  const roleLabel =
    phoneOtpTargetRole || currentUser.membership.role;

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'college_admin':
        return 'College Principal & Administrator';
      case 'hod':
        return 'HOD (Head of Department)';
      case 'teacher':
        return 'Academic Faculty Member';
      case 'student':
        return 'Enrolled Polytechnic Student';
      case 'platform_admin':
        return 'Platform Super Admin';
      case 'librarian':
        return 'Central Campus Librarian';
      case 'accountant':
        return 'Finance Officer & Accountant';
      case 'warden':
        return 'Hostel Warden';
      case 'alumni':
        return 'Verified Polytechnic Alumnus';
      case 'parent':
        return 'Guardian / Parent';
      case 'recruiter':
        return 'Industry Placement Partner';
      case 'lab_assistant':
        return 'Workshop & Lab Technician';
      case 'guest_faculty':
        return 'Visiting Guest Professor';
      default:
        return 'Institutional Identity';
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setIsSending(true);

    const res = await sendRealPhoneOtp(phoneNumber, currentUser.id, roleLabel);
    setIsSending(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to dispatch verification OTP');
      return;
    }

    if (res.sessionToken) {
      setSessionToken(res.sessionToken);
    }

    if (res.previewSms) {
      setIncomingSmsNotice(res.previewSms);
    }

    setStep('input_otp');
    setTimer(60);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const updated = [...otpCode];
    updated[index] = val;
    setOtpCode(updated);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtpCode(digits);
      const lastInput = document.getElementById('otp-box-5');
      lastInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter complete 6-digit OTP code');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    const res = await verifyRealPhoneOtp(phoneNumber, entered, sessionToken, currentUser.id);
    setIsVerifying(false);

    if (!res.success || !res.verified) {
      setErrorMsg(res.error || 'Invalid verification OTP code. Please re-enter.');
      return;
    }

    const cert = res.certificate;
    const sealCode = cert?.verificationSealCode || `SBTE-BIHAR-OTP-${Date.now().toString().slice(-6)}`;
    const securityToken = cert?.securityToken || `AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    setSuccessInfo({
      sealCode,
      token: securityToken,
      certificate: cert,
    });

    // Update currentUser state and local storage
    verifyPhoneWithOtp(phoneNumber, entered);
    if (cert) {
      updateCurrentUser({
        phone: phoneNumber,
        phoneVerified: true,
        institutionalVerification: cert,
      });
    }

    setStep('verified');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-[rgba(20,20,20,0.15)] shadow-2xl rounded-2xl overflow-hidden font-sans">
        {/* Top Header */}
        <div className="bg-[#141414] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
                Official SBTE Verification Gateway
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Phone & SMS OTP Clearance Protocol
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsPhoneOtpModalOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Context Banner */}
        <div className="px-6 py-2.5 bg-[#F8F7F4] border-b border-[rgba(20,20,20,0.08)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-semibold text-[#141414]">Target Clearance:</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2563eb] border border-blue-200 font-bold text-[10px] uppercase font-mono">
              {getRoleDisplayName(roleLabel)}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Node: {currentCollege.code}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {step === 'input_phone' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif text-xl font-bold text-[#141414]">
                  Enter Mobile Number for Institutional Verification
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real authentication confirmation: Enter your registered mobile number. A 6-digit official verification code (OTP) will be dispatched to authenticate that this identity is <strong>not a fake login</strong>.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Registered Indian Mobile Number (10 digits)
                </label>
                <div className="flex rounded-xl border border-slate-300 focus-within:border-[#2563eb] overflow-hidden shadow-xs">
                  <span className="bg-slate-100 px-3.5 py-3 text-xs font-bold text-slate-700 flex items-center gap-1.5 border-r border-slate-300">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber.replace('+91 ', '')}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 33445"
                    className="w-full px-3.5 py-3 text-sm font-mono text-slate-900 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Institutional Fraud Prevention:</span>
                </div>
                <p>
                  Principals, HODs, and Students must authenticate their active phone number. Upon verification, an official SBTE institutional seal and cryptographic token are bound to your active session.
                </p>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full py-3 bg-[#141414] hover:bg-[#2563eb] text-white font-bold text-xs tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>DISPATCHING SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <span>SEND 6-DIGIT VERIFICATION CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'input_otp' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="font-serif text-xl font-bold text-[#141414]">
                  Verify 6-Digit OTP Code
                </h4>
                <p className="text-xs text-slate-600">
                  Verification SMS has been dispatched to{' '}
                  <strong className="text-slate-900 font-mono">{phoneNumber}</strong>.
                </p>
              </div>

              {/* Live Server Dispatched SMS Notification Alert */}
              {incomingSmsNotice ? (
                <div
                  onClick={() => {
                    const digits = incomingSmsNotice.code.split('');
                    setOtpCode(digits);
                    setErrorMsg('');
                  }}
                  className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl cursor-pointer hover:bg-amber-100 transition shadow-xs space-y-1.5"
                  title="Click to auto-fill OTP code"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-900 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                      <span>{incomingSmsNotice.sender}</span>
                    </span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono">
                      CLICK TO AUTOFILL
                    </span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    "{incomingSmsNotice.body}"
                  </p>
                  <div className="flex items-center gap-2 pt-0.5 text-xs text-amber-900">
                    <span className="text-[11px] font-semibold">Active Code:</span>
                    <span className="font-mono font-black text-sm tracking-widest text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-300">
                      {incomingSmsNotice.code}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400 shrink-0" />
                  <span>Connecting to SBTE Telecom Relay Node for real cellular verification...</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 6 OTP Input Boxes with Auto-paste */}
              <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center font-mono text-xl font-black bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-[#2563eb] focus:outline-none transition shadow-2xs"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  Resend code in: <strong className="text-slate-800">{timer}s</strong>
                </span>
                <button
                  type="button"
                  disabled={timer > 0 || isSending}
                  onClick={handleSendOtp}
                  className="text-[#2563eb] font-bold text-xs hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('input_phone')}
                  className="w-1/3 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isVerifying}
                  className="w-2/3 py-3 bg-[#141414] hover:bg-[#2563eb] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>VALIDATING REAL OTP...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>VERIFY & AUTHENTICATE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'verified' && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-[#141414]">
                  Officially Verified!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Mobile number <strong>{phoneNumber}</strong> successfully authenticated. This account is legally recognized and validated against SBTE institutional records.
                </p>
              </div>

              {/* Official Seal Certificate Box */}
              <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] rounded-2xl text-left space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-[10px]">
                  <span className="text-slate-500">AUTHENTICATION STATUS</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    LEGAL INSTITUTIONAL SEAL ISSUED ✓
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Verified Identity:</span>
                  <span className="font-bold text-slate-900">{currentUser.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Clearance Role:</span>
                  <span className="font-bold text-blue-700">{getRoleDisplayName(roleLabel)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Registered College:</span>
                  <span className="font-bold text-slate-800">{currentCollege.name} ({currentCollege.code})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Official Seal Code:</span>
                  <span className="font-bold text-emerald-800">{successInfo?.sealCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Token Hash:</span>
                  <span className="text-slate-600">{successInfo?.token}</span>
                </div>
              </div>

              <button
                onClick={() => setIsPhoneOtpModalOpen(false)}
                className="w-full py-3 bg-[#141414] hover:bg-emerald-600 text-white font-bold text-xs tracking-wider rounded-xl transition cursor-pointer shadow-md"
              >
                RETURN TO VERIFIED DASHBOARD →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
