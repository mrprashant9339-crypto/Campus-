import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badges } from '../common/Badges';
import {
  BIHAR_POLYTECHNIC_DIRECTORY,
  REAL_COLLEGE_PROGRAMS,
} from '../../data/biharPolytechnicDirectory';
import { DocumentViewerModal } from './DocumentViewerModal';
import {
  ShieldCheck,
  QrCode,
  Lock,
  Smartphone,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Award,
  Code2,
  FolderGit2,
  Shield,
  Eye,
  LogOut,
  Building2,
  Calendar,
  Sparkles,
  UserCheck,
  ArrowRight,
  BookOpen,
  Fingerprint,
  Settings,
  Upload,
  Plus,
  X,
  FileCheck2,
  AlertTriangle,
  Clock,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  FileText,
  Phone,
  Mail,
  AlertCircle,
  Download,
  Users,
  MessageSquare,
  HelpCircle,
  Flame,
  Check,
  Edit3,
  Camera,
  Star,
  RefreshCw,
  Search,
  Filter,
  Save,
  CheckCircle,
  Layers,
  FolderOpen,
  Scan,
} from 'lucide-react';
import { UploadedProofDoc } from '../../types';
import { processDocumentOcr, OcrExtractionResult } from '../../utils/ocrService';
import { VerificationHealthIndicator } from '../common/VerificationHealthIndicator';
import { SecurityAuditLog } from '../SecurityAuditLog';

