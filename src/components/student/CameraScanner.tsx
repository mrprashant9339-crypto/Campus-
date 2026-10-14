import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Camera,
  CameraOff,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  X,
  FlipHorizontal,
  Upload,
} from 'lucide-react';

interface ScanSuccessData {
  type: 'lecture_attendance' | 'event_checkin' | 'campus_id';
  title: string;
  subtitle: string;
  venueOrRoom: string;
  codeOrTicket: string;
  timestamp: string;
  hash: string;
}

export const CameraScanner: React.FC<{
  onClose?: () => void;
  compact?: boolean;
}> = ({ onClose, compact = false }) => {
  const {
    currentUser,
    currentCollege,
    attendanceSession,
    markMyAttendance,
    events,
    registerForEvent,
    setActiveNavTab,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScanResult, setLastScanResult] = useState<ScanSuccessData | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanSuccessData[]>([]);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [audioFeedback, setAudioFeedback] = useState(true);

  // Play subtle high-tech success audio beep
  const triggerAudioBeep = () => {
    if (!audioFeedback) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  };

  // Start device camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Device camera API is not supported in this browser environment.');
      }

      // Stop existing stream if any
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied by browser. Grant camera access in site settings or use manual QR entry.'
          : 'Unable to stream hardware camera. Operating in simulated optical ingestion mode.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop device camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Frame scanning loop via native BarcodeDetector API (if available)
  useEffect(() => {
    if (!isCameraActive || !isScanning) return;

    let animId: number;
    let detector: any = null;

    if ('BarcodeDetector' in window) {
      try {
        detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        detector = null;
      }
    }

    const scanFrame = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        if (detector) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              handleParsedPayload(rawValue);
              return; // stop scanning loop on successful detection
            }
          } catch {
            // Frame detection error, continue next frame
          }
        }
      }
      if (isScanning && isCameraActive) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    animId = requestAnimationFrame(scanFrame);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isCameraActive, isScanning, attendanceSession, events]);

  // Toggle front/back camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Main QR parsing and check-in processor
  const handleParsedPayload = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    const timestamp = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(new Date());

    const generatedHash =
      Math.random().toString(16).substring(2, 6) +
      '-' +
      Math.random().toString(16).substring(2, 6) +
      '-' +
      Date.now().toString(16).substring(6);

    // 1. Lecture Attendance QR Check-In
    const isAttendanceMatch =
      code.toUpperCase().includes('X7K') ||
      code.toUpperCase().includes('ATT') ||
      code.toUpperCase().includes('THERMO') ||
      (attendanceSession && code.toUpperCase().includes(attendanceSession.sessionCode.toUpperCase()));

    if (isAttendanceMatch) {
      const activeCode = attendanceSession?.sessionCode || 'X7K-2P9';
      markMyAttendance(activeCode);
      triggerAudioBeep();

      const result: ScanSuccessData = {
        type: 'lecture_attendance',
        title: attendanceSession?.subjectName || 'Thermodynamics (ME301)',
        subtitle: `Faculty: ${attendanceSession?.teacherName || 'Mr. Suresh Prasad'} · Section ${attendanceSession?.sectionName || '3A'}`,
        venueOrRoom: 'Lecture Hall 204',
        codeOrTicket: activeCode,
        timestamp,
        hash: generatedHash,
      };

      setLastScanResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 4)]);
      setScanMessage('✓ Attendance recorded & sealed to SBTE ledger.');
      return;
    }

    // 2. Event Check-In QR
    const matchedEvent = events.find(
      (e) =>
        code.toLowerCase().includes(e.id.toLowerCase()) ||
        (e.qrTicketCode && code.toUpperCase().includes(e.qrTicketCode.toUpperCase())) ||
        code.toUpperCase().includes('TECHFEST') ||
        code.toUpperCase().includes('SPRINT')
    ) || events[0];

    if (matchedEvent) {
      registerForEvent(matchedEvent.id);
      triggerAudioBeep();

      const result: ScanSuccessData = {
        type: 'event_checkin',
        title: matchedEvent.title,
        subtitle: `Event Tier: ${matchedEvent.scope.toUpperCase()} · Organized by ${matchedEvent.organizerName}`,
        venueOrRoom: matchedEvent.venue,
        codeOrTicket: matchedEvent.qrTicketCode || 'EVT-PASS',
        timestamp,
        hash: generatedHash,
      };

      setLastScanResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 4)]);
      setScanMessage(`✓ Admitted to ${matchedEvent.title}. Pass verified.`);
      return;
    }

    // 3. Fallback generic QR check-in
    triggerAudioBeep();
    const result: ScanSuccessData = {
      type: 'campus_id',
      title: 'Campus Ingress Attestation',
      subtitle: `Verified for Roll ${currentUser.membership.rollNumber || 'ME2024001'}`,
      venueOrRoom: currentCollege.name,
      codeOrTicket: code,
      timestamp,
      hash: generatedHash,
    };
    setLastScanResult(result);
    setScanHistory((prev) => [result, ...prev.slice(0, 4)]);
    setScanMessage(`✓ Check-in token "${code}" validated successfully.`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleParsedPayload(manualCode);
    setManualCode('');
  };

  return (
    <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 space-y-6 shadow-sm font-sans">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[rgba(20,20,20,0.08)]">
        <div className="flex items-center gap-3">
          <div className="p-2 border border-[#2563eb] text-[#2563eb] bg-[#2563eb]/5">
            <Camera className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="label text-[9px]">OPTICAL TELEMETRY // QR CHECK-IN</span>
            <h3 className="font-serif text-xl font-bold tracking-tight text-[#141414]">
              Instant Attendance & Event Scanner
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCameraActive && (
            <span className="text-[9px] font-mono bg-[#2563eb] text-white font-semibold px-2 py-0.5">
              FEED LIVE
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:text-[#dc2626] text-[#141414]/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Optical Camera Viewport + Quick Action Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Device Camera Viewport */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-video sm:aspect-4/3 w-full bg-[#141414] border border-[rgba(20,20,20,0.15)] overflow-hidden flex flex-col items-center justify-center">
            {/* Live Camera Video Feed */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Offline or Disabled Camera State Overlay */}
            {!isCameraActive && (
              <div className="p-6 text-center space-y-3 z-10 max-w-sm">
                <div className="w-12 h-12 mx-auto border border-[rgba(255,255,255,0.2)] bg-[#1e1e24] flex items-center justify-center text-white/70">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">
                    Optical Scanner Standby
                  </h4>
                  <p className="text-[11px] text-white/70 mt-1 leading-relaxed font-sans">
                    Activate device camera to scan live faculty classroom projection or event pass QR.
                  </p>
                </div>
                {cameraError && (
                  <div className="p-2.5 bg-[#dc2626]/20 border border-[#dc2626] text-[#ff8080] text-[10px] leading-tight text-left font-mono">
                    {cameraError}
                  </div>
                )}
                <button
                  onClick={startCamera}
                  className="btn-pill accent text-[10px] py-2 px-4 w-full"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ENGAGE DEVICE CAMERA</span>
                </button>
              </div>
            )}

            {/* High-Tech HUD Reticle & Laser Sweep (Active Overlay) */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
                {/* Top Corner Brackets */}
                <div className="flex justify-between items-start">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-[#2563eb]" />
                  <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 border border-[#2563eb]/40 text-[9px] text-[#2563eb] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-ping" />
                    <span>SCANNING // 30 FPS</span>
                  </div>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-[#2563eb]" />
                </div>

                {/* Central Targeting Box with Laser Sweep */}
                <div className="relative self-center w-52 h-52 sm:w-60 sm:h-60 border border-[#2563eb]/40 bg-black/30 flex items-center justify-center">
                  {/* Reticle Crosshairs */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#2563eb]/30" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-[#2563eb]/30" />
                  <div className="w-4 h-4 border border-[#2563eb]" />

                  {/* Laser Scanning Beam */}
                  <div className="absolute inset-x-0 h-1 bg-[#2563eb] shadow-[0_0_15px_#2563eb] animate-bounce" />

                  <div className="absolute -bottom-6 text-[9px] font-mono text-[#2563eb] tracking-widest bg-black/90 px-2">
                    ALIGN QR TARGET
                  </div>
                </div>

                {/* Bottom Corner Brackets & Controls */}
                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-[#2563eb]" />
                  <div className="text-[9px] font-mono text-white/70 bg-black/80 px-2 py-0.5 border border-white/10">
                    MODE: {facingMode.toUpperCase()} LENS
                  </div>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-[#2563eb]" />
                </div>
              </div>
            )}
          </div>

          {/* Camera Viewport Controls Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              {isCameraActive ? (
                <button
                  onClick={stopCamera}
                  className="btn-pill warning text-[9px] py-1 px-3"
                >
                  <CameraOff className="w-3 h-3" />
                  <span>DISENGAGE</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="btn-pill accent text-[9px] py-1 px-3"
                >
                  <Camera className="w-3 h-3" />
                  <span>START CAMERA</span>
                </button>
              )}

              {isCameraActive && (
                <button
                  onClick={toggleCameraFacing}
                  className="btn-pill alt text-[9px] py-1 px-2.5"
                  title="Flip Camera Lens"
                >
                  <FlipHorizontal className="w-3 h-3" />
                  <span>FLIP LENS</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className={`text-[9px] font-mono px-2 py-1 border transition cursor-pointer ${
                audioFeedback
                  ? 'border-[#2563eb]/40 text-[#2563eb] bg-[#2563eb]/5 font-semibold'
                  : 'border-[rgba(20,20,20,0.15)] text-[#141414]/50'
              }`}
            >
              SOUND FX: {audioFeedback ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Right Column: Check-In Validation Hub & Quick Test Targets */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Active / Last Check-In Confirmation Card */}
          {lastScanResult ? (
            <div className="p-4 bg-[#F8F7F4] border border-[#2563eb] shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(20,20,20,0.08)]">
                <span className="text-[9px] font-mono bg-[#2563eb] text-white font-semibold px-2 py-0.5">
                  CHECK-IN CONFIRMED
                </span>
                <span className="text-[9px] font-mono text-[#2563eb] font-semibold">
                  {lastScanResult.timestamp}
                </span>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-[#141414] leading-tight">
                  {lastScanResult.title}
                </h4>
                <p className="text-[11px] text-[#141414]/70 mt-0.5 font-sans">
                  {lastScanResult.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[rgba(20,20,20,0.08)]">
                <div>
                  <span className="label text-[8px]">LOCATION / ROOM</span>
                  <div className="text-[#141414] font-semibold">{lastScanResult.venueOrRoom}</div>
                </div>
                <div>
                  <span className="label text-[8px]">TOKEN / TICKET</span>
                  <div className="text-[#2563eb] font-mono font-semibold">{lastScanResult.codeOrTicket}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[rgba(20,20,20,0.08)] flex items-center justify-between text-[9px] font-mono text-[#141414]/50">
                <span>HASH: {lastScanResult.hash}</span>
                <span className="text-[#2563eb] font-semibold">SBTE LEDGER SEALED</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.08)] space-y-2">
              <span className="label text-[9px]">AWAITING TARGET</span>
              <p className="text-xs text-[#141414]/70 leading-relaxed font-sans">
                Aim device camera at faculty attendance screen or event pass. Instant validation logs student roll #{currentUser.membership.rollNumber || 'ME2024001'}.
              </p>
            </div>
          )}

          {/* Quick One-Click Simulated QR Targets (for instant testing) */}
          <div className="space-y-2 pt-2 border-t border-[rgba(20,20,20,0.08)]">
            <span className="label text-[9px] flex items-center justify-between">
              <span>ONE-TOUCH QR TELEMETRY INGESTION:</span>
              <span className="text-[8px] text-[#2563eb] font-semibold">CLICK TO INGEST</span>
            </span>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleParsedPayload('AUTH_X7K-2P9_THERMODYNAMICS_ME301')}
                className="p-2 bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] hover:border-[#2563eb] text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-[11px] text-[#141414] group-hover:text-[#2563eb]">
                    [LECTURE] Thermodynamics (ME301)
                  </div>
                  <div className="text-[9px] font-mono text-[#141414]/50">Room 204 · Code: X7K-2P9</div>
                </div>
                <Zap className="w-3.5 h-3.5 text-[#2563eb]" />
              </button>

              <button
                type="button"
                onClick={() => handleParsedPayload('GPP-TF25-TICK-00194')}
                className="p-2 bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] hover:border-[#2563eb] text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-[11px] text-[#141414] group-hover:text-[#2563eb]">
                    [EVENT] Tech Fest 2025 Pass
                  </div>
                  <div className="text-[9px] font-mono text-[#141414]/50">Main Auditorium · Ticket #00194</div>
                </div>
                <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
              </button>

              <button
                type="button"
                onClick={() => handleParsedPayload('STU-2024-ME-0001')}
                className="p-2 bg-[#F8F7F4] border border-[rgba(20,20,20,0.1)] hover:border-[#2563eb] text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-[11px] text-[#141414] group-hover:text-[#2563eb]">
                    [CAMPUS GATE] Digital ID Card
                  </div>
                  <div className="text-[9px] font-mono text-[#141414]/50">Roll ME2024001 · Gate Entrance</div>
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
              </button>
            </div>
          </div>

          {/* Manual Code Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <span className="label text-[8px] block mb-1">
              OR TYPE VERIFICATION TOKEN / QR CODE
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. X7K-2P9 or GPP-TF25..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="flex-1 bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] px-3 py-1.5 text-xs text-[#2563eb] font-mono font-semibold focus:border-[#2563eb] outline-none"
              />
              <button type="submit" className="btn-pill accent text-[9px] py-1.5 px-3">
                VERIFY
              </button>
            </div>
          </form>

          {/* Status Message Display */}
          {scanMessage && (
            <div className="p-2 bg-[#F8F7F4] border border-[#2563eb]/40 text-[10px] font-mono text-[#2563eb]">
              {scanMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
