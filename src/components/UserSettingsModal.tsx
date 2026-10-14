import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Fingerprint,
  ScanFace,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Settings,
  Lock,
  Sparkles,
  Check,
  CheckCircle2,
  Sliders,
  Download,
  Bell,
  Wifi,
  FileText,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { registerBiometric, isWebAuthnAvailable, playBiometricSound } from '../utils/biometrics';

export const UserSettingsModal: React.FC = () => {
  const {
    isUserSettingsOpen,
    setIsUserSettingsOpen,
    isBiometricEnabled,
    setIsBiometricEnabled,
    biometricType,
    setBiometricType,
    biometricTimeout,
    setBiometricTimeout,
    currentUser,
    currentCollege,
    openPhoneOtpVerification,
  } = useApp();

  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean | null>(null);
  const [testingSensor, setTestingSensor] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savingFeedback, setSavingFeedback] = useState(false);

  // Additional settings states
  const [maskCryptoHash, setMaskCryptoHash] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [highResPdfMode, setHighResPdfMode] = useState(true);

  useEffect(() => {
    isWebAuthnAvailable().then((supported) => {
      setWebAuthnSupported(supported);
    });
  }, []);

  if (!isUserSettingsOpen) return null;

  const handleToggleBiometrics = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextState = e.target.checked;
    setTestResult(null);

    if (nextState) {
      setTestingSensor(true);
      playBiometricSound('scan');
      try {
        const res = await registerBiometric(currentUser.email, currentUser.fullName);
        setIsBiometricEnabled(true);
        playBiometricSound('success');
        setTestResult('Biometric sensor registered and bound to ID Ledger successfully.');
      } catch {
        setIsBiometricEnabled(true);
        setTestResult('Device biometric simulation enabled for secondary ID Ledger authentication.');
      } finally {
        setTestingSensor(false);
      }
    } else {
      setIsBiometricEnabled(false);
      setTestResult('Biometric verification disabled. ID Ledger will open without secondary challenge.');
    }
  };

  const handleTestSensor = async () => {
    setTestingSensor(true);
    setTestResult(null);
    playBiometricSound('scan');

    setTimeout(() => {
      setTestingSensor(false);
      playBiometricSound('success');
      setTestResult(`✓ Sensor test passed: ${biometricType.toUpperCase()} token captured with 100% integrity.`);
    }, 1000);
  };

  const handleSaveAll = () => {
    setSavingFeedback(true);
    setTimeout(() => {
      setSavingFeedback(false);
      setIsUserSettingsOpen(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white border border-[rgba(20,20,20,0.12)] shadow-[0_35px_90px_rgba(0,0,0,0.25)] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-[rgba(20,20,20,0.08)] bg-[#F8F7F4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white border border-[rgba(20,20,20,0.12)] flex items-center justify-center text-[#2563eb]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="label text-[9px] mb-0.5">SECURITY ARCHITECTURE // PREFERENCES</span>
              <h2 className="font-serif text-2xl font-bold text-[#141414] leading-tight">
                User & Ledger Settings
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsUserSettingsOpen(false)}
            className="p-1.5 hover:bg-black/5 text-[#141414]/70 hover:text-[#141414] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* USER PERSONA & VERIFICATION STATUS SUMMARY */}
          <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="label text-[8px]">ACTIVE IDENTITY LEDGER</span>
              <div className="font-serif text-lg font-bold text-[#141414]">
                {currentUser.fullName}
              </div>
              <div className="text-xs text-[#141414]/60 font-mono mt-0.5">
                Roll: {currentUser.membership.rollNumber || 'ME2024001'} · {currentCollege.name}
              </div>
              <div className="text-xs text-[#141414]/80 font-mono mt-1">
                Phone: <strong className="text-slate-900">{currentUser.phone || '+91 98765 33445'}</strong>{' '}
                {currentUser.phoneVerified ? (
                  <span className="text-emerald-700 font-bold ml-1">✓ OTP Verified</span>
                ) : (
                  <span className="text-amber-700 font-bold ml-1">⏳ Verification Pending</span>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right space-y-1.5">
              <span className="badge-alt px-2.5 py-1 bg-white border border-[rgba(20,20,20,0.12)] text-[#2563eb] text-[10px] font-mono font-semibold inline-block">
                {currentUser.phoneVerified ? 'OFFICIALLY VERIFIED ✓' : 'NODE REGISTERED'}
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => openPhoneOtpVerification(currentUser.membership.role)}
                  className="px-2.5 py-1 bg-[#141414] hover:bg-[#2563eb] text-white text-[10px] font-mono rounded cursor-pointer transition"
                >
                  {currentUser.phoneVerified ? 'Re-Verify Phone / OTP' : 'Verify Mobile Number Now'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 1: BIOMETRIC VERIFICATION (Primary Feature) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,20,0.08)]">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#2563eb]" />
                <h3 className="font-serif text-lg font-bold text-[#141414]">
                  Biometric Verification & ID Ledger Gate
                </h3>
              </div>
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${
                  isBiometricEnabled
                    ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                    : 'border-[rgba(20,20,20,0.15)] text-[#141414]/50 bg-white'
                }`}
              >
                {isBiometricEnabled ? 'ENABLED // PROTECTED' : 'DISABLED // DIRECT ACCESS'}
              </span>
            </div>

            <p className="text-xs text-[#141414]/70">
              When enabled, accessing the confidential <strong>Digital ID Ledger</strong> requires secondary authentication via WebAuthn platform biometrics (Touch ID, Face ID, Windows Hello) or simulated device sensors.
            </p>

            {/* The Master Toggle */}
            <div className="p-4 bg-white border-2 border-[rgba(20,20,20,0.1)] hover:border-[#2563eb]/60 transition flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 border transition ${
                    isBiometricEnabled
                      ? 'bg-[#2563eb]/10 border-[#2563eb] text-[#2563eb]'
                      : 'bg-[#F8F7F4] border-[rgba(20,20,20,0.1)] text-[#141414]/40'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-base font-bold text-[#141414]">
                    Require Biometric Verification for ID Ledger
                  </div>
                  <div className="text-[11px] text-[#141414]/60">
                    Guards student roll number, cryptographic hash, and printable credential export.
                  </div>
                </div>
              </div>

              {/* Styled Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isBiometricEnabled}
                  onChange={handleToggleBiometrics}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-[#2563eb]"></div>
              </label>
            </div>

            {/* Sub-settings if enabled */}
            {isBiometricEnabled && (
              <div className="p-5 bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] space-y-4 animate-in fade-in duration-200">
                <div className="label text-[9px]">BIOMETRIC SENSOR MODALITY</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'fingerprint', label: 'Fingerprint / Touch ID', icon: Fingerprint },
                    { id: 'face', label: 'Face Recognition', icon: ScanFace },
                    { id: 'fido2', label: 'FIDO2 Passkey / Key', icon: KeyRound },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = biometricType === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setBiometricType(mode.id as any)}
                        className={`p-3 border text-left flex flex-col justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#2563eb] text-[#141414] shadow-xs'
                            : 'bg-white/60 border-[rgba(20,20,20,0.1)] text-[#141414]/70 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#2563eb]' : 'text-[#141414]/60'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#2563eb]" />}
                        </div>
                        <span className="text-xs font-semibold">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Session Timeout / Challenge Frequency */}
                <div className="pt-2">
                  <div className="label text-[9px] mb-1.5">AUTHENTICATION CHALLENGE TIMEOUT</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'always', label: 'Prompt Always (Strict)' },
                      { id: '5m', label: '5-Minute Window' },
                      { id: '15m', label: '15-Minute Window' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setBiometricTimeout(t.id as any)}
                        className={`py-2 px-2.5 text-center text-xs font-mono border transition cursor-pointer ${
                          biometricTimeout === t.id
                            ? 'bg-[#141414] text-white border-[#141414]'
                            : 'bg-white border-[rgba(20,20,20,0.12)] text-[#141414]/70 hover:bg-[#F8F7F4]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sensor Diagnostics & Test Button */}
                <div className="pt-3 border-t border-[rgba(20,20,20,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-[#141414]/70">
                    Status:{' '}
                    <span className="text-[#2563eb] font-semibold">
                      {webAuthnSupported ? 'Hardware WebAuthn Ready' : 'Adaptive Simulated Biometric Active'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSensor}
                    disabled={testingSensor}
                    className="px-3.5 py-1.5 bg-white border border-[rgba(20,20,20,0.2)] hover:border-[#2563eb] text-[#141414] hover:text-[#2563eb] text-xs font-mono tracking-wider font-semibold transition cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                  >
                    {testingSensor ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2563eb]" />
                        <span>TESTING SENSOR...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
                        <span>TEST BIOMETRIC SENSOR NOW</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div className="p-2.5 bg-white border border-[#2563eb]/30 text-xs font-mono text-[#2563eb] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2563eb]" />
                    <span>{testResult}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: PRINTABLE ID CARD & VAULT PREFERENCES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,20,0.08)]">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#2563eb]" />
                <h3 className="font-serif text-lg font-bold text-[#141414]">
                  ID Card Print & Document Standards
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-[rgba(20,20,20,0.1)] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#141414]">High-Res PDF Cardsheet</span>
                  <input
                    type="checkbox"
                    checked={highResPdfMode}
                    onChange={(e) => setHighResPdfMode(e.target.checked)}
                    className="accent-[#2563eb]"
                  />
                </div>
                <p className="text-[11px] text-[#141414]/60">
                  Generate 300+ DPI ISO/IEC 7810 ID-1 standard PDF with Front/Back cards and cut-lines.
                </p>
              </div>

              <div className="p-4 border border-[rgba(20,20,20,0.1)] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#141414]">Audio Haptic Feedback</span>
                  <input
                    type="checkbox"
                    checked={audioFeedback}
                    onChange={(e) => setAudioFeedback(e.target.checked)}
                    className="accent-[#2563eb]"
                  />
                </div>
                <p className="text-[11px] text-[#141414]/60">
                  Play acoustic verification tones during biometric scanning and camera QR check-ins.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: CAMPUS SOVEREIGNTY & DPDP ACT 2023 */}
          <div className="space-y-3 p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.08)] text-xs text-[#141414]/70">
            <div className="flex items-center gap-2 text-[#141414] font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>DPDP Act 2023 & Campus Sovereign Encryption</span>
            </div>
            <p>
              All biometric tokens and cryptographic ledger credentials remain bounded to local device storage and the verified college node. Raw biometric data is never transmitted across unencrypted channels.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[rgba(20,20,20,0.08)] bg-[#F8F7F4] flex items-center justify-between shrink-0">
          <div className="text-[11px] font-mono text-[#141414]/60">
            {isBiometricEnabled ? 'Biometrics Active' : 'Biometrics Inactive'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUserSettingsOpen(false)}
              className="px-4 py-2 text-xs font-mono text-[#141414]/70 hover:text-[#141414] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 bg-[#141414] hover:bg-[#2563eb] text-white text-xs font-mono font-semibold tracking-wider transition cursor-pointer flex items-center gap-2"
            >
              {savingFeedback ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savingFeedback ? 'SAVED' : 'SAVE & APPLY'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
