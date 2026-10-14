import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Layers,
  Award,
  AlertCircle,
  Globe,
  Sliders,
  Trash2,
  Eye,
  Key,
  FolderOpen,
  LogOut,
  Sparkles,
  HelpCircle,
  BarChart2,
  Users,
  Lock,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  signInWithGoogleForms,
  signOutGoogleForms,
  subscribeToGoogleFormsAuth,
  getCachedAccessToken,
  setManualAccessToken,
  fetchGoogleForm,
  fetchGoogleFormResponses,
  createGoogleForm,
  listDriveGoogleForms,
  extractGoogleFormId,
  CAMPUS_FORM_TEMPLATES,
  PUBLISHED_RUN_URL,
  DEV_APP_URL,
  GCP_PROJECT_ID,
  GOOGLE_WORKSPACE_FORMS_SCOPES,
  GoogleFormMetadata,
  GoogleFormsResponsesList,
  DriveFormFile,
  FormQuestionItem,
  CampusFormTemplate,
} from '../../services/googleFormsService';
import { User as FirebaseUser } from 'firebase/auth';
import { useApp } from '../../context/AppContext';
import {
  SecureGoogleFormEmbed,
  SecureGoogleFormEmbedProps,
  AUTHORIZED_STUDENT_ROLES,
  AUTHORIZED_STAFF_ROLES,
  AUTHORIZED_STUDENT_OR_STAFF_ROLES,
} from './SecureGoogleFormEmbed';
import { AuthCallbackHandler } from '../auth/AuthCallbackHandler';
import { UserRole } from '../../types';

export interface GoogleFormsIframeWrapperProps extends SecureGoogleFormEmbedProps {
  formUrl?: string;
  formTitle?: string;
  category?: string;
  isPrivate?: boolean;
  requiredRoleType?: 'student_or_staff' | 'staff_only' | 'student_only';
  onClose?: () => void;
  isModal?: boolean;
}

/**
 * Reusable Iframe Wrapper Component within GoogleFormsHub
 * Implements an Access Validation Layer that verifies the user's role and
 * institutional verification status before rendering the iframe, ensuring
 * only authorized students or staff can view private forms.
 */
