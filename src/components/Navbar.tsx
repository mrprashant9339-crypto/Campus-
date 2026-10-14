import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { NotificationCenter } from './NotificationCenter';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  QrCode,
  Sparkles,
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  LogOut,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    colleges,
    currentCollege,
    setCurrentCollege,
    currentUser,
    currentRole,
    switchRole,
    unreadNotificationCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsCopilotOpen,
    setIsDigitalIdOpen,
    setIsQrVerifierOpen,
    setIsAuthWizardOpen,
    setIsCollegeDashboardOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    activeNavTab,
    setActiveNavTab,
    firebaseUser,
    signInWithFirebaseGoogle,
    signOutFirebase,
    isFirebaseConnected,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isNotificationExpanded, setIsNotificationExpanded] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCollegeMenu, setShowCollegeMenu] = useState(false);
  const [collegeMenuSearch, setCollegeMenuSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredMenuColleges = colleges.filter((c) => {
    if (!collegeMenuSearch) return true;
    const q = collegeMenuSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.district && c.district.toLowerCase().includes(q)) ||
      (c.instituteCode && c.instituteCode.toLowerCase().includes(q)) ||
      (c.branches && c.branches.some((b: string) => b.toLowerCase().includes(q)))
    );
  });

  const rolesList: { role: UserRole; label: string; desc: string; icon: string }[] = [
    { role: 'student', label: 'Prashant Kumar', desc: 'Student • ME 3rd Sem', icon: '🎓' },
    { role: 'teacher', label: 'Mr. Suresh Prasad', desc: 'Faculty • Thermodynamics', icon: '👨‍🏫' },
    { role: 'hod', label: 'Prof. Anil Kumar Singh', desc: 'HOD • Mechanical Dept', icon: '🏛️' },
    { role: 'college_admin', label: 'Dr. Rajesh Verma', desc: 'Principal • College Admin', icon: '🛡️' },
    { role: 'platform_admin', label: 'Root Admin', desc: 'Platform Super Admin', icon: '⚡' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Multi-Tenant & Switcher Header Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-white tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            AAVRIT MULTI-TENANT ISOLATION
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <div className="relative inline-block">
            <button
              onClick={() => setShowCollegeMenu(!showCollegeMenu)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-0.5 rounded border border-slate-700 font-medium transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Tenant: {currentCollege.name} ({currentCollege.code})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showCollegeMenu && (
              <div className="absolute left-0 mt-1 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select College Tenant ({colleges.length})
                  </span>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    SBTE BIHAR
                  </span>
                </div>

                <div className="relative my-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by code (111-156), district, name..."
                    value={collegeMenuSearch}
                    onChange={(e) => setCollegeMenuSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 space-y-0.5 text-xs">
                  {filteredMenuColleges.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCurrentCollege(c);
                        setShowCollegeMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl hover:bg-indigo-50 transition cursor-pointer flex items-center justify-between ${
                        c.id === currentCollege.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono bg-slate-900 text-white px-1.5 py-0.2 rounded font-bold">
                            {c.instituteCode || c.code}
                          </span>
                          <span className="font-bold truncate max-w-[210px]">{c.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 ml-7">
                          {c.district || c.city} • {c.branches?.length || c.departments?.length || 5} SBTE Branches
                        </div>
                      </div>
                      {c.id === currentCollege.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                  {filteredMenuColleges.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-400 font-mono">
                      No polytechnic found matching "{collegeMenuSearch}"
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowCollegeMenu(false);
                      setIsCollegeDashboardOpen(true);
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIEW FULL ACADEMIC CURRICULUM & DETAILS</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Role & Persona Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">Role Switcher:</span>
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-0.5 rounded transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Role: <strong className="uppercase">{currentRole.replace('_', ' ')}</strong></span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 cursor-pointer ${
                      currentRole === r.role ? 'bg-indigo-50 font-semibold text-indigo-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{r.icon}</span>
                      <div>
                        <div className="font-medium text-slate-900">{r.label}</div>
                        <div className="text-[10px] text-slate-500">{r.desc}</div>
                      </div>
                    </div>
                    {currentRole === r.role && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Firebase Google Auth Button / Indicator */}
          {firebaseUser ? (
            <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-0.5 rounded font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">Firebase:</span>
              <span className="max-w-[120px] truncate">{firebaseUser.displayName || firebaseUser.email}</span>
              <button
                onClick={() => signOutFirebase()}
                title="Sign out of Firebase"
                className="text-slate-400 hover:text-rose-400 ml-1 transition cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithFirebaseGoogle()}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
              title="Sign in with your Google account via Firebase Auth"
            >
              <span>🔥 Firebase Google Sign-In</span>
            </button>
          )}

          <button
            onClick={() => setActiveNavTab('auth-flow')}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 font-bold px-2.5 py-0.5 rounded transition cursor-pointer shadow-xs"
          >
            <span>🔐 Login & Sign Up Flow</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveNavTab('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">AAVRIT</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    आवृत्त
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Private Campus • Academic Network
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes, subjects, groups, faculty, events..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Campus Copilot AI */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/80 text-xs font-semibold hover:border-indigo-300 hover:shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin-slow" />
              <span className="hidden sm:inline">Campus Copilot</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* College Profile & Events Dashboard */}
            <button
              onClick={() => setIsCollegeDashboardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition cursor-pointer shadow-xs"
              title="Open College Profile, SBTE Affiliation & Events Dashboard"
            >
              <Building2 className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">College Profile</span>
            </button>

            {/* Digital Campus ID */}
            <button
              onClick={() => setIsDigitalIdOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Digital ID</span>
            </button>

            {/* QR Verifier */}
            <button
              onClick={() => setIsQrVerifierOpen(true)}
              title="Verify QR Ticket or Student ID"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
            </button>

            {/* Notifications Bell & Notification Center Component */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                title="Academic Updates, Event Alerts & Messages"
                className={`relative p-2 rounded-lg transition cursor-pointer ${
                  showNotifications
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                <Bell className={`w-5 h-5 ${unreadNotificationCount > 0 ? 'text-indigo-600' : ''}`} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs animate-pulse">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              <NotificationCenter
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                isExpandedView={isNotificationExpanded}
                onToggleExpand={() => setIsNotificationExpanded(!isNotificationExpanded)}
              />
            </div>

            {/* User Profile Mini Trigger */}
            <button
              onClick={() => setActiveNavTab('profile')}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer text-left"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="text-[10px] text-slate-500 font-medium capitalize">
                  {currentRole.replace('_', ' ')}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Role-Aware Navigation Bar */}
      <nav className="bg-slate-50/90 border-t border-slate-200 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Student & Universal Views */}
            <button
              onClick={() => setActiveNavTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'home'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              🏠 Campus Home
            </button>
            <button
              onClick={() => setActiveNavTab('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'feed'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📢 College General Feed
            </button>
            <button
              onClick={() => setActiveNavTab('groups')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'groups'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              👥 Groups & Classes
            </button>
            <button
              onClick={() => setActiveNavTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📚 Notes Vault
            </button>
            <button
              onClick={() => setActiveNavTab('events')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              🎉 Events & Fests
            </button>
            <button
              onClick={() => setActiveNavTab('progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'progress'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📊 Progress & Attendance
            </button>
            <button
              onClick={() => setActiveNavTab('messages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'messages'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              💬 Academic Chat
            </button>
            <button
              onClick={() => setActiveNavTab('inter-college')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeNavTab === 'inter-college'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              🌐 College Network (Layer B)
            </button>
            <button
              onClick={() => setActiveNavTab('forms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeNavTab === 'forms'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-purple-800 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <span>📝 Google Forms</span>
              <span className="text-[10px] px-1 py-0.2 bg-purple-200 text-purple-900 rounded font-black">
                API
              </span>
            </button>
            <button
              onClick={() => setActiveNavTab('auth-flow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                activeNavTab === 'auth-flow'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/70'
              }`}
            >
              <span>✨ Login & Sign Up UI</span>
              <span className="text-[10px] px-1 py-0.2 bg-amber-200 text-amber-900 rounded font-black">16 Screens</span>
            </button>
          </div>

          {/* Role Specific Management Tabs */}
          <div className="flex items-center gap-1 pl-4 border-l border-slate-200">
            {(currentRole === 'teacher' || currentRole === 'hod') && (
              <button
                onClick={() => setActiveNavTab('teacher-dashboard')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  activeNavTab === 'teacher-dashboard'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                👨‍🏫 Teacher Console
              </button>
            )}

            {(currentRole === 'college_admin' || currentRole === 'hod') && (
              <button
                onClick={() => setActiveNavTab('admin-overview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  activeNavTab === 'admin-overview'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                🏛️ College Admin Console
              </button>
            )}

            {currentRole === 'platform_admin' && (
              <button
                onClick={() => setActiveNavTab('platform-admin')}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  activeNavTab === 'platform-admin'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                ⚡ Platform Admin (Root)
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
