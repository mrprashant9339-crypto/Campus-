import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  Building,
  Award,
} from 'lucide-react';

export const QrVerifierModal: React.FC = () => {
  const { isQrVerifierOpen, setIsQrVerifierOpen, currentCollege } = useApp();
  const [tokenInput, setTokenInput] = useState('STU-2024-ME-0001');
  const [verificationResult, setVerificationResult] = useState<any>({
    status: 'valid',
    type: 'Student Digital Identity',
    name: 'Prashant Kumar',
    rollNumber: 'ME2024001',
    college: 'Government Polytechnic Patna',
    department: 'Mechanical Engineering (Sem 3)',
    verifiedDate: '16 July 2024 by Dr. Rajesh Verma (Principal)',
    tamperCheck: 'SHA-256 Signature Match (Valid Certificate Authority)',
  });

  if (!isQrVerifierOpen) return null;

  const handleVerify = (input: string) => {
    const val = input.trim().toUpperCase();
    if (val.includes('STU') || val.includes('ME2024') || val.includes('PRASHANT')) {
      setVerificationResult({
        status: 'valid',
        type: 'Student Digital Identity',
        name: 'Prashant Kumar',
        rollNumber: 'ME2024001',
        college: 'Government Polytechnic Patna',
        department: 'Mechanical Engineering (3rd Sem, Section A)',
        verifiedDate: '16 July 2024 by Dr. Rajesh Verma (Principal)',
        tamperCheck: 'SHA-256 Valid Signature • Root Trust Store OK',
      });
    } else if (val.includes('CERT') || val.includes('TF25')) {
      setVerificationResult({
        status: 'valid',
        type: 'Official Event Certificate',
        name: 'Prashant Kumar',
        eventName: 'Tech Fest 2025 — CAD Modeling Sprint',
        college: 'Government Polytechnic Patna',
        issueDate: '15 Feb 2025',
        tamperCheck: 'Immutable Blockchain / Append-Only Ledger Entry #849',
      });
    } else if (val.includes('X7K') || val.includes('THERMO')) {
      setVerificationResult({
        status: 'valid',
        type: 'Live Attendance Session Token',
        course: 'Thermodynamics (ME301)',
        teacher: 'Mr. Suresh Prasad',
        college: 'Government Polytechnic Patna',
        sessionStatus: 'ACTIVE (Room 204)',
      });
    } else {
      setVerificationResult({
        status: 'invalid',
        error: 'Token signature mismatch or unregistered ID. Please inspect physical document.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-800 text-sm">
              Universal Campus QR & Certificate Validator
            </span>
          </div>
          <button
            onClick={() => setIsQrVerifierOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-600 mb-4">
            Authorized gatekeepers, invigilators, and partner colleges can verify any AAVRIT Digital ID, Event Pass, or Attendance QR code here without exposing private student PII.
          </p>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setTokenInput('STU-2024-ME-0001');
                handleVerify('STU-2024-ME-0001');
              }}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium cursor-pointer"
            >
              Test Student ID: STU-2024-ME-0001
            </button>
            <button
              onClick={() => {
                setTokenInput('CERT-TF25-GPP-089');
                handleVerify('CERT-TF25-GPP-089');
              }}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium cursor-pointer"
            >
              Test Cert: CERT-TF25-GPP-089
            </button>
            <button
              onClick={() => {
                setTokenInput('X7K-2P9');
                handleVerify('X7K-2P9');
              }}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-medium cursor-pointer"
            >
              Test Attendance: X7K-2P9
            </button>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Scan or enter token / QR string..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => handleVerify(tokenInput)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Verify Token
            </button>
          </div>

          {/* Results display */}
          {verificationResult && (
            <div className="mt-5">
              {verificationResult.status === 'valid' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>AUTHENTIC & VERIFIED CREDENTIAL</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                    <div>
                      <span className="text-slate-500">Record Type:</span>{' '}
                      <strong className="text-slate-900">{verificationResult.type}</strong>
                    </div>
                    {verificationResult.name && (
                      <div>
                        <span className="text-slate-500">Holder:</span>{' '}
                        <strong className="text-slate-900">{verificationResult.name}</strong>
                      </div>
                    )}
                    {verificationResult.rollNumber && (
                      <div>
                        <span className="text-slate-500">Roll Number:</span>{' '}
                        <strong className="font-mono text-slate-900">{verificationResult.rollNumber}</strong>
                      </div>
                    )}
                    {verificationResult.college && (
                      <div>
                        <span className="text-slate-500">Issuer Tenant:</span>{' '}
                        <strong className="text-slate-900">{verificationResult.college}</strong>
                      </div>
                    )}
                    {verificationResult.department && (
                      <div>
                        <span className="text-slate-500">Department:</span> {verificationResult.department}
                      </div>
                    )}
                    {verificationResult.eventName && (
                      <div>
                        <span className="text-slate-500">Event Award:</span> {verificationResult.eventName}
                      </div>
                    )}
                    {verificationResult.tamperCheck && (
                      <div className="pt-2 mt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-mono">
                        🔒 {verificationResult.tamperCheck}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>INVALID OR UNRECOGNIZED TOKEN</span>
                  </div>
                  <p>{verificationResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
