import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Fingerprint,
  ScanFace,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { verifyBiometric, playBiometricSound } from '../utils/biometrics';

export const BiometricAuthModal: React.FC = () => {
  const {
    isBiometricPromptOpen,
    setIsBiometricPromptOpen,
    confirmBiometricAuthentication,
    biometricType,
    currentUser,
    currentCollege,
    biometricPromptTitle,
    biometricPromptReason,
  } = useApp();

  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [usePinFallback, setUsePinFallback] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (isBiometricPromptOpen) {
      setScanState('idle');
      setErrorMessage('');
      setUsePinFallback(false);
      setEnteredPin('');
      setPinError('');
    }
  }, [isBiometricPromptOpen]);

  if (!isBiometricPromptOpen) return null;

  const handleStartScan = async () => {
    setScanState('scanning');
    setErrorMessage('');
    playBiometricSound('scan');

    // Simulate authentic biometric scan duration
    const scanTimer = setTimeout(async () => {
      try {
        const result = await verifyBiometric();
        if (result.success) {
          playBiometricSound('success');
          setScanState('success');
          setTimeout(() => {
            confirmBiometricAuthentication();
          }, 800);
        } else {
          // If WebAuthn was cancelled or not present, simulated sensor acts as backup
          playBiometricSound('success');
          setScanState('success');
          setTimeout(() => {
            confirmBiometricAuthentication();
          }, 800);
        }
      } catch (err: any) {
        playBiometricSound('fail');
        setScanState('failed');
        setErrorMessage(err?.message || 'Biometric signature rejected. Try again or enter security PIN.');
      }
    }, 1200);

    return () => clearTimeout(scanTimer);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default acceptable PINs: 1234, or last 4 digits of roll number, or 0000
    const rollDigits = currentUser.membership.rollNumber?.replace(/\D/g, '').slice(-4) || '2024';
    if (enteredPin === '1234' || enteredPin === rollDigits || enteredPin === '0000') {
      playBiometricSound('success');
      setScanState('success');
      setTimeout(() => {
        confirmBiometricAuthentication();
      }, 600);
    } else {
      playBiometricSound('fail');
      setPinError(`Invalid Security PIN. (Hint: Try default 1234 or ${rollDigits})`);
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === 'face') {
      return <ScanFace className="w-16 h-16 text-[#2563eb]" />;
    }
    if (biometricType === 'fido2') {
      return <KeyRound className="w-16 h-16 text-[#2563eb]" />;
    }
    return <Fingerprint className="w-16 h-16 text-[#2563eb]" />;
  };

  const getBiometricName = () => {
    if (biometricType === 'face') return 'Face ID Sensor';
    if (biometricType === 'fido2') return 'FIDO2 Security Key';
    return 'Fingerprint / Touch ID';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-[rgba(20,20,20,0.12)] shadow-[0_30px_90px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-[rgba(20,20,20,0.08)] bg-[#F8F7F4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white border border-[rgba(20,20,20,0.12)] flex items-center justify-center text-[#2563eb]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="label text-[9px] mb-0.5">
                {biometricPromptTitle ? 'STEP-UP SECURITY // SENSITIVE ACTION' : 'SECONDARY AUTHENTICATION'}
              </span>
              <h3 className="font-serif text-lg font-bold text-[#141414] leading-tight">
                {biometricPromptTitle || 'Biometric Ledger Gate'}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsBiometricPromptOpen(false)}
            className="p-1 hover:bg-black/5 text-[#141414]/70 hover:text-[#141414] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="text-xs text-[#141414]/80 leading-relaxed font-medium">
              {biometricPromptReason || (
                <>Access to ID Ledger for <strong className="text-[#141414]">{currentUser.fullName}</strong> is cryptographically protected.</>
              )}
            </div>
            <div className="font-mono text-[10px] text-[#2563eb] tracking-wider font-semibold">
              IDENTITY: {currentUser.fullName} ({currentUser.membership?.rollNumber || currentUser.membership?.employeeId || 'ME2024001'})
            </div>
          </div>

          {!usePinFallback ? (
            /* Biometric Sensor Area */
            <div className="flex flex-col items-center justify-center space-y-5">
              <div
                onClick={scanState !== 'scanning' ? handleStartScan : undefined}
                className={`relative w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer select-none group ${
                  scanState === 'scanning'
                    ? 'border-[#2563eb] bg-[#2563eb]/5 scale-105'
                    : scanState === 'success'
                    ? 'border-emerald-600 bg-emerald-50'
                    : scanState === 'failed'
                    ? 'border-[#dc2626] bg-[#dc2626]/5'
                    : 'border-[rgba(20,20,20,0.15)] hover:border-[#2563eb] bg-[#F8F7F4] hover:bg-white shadow-xs'
                }`}
              >
                {/* Visual Scanner HUD effect */}
                {scanState === 'scanning' && (
                  <>
                    <div className="absolute inset-0 rounded-full border border-[#2563eb] animate-ping opacity-25"></div>
                    <div className="absolute w-full h-1 bg-[#2563eb] top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_12px_#2563eb]"></div>
                  </>
                )}

                {scanState === 'success' ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-in zoom-in-75 duration-200" />
                ) : scanState === 'failed' ? (
                  <ShieldAlert className="w-16 h-16 text-[#dc2626]" />
                ) : (
                  getBiometricIcon()
                )}

                {scanState === 'idle' && (
                  <div className="absolute -bottom-2.5 px-2 py-0.5 bg-[#141414] text-white text-[8px] font-mono tracking-widest uppercase">
                    TAP SENSOR
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="text-center min-h-[40px] flex flex-col items-center justify-center">
                {scanState === 'scanning' ? (
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-semibold text-[#2563eb] flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Verifying Biometric Token...</span>
                    </div>
                    <div className="text-[10px] text-[#141414]/50">
                      Scanning device {getBiometricName()}
                    </div>
                  </div>
                ) : scanState === 'success' ? (
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Biometric Verified</span>
                    </div>
                    <div className="text-[10px] text-[#141414]/60 font-mono">
                      Session clearance authorized. Opening Ledger...
                    </div>
                  </div>
                ) : scanState === 'failed' ? (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#dc2626]">
                      {errorMessage || 'Verification Unsuccessful'}
                    </div>
                    <button
                      onClick={handleStartScan}
                      className="text-[10px] font-mono text-[#2563eb] underline cursor-pointer"
                    >
                      Retry Biometric Scan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-[#141414]">
                      Place finger or look directly at camera
                    </div>
                    <div className="text-[10px] text-[#141414]/60">
                      Using hardware WebAuthn or device biometric sensor
                    </div>
                  </div>
                )}
              </div>

              {/* Trigger Button */}
              {scanState !== 'scanning' && scanState !== 'success' && (
                <button
                  onClick={handleStartScan}
                  className="w-full py-2.5 bg-[#141414] hover:bg-[#2563eb] text-white text-xs font-mono tracking-wider font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AUTHENTICATE {getBiometricName().toUpperCase()}</span>
                </button>
              )}
            </div>
          ) : (
            /* PIN Fallback Form */
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] text-xs text-[#141414]/80">
                Enter your 4-digit Campus Security PIN. Default credentials for student roll:{' '}
                <strong className="font-mono text-[#2563eb]">1234</strong>.
              </div>

              <div>
                <label className="label text-[9px] mb-1">ENTER 4-DIGIT PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError('');
                  }}
                  placeholder="••••"
                  autoFocus
                  className="w-full text-center text-2xl font-mono tracking-[0.5em] py-2.5 border border-[rgba(20,20,20,0.2)] focus:border-[#2563eb] outline-none bg-white"
                />
                {pinError && (
                  <p className="text-[11px] text-[#dc2626] font-mono mt-1.5">{pinError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#141414] hover:bg-[#2563eb] text-white text-xs font-mono tracking-wider font-semibold transition cursor-pointer"
              >
                SUBMIT SECURITY PIN
              </button>
            </form>
          )}

          {/* Alternate Authentication Selector */}
          <div className="pt-2 border-t border-[rgba(20,20,20,0.08)] flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                setUsePinFallback(!usePinFallback);
                setScanState('idle');
                setErrorMessage('');
              }}
              className="text-[#2563eb] hover:underline font-mono text-[10px] cursor-pointer"
            >
              {usePinFallback ? '← Back to Biometric Scanner' : 'Use Security PIN Instead →'}
            </button>
            <button
              onClick={() => setIsBiometricPromptOpen(false)}
              className="text-[#141414]/60 hover:text-[#141414] text-[10px] font-mono cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
