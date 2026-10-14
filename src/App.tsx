/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { EmergencyBanner } from './components/EmergencyBanner';
import { DigitalIdModal } from './components/DigitalIdModal';
import { QrVerifierModal } from './components/QrVerifierModal';
import { CampusCopilotModal } from './components/CampusCopilotModal';
import { AuthWizardModal } from './components/AuthWizardModal';
import { AuthSystemFlow } from './components/auth/AuthSystemFlow';
import { CollegeDashboardModal } from './components/college/CollegeDashboardModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { StudentPublicVerificationModal } from './components/StudentPublicVerificationModal';
import { PhoneOtpVerificationModal } from './components/PhoneOtpVerificationModal';
import { EmailVerificationModal } from './components/EmailVerificationModal';
import { SecurityAuditLogModal } from './components/SecurityAuditLogModal';
import { InstitutionalVerificationHeaderBanner } from './components/common/InstitutionalVerificationHeaderBanner';

// Views
import { StudentHome } from './components/student/StudentHome';
import { CollegeGeneralFeed } from './components/student/CollegeGeneralFeed';
import { GroupsHub } from './components/student/GroupsHub';
import { NotesBrowser } from './components/student/NotesBrowser';
import { EventsHub } from './components/student/EventsHub';
import { StudentProgress } from './components/student/StudentProgress';
import { MessagingHub } from './components/student/MessagingHub';
import { StudentProfile } from './components/student/StudentProfile';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { HODDashboard } from './components/hod/HODDashboard';
import { AlumniDashboard } from './components/alumni/AlumniDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { LibrarianDashboard } from './components/librarian/LibrarianDashboard';
import { LabAssistantDashboard } from './components/lab/LabAssistantDashboard';
import { AccountantDashboard } from './components/accountant/AccountantDashboard';
import { WardenDashboard } from './components/warden/WardenDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { GuestFacultyDashboard } from './components/guest/GuestFacultyDashboard';
import { CollegeAdminOverview } from './components/admin/CollegeAdminOverview';
import { PlatformAdminDashboard } from './components/platform/PlatformAdminDashboard';
import { InterCollegeNetwork } from './components/network/InterCollegeNetwork';
import { GoogleFormsHub } from './components/forms/GoogleFormsHub';

