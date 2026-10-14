import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  UploadCloud,
  FileText,
  Clock,
  Sparkles,
  Lock,
  Mail,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { sendRealPhoneOtp, verifyRealPhoneOtp } from '../services/verificationService';

export const AuthWizardModal: React.FC = () => {
  const { isAuthWizardOpen, setIsAuthWizardOpen, colleges, submitVerificationRequest } = useApp();

  // Wizard step state (1 to 10 matching S-01 to S-10)
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'email' | 'phone' | 'google'>('email');

  // Real OTP verification states
  const [wizardSessionToken, setWizardSessionToken] = useState('');
  const [wizardSmsPreview, setWizardSmsPreview] = useState<{ sender: string; body: string; code: string } | null>(null);
  const [wizardVerifying, setWizardVerifying] = useState(false);
  const [wizardOtpSending, setWizardOtpSending] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // Form states
  const [fullName, setFullName] = useState('Prashant Kumar');
  const [email, setEmail] = useState('prashant@student.gpp.ac.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('College@2024');
  const [consentAccepted, setConsentAccepted] = useState(true);

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Academic details
  const [selectedCollegeId, setSelectedCollegeId] = useState(colleges[0].id);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | 'college_admin'>('student');
  const [department, setDepartment] = useState('Mechanical Engineering');
  const [branch, setBranch] = useState('Mechanical Engineering');
  const [academicYear, setAcademicYear] = useState('2024-25');
  const [semester, setSemester] = useState(3);
  const [section, setSection] = useState('A');
  const [rollNumber, setRollNumber] = useState('ME2024001');

  // Proof document
  const [docType, setDocType] = useState<'id_card' | 'admission_letter' | 'fee_receipt' | 'other'>('id_card');
  const [uploadedFileName, setUploadedFileName] = useState('GPP_Patna_Student_ID_Prashant.jpg');
  const [isSimulatingOcr, setIsSimulatingOcr] = useState(false);
  const [ocrScore, setOcrScore] = useState(0.98);

  if (!isAuthWizardOpen) return null;

  const currentCollegeObj = colleges.find((c) => c.id === selectedCollegeId) || colleges[0];

  const handleDocSubmit = () => {
    setIsSimulatingOcr(true);
    setTimeout(() => {
      setIsSimulatingOcr(false);
      submitVerificationRequest({
        userId: `usr-${Date.now()}`,
        userName: fullName,
        userEmail: email,
        collegeId: currentCollegeObj.id,
        collegeName: currentCollegeObj.name,
        role: selectedRole,
        submittedData: {
          department,
          branch,
          semester,
          section,
          rollNumber,
        },
        docType,
        docName: uploadedFileName,
      });
      setStep(9); // Verification Pending
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
              A
            </div>
            <div>
              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                AAVRIT Onboarding & Identity Verification
              </span>
              <span className="ml-2 text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                Screen S-0{step}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthWizardOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 10) * 100}%` }}
          ></div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* S-01: Splash / Onboarding */}
          {step === 1 && (
            <div className="text-center py-4 space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 animate-pulse-slow">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Verified Academic Ecosystem
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Your Verified Campus.
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                  Notes, assignments, announcements, attendance, and identity — strictly isolated for your college.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-left max-w-md mx-auto">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-lg">🔒</div>
                  <div className="font-bold text-xs text-slate-900 mt-1">Layer A</div>
                  <div className="text-[10px] text-slate-500">Private College Environment</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-lg">🌐</div>
                  <div className="font-bold text-xs text-slate-900 mt-1">Layer B</div>
                  <div className="text-[10px] text-slate-500">College Network & Fests</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-lg">🪪</div>
                  <div className="font-bold text-xs text-slate-900 mt-1">Layer C</div>
                  <div className="text-[10px] text-slate-500">Verified Campus ID</div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
                >
                  Get Started → Create Verified Account
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  I already have an account (Sign In)
                </button>
              </div>
            </div>
          )}

          {/* S-02: Login */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 flex items-center gap-1 font-medium mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 className="text-xl font-extrabold text-slate-900">Welcome back</h2>
                <p className="text-xs text-slate-500">Sign in to your college domain</p>
              </div>

              <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'email' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600'}`}
                >
                  Email
                </button>
                <button
                  onClick={() => setActiveTab('phone')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'phone' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600'}`}
                >
                  Phone OTP
                </button>
                <button
                  onClick={() => setActiveTab('google')}
                  className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'google' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600'}`}
                >
                  Google SSO
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Official College Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Authenticated as ${email}`);
                  setIsAuthWizardOpen(false);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs mt-2 transition cursor-pointer"
              >
                Sign In to Campus
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                New to AAVRIT?{' '}
                <button
                  onClick={() => setStep(3)}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Create account →
                </button>
              </div>
            </div>
          )}

          {/* S-03: Signup Step 1 (Basic Details) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 1 of 6</span>
                  <h2 className="text-lg font-extrabold text-slate-900">Create your account</h2>
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Full Name (as per ID card)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Phone (with OTP support)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <span className="text-[10px] text-emerald-600 font-bold">Strong (Entropy 92)</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* DPDP Act 2023 Consent Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    I accept the <strong>DPDP Act 2023 Consent Notice v1.0</strong>. I understand that my verification document and academic profile will be stored in isolated private tenancy and accessible only to authorized college verifiers.
                  </span>
                </label>
              </div>

              {wizardError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{wizardError}</span>
                </div>
              )}

              <button
                disabled={!consentAccepted || wizardOtpSending}
                onClick={async () => {
                  setWizardOtpSending(true);
                  setWizardError('');
                  const res = await sendRealPhoneOtp(phone, undefined, selectedRole);
                  setWizardOtpSending(false);
                  if (res.success) {
                    if (res.sessionToken) setWizardSessionToken(res.sessionToken);
                    if (res.previewSms) {
                      setWizardSmsPreview(res.previewSms);
                      setOtp(res.previewSms.code.split(''));
                    }
                    setStep(4);
                  } else {
                    setWizardError(res.error || 'Failed to dispatch phone verification OTP');
                  }
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {wizardOtpSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Dispatching Real Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Real OTP Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* S-04: Signup Step 2 (Real OTP Verification) */}
          {step === 4 && (
            <div className="space-y-4 text-center py-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 2 of 6</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">Verify your credentials</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official 6-digit OTP code dispatched to mobile <strong className="text-slate-900 font-mono">{phone}</strong>
                </p>
              </div>

              {/* Live SMS Preview banner */}
              {wizardSmsPreview && (
                <div
                  onClick={() => {
                    setOtp(wizardSmsPreview.code.split(''));
                    setWizardError('');
                  }}
                  className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-left cursor-pointer hover:bg-amber-100 transition space-y-1 shadow-2xs"
                  title="Click to auto-fill"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-amber-900 font-mono font-bold flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                      <span>{wizardSmsPreview.sender}</span>
                    </span>
                    <span className="bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded font-mono">
                      CLICK TO AUTOFILL
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-950 font-medium">
                    "{wizardSmsPreview.body}"
                  </p>
                </div>
              )}

              {wizardError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-1.5 text-left">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{wizardError}</span>
                </div>
              )}

              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value.slice(-1);
                      setOtp(newOtp);
                    }}
                    className="w-10 h-12 text-center text-lg font-mono font-bold bg-slate-50 border-2 border-indigo-200 focus:border-indigo-600 rounded-lg focus:outline-none text-slate-900"
                  />
                ))}
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-between px-2">
                <span>Relay: SBTE Telecom Gateway</span>
                <button
                  type="button"
                  onClick={async () => {
                    setWizardError('');
                    const res = await sendRealPhoneOtp(phone, undefined, selectedRole);
                    if (res.success && res.previewSms) {
                      setWizardSmsPreview(res.previewSms);
                      setOtp(res.previewSms.code.split(''));
                    }
                  }}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(3)}
                  className="w-1/3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={wizardVerifying || otp.join('').length < 6}
                  onClick={async () => {
                    setWizardVerifying(true);
                    setWizardError('');
                    const entered = otp.join('');
                    const res = await verifyRealPhoneOtp(phone, entered, wizardSessionToken);
                    setWizardVerifying(false);
                    if (res.success && res.verified) {
                      setStep(5);
                    } else {
                      setWizardError(res.error || 'Invalid OTP code. Please check and try again.');
                    }
                  }}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition"
                >
                  {wizardVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating Real OTP...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Real OTP & Next →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* S-05: Signup Step 3 (College Selection) */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 3 of 6</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Select your college tenant</h2>
                <p className="text-xs text-slate-500">
                  You will only be granted access to your authenticated college environment
                </p>
              </div>

              <div className="space-y-2">
                {colleges.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCollegeId(c.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                      selectedCollegeId === c.id
                        ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.logoUrl}</span>
                      <div>
                        <div className="text-sm font-bold">{c.name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {c.city}, {c.state} • Code: {c.code}
                        </div>
                      </div>
                    </div>
                    {selectedCollegeId === c.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-dashed border-slate-300 flex items-center justify-between">
                <span>Can't find your college?</span>
                <button
                  onClick={() => alert('College onboarding request logged for verification.')}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Request to add →
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(4)}
                  className="w-1/3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Select & Choose Role →
                </button>
              </div>
            </div>
          )}

          {/* S-06: Signup Step 4 (Role Selection) */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 4 of 6</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">What is your role?</h2>
                <p className="text-xs text-slate-500">
                  Role determines your access permissions and verification rules
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'student',
                    title: 'Student',
                    desc: 'Enrolled in a regular diploma or degree program at this institute.',
                    icon: '🎓',
                  },
                  {
                    id: 'teacher',
                    title: 'Faculty / Teacher',
                    desc: 'Appointed professor, lecturer, or laboratory instructor.',
                    icon: '👨‍🏫',
                  },
                  {
                    id: 'college_admin',
                    title: 'College Administrator',
                    desc: 'Principal, registrar, or authorized verification officer (requires extra authorization).',
                    icon: '🏛️',
                  },
                ].map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id as any)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                      selectedRole === r.id
                        ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{r.icon}</span>
                      <div>
                        <div className="text-sm font-bold">{r.title}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{r.desc}</div>
                      </div>
                    </div>
                    {selectedRole === r.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(5)}
                  className="w-1/3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(7)}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Continue to Academic Details →
                </button>
              </div>
            </div>
          )}

          {/* S-07: Signup Step 5 (Academic Details) */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 5 of 6</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Academic details</h2>
                <p className="text-xs text-slate-500">
                  Maps you directly to your classroom group, subject notes, and teachers
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2"
                  >
                    <option>Mechanical Engineering</option>
                    <option>Computer Science Engineering</option>
                    <option>Electrical Engineering</option>
                    <option>Civil Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Academic Year</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2"
                  >
                    <option>2024-25</option>
                    <option>2023-24</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2"
                  >
                    <option value={1}>1st Semester</option>
                    <option value={2}>2nd Semester</option>
                    <option value={3}>3rd Semester</option>
                    <option value={4}>4th Semester</option>
                    <option value={5}>5th Semester</option>
                    <option value={6}>6th Semester</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Section</label>
                  <div className="flex gap-2 mt-1">
                    {['A', 'B'].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSection(sec)}
                        className={`flex-1 py-1.5 rounded-lg font-bold border transition cursor-pointer ${
                          section === sec
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        Section {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700">
                    {selectedRole === 'student' ? 'Official Roll Number / Registration No.' : 'Employee ID'}
                  </label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(6)}
                  className="w-1/3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(8)}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Next → Upload Proof Document
                </button>
              </div>
            </div>
          )}

          {/* S-08: Signup Step 6 (Proof Upload & OCR) */}
          {step === 8 && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Step 6 of 6</span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Upload proof of identity</h2>
                <p className="text-xs text-slate-500">
                  Required to prevent impersonation and safeguard campus privacy
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Document Type:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'id_card', label: 'College ID Card' },
                    { id: 'admission_letter', label: 'Admission Letter' },
                    { id: 'fee_receipt', label: 'Fee Challan / Receipt' },
                    { id: 'other', label: 'Enrollment Document' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDocType(d.id as any)}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                        docType === d.id
                          ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 border-2 border-dashed border-indigo-300 bg-indigo-50/40 rounded-2xl text-center space-y-2">
                <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto" />
                <div className="font-bold text-xs text-slate-800">
                  {uploadedFileName}
                </div>
                <p className="text-[11px] text-slate-500">
                  PDF, JPG, PNG up to 10MB • AES-256 encrypted storage
                </p>
                <div className="inline-flex items-center gap-1.5 bg-white text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>OCR Auto-Check: 98% Match</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Your uploaded document is stored in isolated private object storage. No public CDN URL is generated.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(7)}
                  className="w-1/3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleDocSubmit}
                  disabled={isSimulatingOcr}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSimulatingOcr ? (
                    <span>Running Anti-Fraud OCR Scan...</span>
                  ) : (
                    <span>Submit for College Verification →</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* S-09: Verification Pending Timeline */}
          {step === 9 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Verification in Progress
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                  Document Under College Review
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Your credentials have been submitted to <strong>{currentCollegeObj.name}</strong> verification queue. Typical approval time is within 24 to 48 hours.
                </p>
              </div>

              {/* Status Timeline */}
              <div className="max-w-xs mx-auto text-left space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">1. Submitted & Encrypted (Done)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-amber-500 animate-pulse flex items-center justify-center text-white text-[9px] font-bold">
                    ●
                  </div>
                  <span className="font-semibold text-amber-900">2. College Admin Queue (In Progress)</span>
                </div>
                <div className="flex items-center gap-2.5 opacity-50">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>
                  <span className="text-slate-500">3. Digital Campus ID Issued</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsAuthWizardOpen(false);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Explore Allowed Public Network & Demos
                </button>
                <button
                  onClick={() => setStep(10)}
                  className="text-xs text-rose-600 hover:underline cursor-pointer block mx-auto"
                >
                  View Sample Rejection & Appeal Flow (S-10)
                </button>
              </div>
            </div>
          )}

          {/* S-10: Verification Rejected & Appeal */}
          {step === 10 && (
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-rose-700">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Verification Request Requires Correction</span>
                </div>
                <p className="mt-1">
                  Reason: "Uploaded ID photo is low resolution and missing institute seal. Roll ME2024001 does not match name on blurred receipt."
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  File Student Appeal or Explanatory Note:
                </label>
                <textarea
                  rows={3}
                  defaultValue="I have attached my official entrance allotment letter stamped by BCECEB council with roll ME2024001."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(8)}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Re-upload Document
                </button>
                <button
                  onClick={() => {
                    alert('Appeal submitted to Principal / College Admin.');
                    setStep(9);
                  }}
                  className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Submit Appeal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