export const StudentProfile: React.FC = () => {
  const {
    currentUser,
    currentCollege,
    openDigitalIdWithBiometrics,
    setIsCollegeDashboardOpen,
    isBiometricEnabled,
    setIsUserSettingsOpen,
    currentRole,
    updateCurrentUser,
    updateUserProfile,
    uploadProfilePhoto,
    uploadVerificationDoc,
    deleteVerificationDoc,
    addSkill,
    removeSkill,
    downloadProfileData,
    setActiveNavTab,
    openEmailVerification,
    openPhoneOtpVerification,
    openSecurityAuditLog,
  } = useApp();

  const collegeDetail =
    BIHAR_POLYTECHNIC_DIRECTORY.find((c) => c.id === currentCollege.id) ||
    BIHAR_POLYTECHNIC_DIRECTORY[0];
  const collegePrograms = REAL_COLLEGE_PROGRAMS.filter(
    (p) => p.collegeId === currentCollege.id || p.collegeId === 'col-gpp-01'
  );

  // Active Tab within Profile
  const [activeProfileSection, setActiveProfileSection] = useState<
    'overview' | 'edit' | 'documents' | 'academic' | 'portfolio' | 'clubs' | 'privacy_security' | 'security_audit'
  >('overview');

  // Document Viewer Modal State
  const [selectedDocForView, setSelectedDocForView] = useState<UploadedProofDoc | null>(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);

  // Skill Input State
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // ==========================================
  // EDIT PROFILE VIEW FORM STATE
  // ==========================================
  const profile = currentUser.profile || {};
  const membership = currentUser.membership || ({} as any);

  const [editFullName, setEditFullName] = useState(currentUser.fullName || '');
  const [editUsername, setEditUsername] = useState(profile.username || 'prashant_sbte');
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editAvatarPreview, setEditAvatarPreview] = useState(currentUser.avatarUrl || '');
  const [editAvatarUrlInput, setEditAvatarUrlInput] = useState('');
  const [editCollegeId, setEditCollegeId] = useState(membership.collegeId || currentCollege.id);
  const [editDepartment, setEditDepartment] = useState(membership.departmentName || 'Mechanical Engineering');
  const [editBranchId, setEditBranchId] = useState(membership.branchId || 'ME');
  const [editSemester, setEditSemester] = useState<number>(membership.semesterNumber || 3);
  const [editSection, setEditSection] = useState(membership.sectionName || 'A');
  const [editRollNumber, setEditRollNumber] = useState(membership.rollNumber || 'ME2024001');
  const [editEnrollmentNumber, setEditEnrollmentNumber] = useState(profile.enrollmentNumber || 'SBTE/2023/ME/0984');
  const [editAdmissionYear, setEditAdmissionYear] = useState<number>(profile.admissionYear || 2023);
  const [editPassingYear, setEditPassingYear] = useState<number>(profile.passingYear || 2026);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [editEmail, setEditEmail] = useState(currentUser.email || 'prashant@gpp.ac.in');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // File Upload Interface for Identity Proof Verification within Edit Profile
  const [uploadProofType, setUploadProofType] = useState<
    'id_card' | 'admission_letter' | 'fee_receipt' | 'marksheet' | 'certificate' | 'other'
  >('id_card');
  const [uploadProofTitle, setUploadProofTitle] = useState('');
  const [proofFilePreview, setProofFilePreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileSize, setProofFileSize] = useState('');
  const [proofUploadSuccess, setProofUploadSuccess] = useState(false);

  // Automated OCR Processing State for Identity Proof Validation
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgressStep, setOcrProgressStep] = useState('');
  const [ocrProgressPct, setOcrProgressPct] = useState(0);
  const [recentOcrResult, setRecentOcrResult] = useState<OcrExtractionResult | null>(null);

  // ==========================================
  // DOCUMENT STORAGE SECTION STATE
  // ==========================================
  const [docFilterStatus, setDocFilterStatus] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [storageUploadType, setStorageUploadType] = useState<
    'id_card' | 'admission_letter' | 'fee_receipt' | 'marksheet' | 'certificate' | 'other'
  >('id_card');
  const [storageUploadTitle, setStorageUploadTitle] = useState('');
  const [storageUploadSuccess, setStorageUploadSuccess] = useState(false);

  // Device Sessions State
  const [deviceSessions, setDeviceSessions] = useState([
    {
      id: 'dev-1',
      device: 'Chrome on Windows 11',
      ip: '103.24.12.82 (Patna, Bihar)',
      lastUsed: 'Active Now (Current Session)',
      isCurrent: true,
    },
    {
      id: 'dev-2',
      device: 'Campus Network Mobile App (Android 14)',
      ip: '103.24.12.82 (Patna, Bihar)',
      lastUsed: '2 hours ago',
      isCurrent: false,
    },
    {
      id: 'dev-3',
      device: 'Hostel Wi-Fi Terminal (Linux / Ubuntu)',
      ip: '103.24.12.90 (Patna, Bihar)',
      lastUsed: 'Yesterday, 10:14 PM',
      isCurrent: false,
    },
  ]);

  const revokeSession = (id: string) => {
    setDeviceSessions((prev) => prev.filter((d) => d.id !== id));
  };

  const revokeAllOtherSessions = () => {
    setDeviceSessions((prev) => prev.filter((d) => d.isCurrent));
  };

  // Avatar Upload Handlers
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditAvatarPreview(reader.result);
          uploadProfilePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit Profile Proof Upload Handler
  const handleEditProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      setProofFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (!uploadProofTitle) {
        setUploadProofTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProofFilePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachProofToProfile = async () => {
    if (!proofFilePreview && !proofFileName) {
      alert('Please select an identity proof file (PDF or Image) to upload.');
      return;
    }

    setIsOcrProcessing(true);
    setOcrProgressPct(15);
    setOcrProgressStep('Initializing OCR scanner & preprocessing proof image...');

    try {
      const docName = uploadProofTitle || proofFileName || 'Verification_Proof.pdf';
      const ocrResult = await processDocumentOcr(
        docName,
        uploadProofType,
        {
          fullName: editFullName || currentUser.fullName,
          rollNumber: editRollNumber || currentUser.membership.rollNumber,
          collegeName: currentCollege.name,
          enrollmentNumber: editEnrollmentNumber || (currentUser.profile as any)?.enrollmentNumber,
        },
        (step, pct) => {
          setOcrProgressStep(step);
          setOcrProgressPct(pct);
        }
      );

      setRecentOcrResult(ocrResult);

      const newDoc: UploadedProofDoc = {
        id: `doc-${Date.now()}`,
        name: docName,
        type: uploadProofType,
        url: proofFilePreview || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        fileSize: proofFileSize || '1.5 MB',
        uploadedAt: 'Today',
        status: 'pending', // Starts as pending for administrative verification
        ocrData: ocrResult.ocrData,
      };

      uploadVerificationDoc(newDoc);
      setProofUploadSuccess(true);
      setProofFilePreview(null);
      setProofFileName('');
      setProofFileSize('');
      setUploadProofTitle('');

      setTimeout(() => {
        setProofUploadSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Automated OCR pipeline error:', err);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Save All Changes in Edit Profile View
  const handleSaveEditProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    updateCurrentUser({
      fullName: editFullName,
      phone: editPhone,
      email: editEmail,
      avatarUrl: editAvatarPreview,
      membership: {
        ...membership,
        collegeId: editCollegeId,
        departmentName: editDepartment,
        branchId: editBranchId,
        semesterNumber: Number(editSemester),
        sectionName: editSection,
        rollNumber: editRollNumber,
      },
    });

    updateUserProfile({
      username: editUsername.replace('@', ''),
      bio: editBio,
      avatarUrl: editAvatarPreview,
      enrollmentNumber: editEnrollmentNumber,
      admissionYear: Number(editAdmissionYear),
      passingYear: Number(editPassingYear),
      batch: `${editAdmissionYear} - ${editPassingYear}`,
    });

    setSaveSuccessMessage(true);
    setTimeout(() => {
      setSaveSuccessMessage(false);
      setActiveProfileSection('overview');
    }, 1200);
  };

  // Document Storage Direct Upload Handler
  const handleStorageDirectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsOcrProcessing(true);
      setOcrProgressPct(15);
      setOcrProgressStep(`Scanning ${file.name} for institutional OCR extraction...`);

      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const docName = storageUploadTitle || file.name;
            const ocrResult = await processDocumentOcr(
              docName,
              storageUploadType,
              {
                fullName: currentUser.fullName,
                rollNumber: currentUser.membership.rollNumber,
                collegeName: currentCollege.name,
                enrollmentNumber: (currentUser.profile as any)?.enrollmentNumber,
              },
              (step, pct) => {
                setOcrProgressStep(step);
                setOcrProgressPct(pct);
              }
            );

            setRecentOcrResult(ocrResult);

            const newDoc: UploadedProofDoc = {
              id: `doc-${Date.now()}`,
              name: docName,
              type: storageUploadType,
              url: reader.result,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadedAt: 'Just now',
              status: 'pending',
              ocrData: ocrResult.ocrData,
            };
            uploadVerificationDoc(newDoc);
            setStorageUploadSuccess(true);
            setStorageUploadTitle('');
            setTimeout(() => setStorageUploadSuccess(false), 3500);
          } catch (err) {
            console.error('OCR pipeline error:', err);
          } finally {
            setIsOcrProcessing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReuploadDoc = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsOcrProcessing(true);
      setOcrProgressPct(15);
      setOcrProgressStep(`Re-processing updated scan for ${file.name}...`);

      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const existing = verificationDocs.find((d) => d.id === docId);
            const docType = existing?.type || 'other';
            const ocrResult = await processDocumentOcr(
              file.name,
              docType,
              {
                fullName: currentUser.fullName,
                rollNumber: currentUser.membership.rollNumber,
                collegeName: currentCollege.name,
                enrollmentNumber: (currentUser.profile as any)?.enrollmentNumber,
              },
              (step, pct) => {
                setOcrProgressStep(step);
                setOcrProgressPct(pct);
              }
            );

            setRecentOcrResult(ocrResult);

            const updatedDoc: UploadedProofDoc = {
              id: docId,
              name: file.name,
              type: docType,
              url: reader.result,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadedAt: 'Just now (Updated)',
              status: 'pending', // Re-submits for review
              ocrData: ocrResult.ocrData,
            };
            uploadVerificationDoc(updatedDoc);
          } catch (err) {
            console.error('OCR reupload error:', err);
          } finally {
            setIsOcrProcessing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Skill Tag Handler
  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim()) {
      addSkill(newSkillInput.trim());
      setNewSkillInput('');
      setIsAddingSkill(false);
    }
  };

  const subjects = profile.subjects || [];
  const projects = profile.projects || [];
  const certificates = profile.certificates || [];
  const clubs = profile.clubs || [];
  const verificationDocs = profile.verificationDocs || [];
  const academicStats = profile.academicStats || {
    cgpa: 8.74,
    attendancePct: 84.5,
    completedAssignments: 18,
    totalAssignments: 20,
    onTimeSubmissions: 17,
    lateSubmissions: 1,
    pendingSubmissions: 2,
  };

  // Document Storage Counts
  const totalDocsCount = verificationDocs.length;
  const verifiedDocsCount = verificationDocs.filter((d) => d.status === 'verified').length;
  const pendingDocsCount = verificationDocs.filter(
    (d) => d.status === 'pending' || d.status === 'under_review'
  ).length;
  const rejectedDocsCount = verificationDocs.filter((d) => d.status === 'rejected').length;

  const filteredDocs = verificationDocs.filter((d) => {
    const matchesStatus =
      docFilterStatus === 'all'
        ? true
        : docFilterStatus === 'verified'
        ? d.status === 'verified'
        : docFilterStatus === 'pending'
        ? d.status === 'pending' || d.status === 'under_review'
        : docFilterStatus === 'rejected'
        ? d.status === 'rejected'
        : true;

    const matchesSearch =
      docSearchQuery.trim() === ''
        ? true
        : d.name.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
          d.type.toLowerCase().includes(docSearchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2 text-slate-800">
      {/* 1. HERO IDENTITY CARD (Basic Identity Snapshot) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        {/* Subtle background watermark */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 text-slate-100 font-serif text-9xl font-black select-none pointer-events-none opacity-40">
          ID
        </div>

        {/* Avatar with live upload and verification seal */}
        <div className="relative group shrink-0">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-28 h-28 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md group-hover:brightness-95 transition"
          />
          <label
            title="Upload New Profile Photo"
            className="absolute inset-0 bg-slate-950/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
          >
            <Camera className="w-6 h-6 mb-1 text-white" />
            <span className="text-[10px] font-bold">Change Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFile}
              className="hidden"
            />
          </label>
          <span
            title="Verified by SBTE / Polytechnic Authority"
            className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full ring-2 ring-white shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>

        {/* Identity Details */}
        <div className="flex-1 text-center md:text-left space-y-2 z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">{currentUser.fullName}</h1>
              <span className="text-xs font-mono text-slate-700 font-semibold bg-slate-100 border border-slate-300 px-2 py-0.5">
                @{profile.username || 'prashant_sbte'}
              </span>
              <span className="px-2.5 py-1 bg-[#10B981] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-black shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                <span>SBTE VERIFIED STATUS: OFFICIAL {currentRole.toUpperCase().replace('_', ' ')}</span>
              </span>
              {/* Verification Health Level Badge */}
              <VerificationHealthIndicator
                user={currentUser}
                variant="badge_only"
                onOpenAuditLog={() => {
                  setActiveProfileSection('security_audit');
                }}
              />
              {currentUser.badges && (
                <Badges badges={currentUser.badges} variant="chip" maxChips={2} />
              )}
            </div>

            {/* Dynamic Verification Health & Account Trust Card */}
            <div className="pt-1">
              <VerificationHealthIndicator
                user={currentUser}
                variant="card"
                onOpenAuditLog={() => {
                  setActiveProfileSection('security_audit');
                }}
                onVerifyEmail={openEmailVerification}
                onVerifyPhone={() => openPhoneOtpVerification()}
              />
            </div>

            {/* Institution-Signed Verification Timestamp & Trust Ledger Box */}
            <div className="p-3 bg-[#f5f4f0] border-l-4 border-l-[#10B981] border border-[#111111] font-mono text-xs space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-[#111111] flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  INSTITUTION-SIGNED VERIFICATION RECORD
                </span>
                <span className="text-[10px] bg-white border border-[#111111] px-2 py-0.5 font-bold text-[#10B981]">
                  CERT: #SBTE-VER-2026-94812-VAL
                </span>
              </div>
              <p className="text-[11px] text-[#444444] leading-relaxed">
                Cryptographically signed by <strong>State Board of Technical Education (SBTE) Patna & {currentCollege.name}</strong> Registrar Node on <strong>October 11, 2026 at 09:30:14 IST</strong>. 
                Authenticated via state polytechnic biometric record, SMS OTP, and institutional admission roster.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[10px] text-[#666666] flex-wrap">
                <span>DIGITAL SIGNATURE: <code className="bg-white px-1.5 py-0.5 border border-[#dddddd] text-black">7f9a2b8e...3c4d1e0f</code></span>
                <span>//</span>
                <span>PHONE NODE: <strong className="text-black">{currentUser.phone || '+91 98765 43210'}</strong> (OTP VERIFIED ✓)</span>
                <span>//</span>
                <span>ENROLLMENT: <strong className="text-black">{profile.enrollmentNumber || 'SBTE/2023/ME/0984'}</strong></span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-700 font-semibold">
            {membership.departmentName || 'Mechanical Engineering'} • Sem {membership.semesterNumber || 3} (Sec {membership.sectionName || 'A'})
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              🏛️ <strong>{currentCollege.name}</strong>
            </span>
            <span>•</span>
            <span>
              Roll: <strong className="font-mono text-slate-800">{membership.rollNumber || 'ME2024001'}</strong>
            </span>
            <span>•</span>
            <span>
              Enrollment: <strong className="font-mono text-slate-800">{profile.enrollmentNumber || 'SBTE/2023/ME/0984'}</strong>
            </span>
            <span>•</span>
            <span>
              Batch: <strong className="text-slate-800">{profile.batch || '2023 - 2026'}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-600 italic pt-1 max-w-xl leading-relaxed">
            "{profile.bio || 'Polytechnic Engineering scholar pursuing Diploma under SBTE Bihar.'}"
          </p>

          {/* Real Contact & Identity Verification Status Bar */}
          <div className="flex flex-wrap gap-2 pt-1 justify-center md:justify-start text-[11px] items-center">
            {/* Email Verification Chip */}
            <div className="flex items-center gap-1">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 font-medium border border-slate-200">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser.email}</span>
              </span>
              {currentUser.emailVerified ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[10px] flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>EMAIL VERIFIED</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={openEmailVerification}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                  title="Verify your academic email with real OTP code"
                >
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  <span>VERIFY EMAIL NOW</span>
                </button>
              )}
            </div>

            {/* Phone Verification Chip */}
            <div className="flex items-center gap-1">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 font-medium border border-slate-200">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser.phone || '+91 98765 43210'}</span>
              </span>
              {currentUser.phoneVerified ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[10px] flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>PHONE OTP VERIFIED</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => openPhoneOtpVerification()}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer transition"
                  title="Authenticate phone number with real SMS OTP"
                >
                  <AlertCircle className="w-3 h-3 text-amber-700" />
                  <span>VERIFY PHONE NOW</span>
                </button>
              )}
            </div>

            {profile.emergencyContact && (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg flex items-center gap-1.5 font-bold" title="Strictly private to authorities">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Emergency: {profile.emergencyContact.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 z-10 w-full md:w-auto">
          <button
            onClick={() => setActiveProfileSection('edit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
              activeProfileSection === 'edit'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Edit Profile View</span>
          </button>

          <button
            onClick={() => setActiveProfileSection('documents')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
              activeProfileSection === 'documents'
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-black'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Document Storage ({verificationDocs.length})</span>
          </button>

          <button
            onClick={openDigitalIdWithBiometrics}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
          >
            {isBiometricEnabled ? (
              <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>Digital ID Card</span>
          </button>
        </div>
      </div>

      {/* 2. PROFILE SECTION NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-2 shadow-2xs overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveProfileSection('overview')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
            activeProfileSection === 'overview'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>01 // Overview</span>
        </button>

        <button
          onClick={() => setActiveProfileSection('edit')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
            activeProfileSection === 'edit'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>02 // Edit Profile</span>
        </button>

        <button
          onClick={() => setActiveProfileSection('documents')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
            activeProfileSection === 'documents'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>03 // Document Storage ({verificationDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveProfileSection('academic')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
            activeProfileSection === 'academic'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>04 // Academic & Progress</span>
        </button>

        <button
          onClick={() => setActiveProfileSection('portfolio')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
            activeProfileSection === 'portfolio'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>05 // Portfolio & Projects</span>
        </button>

        <button
          onClick={() => setActiveProfileSection('clubs')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
            activeProfileSection === 'clubs'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>06 // Clubs & Mentoring</span>
        </button>

        <button
          onClick={() => setActiveProfileSection('privacy_security')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
            activeProfileSection === 'privacy_security'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/20'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>07 // Privacy & Security</span>
        </button>

        <button
          onClick={() => setActiveProfileSection('security_audit')}
          className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition font-mono ${
            activeProfileSection === 'security_audit'
              ? 'border-black text-black bg-slate-100 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>08 // Security Audit Log</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: EDIT PROFILE VIEW (User Request #1)                             */}
      {/* ========================================================================= */}
      {activeProfileSection === 'edit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  Edit Student Profile & Identity Ledger
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-mono">
                  FORM // S-23
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Update photo, bio, branch, semester, section, and upload verification identity proofs
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveProfileSection('overview')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditProfile}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {saveSuccessMessage && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Profile information successfully committed and synced across your campus ledger.</span>
            </div>
          )}

          <form onSubmit={handleSaveEditProfile} className="p-6 space-y-8 text-xs text-slate-800">
            {/* SUB-SECTION 1: PHOTO / AVATAR */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  <span>1. Photo & Profile Avatar</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update student identity photograph visible on your digital campus ID card and attendance log
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group shrink-0">
                  <img
                    src={editAvatarPreview || currentUser.avatarUrl}
                    alt="Preview Avatar"
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
                  />
                  <label className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-3 text-center md:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const presets = [
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
                        ];
                        const random = presets[Math.floor(Math.random() * presets.length)];
                        setEditAvatarPreview(random);
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Choose Preset Avatar</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 max-w-lg">
                    <span className="text-[11px] text-slate-500 shrink-0 font-medium">Or Image URL:</span>
                    <input
                      type="url"
                      value={editAvatarUrlInput}
                      onChange={(e) => {
                        setEditAvatarUrlInput(e.target.value);
                        if (e.target.value.startsWith('http')) {
                          setEditAvatarPreview(e.target.value);
                        }
                      }}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 border border-slate-300 bg-white rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUB-SECTION 2: NAME, USERNAME & BIO */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>2. Basic Identity & Bio</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Full Name (As per SBTE Records) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Prashant Kumar"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Username / Handle (@handle) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="prashant_sbte"
                      className="w-full border border-slate-300 rounded-xl p-2.5 pl-7 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Student Bio & Technical Statement</label>
                    <span className="text-[10px] text-slate-400">{editBio.length} / 250 characters</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="e.g. ME 3rd Sem • CAD, Python, Robotics enthusiast • Secretary of Coding Club"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SUB-SECTION 3: ACADEMIC DETAILS (Branch, Semester, Section, Roll No) */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>3. Academic Enrollment Details</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update Polytechnic branch, current semester, section, roll number, and enrollment credentials
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="sm:col-span-2 md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">
                    Polytechnic Institution
                  </label>
                  <select
                    value={editCollegeId}
                    onChange={(e) => setEditCollegeId(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white font-semibold"
                  >
                    {BIHAR_POLYTECHNIC_DIRECTORY.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.sbteCode} — {col.name} ({col.district}, Bihar)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Engineering Branch / Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editDepartment}
                    onChange={(e) => {
                      setEditDepartment(e.target.value);
                      const map: Record<string, string> = {
                        'Mechanical Engineering': 'ME',
                        'Civil Engineering': 'CE',
                        'Electrical Engineering': 'EE',
                        'Computer Science & Engineering': 'CSE',
                        'Electronics Engineering': 'ECE',
                        'Automobile Engineering': 'AE',
                      };
                      setEditBranchId(map[e.target.value] || 'ME');
                    }}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white font-semibold"
                  >
                    <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                    <option value="Civil Engineering">Civil Engineering (CE)</option>
                    <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Electronics Engineering">Electronics Engineering (ECE)</option>
                    <option value="Automobile Engineering">Automobile Engineering (AE)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Current Semester <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>
                        Semester {s} ({s === 1 || s === 2 ? '1st Year' : s === 3 || s === 4 ? '2nd Year' : '3rd Final Year'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Class Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white font-semibold"
                  >
                    {['A', 'B', 'C', 'General'].map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Class Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editRollNumber}
                    onChange={(e) => setEditRollNumber(e.target.value.toUpperCase())}
                    placeholder="ME2024001"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    SBTE Enrollment / Registration No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editEnrollmentNumber}
                    onChange={(e) => setEditEnrollmentNumber(e.target.value.toUpperCase())}
                    placeholder="SBTE/2023/ME/0984"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Admission Year & Passing Year
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={editAdmissionYear}
                      onChange={(e) => setEditAdmissionYear(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono"
                    />
                    <input
                      type="number"
                      value={editPassingYear}
                      onChange={(e) => setEditPassingYear(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SUB-SECTION 4: FILE UPLOAD INTERFACE FOR IDENTITY PROOF VERIFICATION */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span>4. File Upload for Identity Proof Verification</span>
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                    Official Verification Vault
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload scanned identity documents (Student ID card, admission allotment letter, fee receipt, marksheets) to achieve Verified Campus Identity status
                </p>
              </div>

              {/* Proof Upload Form Card */}
              <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Identity Document Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={uploadProofType}
                      onChange={(e) => setUploadProofType(e.target.value as any)}
                      className="w-full border border-indigo-200 bg-white rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="id_card">Student ID Card (Front & Back Scan)</option>
                      <option value="admission_letter">BCECEB Diploma Admission Allotment Letter</option>
                      <option value="fee_receipt">Semester Academic Fee Receipt / Bank Challan</option>
                      <option value="marksheet">SBTE Previous Semester Marksheet</option>
                      <option value="certificate">Matriculation / Domicile Certificate</option>
                      <option value="other">Other Official Government Identity</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Document Title / Custom Label
                    </label>
                    <input
                      type="text"
                      value={uploadProofTitle}
                      onChange={(e) => setUploadProofTitle(e.target.value)}
                      placeholder="e.g. GP_Patna7_StudentID_Card_Scan"
                      className="w-full border border-indigo-200 bg-white rounded-xl p-2.5 text-xs"
                    />
                  </div>
                </div>

                {/* File Drop/Select Area */}
                <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white rounded-xl p-6 text-center transition cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleEditProofFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-indigo-100/70 text-indigo-700 rounded-full group-hover:scale-105 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-xs text-slate-800">
                      {proofFileName ? (
                        <span className="text-indigo-600 font-extrabold">{proofFileName} ({proofFileSize})</span>
                      ) : (
                        'Drop document scan here or click to browse'
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports PDF, PNG, JPG scans up to 10 MB • Cryptographically hashed upon intake
                    </p>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500">
                    Status upon submission: <span className="font-bold text-amber-700">⏳ Pending Verification</span>
                  </div>

                  <button
                    type="button"
                    disabled={isOcrProcessing}
                    onClick={handleAttachProofToProfile}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    {isOcrProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Automated OCR...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-3.5 h-3.5" />
                        <span>Run OCR & Attach Proof Document</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live OCR Scanning Progress Indicator */}
                {isOcrProcessing && (
                  <div className="p-4 bg-indigo-950 text-white rounded-xl space-y-2.5 animate-in fade-in shadow-md">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold">
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                        <span>Automated OCR Pipeline Running...</span>
                      </div>
                      <span className="font-mono text-cyan-300 font-bold">{ocrProgressPct}%</span>
                    </div>
                    <div className="w-full bg-indigo-900/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-indigo-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgressPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-indigo-200 font-mono">
                      {ocrProgressStep}
                    </p>
                  </div>
                )}

                {/* Extracted OCR Details Preview Card */}
                {recentOcrResult && (
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-emerald-50 border-2 border-indigo-200 rounded-xl space-y-3 relative shadow-xs animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => setRecentOcrResult(null)}
                      className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-xs">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Automated OCR Extracted Credentials (Administrative Validation)</span>
                      <span className="ml-auto mr-6 text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                        Confidence: {recentOcrResult.ocrData.confidenceScore}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[9px] uppercase font-mono text-slate-500 block">Candidate Name</span>
                        <div className="font-bold text-slate-900">{recentOcrResult.ocrData.extractedName}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[9px] uppercase font-mono text-slate-500 block">Date of Birth (DOB)</span>
                        <div className="font-bold text-indigo-700">{recentOcrResult.ocrData.extractedDob}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[9px] uppercase font-mono text-slate-500 block">Roll / Ledger No</span>
                        <div className="font-bold text-slate-900 font-mono">{recentOcrResult.ocrData.extractedRoll}</div>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-[9px] uppercase font-mono text-slate-500 block">Father / Guardian</span>
                        <div className="font-bold text-slate-800">{recentOcrResult.ocrData.extractedFatherName}</div>
                      </div>
                    </div>
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center justify-between">
                      <span>✓ {recentOcrResult.ocrData.validationMessage}</span>
                      <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase">Passed Institutional Check</span>
                    </div>
                  </div>
                )}

                {proofUploadSuccess && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Document attached to your vault with extracted OCR credentials! Status: Pending Institutional Approval.</span>
                  </div>
                )}
              </div>

              {/* Already Attached Documents Overview in Edit Mode */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Currently Attached Identity Proofs ({verificationDocs.length} Documents)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {verificationDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-slate-900 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="uppercase font-semibold">{doc.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span
                            className={`font-bold ${
                              doc.status === 'verified'
                                ? 'text-emerald-700'
                                : doc.status === 'pending' || doc.status === 'under_review'
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {doc.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteVerificationDoc(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Footer Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveProfileSection('overview')}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel & Return to Overview
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: DOCUMENT STORAGE SECTION (User Request #2)                      */}
      {/* ========================================================================= */}
      {activeProfileSection === 'documents' && (
        <div className="space-y-6">
          {/* Document Storage Header with Metrics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                      Academic Credential Vault & Document Storage
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Manage, inspect, and upload student credentials, identity proofs, and examination certificates
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveProfileSection('edit')}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Document Metrics Bar: Total, Verified, Pending, Rejected */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div
                onClick={() => setDocFilterStatus('all')}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  docFilterStatus === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">All Documents</div>
                <div className="text-2xl font-black mt-1">{totalDocsCount}</div>
                <span className="text-[10px] opacity-70">Complete Vault</span>
              </div>

              <div
                onClick={() => setDocFilterStatus('verified')}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  docFilterStatus === 'verified'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50/60 hover:bg-emerald-100/60 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </div>
                <div className="text-2xl font-black mt-1 text-emerald-900">{verifiedDocsCount}</div>
                <span className="text-[10px] text-emerald-800 font-semibold">SBTE Authenticated</span>
              </div>

              <div
                onClick={() => setDocFilterStatus('pending')}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  docFilterStatus === 'pending'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50/60 hover:bg-amber-100/60 border-amber-200 text-amber-950'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Pending</span>
                </div>
                <div className="text-2xl font-black mt-1 text-amber-900">{pendingDocsCount}</div>
                <span className="text-[10px] text-amber-800 font-semibold">Under Review</span>
              </div>

              <div
                onClick={() => setDocFilterStatus('rejected')}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  docFilterStatus === 'rejected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50/60 hover:bg-rose-100/60 border-rose-200 text-rose-950'
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Rejected</span>
                </div>
                <div className="text-2xl font-black mt-1 text-rose-900">{rejectedDocsCount}</div>
                <span className="text-[10px] text-rose-800 font-semibold">Action Required</span>
              </div>
            </div>

            {/* Quick Upload Intake Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Upload Document to Storage</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Instant intake for marksheet, ID, allotment or certificate
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <select
                    value={storageUploadType}
                    onChange={(e) => setStorageUploadType(e.target.value as any)}
                    className="w-full border border-slate-300 bg-white rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="id_card">Student ID Card</option>
                    <option value="admission_letter">Admission Allotment Letter</option>
                    <option value="fee_receipt">Academic Fee Receipt</option>
                    <option value="marksheet">Consolidated Marksheet</option>
                    <option value="certificate">Skill / Award Certificate</option>
                    <option value="other">Other Official Document</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    value={storageUploadTitle}
                    onChange={(e) => setStorageUploadTitle(e.target.value)}
                    placeholder="Document Title (e.g. 2nd Sem Marksheet)"
                    className="w-full border border-slate-300 bg-white rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select & Upload File</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleStorageDirectUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Live OCR Scanning Progress in Storage */}
              {isOcrProcessing && (
                <div className="p-3.5 bg-indigo-950 text-white rounded-xl space-y-2 animate-in fade-in shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                      <span>Optical Character Recognition (OCR) Scanning File...</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold">{ocrProgressPct}%</span>
                  </div>
                  <div className="w-full bg-indigo-900/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-indigo-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgressPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-indigo-200 font-mono">
                    {ocrProgressStep}
                  </p>
                </div>
              )}

              {/* Extracted OCR Details Card in Storage */}
              {recentOcrResult && (
                <div className="p-3.5 bg-indigo-50/90 border border-indigo-200 rounded-xl space-y-2 relative shadow-xs animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => setRecentOcrResult(null)}
                    className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs pr-6">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>OCR Extracted: Name [{recentOcrResult.ocrData.extractedName}] • DOB [{recentOcrResult.ocrData.extractedDob}] • Roll [{recentOcrResult.ocrData.extractedRoll}]</span>
                    <span className="ml-auto text-[9px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                      {recentOcrResult.ocrData.confidenceScore}% Valid
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 flex items-center justify-between">
                    <span>{recentOcrResult.ocrData.validationMessage}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">Validated for Registrar</span>
                  </div>
                </div>
              )}

              {storageUploadSuccess && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Document uploaded to storage repository with extracted OCR credentials! Status: Pending review.</span>
                </div>
              )}
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  placeholder="Search stored documents..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setDocFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    docFilterStatus === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({totalDocsCount})
                </button>
                <button
                  onClick={() => setDocFilterStatus('verified')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    docFilterStatus === 'verified'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Verified ({verifiedDocsCount})
                </button>
                <button
                  onClick={() => setDocFilterStatus('pending')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    docFilterStatus === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Pending ({pendingDocsCount})
                </button>
                <button
                  onClick={() => setDocFilterStatus('rejected')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    docFilterStatus === 'rejected'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Rejected ({rejectedDocsCount})
                </button>
              </div>
            </div>

            {/* Stored Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredDocs.map((doc) => {
                const isVerified = doc.status === 'verified';
                const isPending = doc.status === 'pending' || doc.status === 'under_review';
                const isRejected = doc.status === 'rejected';

                return (
                  <div
                    key={doc.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Status Badge Top Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {doc.type.replace('_', ' ')}
                        </span>

                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-xs text-slate-900 line-clamp-1">{doc.name}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Uploaded {doc.uploadedAt} • Size: {doc.fileSize || '1.8 MB'}
                      </p>

                      {/* Rejection notice box if rejected */}
                      {isRejected && doc.rejectionReason && (
                        <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-900 space-y-0.5">
                          <span className="font-bold block flex items-center gap-1 text-rose-700">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Rejection Reason:</span>
                          </span>
                          <p className="text-rose-800 leading-tight">{doc.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-1">
                      <button
                        onClick={() => {
                          setSelectedDocForView(doc);
                          setIsDocViewerOpen(true);
                        }}
                        className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>

                      <a
                        href={doc.url}
                        download={doc.name}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-bold flex items-center gap-1 transition text-[11px]"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>

                      <label
                        className="px-2 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition text-[11px]"
                        title="Re-upload replacement scan"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-upload</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleReuploadDoc(doc.id, e)}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${doc.name} from storage?`)) {
                            deleteVerificationDoc(doc.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">
                No documents match the current filter "{docFilterStatus}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: OVERVIEW                                                         */}
      {/* ========================================================================= */}
      {activeProfileSection === 'overview' && (
        <div className="space-y-6">
          {/* Institutional Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-800/60 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-sm text-white">
                      {collegeDetail?.name || currentCollege.name}
                    </h2>
                    <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.2 rounded font-bold">
                      SBTE Code: {collegeDetail?.sbteCode || currentCollege.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-200 mt-0.5">
                    AICTE Approved • AISHE: {collegeDetail?.aisheCode || 'S-2490'} • Estd {collegeDetail?.establishedYear || 1955} • {collegeDetail?.district || currentCollege.city}, Bihar
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCollegeDashboardOpen(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm transition"
              >
                <span>Open Full College Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Institutional Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                  Principal's Desk
                </span>
                <div className="font-bold text-white mt-1">
                  {collegeDetail?.principalName || 'Dr. Chandrashekhar Singh'}
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {collegeDetail?.principalQualification || 'M.Tech, Ph.D. (NIT Patna)'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
                  My Department & HOD
                </span>
                <div className="font-bold text-white mt-1">
                  {membership.departmentName || 'Mechanical Engineering'}
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  HOD: Prof. Anil Kumar Singh • Intake: 60 / yr
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
                  Active Institutional Programs
                </span>
                <div className="font-bold text-emerald-400 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{collegePrograms.length} Live Institutional Programs</span>
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  TechFest, Hackathons & Placement drives
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Cumulative CGPA</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{academicStats.cgpa}</div>
              <span className="text-[10px] text-emerald-600 font-bold">Top 5% in Branch</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Attendance Rate</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{academicStats.attendancePct}%</div>
              <span className="text-[10px] text-emerald-600 font-bold">✓ Statutory Compliant (&gt;75%)</span>
            </div>

            <div
              onClick={() => setActiveProfileSection('documents')}
              className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs cursor-pointer transition"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stored Documents</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{verificationDocs.length} Docs</div>
              <span className="text-[10px] text-emerald-600 font-bold">✓ {verifiedDocsCount} Verified • {pendingDocsCount} Pending</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Notes Contributed</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{profile.notesContribution?.uploadedCount || 6}</div>
              <span className="text-[10px] text-amber-600 font-bold">⭐ {profile.notesContribution?.totalDownloads || 342} Downloads</span>
            </div>
          </div>

          {/* Institutional Merit Badges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900">
                    Institutional Achievement & Merit Badges
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Peer-reviewed distinctions, research leadership, and academic badges verified by {currentCollege.name}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-full self-start sm:self-auto">
                {currentUser.badges?.length || 6} Badges Conferred
              </span>
            </div>

            <Badges
              badges={currentUser.badges || []}
              variant="grid"
              showCategoryFilters={true}
              interactive={true}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: ACADEMIC & PROGRESS                                              */}
      {/* ========================================================================= */}
      {activeProfileSection === 'academic' && (
        <div className="space-y-6">
          {/* Subjects and Faculty List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Enrolled Academic Modules & Faculty Assigned (3rd Semester)</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Conducted vs Attended lectures with SBTE statutory 75% attendance threshold audit
                </p>
              </div>
              <button
                onClick={() => setActiveNavTab('progress')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                View Full Attendance Ledger →
              </button>
            </div>

            <div className="space-y-3">
              {subjects.map((sub) => {
                const isDeficit = sub.attendancePct < 75;
                return (
                  <div
                    key={sub.code}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isDeficit ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {sub.code}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">({sub.credits} Credits)</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Faculty: <strong>{sub.faculty}</strong> • Location: {sub.room || 'LH-102'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {sub.attended} / {sub.conducted} classes
                        </div>
                        <div className="text-[10px] text-slate-500">Marks: {sub.marks || '88 / 100'}</div>
                      </div>

                      <div className="min-w-[70px] text-right">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isDeficit ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {sub.attendancePct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificates with Credential ID & Verify QR */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Verified Academic Credentials & Certificates</span>
              </h2>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {certificates.length} Conferred
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        {cert.category}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1">{cert.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Issued by: {cert.issuer} ({cert.issueDate})
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 flex items-center justify-between">
                    <span>ID: {cert.credentialId}</span>
                    <button
                      onClick={openDigitalIdWithBiometrics}
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-sans font-bold"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>Verify QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: PORTFOLIO & PROJECTS                                             */}
      {/* ========================================================================= */}
      {activeProfileSection === 'portfolio' && (
        <div className="space-y-6">
          {/* Skills Section with Add / Remove */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Technical Skills & Engineering Proficiencies</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified engineering competencies and software tools
                </p>
              </div>

              {!isAddingSkill ? (
                <button
                  onClick={() => setIsAddingSkill(true)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              ) : null}
            </div>

            {isAddingSkill && (
              <form onSubmit={handleAddSkillSubmit} className="flex gap-2 pb-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="e.g. AutoCAD, MATLAB, CNC Programming, IoT Sensors..."
                  className="flex-1 border border-indigo-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Save Skill
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-2 group hover:bg-slate-200 transition"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Remove skill"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Capstone Projects Showcase */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <span>Capstone & Applied Engineering Projects</span>
            </h2>

            <div className="space-y-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{proj.title}</h4>
                      <p className="text-[11px] text-indigo-600 font-bold mt-0.5">{proj.role}</p>
                    </div>
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-800 font-bold flex items-center gap-1.5 self-start transition"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>

                  <p className="text-slate-600 leading-relaxed text-xs">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {proj.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    Team Members: {proj.teamMembers.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: CLUBS & MENTORING                                                */}
      {/* ========================================================================= */}
      {activeProfileSection === 'clubs' && (
        <div className="space-y-6">
          {/* Mentoring & Help Network */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Peer Help Network & Mentoring Distinction</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Contributions to junior diploma students and campus doubt clearance
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Senior Mentor Badge</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Queries Resolved</span>
                <div className="text-2xl font-black text-slate-900">
                  {profile.mentoringStats?.peersHelped || 38} Students
                </div>
                <p className="text-[10px] text-slate-500">Thermodynamics & CAD Labs</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Peer Feedback Rating</span>
                <div className="text-2xl font-black text-amber-600 flex items-center gap-1">
                  <span>★ {profile.mentoringStats?.rating || 4.9}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                </div>
                <p className="text-[10px] text-slate-500">Based on 42 reviews</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-500 font-medium">Batch Admission & Passing</span>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {profile.admissionYear || 2023} → {profile.passingYear || 2026}
                </div>
                <p className="text-[10px] text-slate-500">3-Year Regular Diploma</p>
              </div>
            </div>
          </div>

          {/* Clubs and Leadership */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Clubs, Societies & Leadership Positions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        club.role === 'lead'
                          ? 'bg-amber-100 text-amber-800'
                          : club.role === 'secretary'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {club.role}
                    </span>
                    <span className="text-[10px] text-slate-500">Since {club.joinedYear}</span>
                  </div>

                  <h4 className="font-bold text-slate-900">{club.name}</h4>
                  <p className="text-[11px] text-slate-500">{club.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: PRIVACY & SECURITY                                               */}
      {/* ========================================================================= */}
      {activeProfileSection === 'privacy_security' && (
        <div className="space-y-6">
          {/* Biometric Verification Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900">
                    Biometric Verification for ID Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Secondary authentication via WebAuthn, Touch ID, or Face ID
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    isBiometricEnabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isBiometricEnabled ? 'ACTIVE (PROTECTED)' : 'DISABLED'}
                </span>
                <button
                  onClick={() => setIsUserSettingsOpen(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              When biometric authentication is active, accessing your high-resolution printable ID card and roll credentials requires physical sensor confirmation.
            </p>
          </div>

          {/* Active Device Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>Active Login Sessions & Devices</span>
              </h2>

              <button
                onClick={revokeAllOtherSessions}
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Log Out All Other Devices
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {deviceSessions.map((dev) => (
                <div
                  key={dev.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{dev.device}</span>
                      {dev.isCurrent && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          CURRENT DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      IP: {dev.ip} • {dev.lastUsed}
                    </div>
                  </div>

                  {!dev.isCurrent && (
                    <button
                      onClick={() => revokeSession(dev.id)}
                      className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold border border-rose-200 transition cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: SECURITY AUDIT LOG & IMMUTABLE TRUST LEDGER                      */}
      {/* ========================================================================= */}
      {activeProfileSection === 'security_audit' && (
        <div className="space-y-4">
          <SecurityAuditLog
            targetUser={currentUser}
            variant="standalone"
            onTriggerEmailVerification={openEmailVerification}
            onTriggerPhoneVerification={() => openPhoneOtpVerification()}
          />
        </div>
      )}

      {/* Global Document Viewer Modal */}
      <DocumentViewerModal
        doc={selectedDocForView}
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
      />
    </div>
  );
};