import {
  Home,
  Megaphone,
  BookOpen,
  Users,
  User,
  Sparkles,
  QrCode,
  Calendar,
  BarChart3,
  MessageSquare,
  Globe,
  ChevronDown,
  CheckCircle2,
  Wifi,
  ClipboardList,
  WifiOff,
  Bell,
  Menu,
  X,
  ShieldCheck,
  Settings,
  Fingerprint,
  Lock,
  Search,
  Building2,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    currentUser,
    currentRole,
    switchRole,
    colleges,
    currentCollege,
    setCurrentCollege,
    setIsCopilotOpen,
    setIsDigitalIdOpen,
    openDigitalIdWithBiometrics,
    isUserSettingsOpen,
    setIsUserSettingsOpen,
    isBiometricEnabled,
    isOffline,
    toggleOfflineSimulation,
    firebaseUser,
    signInWithFirebaseGoogle,
    signOutFirebase,
    unreadNotificationCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isPublicVerificationOpen,
    setIsPublicVerificationOpen,
    verifiedTargetUser,
    openPhoneOtpVerification,
    downloadProfileData,
    setIsQrVerifierOpen,
    isSecurityAuditLogModalOpen,
    setIsSecurityAuditLogModalOpen,
    auditLogTargetUser,
    openEmailVerification,
    setIsCollegeDashboardOpen,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [collegeSearchFilter, setCollegeSearchFilter] = useState('');

  const filteredColleges = colleges.filter((c) => {
    if (!collegeSearchFilter) return true;
    const q = collegeSearchFilter.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.district && c.district.toLowerCase().includes(q)) ||
      (c.instituteCode && c.instituteCode.toLowerCase().includes(q)) ||
      c.code.toLowerCase().includes(q) ||
      (c.branches && c.branches.some((b) => b.toLowerCase().includes(q)))
    );
  });

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date()).toUpperCase();

  const navItems = [
    { id: 'home', label: '01 OVERVIEW', icon: Home },
    { id: 'feed', label: '02 BULLETIN FEED', icon: Megaphone },
    { id: 'groups', label: '03 SOCIAL CLUSTERS', icon: Users },
    { id: 'notes', label: '04 SCHOLARLY VAULT', icon: BookOpen },
    { id: 'events', label: '05 EVENTS ARCHIVE', icon: Calendar },
    { id: 'progress', label: '06 ATTENDANCE LEDGER', icon: BarChart3 },
    { id: 'messages', label: '07 SECURE EXCHANGE', icon: MessageSquare },
    { id: 'inter-college', label: '08 CONSORTIUM NET', icon: Globe },
    { id: 'forms', label: '09 GOOGLE FORMS', icon: ClipboardList },
    { id: 'profile', label: '10 ID CREDENTIAL', icon: User },
  ];

  if (activeNavTab === 'auth-flow') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#141414] flex flex-col font-sans">
        <AuthSystemFlow onComplete={() => setActiveNavTab('home')} />
        <DigitalIdModal />
        <QrVerifierModal />
        <CampusCopilotModal />
        <AuthWizardModal />
        <CollegeDashboardModal />
        <PhoneOtpVerificationModal />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'home':
        return <StudentHome />;
      case 'feed':
        return <CollegeGeneralFeed />;
      case 'groups':
        return <GroupsHub />;
      case 'notes':
        return <NotesBrowser />;
      case 'events':
        return <EventsHub />;
      case 'progress':
        return <StudentProgress />;
      case 'messages':
        return <MessagingHub />;
      case 'inter-college':
        return <InterCollegeNetwork />;
      case 'forms':
        return <GoogleFormsHub />;
      case 'profile':
        return <StudentProfile />;
      case 'teacher-dashboard':
        return <TeacherDashboard />;
      case 'hod-dashboard':
        return <HODDashboard />;
      case 'alumni-dashboard':
        return <AlumniDashboard />;
      case 'parent-dashboard':
        return <ParentDashboard />;
      case 'librarian-dashboard':
        return <LibrarianDashboard />;
      case 'lab-assistant-dashboard':
        return <LabAssistantDashboard />;
      case 'accountant-dashboard':
        return <AccountantDashboard />;
      case 'warden-dashboard':
        return <WardenDashboard />;
      case 'recruiter-dashboard':
        return <RecruiterDashboard />;
      case 'guest-faculty-dashboard':
        return <GuestFacultyDashboard />;
      case 'admin-overview':
        return <CollegeAdminOverview />;
      case 'platform-admin':
        return <PlatformAdminDashboard />;
      default:
        return <StudentHome />;
    }
  };

  const getHeadingTitle = () => {
    switch (activeNavTab) {
      case 'home':
        return currentUser.fullName;
      case 'feed':
        return 'Campus Bulletin';
      case 'groups':
        return 'Academic Clusters';
      case 'notes':
        return 'Scholarly Vault';
      case 'events':
        return 'Events Chronicle';
      case 'progress':
        return 'Attendance Ledger';
      case 'messages':
        return 'Secure Dispatch';
      case 'inter-college':
        return 'SBTE Consortium';
      case 'forms':
        return 'Google Forms & Surveys Hub';
      case 'profile':
        return 'Student Profile';
      case 'teacher-dashboard':
        return 'Faculty Desk';
      case 'hod-dashboard':
        return 'HOD Department Desk';
      case 'alumni-dashboard':
        return 'Alumni Mentorship Desk';
      case 'parent-dashboard':
        return 'Guardian Monitoring Desk';
      case 'librarian-dashboard':
        return 'Central Library Desk';
      case 'lab-assistant-dashboard':
        return 'Practical Labs & Workshop Desk';
      case 'accountant-dashboard':
        return 'Treasury & Accounts Desk';
      case 'warden-dashboard':
        return 'Hostel Warden Desk';
      case 'recruiter-dashboard':
        return 'Campus Placement & DET Desk';
      case 'guest-faculty-dashboard':
        return 'Visiting Professor Desk';
      case 'admin-overview':
        return 'Registrar Desk';
      case 'platform-admin':
        return 'Root Console';
      default:
        return 'AAVRIT System';
    }
  };

  const getHeadingSubtitle = () => {
    switch (activeNavTab) {
      case 'home':
        return `Identity Ledger // 00492-X · Node: ${currentCollege.code}`;
      case 'feed':
        return `Official Directives & Gazette // ${currentCollege.name}`;
      case 'groups':
        return `Peer Labs, Workshops & Certified Societies`;
      case 'notes':
        return `Verified Lecture PDFs, Lab Manuals & PYQs (Offline Sync)`;
      case 'events':
        return `State Hackathons, Convocations & Symposia`;
      case 'progress':
        return `SBTE Statutory Attendance Record (75% Compliance Audit)`;
      case 'messages':
        return `Encrypted PDF Dispatch & Faculty Appointments`;
      case 'inter-college':
        return `Bihar Polytechnic Inter-Institutional Mesh`;
      case 'profile':
        return `Reg: ${currentUser.membership.rollNumber || 'ME2024001'} // Biometric Clearance`;
      case 'teacher-dashboard':
        return `Faculty Roster & Practical Attestation`;
      case 'hod-dashboard':
        return `Department of Mechanical Engineering · HOD: Prof. Anil Kumar Singh`;
      case 'alumni-dashboard':
        return `Class of 2024 · Tata Motors Plant Engineer · Vikash Anand`;
      case 'parent-dashboard':
        return `Ward: Prashant Kumar (ME2024001) · Real-Time Compliance`;
      case 'librarian-dashboard':
        return `Digital Notes Vault & SBTE Textbook Catalog · Shambhu Nath Sharma`;
      case 'lab-assistant-dashboard':
        return `Workshop & Machine Apparatus Register · Ranjeet Paswan`;
      case 'accountant-dashboard':
        return `Statutory Fee Collection & Student Credit Card · CA Manish Sinha`;
      case 'warden-dashboard':
        return `Residential Welfare & Night Curfew Ledger · Kunal Kishor`;
      case 'recruiter-dashboard':
        return `L&T Construction DET Partner · Priya Malhotra`;
      case 'guest-faculty-dashboard':
        return `Visiting Professor Term · Dr. Arvind Swarup`;
      case 'admin-overview':
        return `Institutional Registration & Access Matrix`;
      case 'platform-admin':
        return `Multi-Tenant PostgreSQL & Cloud SQL Infrastructure`;
      default:
        return `Sys//ID: ${currentCollege.code}`;
    }
  };

  const roles = [
    { id: 'student', label: 'Prashant Kumar', title: 'Student · ME 3rd Sem' },
    { id: 'teacher', label: 'Mr. Suresh Prasad', title: 'Faculty · Thermodynamics' },
    { id: 'hod', label: 'Prof. Anil Kumar Singh', title: 'HOD · Mechanical Dept' },
    { id: 'college_admin', label: 'Dr. Rajesh Verma', title: 'Principal · College Admin' },
    { id: 'platform_admin', label: 'Root Operator', title: 'Platform Super Admin' },
    { id: 'alumni', label: 'Vikash Anand', title: 'Alumni · Tata Motors Engr' },
    { id: 'parent', label: 'Ramesh Kumar', title: 'Parent · Prashant Kumar' },
    { id: 'librarian', label: 'Shambhu Nath Sharma', title: 'Chief Librarian' },
    { id: 'lab_assistant', label: 'Ranjeet Paswan', title: 'Lab Assistant · Workshop' },
    { id: 'accountant', label: 'CA Manish Sinha', title: 'Accountant / Bursar' },
    { id: 'warden', label: 'Kunal Kishor', title: 'Hostel Warden' },
    { id: 'recruiter', label: 'Priya Malhotra', title: 'Recruiter · L&T Partner' },
    { id: 'guest_faculty', label: 'Dr. Arvind Swarup', title: 'Visiting Guest Faculty' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#111111] font-sans flex flex-col xl:grid xl:grid-cols-[240px_1fr_320px] lg:grid lg:grid-cols-[240px_1fr]">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#111111] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-[#111111] hover:bg-[#e0ddd5] border border-[#111111] transition cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5 text-[#cc0000]" /> : <Menu className="w-5 h-5 text-[#111111]" />}
          </button>
          <span className="font-display text-2xl font-bold tracking-tight text-[#111111]">
            AAVRIT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openDigitalIdWithBiometrics}
            className="btn-outline !py-1 !px-2.5 text-[10px]"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>ID</span>
          </button>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 border border-[#111111] bg-white hover:bg-[#e0ddd5] text-[#111111] relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#cc0000] rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Left Rail Sidebar: Variation 12 Structure */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[240px] bg-white border-r border-[#111111] flex flex-col justify-between z-50 overflow-y-auto transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Block */}
          <div className="brand-block flex items-start justify-between">
            <div
              onClick={() => {
                setActiveNavTab('home');
                setMobileSidebarOpen(false);
              }}
              className="cursor-pointer"
            >
              <div className="brand-text">AAVRIT</div>
              <div className="meta mt-1">ARCHIVE 2026.B</div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-[#111111] hover:text-[#cc0000] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Academic Tenant Selector */}
          <div className="px-5 py-3 border-b border-[#e0ddd5]">
            <div className="meta mb-1 text-[8px]">INSTITUTION NODE</div>
            <div className="relative">
              <button
                onClick={() => {
                  setShowCollegeDropdown(!showCollegeDropdown);
                  setShowRoleDropdown(false);
                }}
                className="w-full text-left text-[11px] font-mono px-2.5 py-1.5 bg-[#f5f4f0] border border-[#111111] hover:bg-[#e0ddd5] flex items-center justify-between transition cursor-pointer"
              >
                <span className="truncate text-[#111111] font-semibold">{currentCollege.code}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-1 text-[#111111]" />
              </button>

              {showCollegeDropdown && (
                <div className="absolute left-0 w-80 sm:w-88 mt-1 bg-white border border-[#111111] shadow-2xl py-1 z-50 rounded-b-lg">
                  <div className="px-3 py-1.5 meta border-b border-[#e0ddd5] text-[9px] flex items-center justify-between font-mono bg-white">
                    <span>BIHAR POLYTECHNIC DIRECTORY</span>
                    <span className="font-bold text-[#10B981]">{filteredColleges.length} / 46 INSTITUTES</span>
                  </div>

                  {/* Search box */}
                  <div className="p-2 border-b border-[#e0ddd5] bg-[#f5f4f0]">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#666666]" />
                      <input
                        type="text"
                        placeholder="Search code (111-156), district, name..."
                        value={collegeSearchFilter}
                        onChange={(e) => setCollegeSearchFilter(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-xs border border-[#111111] bg-white font-mono placeholder:text-slate-400 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#e0ddd5]/60">
                    {filteredColleges.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => {
                          setCurrentCollege(col);
                          setShowCollegeDropdown(false);
                          setCollegeSearchFilter('');
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-mono flex items-start justify-between hover:bg-[#f5f4f0] transition cursor-pointer ${
                          col.id === currentCollege.id ? 'bg-[#e0ddd5] text-[#111111] font-bold' : 'text-[#111111]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold bg-[#111111] text-white px-1.5 py-0.2 rounded font-mono">
                              CODE {col.instituteCode || col.code}
                            </span>
                            <span className="text-[10px] text-[#666666] font-sans font-semibold">
                              {col.district}
                            </span>
                          </div>
                          <div className="text-xs font-bold font-sans text-slate-900 leading-tight">
                            {col.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {col.branches?.length || col.departments?.length || 5} SBTE Branches
                          </div>
                        </div>
                        {col.id === currentCollege.id && (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-1" />
                        )}
                      </button>
                    ))}
                    {filteredColleges.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500 font-mono">
                        No polytechnic matched "{collegeSearchFilter}"
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-[#e0ddd5] bg-[#f5f4f0]">
                    <button
                      onClick={() => {
                        setShowCollegeDropdown(false);
                        setIsCollegeDashboardOpen(true);
                      }}
                      className="w-full py-1 text-center bg-black hover:bg-zinc-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Building2 className="w-3 h-3 text-amber-400" />
                      <span>VIEW FULL ACADEMIC DETAILS</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="py-2">
            {navItems.map((item) => {
              const isActive = activeNavTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNavTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`block px-5 py-2.5 font-mono text-xs transition border-b border-[#e0ddd5]/50 ${
                    isActive
                      ? 'bg-[#e0ddd5] text-[#111111] font-bold border-l-4 border-l-[#111111]'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-[#f5f4f0]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Role-Specific Desks */}
            {currentRole === 'teacher' && (
              <a
                href="#teacher-dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNavTab('teacher-dashboard');
                  setMobileSidebarOpen(false);
                }}
                className={`block px-5 py-2.5 font-mono text-xs transition border-b border-[#e0ddd5]/50 ${
                  activeNavTab === 'teacher-dashboard'
                    ? 'bg-[#e0ddd5] text-[#111111] font-bold border-l-4 border-l-[#111111]'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#f5f4f0]'
                }`}
              >
                10 FACULTY DESK
              </a>
            )}

            {currentRole === 'hod' && (
              <a
                href="#hod-dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNavTab('hod-dashboard');
                  setMobileSidebarOpen(false);
                }}
                className={`block px-5 py-2.5 font-mono text-xs transition border-b border-[#e0ddd5]/50 ${
                  activeNavTab === 'hod-dashboard'
                    ? 'bg-[#e0ddd5] text-[#111111] font-bold border-l-4 border-l-[#111111]'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#f5f4f0]'
                }`}
              >
                10 HOD DEPT DESK
              </a>
            )}

            {(currentRole === 'college_admin' || currentRole === 'platform_admin') && (
              <a
                href="#admin-overview"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNavTab('admin-overview');
                  setMobileSidebarOpen(false);
                }}
                className={`block px-5 py-2.5 font-mono text-xs transition border-b border-[#e0ddd5]/50 ${
                  activeNavTab === 'admin-overview'
                    ? 'bg-[#e0ddd5] text-[#111111] font-bold border-l-4 border-l-[#111111]'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#f5f4f0]'
                }`}
              >
                11 REGISTRAR DESK
              </a>
            )}
          </nav>
        </div>

        {/* User Context Card at Bottom of Left Rail */}
        <div>
          <div className="user-context-card">
            <div className="context-row">
              <span className="context-label">Status</span>
              <span className="context-value">
                {currentRole === 'student'
                  ? 'REG. STUDENT'
                  : currentRole === 'college_admin'
                  ? 'PRIN. / REG.'
                  : currentRole.toUpperCase().replace('_', ' ')}
              </span>
            </div>
            <div className="context-row">
              <span className="context-label">Org</span>
              <span className="context-value">{currentCollege.code}</span>
            </div>
            <div className="context-row">
              <span className="context-label">Major // Roll</span>
              <span className="context-value">
                {currentUser.membership?.branchId || 'CSE'} // {currentUser.membership?.rollNumber || '24-001'}
              </span>
            </div>
            <div className="context-row">
              <span className="context-label">Email Node</span>
              <span className="context-value !text-[9px] !font-mono lowercase truncate">
                {currentUser.email || 'p.raj@poly.edu'}
              </span>
            </div>

            {/* Persona Switcher & Settings Shortcut */}
            <div className="mt-3 pt-2 border-t border-[#111111]/15 flex items-center justify-between gap-1">
              <div className="relative flex-1">
                <button
                  onClick={() => {
                    setShowRoleDropdown(!showRoleDropdown);
                    setShowCollegeDropdown(false);
                  }}
                  className="w-full text-left flex items-center justify-between font-mono text-[9px] font-bold text-[#111111] hover:text-[#cc0000] cursor-pointer"
                >
                  <span>SWITCH PERSONA</span>
                  <ChevronDown className="w-3 h-3 text-[#111111]" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[#111111] shadow-xl py-1 z-50">
                    <div className="px-3 py-1 meta border-b border-[#e0ddd5] text-[8px]">
                      SELECT PERSONA CLEARANCE
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          switchRole(r.id as any);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-mono flex flex-col hover:bg-[#f5f4f0] cursor-pointer ${
                          currentRole === r.id ? 'bg-[#e0ddd5] text-[#111111] font-bold' : 'text-[#111111]'
                        }`}
                      >
                        <span>{r.label}</span>
                        <span className="text-[9px] text-[#666666]">{r.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsUserSettingsOpen(true)}
                className="p-1 border border-[#111111] hover:bg-[#111111] hover:text-white transition cursor-pointer"
                title="User Settings & Biometrics"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Wi-Fi Telemetry & Firebase Sync Controls */}
          <div className="px-5 py-2.5 border-t border-[#e0ddd5] flex items-center justify-between text-[10px] font-mono">
            <button
              onClick={toggleOfflineSimulation}
              className={`flex items-center gap-1 font-bold ${
                isOffline ? 'text-[#cc0000]' : 'text-[#10B981]'
              }`}
            >
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span>{isOffline ? 'OFFLINE' : 'ONLINE'}</span>
            </button>

            {firebaseUser ? (
              <button
                onClick={signOutFirebase}
                className="text-[#cc0000] underline cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={signInWithFirebaseGoogle}
                className="font-bold underline cursor-pointer text-[#111111]"
              >
                Sync Node
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Center Main Workspace */}
      <main className="flex flex-col min-h-screen p-5 sm:p-8 lg:p-10 gap-6">
        {/* Official Institutional Verification Header Banner */}
        <InstitutionalVerificationHeaderBanner />

        {/* Header Block matching Variation 12 */}
        <div className="header">
          <div>
            <div className="meta">SYSTEM DATA LOG // {currentCollege.code}</div>
            <div className="section-title">{getHeadingTitle()}</div>
          </div>
          <div className="flex flex-col sm:items-end gap-1 text-right">
            <div className="meta">AUTH STATUS</div>
            <div className="flex items-center gap-1.5 font-display text-sm font-bold text-[#10B981] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>SBTE VERIFIED</span>
            </div>
            <div className="meta text-[9px] text-[#666666]">
              REF: {todayFormatted} // SHA-256
            </div>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openDigitalIdWithBiometrics}
            className="btn-outline !w-auto"
            title={isBiometricEnabled ? 'Biometrically Protected ID Ledger' : 'View ID Ledger'}
          >
            {isBiometricEnabled ? <Fingerprint className="w-3.5 h-3.5 text-emerald-600" /> : <QrCode className="w-3.5 h-3.5" />}
            <span>ID LEDGER</span>
          </button>

          <button
            onClick={() => setIsUserSettingsOpen(true)}
            className="btn-outline !w-auto"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={() => setIsCopilotOpen(true)}
            className="btn-black !w-auto !py-2 !px-3 text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>COPILOT</span>
          </button>

          <button
            onClick={() => setIsCollegeDashboardOpen(true)}
            className="btn-outline !w-auto"
            title="Inspect Official 2026-27 SBTE College Academic Directory & Approved Branches"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>COLLEGE INFO</span>
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-outline !w-auto relative"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>DISPATCHES</span>
            {unreadNotificationCount > 0 && (
              <span className="badge-alt ml-1 px-1 bg-[#cc0000] text-white text-[8px]">{unreadNotificationCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-6 top-32 w-80 sm:w-96 bg-white border border-[#111111] shadow-2xl p-4 z-50 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-[#e0ddd5] mb-3">
                <span className="meta font-bold">SYSTEM DISPATCHES</span>
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-[10px] font-mono underline cursor-pointer text-[#cc0000]"
                >
                  Acknowledge All
                </button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#666666] italic py-2">No pending dispatches.</p>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 border text-xs cursor-pointer transition ${
                        !n.isRead ? 'bg-[#faf9f6] border-[#111111]' : 'bg-white border-[#e0ddd5] opacity-70'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-[#111111]">{n.title}</span>
                        <span className="text-[9px] font-mono text-[#666666]">{n.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-[#555555] mt-1">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Banner if Active */}
        <EmergencyBanner />

        {/* Dynamic View Content */}
        <div className="flex-1">
          {renderActiveView()}
        </div>

        {/* Footer Line matching Variation 12 */}
        <div className="footer-line mt-6">
          <div className="meta">SBTE PATNA // {currentCollege.name.toUpperCase()}</div>
          <div className="meta">REF: {todayFormatted} // AES-256 VALIDATED</div>
        </div>
      </main>

      {/* Right Detail Sidebar matching Variation 12 */}
      <section className="detail-sidebar hidden xl:flex">
        {/* Official Identity Pass Card */}
        <div>
          <div className="meta" style={{ marginBottom: '15px' }}>Official Identity</div>
          <div
            onClick={openDigitalIdWithBiometrics}
            className="pass-card cursor-pointer hover:border-[#cc0000] transition group"
            title="Click to view full cryptographic ID Ledger"
          >
            <div className="pass-header">
              <div className="pass-avatar">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-sm font-bold">{currentUser.fullName.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', textTransform: 'uppercase', lineHeight: 1 }}>
                  {currentUser.fullName}
                </div>
                <div className="meta mt-1">
                  {currentCollege.code}-{currentUser.membership?.rollNumber || '2024-CSE'}
                </div>
              </div>
            </div>
            <div className="pass-barcode"></div>
            <div className="mt-3 pt-2 border-t border-[#111111]/15 flex items-center justify-between text-[9px] font-mono">
              <span className="text-[#10B981] font-bold">[SBTE VERIFIED]</span>
              <span className="text-[#666666] group-hover:text-[#111111]">OPEN PASS →</span>
            </div>
          </div>
        </div>

        {/* Node Controls */}
        <div>
          <div className="meta" style={{ marginBottom: '15px' }}>Node Controls</div>
          <button
            onClick={() => openPhoneOtpVerification(currentRole)}
            className="btn-outline"
          >
            UPDATE MOBILE (OTP)
          </button>
          <button
            onClick={() => setIsUserSettingsOpen(true)}
            className="btn-outline"
          >
            SYNC BIOMETRICS
          </button>
          <button
            onClick={downloadProfileData}
            className="btn-outline"
          >
            EXPORT RECORD
          </button>
          <button
            onClick={() => setIsQrVerifierOpen(true)}
            className="btn-outline"
          >
            OPTICAL QR VERIFIER
          </button>
          <button
            onClick={() => setIsSecurityAuditLogModalOpen(true)}
            className="btn-outline"
          >
            SECURITY AUDIT LEDGER
          </button>
          <button
            onClick={() => setIsCollegeDashboardOpen(true)}
            className="btn-outline !border-indigo-600 !text-indigo-900 !bg-indigo-50/50 hover:!bg-indigo-100"
          >
            ACADEMIC DETAILS & SYLLABUS
          </button>
        </div>

        {/* Recent Bulletins */}
        <div style={{ borderTop: '1px solid var(--ink)', paddingTop: '20px' }}>
          <div className="meta" style={{ marginBottom: '15px' }}>Recent Bulletins</div>
          <div style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
            <p><strong>[!] MID-SEM ALERT:</strong> PHASE 01 BEGINS NOV 18.</p>
            <p style={{ marginTop: '10px', color: 'var(--ink-dim)' }}>[i] LIBRARY: RETURN VOL 2 MECH BY FRI.</p>
            {notifications.slice(0, 2).map((n) => (
              <p key={n.id} style={{ marginTop: '10px', color: 'var(--ink-dim)' }}>
                <strong>[#] {n.title}:</strong> {n.body.slice(0, 50)}...
              </p>
            ))}
          </div>
        </div>

        {/* Terminate Session Button */}
        <button
          onClick={() => {
            if (firebaseUser) {
              signOutFirebase();
            } else {
              switchRole('student');
              setActiveNavTab('home');
            }
          }}
          className="btn-black"
          style={{ marginTop: 'auto', background: 'var(--warning)', borderColor: 'var(--warning)' }}
        >
          TERMINATE SESSION
        </button>
      </section>

      {/* Global Modals */}
      <DigitalIdModal />
      <UserSettingsModal />
      <BiometricAuthModal />
      <QrVerifierModal />
      <CampusCopilotModal />
      <AuthWizardModal />
      <CollegeDashboardModal />
      <PhoneOtpVerificationModal />
      <EmailVerificationModal />
      <SecurityAuditLogModal
        isOpen={isSecurityAuditLogModalOpen}
        onClose={() => setIsSecurityAuditLogModalOpen(false)}
        targetUser={auditLogTargetUser || currentUser}
        onTriggerEmailVerification={openEmailVerification}
        onTriggerPhoneVerification={() => openPhoneOtpVerification()}
      />
      <StudentPublicVerificationModal
        isOpen={isPublicVerificationOpen}
        onClose={() => setIsPublicVerificationOpen(false)}
        student={verifiedTargetUser || currentUser}
        college={currentCollege}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
