import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Check,
  Copy,
  Download,
  ShieldCheck,
  QrCode,
  Hash,
  Fingerprint,
  Printer,
  FileCheck2,
  RefreshCw,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { generateIdCardPdf } from '../utils/generateIdCardPdf';
import { generateStudentQrDataUrl, getStudentVerificationUrl } from '../utils/qrGenerator';
import { PeerQrScannerOverlay } from './PeerQrScannerOverlay';

export const DigitalIdModal: React.FC = () => {
  const {
    isDigitalIdOpen,
    setIsDigitalIdOpen,
    currentUser,
    currentCollege,
    isBiometricEnabled,
    openPublicVerificationForUser,
  } = useApp();
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isPeerScannerOpen, setIsPeerScannerOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      generateStudentQrDataUrl(currentUser.id).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [currentUser?.id]);

  if (!isDigitalIdOpen) return null;

  const regCode = currentUser.membership.rollNumber || 'ME2024001';
  const cryptoHash = '9f8e-3a1b-c742-ee01';
  const verificationUrl = getStudentVerificationUrl(currentUser.id);

  const copyCredential = () => {
    navigator.clipboard.writeText(`${regCode} // ${cryptoHash} // ${currentUser.fullName} // ${currentCollege.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfDownloaded(false);

    try {
      await generateIdCardPdf({
        user: currentUser,
        college: currentCollege,
        cryptoHash,
      });
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3500);
    } catch (err) {
      console.error('Failed to generate printable ID Card PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[960px] bg-white border border-[rgba(20,20,20,0.12)] shadow-[0_30px_90px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Top Floating Actions: Download ID Card, Copy Hash & Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 sm:gap-3">
          {/* Prominent Download ID Card Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`flex items-center gap-1.5 px-3 py-1 border text-[10px] font-mono tracking-wider transition cursor-pointer ${
              pdfDownloaded
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-[#141414] hover:bg-[#2563eb] border-[#141414] text-white'
            }`}
            title="Download high-resolution, printable PDF version of ID credentials"
          >
            {isGeneratingPdf ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-white" />
                <span>GENERATING PDF...</span>
              </>
            ) : pdfDownloaded ? (
              <>
                <FileCheck2 className="w-3 h-3 text-emerald-600" />
                <span>PDF DOWNLOADED</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 text-white" />
                <span className="font-semibold">DOWNLOAD ID CARD (PDF)</span>
              </>
            )}
          </button>

          <button
            onClick={copyCredential}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] hover:border-[#2563eb] text-[#141414] hover:text-[#2563eb] text-[10px] font-mono tracking-wider transition cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-[#2563eb]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'HASH COPIED' : 'COPY HASH'}</span>
          </button>

          <button
            onClick={() => setIsDigitalIdOpen(false)}
            className="p-1.5 bg-[#F8F7F4] border border-[rgba(20,20,20,0.15)] hover:border-[#dc2626] text-[#141414] hover:text-[#dc2626] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Shell: 2-column Technical ID Ledger Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[290px_1fr] min-h-[580px]">
          {/* Left Sidebar: Photo, QR & Telemetry */}
          <div className="bg-[#F8F7F4] border-b md:border-b-0 md:border-r border-[rgba(20,20,20,0.08)] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="label">Primary Image</span>
                <span className="text-[9px] font-mono text-[#2563eb] tracking-widest font-semibold">[LIVE_ID]</span>
              </div>
              <div className="photo-container bg-white">
                <div className="photo-frame flex items-center justify-center relative">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover contrast-105"
                  />
                  {/* Subtle Grid Reticle */}
                  <div className="absolute inset-0 border border-[#2563eb]/30 pointer-events-none m-2"></div>
                  <div className="absolute top-1 left-1 text-[8px] font-mono text-white bg-[#141414] px-1">
                    ID//BIO
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-[#141414]/70">
                <span>STATUS: VERIFIED</span>
                <span className="text-[#2563eb] font-semibold">100% SBTE</span>
              </div>

              {isBiometricEnabled && (
                <div className="mt-2.5 p-2 bg-white border border-emerald-500/30 text-[9px] font-mono text-emerald-800 flex items-center gap-1.5">
                  <Fingerprint className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>BIOMETRICALLY AUTHENTICATED</span>
                </div>
              )}
            </div>

            {/* Real Scan-Ready QR Zone */}
            <div className="mt-6 pt-5 border-t border-[rgba(20,20,20,0.08)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 shrink-0 bg-white p-1 border-2 border-[#141414] shadow-sm flex items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Scan to Verify Student ID"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode className="w-8 h-8 text-slate-400 animate-pulse" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="label text-[9px]">UNIVERSAL QR CODE</span>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">LIVE</span>
                  </div>
                  <div className="text-[10px] font-sans text-[#141414]/80 leading-tight">
                    Scan with any smartphone camera or Google Lens to view verified credentials.
                  </div>
                </div>
              </div>

              {/* Action Buttons for QR Scanner Overlay & Phone Preview */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPeerScannerOpen(true)}
                  className="w-full py-2 px-3 bg-[#141414] hover:bg-[#2563eb] text-white text-[10px] font-mono tracking-wider font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-300" />
                  <span>SCAN PEER STUDENT ID (CAMERA)</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPublicVerificationForUser('current')}
                  className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-[rgba(20,20,20,0.2)] text-[#141414] text-[10px] font-mono tracking-wider font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  title="Preview what external phones see when scanning this QR code"
                >
                  <ExternalLink className="w-3 h-3 text-[#2563eb]" />
                  <span>PREVIEW PHONE SCAN VIEW</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8 sm:p-12 flex flex-col justify-between bg-white">
            {/* Header Group */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="label">Identity Ledger // 00492-X</span>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#2563eb] animate-pulse"></span>
                  <span className="text-[10px] font-mono text-[#141414]/60 uppercase tracking-widest">
                    ACTIVE MULTI-TENANT NODE
                  </span>
                </div>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141414] tracking-tight leading-[0.95]">
                {currentUser.fullName}
              </h2>
            </div>

            {/* Technical Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 my-6 py-6 border-y border-[rgba(20,20,20,0.08)]">
              <div className="data-item">
                <span className="label">Registration Code</span>
                <div className="val">{regCode}</div>
              </div>
              <div className="data-item">
                <span className="label">Discipline</span>
                <div className="val">{currentUser.membership.departmentName || 'Mechanical Eng.'}</div>
              </div>
              <div className="data-item">
                <span className="label">Clearance Tier</span>
                <div className="val">
                  Semester {currentUser.membership.semesterNumber || '03'} // Sec {currentUser.membership.sectionName || 'A'}
                </div>
              </div>
              <div className="data-item">
                <span className="label">Cryptographic Hash</span>
                <div className="val text-[0.85rem] font-mono text-[#2563eb]">
                  {cryptoHash}
                </div>
              </div>
            </div>

            {/* Printable ID Card Download Callout Strip */}
            <div className="mb-6 p-3.5 bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-white border border-[rgba(20,20,20,0.1)] flex items-center justify-center text-[#2563eb]">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#141414]">
                    Printable High-Resolution Campus ID Card (PDF)
                  </div>
                  <div className="text-[10px] text-[#141414]/60 font-mono">
                    ISO/IEC 7810 ID-1 standard · Front & Back Cardsheet with crop marks
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#2563eb] text-white text-[11px] font-mono tracking-wider font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>PRINTING...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    <span>EXPORT PDF CARD</span>
                  </>
                )}
              </button>
            </div>

            {/* Technical Footer */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4 border-t-2 border-[#141414]">
              <div>
                <span className="label">Issuing Authority</span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#141414] tracking-tight">
                  {currentCollege.name}
                </div>
                <div className="text-[10px] font-mono text-[#141414]/50 mt-0.5">
                  SBTE Campus Consortium Node · Patna, Bihar
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="barcode-lines mb-1 inline-block"></div>
                <div className="text-[10px] font-mono text-[#141414]/50 tracking-widest">
                  SBTE-VERIFIED-CREDENTIAL
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real Camera Peer-to-Peer QR Scanner Overlay */}
        <PeerQrScannerOverlay
          isOpen={isPeerScannerOpen}
          onClose={() => setIsPeerScannerOpen(false)}
          onScanSuccess={(scannedId) => {
            setIsPeerScannerOpen(false);
            openPublicVerificationForUser(scannedId);
          }}
        />
      </div>
    </div>
  );
};