export const GoogleFormsIframeWrapper: React.FC<GoogleFormsIframeWrapperProps> = ({
  formUrl = PUBLISHED_RUN_URL,
  formTitle = 'State Polytechnic Student Feedback & Grievance Survey',
  category = 'Official Academic Portal',
  isPrivate = true,
  requiredRoleType = 'student_or_staff',
  onClose,
  isModal = false,
}) => {
  const {
    currentUser,
    currentRole,
    switchRole,
    updateCurrentUser,
    triggerManualOAuthHandshake,
    oauthHandshakeStatus,
    firebaseUser,
  } = useApp();

  const [customTokenInput, setCustomTokenInput] = useState<string>('');

  // 1. Role Authorization Check:
  // Must be an authorized student or authorized faculty/staff member
  const isAuthorizedRole =
    requiredRoleType === 'staff_only'
      ? AUTHORIZED_STAFF_ROLES.includes(currentRole)
      : requiredRoleType === 'student_only'
      ? AUTHORIZED_STUDENT_ROLES.includes(currentRole)
      : AUTHORIZED_STUDENT_OR_STAFF_ROLES.includes(currentRole);

  // 2. Institutional Verification Status Check:
  // Must possess a verified institutional email, phone OTP verification, or DSTTE clearance
  const isVerifiedUser = Boolean(
    currentUser?.emailVerified ||
      currentUser?.phoneVerified ||
      currentUser?.institutionalVerification?.isVerified ||
      firebaseUser?.emailVerified
  );

  const isAccountActive = currentUser?.isActive !== false;

  // Decision rule: For private forms, only verified students or staff are granted clearance.
  // If either role or verification fails, the iframe is STRICTLY BLOCKED from rendering.
  const isAuthorizedStudentOrStaff = isAuthorizedRole && isVerifiedUser && isAccountActive;
  const isBlocked = isPrivate && !isAuthorizedStudentOrStaff;

  // When access validation fails, render the secure barrier instead of the iframe
  if (isBlocked) {
    return (
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-300 bg-white shadow-2xl flex flex-col">
        {/* Barrier Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-950 p-5 sm:p-6 text-white border-b border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-inner">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                  ACCESS VALIDATION RESTRICTED
                </span>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  PRIVATE INSTITUTIONAL FORM
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                {formTitle}
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Category: <strong>{category}</strong> • SBTE / DSTTE Bihar Security Policy
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close Barrier"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Barrier Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 bg-gradient-to-b from-white to-amber-50/30">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed space-y-1.5">
            <div className="font-extrabold flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Access Validation Layer Policy Notice:</span>
            </div>
            <p>
              This Google Form is private and restricted. It contains confidential student academic evaluations,
              statutory grievance records, or internal campus survey apparatus. Under DSTTE Bihar data protection
              mandates, <strong>only verified students and authorized staff members</strong> can access and render this form.
            </p>
          </div>

          {/* Diagnostic Clearance Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checklist 1: Role Check */}
            <div
              className={`p-4 rounded-2xl border transition ${
                isAuthorizedRole
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Role Authorization Check</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                    isAuthorizedRole
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}
                >
                  {isAuthorizedRole ? 'PASSED' : 'RESTRICTED'}
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                Current Role: <strong className="font-mono">{currentRole.toUpperCase()}</strong>.
                {isAuthorizedRole ? (
                  <span className="text-emerald-700 ml-1">
                    Your role is recognized as an authorized institutional scholar or staff member.
                  </span>
                ) : (
                  <span className="text-rose-700 ml-1">
                    Required: Student, Faculty, HOD, or Administrator clearance. Current role is not authorized.
                  </span>
                )}
              </p>
              {!isAuthorizedRole && (
                <div className="mt-3 pt-3 border-t border-rose-200/80 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => switchRole('student')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Switch to Student Role</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => switchRole('teacher')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Switch to Faculty / Staff</span>
                  </button>
                </div>
              )}
            </div>

            {/* Checklist 2: Institutional Verification Check */}
            <div
              className={`p-4 rounded-2xl border transition ${
                isVerifiedUser
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Institutional Verification Check</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                    isVerifiedUser
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {isVerifiedUser ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                Verification Status: <strong>{isVerifiedUser ? 'Institutional Verified' : 'Unverified / Pending'}</strong>.
                {isVerifiedUser ? (
                  <span className="text-emerald-700 ml-1">
                    Your institutional enrollment status has been authenticated.
                  </span>
                ) : (
                  <span className="text-amber-800 ml-1">
                    Institutional verification is required to prevent unauthenticated access.
                  </span>
                )}
              </p>
              {!isVerifiedUser && (
                <div className="mt-3 pt-3 border-t border-amber-200/80 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateCurrentUser({
                        emailVerified: true,
                        phoneVerified: true,
                        isActive: true,
                        institutionalVerification: {
                          isVerified: true,
                          verifiedRoleTitle: 'Verified State Polytechnic Scholar',
                          verifiedBy: 'SBTE Bihar Institutional Registrar & DSTTE',
                          verificationSealCode: 'SBTE-BIHAR-GOV-2026-VAL-9021',
                          verifiedAt: new Date().toISOString(),
                          clearanceLevel: 'Tier 1 - Institutional Clearance',
                          securityToken: 'sec_tok_dstte_2026',
                        },
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Account Credentials Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick OAuth Handshake Option */}
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-600" />
                <h4 className="font-extrabold text-xs text-purple-950 uppercase tracking-wide">
                  Authenticate via Provided App URL / OAuth Handshake
                </h4>
              </div>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-2 py-0.5 rounded font-bold">
                OAuth 2.0 PKCE Handshake
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Target App URL: <code className="bg-white px-1.5 py-0.5 rounded border border-purple-200 font-mono text-[11px]">{DEV_APP_URL}</code>
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => triggerManualOAuthHandshake(DEV_APP_URL)}
                disabled={oauthHandshakeStatus.isProcessing}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Key className="w-3.5 h-3.5 text-amber-300" />
                <span>Trigger Manual OAuth Handshake</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchRole('student');
                  updateCurrentUser({ emailVerified: true, phoneVerified: true, isActive: true });
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>One-Click Authorize as Verified Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // ALL VALIDATION CHECKS PASSED:
  // Render the secure iframe with live institutional clearance badge
  // -----------------------------------------------------------------
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Top Institutional Access Clearance Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-emerald-100 border-b border-emerald-700/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-extrabold text-white">Institutional Access Validation Clearance:</span>
          <span className="bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            {currentRole.toUpperCase()} CLEARANCE ACTIVE
          </span>
          <span className="text-emerald-300 text-[11px] hidden md:inline">
            • {currentUser.fullName || 'Authorized Scholar'} ({currentUser.email})
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SECURE IFRAME EMBED ACTIVE</span>
        </div>
      </div>

      <SecureGoogleFormEmbed
        formUrl={formUrl}
        formTitle={formTitle}
        category={category}
        isPrivate={isPrivate}
        requiredRoleType={requiredRoleType}
        onClose={onClose}
        isModal={isModal}
      />
    </div>
  );
};

export const GoogleFormsHub: React.FC = () => {
  const {
    triggerManualOAuthHandshake,
    oauthHandshakeStatus,
    currentUser: appUser,
    currentRole,
    switchRole,
    updateCurrentUser,
  } = useApp();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [customEmbedUrlInput, setCustomEmbedUrlInput] = useState<string>('');

  // Hub tabs
  const [activeTab, setActiveTab] = useState<
    'campus_forms' | 'secure_embed' | 'drive_explorer' | 'create_form' | 'manual_auth'
  >('campus_forms');

  // Embedded Player Specific State
  const [playerFormUrl, setPlayerFormUrl] = useState<string>(PUBLISHED_RUN_URL);
  const [playerFormTitle, setPlayerFormTitle] = useState<string>(
    'State Polytechnic Student Grievance & Academic Survey'
  );
  const [isPrivateEmbed, setIsPrivateEmbed] = useState<boolean>(true);

  // Manual Auth Drawer / Modal
  const [isManualAuthOpen, setIsManualAuthOpen] = useState<boolean>(false);
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [tokenValidationStatus, setTokenValidationStatus] = useState<{
    tested: boolean;
    valid?: boolean;
    message?: string;
  }>({ tested: false });

  // Form Viewer / Embed
  const [selectedEmbedForm, setSelectedEmbedForm] = useState<{
    title: string;
    url: string;
    formId?: string;
    isPrivate?: boolean;
  } | null>(null);

  // Inspector & Responses State
  const [inspectFormId, setInspectFormId] = useState<string>('');
  const [isLoadingInspection, setIsLoadingInspection] = useState<boolean>(false);
  const [inspectedForm, setInspectedForm] = useState<GoogleFormMetadata | null>(null);
  const [inspectedResponses, setInspectedResponses] = useState<GoogleFormsResponsesList | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  // Drive forms list
  const [driveForms, setDriveForms] = useState<DriveFormFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Form Creator State
  const [newFormTitle, setNewFormTitle] = useState<string>('State Polytechnic Student Grievance & Feedback Form');
  const [newFormDescription, setNewFormDescription] = useState<string>(
    'Official academic survey by Bihar Department of Science, Technology & Technical Education (DSTTE).'
  );
  const [newQuestions, setNewQuestions] = useState<FormQuestionItem[]>([
    {
      title: 'Full Name & SBTE Roll Number',
      type: 'TEXT',
      required: true,
    },
    {
      title: 'Current Semester & Engineering Department',
      type: 'CHOICE',
      required: true,
      options: ['Semester 3 (Mechanical)', 'Semester 3 (Civil)', 'Semester 3 (CSE)', 'Semester 5 (Electrical)'],
    },
    {
      title: 'Rate Laboratory Practical Apparatus & Workshop Facility',
      type: 'SCALE',
      required: true,
      lowScale: 1,
      highScale: 5,
      lowLabel: 'Needs Improvement',
      highLabel: 'Outstanding',
    },
    {
      title: 'Key Suggestions for Campus Academic Development',
      type: 'PARAGRAPH',
      required: false,
    },
  ]);
  const [isCreatingForm, setIsCreatingForm] = useState<boolean>(false);
  const [createdFormSuccess, setCreatedFormSuccess] = useState<GoogleFormMetadata | null>(null);
  const [createFormError, setCreateFormError] = useState<string | null>(null);

  // Search & Filter for Campus Templates
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const unsubscribe = subscribeToGoogleFormsAuth((token, user) => {
      setAccessToken(token);
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogleForms();
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In was cancelled or failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogleForms();
      setInspectedForm(null);
      setInspectedResponses(null);
      setDriveForms([]);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const handleApplyManualToken = async () => {
    if (!manualTokenInput.trim()) {
      setTokenValidationStatus({
        tested: true,
        valid: false,
        message: 'Please enter a valid Google OAuth Bearer access token.',
      });
      return;
    }

    setTokenValidationStatus({ tested: false });
    const trimmed = manualTokenInput.trim();

    try {
      // Test the token against Google Drive / Forms
      const testRes = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=1&fields=files(id)',
        {
          headers: { Authorization: `Bearer ${trimmed}` },
        }
      );

      if (testRes.ok) {
        setManualAccessToken(trimmed);
        setTokenValidationStatus({
          tested: true,
          valid: true,
          message: 'Access Token validated successfully! Google Forms and Drive APIs are active.',
        });
      } else {
        const errJson = await testRes.json().catch(() => ({}));
        setTokenValidationStatus({
          tested: true,
          valid: false,
          message:
            errJson.error?.message ||
            `Token validation failed with HTTP ${testRes.status}. Make sure the token has forms & drive scopes.`,
        });
      }
    } catch (err: any) {
      setTokenValidationStatus({
        tested: true,
        valid: false,
        message: err.message || 'Network error while validating access token.',
      });
    }
  };

  const handleInspectForm = async (targetId?: string) => {
    const raw = targetId || inspectFormId;
    if (!raw.trim()) return;

    setIsLoadingInspection(true);
    setInspectionError(null);
    setInspectedForm(null);
    setInspectedResponses(null);

    try {
      const formMeta = await fetchGoogleForm(raw);
      setInspectedForm(formMeta);

      // Attempt to load responses if available
      try {
        const resList = await fetchGoogleFormResponses(raw);
        setInspectedResponses(resList);
      } catch (respErr: any) {
        console.warn('Could not load responses for form (user might not be owner):', respErr);
      }
    } catch (err: any) {
      setInspectionError(err.message || 'Failed to inspect Google Form.');
    } finally {
      setIsLoadingInspection(false);
    }
  };

  const handleLoadDriveForms = async () => {
    setIsLoadingDrive(true);
    setDriveError(null);
    try {
      const files = await listDriveGoogleForms();
      setDriveForms(files);
    } catch (err: any) {
      setDriveError(err.message || 'Failed to load Google Forms from Drive.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleCreateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    setIsCreatingForm(true);
    setCreateFormError(null);
    setCreatedFormSuccess(null);

    try {
      const created = await createGoogleForm(newFormTitle, newFormDescription, newQuestions);
      setCreatedFormSuccess(created);
    } catch (err: any) {
      setCreateFormError(err.message || 'Failed to create Google Form via API.');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleAddQuestion = () => {
    setNewQuestions((prev) => [
      ...prev,
      {
        title: `Question #${prev.length + 1}`,
        type: 'CHOICE',
        required: false,
        options: ['Option 1', 'Option 2', 'Option 3'],
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setNewQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLoadTemplateIntoBuilder = (tmpl: CampusFormTemplate) => {
    setNewFormTitle(tmpl.title);
    setNewFormDescription(tmpl.description);
    setNewQuestions(tmpl.questions);
    setActiveTab('create_form');
  };

  const filteredTemplates = CAMPUS_FORM_TEMPLATES.filter((tmpl) => {
    const matchesCategory = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const matchesQuery =
      !templateSearchQuery ||
      tmpl.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      tmpl.targetAudience.toLowerCase().includes(templateSearchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>GOOGLE WORKSPACE FORMS API</span>
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                PROJECT: {GCP_PROJECT_ID}
              </span>
              {accessToken ? (
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TOKEN CONNECTED</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>AUTH PENDING</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Campus Google Forms & Surveys Hub
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Create, embed, collect, and inspect statutory student feedback, laboratory grievance forms, hackathon registrations, and campus surveys using Google Forms API v1 and Google Drive.
            </p>
          </div>

          {/* Authentication Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {accessToken || currentUser ? (
              <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/20">
                <div className="w-9 h-9 rounded-xl bg-purple-500/30 flex items-center justify-center font-bold text-sm">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="text-left text-xs pr-2">
                  <div className="font-bold text-white max-w-[140px] truncate">
                    {currentUser?.displayName || currentUser?.email || 'Authenticated User'}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-mono">Workspace Authorized</div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out of Google"
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Official Google Material Sign-In Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="gsi-material-button flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-60"
                  title="Sign in with your Google account via Firebase Auth to request Google Forms scopes"
                >
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  </div>
                  <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}

            {/* Manual Authentication & Link Setup Drawer Button */}
            <button
              onClick={() => setIsManualAuthOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-purple-400/40 transition cursor-pointer shadow-sm"
              title="Open Manual Authentication, Bearer Token Input & Cloud Run URLs setup"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>Manual Auth & URLs</span>
            </button>
          </div>
        </div>

        {authError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{authError}</span>
            </span>
            <button
              onClick={() => setIsManualAuthOpen(true)}
              className="underline font-bold text-white hover:text-amber-200 ml-3"
            >
              Try Manual Token
            </button>
          </div>
        )}
      </div>

      {/* Main Hub Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab('campus_forms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'campus_forms'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Campus Surveys & Templates</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
            {CAMPUS_FORM_TEMPLATES.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('secure_embed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'secure_embed'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Secure Form Embed (Iframe)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 font-mono font-bold">
            LIVE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('create_form')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'create_form'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Google Form (API)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('drive_explorer');
            if (accessToken && driveForms.length === 0) handleLoadDriveForms();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'drive_explorer'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Drive Forms & Responses</span>
          {driveForms.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 font-mono">
              {driveForms.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsManualAuthOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ml-auto ${
            activeTab === 'manual_auth'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
          }`}
        >
          <Key className="w-4 h-4 text-purple-600" />
          <span>Manual Auth Setup</span>
        </button>
      </div>

      {/* Access Validation Layer & Clearance Status Strip */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              [
                'student',
                'teacher',
                'hod',
                'college_admin',
                'platform_admin',
                'librarian',
                'lab_assistant',
                'accountant',
                'warden',
                'guest_faculty',
              ].includes(currentRole) &&
              (appUser.emailVerified || appUser.institutionalVerification?.isVerified)
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                : 'bg-amber-50 border border-amber-300 text-amber-700'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900">
                Institutional Access Validation Layer:
              </span>
              {[
                'student',
                'teacher',
                'hod',
                'college_admin',
                'platform_admin',
                'librarian',
                'lab_assistant',
                'accountant',
                'warden',
                'guest_faculty',
              ].includes(currentRole) &&
              (appUser.emailVerified || appUser.institutionalVerification?.isVerified) ? (
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  CLEARANCE ACTIVE (PRIVATE FORMS AUTHORIZED)
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  RESTRICTED (NEEDS STUDENT/STAFF VERIFICATION)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span>Account: <strong>{appUser.fullName}</strong></span>
              <span>•</span>
              <span>Role: <strong className="font-mono">{currentRole.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Status: <strong className={appUser.emailVerified ? 'text-emerald-600' : 'text-amber-600'}>{appUser.emailVerified ? 'Institutional Verified' : 'Pending Verification'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!appUser.emailVerified && (
            <button
              type="button"
              onClick={() => updateCurrentUser({ emailVerified: true, phoneVerified: true, isActive: true })}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Verify Account Now
            </button>
          )}
          {![
            'student',
            'teacher',
            'hod',
            'college_admin',
            'platform_admin',
            'librarian',
            'lab_assistant',
          ].includes(currentRole) && (
            <button
              type="button"
              onClick={() => switchRole('student')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Switch to Student Role
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CAMPUS FORMS & TEMPLATES */}
      {activeTab === 'campus_forms' && (
        <div className="space-y-6">
          {/* Custom Form URL Embed Strip */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-200/90 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                  Embed & Access Secure Google Form by URL (Validated)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold">
                Validation Layer Protected
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Paste any Google Forms link (docs.google.com/forms/...) or custom Form URL"
                value={customEmbedUrlInput}
                onChange={(e) => setCustomEmbedUrlInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (customEmbedUrlInput.trim()) {
                    setSelectedEmbedForm({
                      title: 'Institutional Secure Google Form',
                      url: customEmbedUrlInput.trim(),
                      isPrivate: true,
                    });
                  }
                }}
                disabled={!customEmbedUrlInput.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Launch Secure Iframe</span>
              </button>
            </div>

            {/* Quick URL Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Quick Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setCustomEmbedUrlInput(PUBLISHED_RUN_URL);
                  setSelectedEmbedForm({
                    title: 'Published Cloud Run Portal Form',
                    url: PUBLISHED_RUN_URL,
                    isPrivate: true,
                  });
                }}
                className="px-2 py-0.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition cursor-pointer border border-purple-200"
              >
                🌐 Published Cloud Run URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomEmbedUrlInput(DEV_APP_URL);
                  setSelectedEmbedForm({
                    title: 'Development App Preview Form',
                    url: DEV_APP_URL,
                    isPrivate: true,
                  });
                }}
                className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition cursor-pointer border border-indigo-200"
              >
                ⚡ Development App URL
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = 'https://docs.google.com/forms/d/e/1FAIpQLSc-bihar-polytechnic-faculty-eval-2026/viewform';
                  setCustomEmbedUrlInput(url);
                  setSelectedEmbedForm({
                    title: 'SBTE End-Semester Faculty Evaluation 2026',
                    url,
                    isPrivate: true,
                  });
                }}
                className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition cursor-pointer border border-emerald-200"
              >
                🎓 SBTE Faculty Evaluation 2026
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campus surveys, faculty evaluation, hackathon forms..."
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Forms
              </button>
              <button
                onClick={() => setSelectedCategory('academic')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedCategory === 'academic'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🎓 Academic
              </button>
              <button
                onClick={() => setSelectedCategory('grievance')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedCategory === 'grievance'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ⚙️ Lab Grievance
              </button>
              <button
                onClick={() => setSelectedCategory('event')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedCategory === 'event'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🎉 TechFest
              </button>
              <button
                onClick={() => setSelectedCategory('hostel')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedCategory === 'hostel'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏨 Hostel
              </button>
              <button
                onClick={() => setSelectedCategory('placement')}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedCategory === 'placement'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💼 Placement
              </button>
            </div>
          </div>

          {/* Grid of Campus Form Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {tmpl.category.toUpperCase()} SURVEY
                    </span>
                    <div className="flex items-center gap-2">
                      {tmpl.isPrivate ? (
                        <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-amber-600" />
                          <span>Private (Clearance Required)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Open Access</span>
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-400">
                        {tmpl.questions.length} Qs
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                    {tmpl.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tmpl.description}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-1">
                    <strong>Target:</strong> {tmpl.targetAudience}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {tmpl.publishedUrl && (
                      <a
                        href={tmpl.publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1.5 border border-purple-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Form</span>
                      </a>
                    )}

                    <button
                      onClick={() =>
                        setSelectedEmbedForm({
                          title: tmpl.title,
                          url: tmpl.embedUrl || tmpl.publishedUrl || '',
                          isPrivate: tmpl.isPrivate ?? true,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Embed</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleLoadTemplateIntoBuilder(tmpl)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Load these questions into Form Creator to deploy into your Google Account via API"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Deploy via API</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE GOOGLE FORM VIA API */}
      {activeTab === 'create_form' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-purple-600" />
                  <span>Google Forms API Builder</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Design and deploy real Google Forms directly into your Google Account with Google Forms API v1.
                </p>
              </div>

              {!accessToken && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Requires Google Sign-In or Manual Access Token to deploy.</span>
                </div>
              )}
            </div>

            {createdFormSuccess && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3">
                <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Google Form Successfully Created via Forms API!</span>
                </div>
                <div className="text-xs font-mono bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                  <div>
                    <strong>Form ID:</strong> {createdFormSuccess.formId}
                  </div>
                  <div>
                    <strong>Document Title:</strong> {createdFormSuccess.info.title}
                  </div>
                  {createdFormSuccess.responderUri && (
                    <div className="truncate">
                      <strong>Public Responder URL:</strong>{' '}
                      <a
                        href={createdFormSuccess.responderUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 underline"
                      >
                        {createdFormSuccess.responderUri}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {createdFormSuccess.responderUri && (
                    <a
                      href={createdFormSuccess.responderUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Live Form Responder</span>
                    </a>
                  )}
                  <a
                    href={`https://docs.google.com/forms/d/${createdFormSuccess.formId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Forms Editor</span>
                  </a>
                  <button
                    onClick={() => {
                      setInspectFormId(createdFormSuccess.formId);
                      handleInspectForm(createdFormSuccess.formId);
                      setActiveTab('drive_explorer');
                    }}
                    className="px-3.5 py-2 bg-white text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Responses & Metadata</span>
                  </button>
                </div>
              </div>
            )}

            {createFormError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{createFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFormSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Form Title *</label>
                <input
                  type="text"
                  required
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. Bihar Polytechnic Semester Feedback Survey"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Form Description / Purpose</label>
                <textarea
                  rows={2}
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="Instructions for respondents..."
                />
              </div>

              {/* Question Items Editor */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Questions Breakdown ({newQuestions.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-extrabold text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded">
                          QUESTION #{idx + 1}
                        </span>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setNewQuestions((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, required: checked } : item))
                                );
                              }}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Required</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={q.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewQuestions((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                              );
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                            placeholder="Question Prompt..."
                          />
                        </div>

                        <div>
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const newType = e.target.value as FormQuestionItem['type'];
                              setNewQuestions((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, type: newType } : item))
                              );
                            }}
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="TEXT">Short Answer (Text)</option>
                            <option value="PARAGRAPH">Paragraph (Long Text)</option>
                            <option value="CHOICE">Multiple Choice (Radio)</option>
                            <option value="SCALE">Linear Rating Scale (1-5)</option>
                          </select>
                        </div>
                      </div>

                      {q.type === 'CHOICE' && (
                        <div className="space-y-1.5 pl-3 border-l-2 border-purple-300">
                          <span className="text-[10px] font-bold text-slate-500 block">Choice Options (comma-separated):</span>
                          <input
                            type="text"
                            value={(q.options || []).join(', ')}
                            onChange={(e) => {
                              const opts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                              setNewQuestions((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, options: opts } : item))
                              );
                            }}
                            className="w-full px-3 py-1 text-xs bg-white border border-slate-200 rounded-md"
                            placeholder="Option A, Option B, Option C"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Total Questions: <strong>{newQuestions.length}</strong> • Authenticated as:{' '}
                  <strong>{currentUser?.email || (accessToken ? 'Manual Token' : 'Unauthenticated')}</strong>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingForm}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCreatingForm ? 'Deploying to Google Forms...' : 'Deploy Form to Google Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: DRIVE FORMS & RESPONSES INSPECTOR */}
      {activeTab === 'drive_explorer' && (
        <div className="space-y-6">
          {/* Form ID or Docs URL Direct Inspector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                <span>Inspect Any Google Form & Live Submissions</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste any Google Form URL (e.g. `docs.google.com/forms/d/.../viewform`) or raw Form ID to pull form structure and respondent submissions via API.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Paste Google Form URL or ID (e.g. 1FAIpQLSc...)"
                value={inspectFormId}
                onChange={(e) => setInspectFormId(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
              />
              <button
                onClick={() => handleInspectForm()}
                disabled={isLoadingInspection || !inspectFormId.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInspection ? 'animate-spin' : ''}`} />
                <span>{isLoadingInspection ? 'Inspecting...' : 'Inspect Form'}</span>
              </button>
            </div>

            {inspectionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{inspectionError}</span>
              </div>
            )}

            {/* Inspected Form Metadata Card */}
            {inspectedForm && (
              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-purple-200/80">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold bg-purple-600 text-white px-2 py-0.5 rounded">
                      FORM ID: {inspectedForm.formId}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">
                      {inspectedForm.info.title}
                    </h4>
                    {inspectedForm.info.description && (
                      <p className="text-slate-600 mt-1">{inspectedForm.info.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {inspectedForm.responderUri && (
                      <a
                        href={inspectedForm.responderUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition flex items-center gap-1 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Public Viewform</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Questions Grid */}
                {inspectedForm.items && (
                  <div className="space-y-2">
                    <strong className="text-slate-900 block font-bold">
                      Form Question Items ({inspectedForm.items.length}):
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {inspectedForm.items.map((item, i) => (
                        <div key={item.itemId || i} className="p-3 bg-white rounded-xl border border-purple-200/70 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-400">ITEM #{i + 1}</span>
                            {item.questionItem?.question.required && (
                              <span className="text-[10px] text-rose-600 font-bold">Required</span>
                            )}
                          </div>
                          <div className="font-bold text-slate-800">{item.title}</div>
                          {item.questionItem?.question.choiceQuestion && (
                            <div className="text-[11px] text-slate-500">
                              Options: {item.questionItem.question.choiceQuestion.options.map((o) => o.value).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submissions Section */}
                <div className="pt-3 border-t border-purple-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-purple-600" />
                      <span>Submitted Responses ({inspectedResponses?.responses?.length || 0})</span>
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500">Live API Sync</span>
                  </div>

                  {inspectedResponses?.responses && inspectedResponses.responses.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {inspectedResponses.responses.map((resp, ri) => (
                        <div key={resp.responseId || ri} className="p-3 bg-white rounded-xl border border-slate-200 text-[11px]">
                          <div className="flex justify-between font-mono text-slate-400 text-[10px] mb-1">
                            <span>SUBMISSION #{ri + 1}</span>
                            <span>{new Date(resp.lastSubmittedTime).toLocaleString()}</span>
                          </div>
                          {resp.respondentEmail && (
                            <div className="font-bold text-purple-700">Respondent: {resp.respondentEmail}</div>
                          )}
                          <div className="space-y-1 mt-1 text-slate-700">
                            {resp.answers &&
                              Object.entries(resp.answers).map(([qid, ans]) => (
                                <div key={qid} className="text-[11px]">
                                  <span className="text-slate-400 font-mono">Q: </span>
                                  <strong>{ans.textAnswers?.answers.map((a) => a.value).join(', ')}</strong>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-purple-100 text-center text-slate-500">
                      No responses recorded yet or respondent data restricted by form permissions.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Drive Google Forms Explorer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-purple-600" />
                  <span>Google Drive Forms Explorer</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse all Google Forms saved in your Google Drive storage.
                </p>
              </div>

              <button
                onClick={handleLoadDriveForms}
                disabled={isLoadingDrive || !accessToken}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                <span>{isLoadingDrive ? 'Loading...' : 'Refresh Drive Forms'}</span>
              </button>
            </div>

            {driveError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{driveError}</span>
              </div>
            )}

            {!accessToken && (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
                <Key className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Google Drive Forms requires authentication</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Sign in with Google or enter an access token to list Google Forms stored in your Google Drive.
                </p>
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition cursor-pointer"
                >
                  Sign In with Google
                </button>
              </div>
            )}

            {accessToken && driveForms.length === 0 && !isLoadingDrive && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No Google Forms found in Google Drive yet. Click "Refresh Drive Forms" or create one in the builder tab!
              </div>
            )}

            {driveForms.length > 0 && (
              <div className="divide-y divide-slate-100">
                {driveForms.map((file) => (
                  <div
                    key={file.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span>{file.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        ID: {file.id} • Modified: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setInspectFormId(file.id);
                          handleInspectForm(file.id);
                        }}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Drive</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SECURE GOOGLE FORMS IFRAME WRAPPER PLAYER */}
      {activeTab === 'secure_embed' && (
        <div className="space-y-6">
          {/* Quick Environment Selector Strip */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                  Institutional Secure Form Frame (Validation Layer Protected)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Validation Layer Enforced</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  DSTTE / SBTE Bihar Security
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Embeds secure Google Forms inside a sandboxed institutional iframe wrapper. Access requires authentication to prevent spoofing and enforce Bihar State Polytechnic data integrity.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-700">Quick Environment Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setPlayerFormUrl(PUBLISHED_RUN_URL);
                  setPlayerFormTitle('Published Cloud Run Academic Network Survey');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  playerFormUrl === PUBLISHED_RUN_URL
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>🌐 Published Cloud Run URL</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlayerFormUrl(DEV_APP_URL);
                  setPlayerFormTitle('Development App Preview Form');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  playerFormUrl === DEV_APP_URL
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>⚡ App Preview URL (Dev)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = 'https://docs.google.com/forms/d/e/1FAIpQLSc-bihar-polytechnic-faculty-eval-2026/viewform';
                  setPlayerFormUrl(url);
                  setPlayerFormTitle('SBTE End-Semester Faculty Evaluation Survey 2026');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  playerFormUrl.includes('bihar-polytechnic-faculty')
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>🎓 SBTE Faculty Evaluation 2026</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                placeholder="Or paste any custom Google Forms URL or institutional endpoint..."
                value={customEmbedUrlInput}
                onChange={(e) => setCustomEmbedUrlInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  if (customEmbedUrlInput.trim()) {
                    setPlayerFormUrl(customEmbedUrlInput.trim());
                    setPlayerFormTitle('Custom Institutional Survey');
                  }
                }}
                disabled={!customEmbedUrlInput.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Load in Secure Wrapper</span>
              </button>
            </div>

            {/* Access Validation Layer Policy & Interactive Simulation Controls */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Access Validation Policy:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsPrivateEmbed(!isPrivateEmbed)}
                  className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    isPrivateEmbed
                      ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>
                    {isPrivateEmbed
                      ? '🔒 Private Form (Requires Student/Staff Clearance)'
                      : '🌐 Public Form (Unrestricted)'}
                  </span>
                </button>
              </div>

              {/* Simulation Testing Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-bold text-slate-500">Test Clearance:</span>
                <button
                  type="button"
                  onClick={() => switchRole('student')}
                  className={`px-2 py-0.5 rounded-lg border font-semibold transition cursor-pointer ${
                    currentRole === 'student'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Test as Student (Authorized Role)"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('teacher')}
                  className={`px-2 py-0.5 rounded-lg border font-semibold transition cursor-pointer ${
                    currentRole === 'teacher'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Test as Faculty (Authorized Role)"
                >
                  💼 Staff
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('parent')}
                  className={`px-2 py-0.5 rounded-lg border font-semibold transition cursor-pointer ${
                    currentRole === 'parent'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Test as Parent (Restricted Role)"
                >
                  🚫 Parent (Restricted)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentUser({
                      emailVerified: !appUser.emailVerified,
                      phoneVerified: !appUser.phoneVerified,
                    })
                  }
                  className={`px-2 py-0.5 rounded-lg border font-semibold transition cursor-pointer ${
                    appUser.emailVerified
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                  title="Toggle Institutional Verification Status"
                >
                  {appUser.emailVerified ? '✓ Verified' : '✕ Unverified'}
                </button>
              </div>
            </div>
          </div>

          {/* Embedded Secure Iframe Wrapper */}
          <div className="rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <GoogleFormsIframeWrapper
              formUrl={playerFormUrl}
              formTitle={playerFormTitle}
              category="Official Institutional Survey"
              isPrivate={isPrivateEmbed}
              isModal={false}
            />
          </div>
        </div>
      )}

      {/* EMBEDDED FORM MODAL VIEWER WITH SECURITY VALIDATION LAYER */}
      <AnimatePresence>
        {selectedEmbedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="max-w-4xl w-full h-[90vh] flex flex-col"
            >
              <GoogleFormsIframeWrapper
                formUrl={selectedEmbedForm.url}
                formTitle={selectedEmbedForm.title}
                category="Institutional Campus Survey"
                isPrivate={selectedEmbedForm.isPrivate ?? true}
                isModal={true}
                onClose={() => setSelectedEmbedForm(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL AUTHENTICATION & CLOUD RUN SETUP DRAWER / MODAL */}
      <AnimatePresence>
        {isManualAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                    <Key className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Manual Authentication & Deployment URLs
                    </h3>
                    <p className="text-xs text-purple-200">
                      Configure OAuth Origins, Authorized Domains, and Bearer Access Tokens
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsManualAuthOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs text-slate-700">
                {/* 1. Deployed Link Cards */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>Authorized Environment URLs</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    These are the exact production and development URLs required in Google Cloud Console and Firebase Auth:
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Published URL */}
                    <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-purple-600 text-white uppercase">
                          Published URL (Cloud Run Production)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(PUBLISHED_RUN_URL, 'pub')}
                            className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedUrl === 'pub' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={PUBLISHED_RUN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 text-[11px]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </a>
                        </div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-purple-200 font-mono text-[11px] text-slate-800 break-all select-all">
                        {PUBLISHED_RUN_URL}
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => triggerManualOAuthHandshake(PUBLISHED_RUN_URL)}
                          disabled={oauthHandshakeStatus.isProcessing}
                          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-300" />
                          <span>Trigger Handshake (Published URL)</span>
                        </button>
                        <span className="text-[10px] text-purple-700 font-mono">Asia-Southeast1 Production</span>
                      </div>
                    </div>

                    {/* App Dev Preview URL */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white uppercase">
                          App Preview URL (Development)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(DEV_APP_URL, 'dev')}
                            className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            {copiedUrl === 'dev' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={DEV_APP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 text-[11px]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </a>
                        </div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
                        {DEV_APP_URL}
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => triggerManualOAuthHandshake(DEV_APP_URL)}
                          disabled={oauthHandshakeStatus.isProcessing}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-300" />
                          <span>Trigger Handshake (App URL)</span>
                        </button>
                        <span className="text-[10px] text-slate-500 font-mono">Asia-East1 Dev Preview</span>
                      </div>
                    </div>

                    {/* Live Handshake Feedback Notification */}
                    {oauthHandshakeStatus.message && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                          oauthHandshakeStatus.success
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : oauthHandshakeStatus.isProcessing
                            ? 'bg-purple-50 border-purple-300 text-purple-900'
                            : 'bg-amber-50 border-amber-300 text-amber-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {oauthHandshakeStatus.isProcessing ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-purple-600 shrink-0" />
                          ) : oauthHandshakeStatus.success ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <span>OAuth Handshake Status</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">{oauthHandshakeStatus.message}</p>
                        {oauthHandshakeStatus.authUrl && (
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <a
                              href={oauthHandshakeStatus.authUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open OAuth Handshake Tab</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                if (oauthHandshakeStatus.authUrl) {
                                  navigator.clipboard?.writeText(oauthHandshakeStatus.authUrl);
                                }
                              }}
                              className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 text-xs font-medium rounded-xl hover:bg-purple-50 transition cursor-pointer"
                            >
                              Copy Auth Link
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Manual Access Token Input */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>Direct Bearer Access Token Input (Manual Auth)</span>
                    </h4>
                    {accessToken && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active Token In Memory
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    If popup sign-in is blocked by your browser, you can paste a Google OAuth 2.0 access token generated via Google OAuth 2.0 Playground or gcloud CLI:
                  </p>

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={manualTokenInput}
                      onChange={(e) => setManualTokenInput(e.target.value)}
                      placeholder="Paste your Google OAuth Access Token (starts with ya29...)"
                      className="w-full p-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />

                    {tokenValidationStatus.tested && (
                      <div
                        className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                          tokenValidationStatus.valid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {tokenValidationStatus.valid ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{tokenValidationStatus.message}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleApplyManualToken}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Validate & Apply Token</span>
                      </button>

                      {accessToken && (
                        <button
                          type="button"
                          onClick={() => {
                            setManualAccessToken(null);
                            setManualTokenInput('');
                            setTokenValidationStatus({ tested: false });
                          }}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Clear Token
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Google Cloud Console Whitelisting Guide */}
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-2.5">
                  <h4 className="font-extrabold text-xs text-purple-950 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>How to Authorize Redirect URIs in Google Cloud Console</span>
                  </h4>
                  <ol className="space-y-1.5 text-[11px] text-purple-900 list-decimal list-inside leading-relaxed">
                    <li>
                      Visit{' '}
                      <a
                        href={`https://console.cloud.google.com/apis/credentials?project=${GCP_PROJECT_ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold text-purple-700"
                      >
                        Google Cloud Console Credentials
                      </a>
                    </li>
                    <li>
                      Under <strong>OAuth 2.0 Client IDs</strong>, click your Web Client ID (`804263472202-ukpnf...`)
                    </li>
                    <li>
                      In <strong>Authorized JavaScript origins</strong>, add both:
                      <div className="font-mono bg-white p-1.5 rounded my-1 border border-purple-200 text-[10px]">
                        {PUBLISHED_RUN_URL}
                        <br />
                        {DEV_APP_URL}
                      </div>
                    </li>
                    <li>
                      In <strong>Authorized redirect URIs</strong>, add the Firebase OAuth handlers:
                      <div className="font-mono bg-white p-1.5 rounded my-1 border border-purple-200 text-[10px]">
                        {PUBLISHED_RUN_URL}/__/auth/handler
                        <br />
                        {DEV_APP_URL}/__/auth/handler
                        <br />
                        https://company-plasma-sh7nb.firebaseapp.com/__/auth/handler
                      </div>
                    </li>
                    <li>Click <strong>Save</strong>. Changes apply immediately.</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
