import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  X,
  FlipHorizontal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Users,
  Search,
} from 'lucide-react';
import { User, College } from '../types';
import { INITIAL_USERS } from '../mockData';

interface PeerQrScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (studentId: string) => void;
}

export const PeerQrScannerOverlay: React.FC<PeerQrScannerOverlayProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [manualCode, setManualCode] = useState('');

  // Start real device camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Camera API not available on this browser. Use manual verification or preset peers.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access or select sample peer below.'
          : 'Unable to start camera stream. Use preset peer verification.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/90 text-white flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
              <span>Peer-to-Peer Student ID Scanner</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                CAMERA_API // ACTIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Point camera at peer student ID QR code to verify credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCameraActive && (
            <button
              onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Flip Camera"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer"
            title="Close Scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Viewfinder Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {/* Video stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isCameraActive ? 'opacity-100' : 'opacity-20'
          }`}
        />

        {/* Viewfinder Target Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-indigo-400/80 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.3)]">
            {/* Corner Markers */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>

            {/* Animated Laser Scanning Line */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse top-1/2 -translate-y-1/2"></div>

            <div className="absolute bottom-3 inset-x-0 text-center">
              <span className="text-[10px] font-mono text-cyan-300 font-semibold bg-black/60 px-2.5 py-1 rounded-full border border-cyan-500/30">
                ALIGN STUDENT QR CODE
              </span>
            </div>
          </div>
        </div>

        {/* Camera Error or Fallback Message */}
        {cameraError && (
          <div className="absolute top-6 inset-x-6 max-w-md mx-auto p-3 bg-slate-900/90 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}
      </div>

      {/* Bottom Controls & Peer Test Selectors */}
      <div className="p-4 bg-slate-950/90 backdrop-blur-md border-t border-white/10 space-y-3 z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Quick Peer Scan Test Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-[10px] font-mono text-slate-400 shrink-0">TEST PEER QR:</span>
            <button
              type="button"
              onClick={() => onScanSuccess('usr-student-01')}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Prashant Kumar (Verified ✓)</span>
            </button>

            <button
              type="button"
              onClick={() => onScanSuccess('usr-student-ce')}
              className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
            >
              <Users className="w-3 h-3 text-indigo-400" />
              <span>Rahul Singh (Verified ✓)</span>
            </button>

            <button
              type="button"
              onClick={() => onScanSuccess('usr-unverified-test')}
              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Unapproved Student (Pending ⚠️)</span>
            </button>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter Roll or Student ID..."
              className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
