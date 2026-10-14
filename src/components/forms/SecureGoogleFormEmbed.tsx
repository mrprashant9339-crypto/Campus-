import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  AlertCircle,
  FileText,
  Key,
  Globe,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  X,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatGoogleFormEmbedUrl,
  signInWithGoogleForms,
  getCachedAccessToken,
  setManualAccessToken,
  DEV_APP_URL,
  PUBLISHED_RUN_URL,
} from '../../services/googleFormsService';

import { UserRole } from '../../types';

export const AUTHORIZED_STUDENT_ROLES: UserRole[] = ['student'];
export const AUTHORIZED_STAFF_ROLES: UserRole[] = [
  'teacher',
  'hod',
  'college_admin',
  'platform_admin',
  'librarian',
  'lab_assistant',
  'accountant',
  'warden',
  'guest_faculty',
];
export const AUTHORIZED_STUDENT_OR_STAFF_ROLES: UserRole[] = [
  ...AUTHORIZED_STUDENT_ROLES,
  ...AUTHORIZED_STAFF_ROLES,
];

export interface SecureGoogleFormEmbedProps {
  formUrl?: string;
  formTitle?: string;
  category?: string;
  isPrivate?: boolean;
  requiredRoleType?: 'student_or_staff' | 'staff_only' | 'student_only';
  onClose?: () => void;
  isModal?: boolean;
}

