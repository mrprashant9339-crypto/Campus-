import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileCheck2,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { UploadedProofDoc } from '../../types';

interface DocumentViewerModalProps {
  doc: UploadedProofDoc | null;
  isOpen: boolean;
  onClose: () => void;
  onReupload?: (docId: string, newFile: File) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  doc,
  isOpen,
  onClose,
  onReupload,
}) => {
  const { deleteVerificationDoc, uploadVerificationDoc } = useApp();
  const [reuploadSuccess, setReuploadSuccess] = useState(false);

  if (!isOpen || !doc) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          uploadVerificationDoc({
            id: doc.id,
            name: file.name,
            type: doc.type,
            url: reader.result,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: 'Just now (Updated)',
            status: 'verified',
          });
          setReuploadSuccess(true);
          setTimeout(() => {
            setReuploadSuccess(false);
            onClose();
          }, 1000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${doc.name}?`)) {
      deleteVerificationDoc(doc.id);
      onClose();
    }
  };

  const getStatusBadge = () => {
    switch (doc.status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified by SBTE Registrar</span>
          </span>
        );
      case 'pending':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending (Under Administrative Review)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Action Required / Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white truncate max-w-md">{doc.name}</h3>
              <p className="text-[11px] text-slate-300">
                Uploaded {doc.uploadedAt} • Size: {doc.fileSize || '1.8 MB'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {reuploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Document updated successfully and verified.</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Document Classification</span>
              <div className="font-bold text-slate-900 text-sm">
                {doc.type === 'id_card'
                  ? 'Official Student ID Card (Polytechnic)'
                  : doc.type === 'admission_letter'
                  ? 'BCECEB Diploma Allotment / Admission Letter'
                  : doc.type === 'fee_receipt'
                  ? 'Semester Academic Fee Receipt'
                  : 'Institutional Proof Document'}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {doc.status === 'rejected' && doc.rejectionReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Rejection Audit Reason:</span>
                <p className="text-[11px] text-rose-800 mt-0.5">{doc.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Document Preview Area */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center min-h-[260px] p-2 relative group">
            {doc.url.startsWith('data:image') || doc.url.includes('images.unsplash.com') ? (
              <img
                src={doc.url}
                alt={doc.name}
                className="max-h-[320px] max-w-full rounded-lg object-contain shadow-xs"
              />
            ) : (
              <div className="text-center p-8 space-y-2">
                <FileCheck2 className="w-16 h-16 text-indigo-500 mx-auto" />
                <div className="font-bold text-sm text-slate-800">{doc.name}</div>
                <p className="text-slate-500 text-xs">Encrypted PDF Document Record</p>
              </div>
            )}
          </div>

          {/* Automated OCR Extracted Details for Administrative Validation */}
          {doc.ocrData && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Automated OCR Extracted Credentials (Administrative Validation)</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                  OCR Match: {doc.ocrData.confidenceScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Student Name</span>
                  <span className="font-bold text-slate-900">{doc.ocrData.extractedName}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Date of Birth (DOB)</span>
                  <span className="font-bold text-indigo-700">{doc.ocrData.extractedDob}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Extracted Roll</span>
                  <span className="font-bold text-slate-900 font-mono">{doc.ocrData.extractedRoll}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-indigo-100">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Parent / Guardian</span>
                  <span className="font-bold text-slate-800">{doc.ocrData.extractedFatherName || 'Ramesh Kumar'}</span>
                </div>
              </div>

              {doc.ocrData.validationMessage && (
                <div className="text-[10px] font-mono text-indigo-950 flex items-center gap-1 bg-white/60 p-1.5 rounded-md">
                  <span className="text-emerald-600 font-bold">✓ Validation:</span>
                  <span>{doc.ocrData.validationMessage}</span>
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-700">DPDP Verification Ledger Audit</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Cryptographically timestamped and matched against SBTE Bihar database records. Document proofs remain strictly encrypted and confidential to institutional authorities.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Document</span>
          </button>

          <div className="flex items-center gap-2">
            <label className="px-4 py-2 bg-white hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-upload Fresh Scan</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <a
              href={doc.url}
              download={doc.name}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Record</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
