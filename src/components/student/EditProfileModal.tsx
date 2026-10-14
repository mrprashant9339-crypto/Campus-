import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Camera,
  Upload,
  User,
  Building2,
  GraduationCap,
  Briefcase,
  Shield,
  Bell,
  Phone,
  Mail,
  AlertCircle,
  Check,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Github,
  Linkedin,
  FileText,
  Save,
  HelpCircle,
} from 'lucide-react';
import { BIHAR_POLYTECHNIC_DIRECTORY } from '../../data/biharPolytechnicDirectory';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    updateCurrentUser,
    updateUserProfile,
    uploadProfilePhoto,
    currentCollege,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'basic' | 'academic' | 'portfolio' | 'privacy' | 'security'>('basic');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Basic Identity Form State
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [username, setUsername] = useState(currentUser.profile?.username || 'prashant_sbte');
  const [bio, setBio] = useState(currentUser.profile?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl || '');
  
  // Academic Form State
  const [selectedCollegeId, setSelectedCollegeId] = useState(currentUser.membership?.collegeId || currentCollege.id);
  const [departmentName, setDepartmentName] = useState(currentUser.membership?.departmentName || 'Mechanical Engineering');
  const [semesterNumber, setSemesterNumber] = useState<number>(currentUser.membership?.semesterNumber || 3);
  const [sectionName, setSectionName] = useState(currentUser.membership?.sectionName || 'A');
  const [rollNumber, setRollNumber] = useState(currentUser.membership?.rollNumber || 'ME2024001');
  const [enrollmentNumber, setEnrollmentNumber] = useState(currentUser.profile?.enrollmentNumber || 'SBTE/2023/ME/0984');
  const [admissionYear, setAdmissionYear] = useState<number>(currentUser.profile?.admissionYear || 2023);
  const [passingYear, setPassingYear] = useState<number>(currentUser.profile?.passingYear || 2026);

  // Portfolio & Collaboration State
  const [resumeUrl, setResumeUrl] = useState(currentUser.profile?.resumeUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser.profile?.portfolioUrl || '');
  const [githubUrl, setGithubUrl] = useState(currentUser.profile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.profile?.linkedinUrl || '');
  const [openToCollaborate, setOpenToCollaborate] = useState(currentUser.profile?.openToCollaborate ?? true);
  const [lookingFor, setLookingFor] = useState(currentUser.profile?.lookingFor || 'Frontend Developer & UI/UX Designer for Capstone Project');

  // Contact & Emergency (strictly private)
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [email, setEmail] = useState(currentUser.email || 'prashant@gpp.ac.in');
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.profile?.emergencyContact?.name || 'Ramesh Kumar (Father)');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser.profile?.emergencyContact?.phone || '+91 94310 98765');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(currentUser.profile?.emergencyContact?.relation || 'Father / Guardian');

  // Privacy & Notifications
  const [profileVisibility, setProfileVisibility] = useState(currentUser.profile?.privacySettings?.profile || 'college_only');
  const [phoneVisibility, setPhoneVisibility] = useState(currentUser.profile?.privacySettings?.phone || 'private');
  const [emailVisibility, setEmailVisibility] = useState(currentUser.profile?.privacySettings?.email || 'private');
  const [attendanceVisibility, setAttendanceVisibility] = useState(currentUser.profile?.privacySettings?.attendance || 'teachers_only');

  const [notificationMode, setNotificationMode] = useState(currentUser.profile?.notificationSettings?.mode || 'all');
  const [notifAssignments, setNotifAssignments] = useState(currentUser.profile?.notificationSettings?.assignments ?? true);
  const [notifNotices, setNotifNotices] = useState(currentUser.profile?.notificationSettings?.notices ?? true);
  const [notifEvents, setNotifEvents] = useState(currentUser.profile?.notificationSettings?.events ?? true);
  const [notifMessages, setNotifMessages] = useState(currentUser.profile?.notificationSettings?.messages ?? true);

  const [appLanguage, setAppLanguage] = useState(currentUser.profile?.appSettings?.language || 'english');
  const [appTheme, setAppTheme] = useState(currentUser.profile?.appSettings?.theme || 'light');
  const [copilotEnabled, setCopilotEnabled] = useState(currentUser.profile?.aiSettings?.copilotEnabled ?? true);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
          uploadProfilePhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save to AppContext and LocalStorage
    updateCurrentUser({
      fullName,
      phone,
      email,
      avatarUrl: avatarPreview,
      membership: {
        ...currentUser.membership,
        collegeId: selectedCollegeId,
        departmentName,
        semesterNumber: Number(semesterNumber),
        sectionName,
        rollNumber,
      },
    });

    updateUserProfile({
      username: username.replace('@', ''),
      bio,
      avatarUrl: avatarPreview,
      enrollmentNumber,
      admissionYear: Number(admissionYear),
      passingYear: Number(passingYear),
      batch: `${admissionYear} - ${passingYear}`,
      resumeUrl,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      openToCollaborate,
      lookingFor,
      emergencyContact: {
        name: emergencyContactName,
        phone: emergencyContactPhone,
        relation: emergencyContactRelation,
        isPrivate: true,
      },
      privacySettings: {
        profile: profileVisibility as any,
        phone: phoneVisibility as any,
        email: emailVisibility as any,
        attendance: attendanceVisibility as any,
        blockedUsers: currentUser.profile?.privacySettings?.blockedUsers || [],
        mutedGroups: currentUser.profile?.privacySettings?.mutedGroups || [],
      },
      notificationSettings: {
        mode: notificationMode as any,
        assignments: notifAssignments,
        notices: notifNotices,
        events: notifEvents,
        messages: notifMessages,
      },
      appSettings: {
        language: appLanguage as any,
        theme: appTheme as any,
      },
      aiSettings: {
        copilotEnabled,
        retentionDays: 30,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                <span>Profile Management Ledger</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-mono">
                  S-23 // SBTE
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Update identity, academic department, proofs, portfolio & DPDP privacy bounds
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 shrink-0 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
              activeTab === 'basic'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Identity & Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>2. College & Academic</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
              activeTab === 'portfolio'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>3. Portfolio & Collab</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>4. Privacy (DPDP)</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>5. Emergency & Notifications</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-bold text-xs animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile ledger updated successfully and synced across campus records.</span>
            </div>
          )}

          {/* TAB 1: BASIC IDENTITY & PHOTO */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group">
                  <img
                    src={avatarPreview || currentUser.avatarUrl}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
                  />
                  <label className="absolute inset-0 bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-extrabold text-sm text-slate-900">Student Identity Photograph</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ Instant Update
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Upload official passport-style picture or camera selfie. This photo appears on your verifiable Digital Campus ID and attendance check-in ledger.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File / Take Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomAvatars = [
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
                        ];
                        const next = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];
                        setAvatarPreview(next);
                        uploadProfilePhoto(next);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Preset Avatar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Full Name (as per Matriculation / SBTE) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Prashant Kumar"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Campus Username (@handle) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="prashant_sbte"
                      className="w-full border border-slate-300 rounded-lg p-2.5 pl-7 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Short Bio & Technical Interests
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. ME 3rd Sem • CAD, Python, Robotics enthusiast • Secretary of Coding Club"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC & INSTITUTIONAL */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Polytechnic Institution <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white"
                >
                  {BIHAR_POLYTECHNIC_DIRECTORY.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.sbteCode} — {col.name} ({col.district}, Bihar)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department / Branch</label>
                  <select
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white"
                  >
                    <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                    <option value="Civil Engineering">Civil Engineering (CE)</option>
                    <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Electronics Engineering">Electronics Engineering (ECE)</option>
                    <option value="Automobile Engineering">Automobile Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Semester</label>
                    <select
                      value={semesterNumber}
                      onChange={(e) => setSemesterNumber(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Section</label>
                    <select
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold bg-white"
                    >
                      {['A', 'B', 'C', 'General'].map((sec) => (
                        <option key={sec} value={sec}>
                          Section {sec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Roll Number</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="e.g. ME2024001"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">SBTE Registration / Enrollment No</label>
                  <input
                    type="text"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="e.g. SBTE/2023/ME/0984"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admission Year</label>
                  <input
                    type="number"
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Passing Year</label>
                  <input
                    type="number"
                    value={passingYear}
                    onChange={(e) => setPassingYear(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PORTFOLIO & COLLABORATION */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              {/* Collaboration Toggle */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-indigo-950">
                      Open to Inter-College Project Collaboration
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openToCollaborate}
                      onChange={(e) => setOpenToCollaborate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    What collaborators are you looking for?
                  </label>
                  <input
                    type="text"
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    placeholder="e.g. Frontend Dev, UI/UX Designer, 3D CAD Modeler for Hackathon..."
                    className="w-full border border-indigo-200 bg-white rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Portfolio Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Resume / CV Link</span>
                  </label>
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Personal Portfolio / Blog Website</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://myportfolio.dev"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Github className="w-3.5 h-3.5 text-slate-500" />
                    <span>GitHub Profile</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY SETTINGS (DPDP ACT 2023) */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs">
                <span className="font-bold block mb-0.5">🇮🇳 DPDP Act 2023 Statutory Privacy Controls</span>
                Emergency contacts, phone numbers and unverified academic records are strictly private by default. Configure exactly who within your campus or outside can inspect your verified identity.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Profile Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  >
                    <option value="college_only">College Verified Members Only (Default)</option>
                    <option value="class_only">My Class & Branch Only</option>
                    <option value="teachers_only">Teachers & HOD Only</option>
                    <option value="public">Public Inter-Polytechnic Network</option>
                    <option value="private">Private (Ghost Mode)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number Access</label>
                  <select
                    value={phoneVisibility}
                    onChange={(e) => setPhoneVisibility(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  >
                    <option value="private">Private (Only Admin & Faculty)</option>
                    <option value="college_only">College Verified Peers</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Visibility</label>
                  <select
                    value={emailVisibility}
                    onChange={(e) => setEmailVisibility(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  >
                    <option value="private">Private (Encrypted)</option>
                    <option value="college_only">College Verified Peers</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Attendance Percentage Visibility</label>
                  <select
                    value={attendanceVisibility}
                    onChange={(e) => setAttendanceVisibility(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                  >
                    <option value="teachers_only">Teachers & Proctor Only</option>
                    <option value="college_only">College Verified Peers</option>
                    <option value="private">Strictly Private</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EMERGENCY CONTACT & NOTIFICATIONS */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              {/* Emergency Contact */}
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="font-extrabold text-xs text-rose-950">
                    Emergency Contact (Strictly Visible Only to College Administration)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Relation</label>
                    <input
                      type="text"
                      value={emergencyContactRelation}
                      onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      placeholder="Father / Mother / Guardian"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="+91 94310 98765"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Notification Dispatch Mode</span>
                  <select
                    value={notificationMode}
                    onChange={(e) => setNotificationMode(e.target.value as any)}
                    className="border border-slate-300 rounded-lg p-1.5 text-xs bg-white font-semibold"
                  >
                    <option value="all">All Notifications</option>
                    <option value="important_only">Important Only (Exams & Notices)</option>
                    <option value="mute">Mute All</option>
                    <option value="schedule">Scheduled Hours (8 AM - 8 PM)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifAssignments}
                      onChange={(e) => setNotifAssignments(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Assignments</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifNotices}
                      onChange={(e) => setNotifNotices(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Official Notices</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifEvents}
                      onChange={(e) => setNotifEvents(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Campus Events</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifMessages}
                      onChange={(e) => setNotifMessages(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Direct Messages</span>
                  </label>
                </div>
              </div>

              {/* App Settings: Language & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Language</label>
                  <select
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white font-semibold"
                  >
                    <option value="english">English (Official SBTE Standard)</option>
                    <option value="hindi">हिन्दी (Hindi)</option>
                    <option value="hinglish">Hinglish (Colloquial Campus)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Theme Preference</label>
                  <select
                    value={appTheme}
                    onChange={(e) => setAppTheme(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white font-semibold"
                  >
                    <option value="light">Light Editorial Ledger (Clean Print)</option>
                    <option value="dark">Dark High-Contrast Mode</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs cursor-pointer transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-200 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Commit Profile Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