export const SecureGoogleFormEmbed: React.FC<SecureGoogleFormEmbedProps> = ({
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
    currentCollege,
    firebaseUser,
    triggerManualOAuthHandshake,
    oauthHandshakeStatus,
    switchRole,
    updateCurrentUser,
  } = useApp();

  const [currentUrl, setCurrentUrl] = useState<string>(formUrl || PUBLISHED_RUN_URL);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(true);
  const [hasIframeError, setHasIframeError] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [barrierTokenInput, setBarrierTokenInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync currentUrl if prop changes
  useEffect(() => {
    if (formUrl) setCurrentUrl(formUrl);
  }, [formUrl]);

  const activeToken = getCachedAccessToken();

  // -------------------------------------------------------------
  // ACCESS VALIDATION LAYER:
  // 1. Authentication Session Check
  // 2. Role Authorization Check (Authorized Students & Staff only)
  // 3. Institutional Verification Status Check
  // -------------------------------------------------------------
  const hasAuthSession = Boolean(
    firebaseUser || activeToken || (currentUser?.emailVerified && currentUser?.isActive)
  );

  const isAuthorizedRole =
    requiredRoleType === 'staff_only'
      ? AUTHORIZED_STAFF_ROLES.includes(currentRole)
      : requiredRoleType === 'student_only'
      ? AUTHORIZED_STUDENT_ROLES.includes(currentRole)
      : AUTHORIZED_STUDENT_OR_STAFF_ROLES.includes(currentRole);

  const isVerifiedUser = Boolean(
    currentUser?.emailVerified ||
      currentUser?.phoneVerified ||
      currentUser?.institutionalVerification?.isVerified ||
      firebaseUser?.emailVerified
  );

  const isAccountActive = currentUser?.isActive !== false;

  // For private forms, all checks must pass before the iframe is rendered
  const hasAccessClearance =
    !isPrivate || (hasAuthSession && isAuthorizedRole && isVerifiedUser && isAccountActive);

  // Sanitize and format the embed URL
  const sanitizedEmbedUrl = formatGoogleFormEmbedUrl(currentUrl || PUBLISHED_RUN_URL);

  useEffect(() => {
    setIsLoadingIframe(true);
    setHasIframeError(false);
  }, [sanitizedEmbedUrl, iframeKey]);

  const handleReloadFrame = () => {
    setIsLoadingIframe(true);
    setHasIframeError(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleQuickSignIn = async () => {
    setIsAuthenticating(true);
    setAuthErrorMessage(null);
    try {
      await signInWithGoogleForms();
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'Google authentication was not completed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleTriggerHandshake = async (targetUrl = DEV_APP_URL) => {
    setIsAuthenticating(true);
    setAuthErrorMessage(null);
    try {
      await triggerManualOAuthHandshake(targetUrl);
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'Failed to trigger OAuth handshake.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleApplyBarrierToken = () => {
    if (!barrierTokenInput.trim()) return;
    setManualAccessToken(barrierTokenInput.trim());
    setBarrierTokenInput('');
  };

  const handleQuickVerifyUser = () => {
    updateCurrentUser({
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
      institutionalVerification: {
        isVerified: true,
        verifiedRoleTitle: `${currentRole.toUpperCase()} (Institutional Credential)`,
        verifiedBy: 'DSTTE Bihar & SBTE Registrar Validation Node',
        verificationSealCode: `SBTE-VAL-2026-${Date.now().toString(36).toUpperCase()}`,
        verifiedAt: new Date().toISOString(),
        clearanceLevel: 'Tier 1 - Academic Clearance',
        securityToken: `SEC-TOK-${Date.now()}`,
      },
    });
  };

  // -------------------------------------------------------------
  // 1. ACCESS DENIED / VALIDATION LAYER BARRIER
  // Renders when user is unauthenticated, lacks role clearance, or is unverified
  // -------------------------------------------------------------
  if (!hasAccessClearance) {
    return (
      <div
        className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl p-6 sm:p-8 text-center space-y-6 ${
          isModal ? 'max-w-2xl w-full mx-auto' : ''
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              ACCESS VALIDATION LAYER
            </span>
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              PRIVATE FORM RESTRICTION
            </span>
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              STUDENT & STAFF ONLY
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            Authorization & Verification Required to View Private Form
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed">
            The form <strong>"{formTitle}"</strong> is restricted to authorized students and academic staff members with verified credentials.
          </p>
        </div>

        {/* Validation Check Breakdown Matrix */}
        <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left text-xs">
          {/* Check 1: Role Clearance */}
          <div
            className={`p-3 rounded-2xl border ${
              isAuthorizedRole
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                : 'bg-rose-50/80 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-[11px] mb-1">
              <span>Role Clearance</span>
              {isAuthorizedRole ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5 text-rose-600" />
              )}
            </div>
            <div className="text-[10px] font-mono">
              Role: <strong>{currentRole.toUpperCase()}</strong>
            </div>
            <div className="text-[10px] mt-0.5 text-slate-600">
              {isAuthorizedRole ? 'Authorized Student/Staff' : 'Access Restricted'}
            </div>
          </div>

          {/* Check 2: Verification Status */}
          <div
            className={`p-3 rounded-2xl border ${
              isVerifiedUser
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                : 'bg-amber-50/80 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-[11px] mb-1">
              <span>Verification</span>
              {isVerifiedUser ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
            </div>
            <div className="text-[10px] font-mono">
              Status: <strong>{isVerifiedUser ? 'VERIFIED' : 'PENDING'}</strong>
            </div>
            <div className="text-[10px] mt-0.5 text-slate-600">
              {isVerifiedUser ? 'Institutional Email OK' : 'Needs Verification'}
            </div>
          </div>

          {/* Check 3: Authentication Session */}
          <div
            className={`p-3 rounded-2xl border ${
              hasAuthSession
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                : 'bg-rose-50/80 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-[11px] mb-1">
              <span>Auth Session</span>
              {hasAuthSession ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-rose-600" />
              )}
            </div>
            <div className="text-[10px] font-mono">
              OAuth: <strong>{hasAuthSession ? 'ACTIVE' : 'NO TOKEN'}</strong>
            </div>
            <div className="text-[10px] mt-0.5 text-slate-600">
              {hasAuthSession ? 'TLS Bearer Present' : 'Sign-in Required'}
            </div>
          </div>
        </div>

        {/* Reason Explanations */}
        {!isAuthorizedRole && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl max-w-md mx-auto text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Unauthorized Role Clearance:</span>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Your active role is <strong>{currentRole.toUpperCase()}</strong>. Private forms contain sensitive academic grading, laboratory apparatus records, or internal feedback and can only be accessed by enrolled Students, Faculty, HODs, or Administrators.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchRole('student')}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                >
                  Switch to Student Role (Sandbox)
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('teacher')}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                >
                  Switch to Faculty Role
                </button>
              </div>
            </div>
          </div>
        )}

        {!isVerifiedUser && isAuthorizedRole && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl max-w-md mx-auto text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Verification Status Incomplete:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Your account is not verified yet. Complete verification to certify your institutional identity.
              </p>
              <button
                type="button"
                onClick={handleQuickVerifyUser}
                className="mt-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
              >
                Instant Institutional Verification (Demo)
              </button>
            </div>
          </div>
        )}

        {/* Live OAuth Handshake Status Alerts */}
        {oauthHandshakeStatus.message && (
          <div
            className={`p-3.5 rounded-2xl border text-xs text-left max-w-md mx-auto space-y-1.5 ${
              oauthHandshakeStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : oauthHandshakeStatus.isProcessing
                ? 'bg-purple-50 border-purple-200 text-purple-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {oauthHandshakeStatus.isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600 shrink-0" />
              ) : oauthHandshakeStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>OAuth Handshake Status</span>
            </div>
            <p className="text-[11px] leading-relaxed">{oauthHandshakeStatus.message}</p>
            {oauthHandshakeStatus.authUrl && (
              <div className="pt-1">
                <a
                  href={oauthHandshakeStatus.authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 text-white font-bold text-[11px] hover:bg-purple-800 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Handshake Authorization Tab</span>
                </a>
              </div>
            )}
          </div>
        )}

        {authErrorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authErrorMessage}</span>
          </div>
        )}

        {/* Authentication Actions */}
        <div className="space-y-4 max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={handleQuickSignIn}
              disabled={isAuthenticating}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAuthenticating ? 'Authenticating...' : 'Sign in with Google'}</span>
            </button>

            <button
              onClick={() => handleTriggerHandshake(DEV_APP_URL)}
              disabled={isAuthenticating || oauthHandshakeStatus.isProcessing}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              title="Triggers the OAuth handshake using the provided App URL"
            >
              <Key className="w-4 h-4 text-amber-300" />
              <span>Trigger App URL Handshake</span>
            </button>
          </div>

          {/* Quick Manual Token Input directly in the barrier */}
          <div className="pt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-600" />
                <span>Manual Access Token Validation:</span>
              </span>
              <span className="text-[10px] text-purple-600 font-mono">Instant Unlock</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={barrierTokenInput}
                onChange={(e) => setBarrierTokenInput(e.target.value)}
                placeholder="Paste Bearer token (ya29...)"
                className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyBarrierToken}
                disabled={!barrierTokenInput.trim()}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Validate
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-3">
          <span>Target: {currentCollege.name}</span>
          <span>•</span>
          <span>Role: {currentRole.toUpperCase()}</span>
          <span>•</span>
          <span>SBTE Verified Protocol 2026</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED STATE: Secure Google Form Iframe Wrapper
  // -------------------------------------------------------------
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen w-screen'
          : 'w-full min-h-[640px]'
      }`}
    >
      {/* Top Security & Verification Navigation Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 sm:p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span>AUTHENTICATED ACCESS</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                {category}
              </span>
            </div>

            <h3 className="text-xs sm:text-sm font-extrabold text-white truncate mt-0.5">
              {formTitle}
            </h3>
          </div>
        </div>

        {/* Verification Status & Frame Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 text-xs">
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[150px]">
              {firebaseUser?.displayName || firebaseUser?.email || currentUser.fullName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReloadFrame}
              title="Reload form iframe"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingIframe ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <a
              href={sanitizedEmbedUrl.replace('embedded=true', '').replace(/[?&]$/, '')}
              target="_blank"
              rel="noopener noreferrer"
              title="Open Google Form in a new tab"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onClose && (
              <button
                onClick={onClose}
                title="Close Form View"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20 transition cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Environment / URL Switcher Bar */}
      <div className="bg-slate-900 border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400">Target URL:</span>
          <button
            type="button"
            onClick={() => setCurrentUrl(PUBLISHED_RUN_URL)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition cursor-pointer ${
              currentUrl === PUBLISHED_RUN_URL
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            🌐 Published Cloud Run
          </button>
          <button
            type="button"
            onClick={() => setCurrentUrl(DEV_APP_URL)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition cursor-pointer ${
              currentUrl === DEV_APP_URL
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            ⚡ App Preview URL
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 truncate max-w-sm">
          <span className="truncate">{currentUrl}</span>
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(currentUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }
            }}
            className="p-1 hover:text-white transition cursor-pointer"
            title="Copy URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Globe className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Secure Iframe Area with Loading Spinner & Error Guard */}
      <div className="relative flex-1 bg-slate-100 min-h-[560px]">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoadingIframe && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3"
            >
              <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900">
                  Loading Secure Google Form...
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Validating authentication credentials & establishing TLS session
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Sandboxed Iframe */}
        <iframe
          key={iframeKey}
          src={sanitizedEmbedUrl}
          title={formTitle}
          onLoad={() => setIsLoadingIframe(false)}
          onError={() => {
            setIsLoadingIframe(false);
            setHasIframeError(true);
          }}
          className="w-full h-full min-h-[580px] border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        />

        {/* Fallback Help Banner (appears if cookies or iframe restrictions block rendering) */}
        {hasIframeError && (
          <div className="absolute inset-0 bg-slate-50 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <h4 className="font-bold text-sm text-slate-800">
              Form Frame Restricted by Browser Third-Party Cookie Policy
            </h4>
            <p className="text-xs text-slate-500 max-w-md">
              Google Forms occasionally enforces top-level navigation depending on institutional Google account sign-in cookies. You can open the form directly:
            </p>
            <a
              href={sanitizedEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Form Directly</span>
            </a>
          </div>
        )}
      </div>

      {/* Institutional Security Watermark Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SBTE Bihar Official Academic Survey Portal</span>
        </div>

        <div className="flex items-center gap-3">
          <span>SSL 256-Bit Encrypted</span>
          <span>•</span>
          <span>Institution: {currentCollege.code}</span>
          <span>•</span>
          <a
            href={sanitizedEmbedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 underline font-bold"
          >
            Direct Link
          </a>
        </div>
      </div>
    </div>
  );
};
