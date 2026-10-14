import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Group } from '../../types';
import {
  Users,
  Lock,
  Globe,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  MessageSquare,
  Shield,
  Search,
  Building2,
  Calendar,
  AlertTriangle,
  UserCheck,
  Send,
  FileText,
  Sparkles,
  Download,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const GroupsHub: React.FC = () => {
  const {
    groups,
    joinGroup,
    leaveGroup,
    currentCollege,
    currentUser,
    currentRole,
    setIsCollegeDashboardOpen,
    switchStudentBranch,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'my' | 'branch_restricted' | 'clubs'>('all');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [restrictedGroupAttempt, setRestrictedGroupAttempt] = useState<Group | null>(null);
  const [groupTab, setGroupTab] = useState<'feed' | 'notes' | 'members'>('feed');
  const [newDiscussionText, setNewDiscussionText] = useState('');
  const [localDiscussions, setLocalDiscussions] = useState<Record<string, { id: string; author: string; role: string; text: string; time: string }[]>>({
    'grp-dept-me': [
      {
        id: 'd-1',
        author: 'Prof. Anil Kumar Singh (HOD ME)',
        role: 'Faculty / HOD',
        text: 'All 3rd Semester Mechanical students: Please note that the SolidWorks 3D CAD parametric modeling lab sessions begin this Thursday at Machine Design Lab M-201.',
        time: 'Today at 09:15 AM',
      },
      {
        id: 'd-2',
        author: 'Prashant Kumar (ME2024001)',
        role: 'Student Member',
        text: 'Sir, will the CSWA certification tutorial sheets be distributed in print or uploaded to the resources tab?',
        time: '1 hour ago',
      },
    ],
    'grp-class-me3a': [
      {
        id: 'd-3',
        author: 'Mr. Suresh Prasad (Class Teacher)',
        role: 'Assistant Professor',
        text: 'Assignment 2 on Second Law of Thermodynamics and Clausius Inequality is due on Friday. Ensure handwritten full calculations.',
        time: 'Yesterday',
      },
    ],
    'grp-gen-01': [
      {
        id: 'd-4',
        author: 'Dr. Chandrashekhar Singh (Principal)',
        role: 'College Administration',
        text: 'Official Circular: The SBTE State-Level Innovation TechFest is scheduled for 14-15 February 2025. All student branch societies are invited to submit prototype entries.',
        time: '2 days ago',
      },
    ],
  });

  // Determine current student's branch code from profile metadata
  const getStudentBranchCode = (): 'ME' | 'CE' | 'EE' | 'CSE' | 'ECE' => {
    const dept = (currentUser.membership.departmentName || currentUser.membership.branchName || '').toLowerCase();
    if (dept.includes('civil')) return 'CE';
    if (dept.includes('comp') || dept.includes('cse')) return 'CSE';
    if (dept.includes('elec') && !dept.includes('comm')) return 'EE';
    if (dept.includes('electronics') || dept.includes('comm')) return 'ECE';
    return 'ME';
  };

  const studentBranchCode = getStudentBranchCode();

  /**
   * Branch Guard Middleware
   * Restricts join requests and group access based on a student's branch metadata from their profile,
   * effectively preventing cross-branch unauthorized group access.
   */
  interface BranchGuardDecision {
    allowed: boolean;
    action: 'join' | 'access';
    reason?: string;
    studentBranch: string;
    targetBranch: string;
  }

  const branchGuardMiddleware = (group: Group, action: 'join' | 'access'): BranchGuardDecision => {
    // 1. Supervisory role bypass (College Admin, Platform Admin, Faculty/HOD)
    if (
      currentRole === 'college_admin' ||
      currentRole === 'platform_admin' ||
      currentRole === 'teacher' ||
      currentRole === 'hod'
    ) {
      return { allowed: true, action, studentBranch: studentBranchCode, targetBranch: group.branchCode || 'ALL' };
    }

    // 2. Open institutional spaces & campus clubs are open to all college students
    if (!group.branchCode || group.branchCode === 'ALL') {
      return { allowed: true, action, studentBranch: studentBranchCode, targetBranch: 'ALL' };
    }

    // 3. Strict Branch Metadata Match (e.g. ME student to ME group)
    if (group.branchCode === studentBranchCode) {
      return { allowed: true, action, studentBranch: studentBranchCode, targetBranch: group.branchCode };
    }

    // 4. Block unauthorized cross-branch attempt
    return {
      allowed: false,
      action,
      studentBranch: studentBranchCode,
      targetBranch: group.branchCode,
      reason: `Branch Guard Protocol Violation: Student from branch ${studentBranchCode} is not permitted to ${action} ${group.branchName || group.branchCode} (${group.branchCode}) group.`,
    };
  };

  const hasBranchAccess = (group: Group): boolean => {
    return branchGuardMiddleware(group, 'access').allowed;
  };

  // Only display groups of the logged-in college
  const collegeGroups = groups.filter(
    (g) => g.collegeId === currentCollege.id || !g.collegeId || g.collegeId === 'col-gpp-01'
  );

  // Filter groups
  const filteredGroups = collegeGroups.filter((g) => {
    if (filter === 'my') return hasBranchAccess(g) && g.isMember;
    if (filter === 'branch_restricted') return g.branchCode && g.branchCode !== 'ALL';
    if (filter === 'clubs') return g.type === 'club';
    return true;
  });

  const handleGroupClick = (group: Group) => {
    const decision = branchGuardMiddleware(group, 'access');
    if (decision.allowed) {
      setSelectedGroup(group);
      setRestrictedGroupAttempt(null);
    } else {
      // Prevent entrance and display security restriction alert
      setRestrictedGroupAttempt(group);
    }
  };

  const handleJoinRequest = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    const decision = branchGuardMiddleware(group, 'join');
    if (!decision.allowed) {
      // Middleware blocked join request
      setRestrictedGroupAttempt(group);
      return;
    }
    // Allowed by middleware
    joinGroup(group.id);
  };

  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionText.trim() || !selectedGroup) return;

    const newEntry = {
      id: `msg-${Date.now()}`,
      author: `${currentUser.fullName} (${currentUser.membership.rollNumber || studentBranchCode})`,
      role: currentRole === 'student' ? 'Student Member' : 'Faculty Admin',
      text: newDiscussionText.trim(),
      time: 'Just now',
    };

    setLocalDiscussions((prev) => ({
      ...prev,
      [selectedGroup.id]: [newEntry, ...(prev[selectedGroup.id] || [])],
    }));

    setNewDiscussionText('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* College Institutional Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl">🏛️</span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              {currentCollege.code} • SBTE BIHAR
            </span>
            <span className="text-xs text-slate-300">
              {currentCollege.city}, Bihar
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            {currentCollege.name} — Departmental Groups & Cohorts
          </h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
            Total active cohorts in this institution. According to SBTE Bihar regulations, students are quarantined strictly to their registered branch workspace.
          </p>
        </div>

        {/* Action Button: Open College Dashboard & Events */}
        <button
          onClick={() => setIsCollegeDashboardOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
        >
          <Building2 className="w-4 h-4" />
          <span>College Profile & Events Dashboard</span>
        </button>
      </div>

      {/* Student Branch Status & Live Testing Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-black text-indigo-700 text-sm">
            {studentBranchCode}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900">
                Logged in as: {currentUser.fullName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Branch: {currentUser.membership.departmentName || 'Mechanical Engineering'} ({studentBranchCode})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Roll No: <strong className="font-mono text-slate-700">{currentUser.membership.rollNumber || 'ME2024001'}</strong> • You have access ONLY to <strong>{studentBranchCode}</strong> groups and open spaces.
            </p>
          </div>
        </div>

        {/* Interactive Demo Branch Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold self-stretch sm:self-auto shrink-0">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider px-1 font-bold hidden md:inline">
            Test Isolation:
          </span>
          <button
            onClick={() => switchStudentBranch('ME')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
              studentBranchCode === 'ME'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white'
            }`}
            title="Switch to Mechanical Student (Prashant)"
          >
            👨‍🎓 ME (Mechanical)
          </button>
          <button
            onClick={() => switchStudentBranch('CE')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
              studentBranchCode === 'CE'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white'
            }`}
            title="Switch to Civil Student (Rahul)"
          >
            👷 CE (Civil)
          </button>
          <button
            onClick={() => switchStudentBranch('CSE')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
              studentBranchCode === 'CSE'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-white'
            }`}
            title="Switch to Computer Science Student (Sneha)"
          >
            💻 CSE (Computer)
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'all' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            All College Spaces ({groups.length})
          </button>
          <button
            onClick={() => setFilter('my')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'my' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            My Accessible Cohorts
          </button>
          <button
            onClick={() => setFilter('branch_restricted')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'branch_restricted' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            Departmental Guilds (CE/ME/EE/CSE/ECE)
          </button>
          <button
            onClick={() => setFilter('clubs')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === 'clubs' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
            }`}
          >
            Open Clubs & Councils
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Showing <strong>{filteredGroups.length}</strong> groups for {currentCollege.name}
        </span>
      </div>

      {/* Groups Grid with Access Badges & Lock State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.map((group) => {
          const hasAccess = hasBranchAccess(group);
          const isBranchRestricted = group.branchCode && group.branchCode !== 'ALL';

          return (
            <div
              key={group.id}
              onClick={() => handleGroupClick(group)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                hasAccess
                  ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                  : 'bg-slate-50/90 border-slate-300/80 hover:border-rose-300 hover:bg-rose-50/20'
              }`}
            >
              {/* Branch Restriction Status Notch */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      group.branchCode === 'ME'
                        ? 'bg-blue-100 text-blue-800'
                        : group.branchCode === 'CE'
                        ? 'bg-amber-100 text-amber-800'
                        : group.branchCode === 'CSE'
                        ? 'bg-purple-100 text-purple-800'
                        : group.branchCode === 'EE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {group.branchCode || 'GENERAL'}
                  </span>

                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {group.type.replace('_', ' ')}
                  </span>
                </div>

                {/* Access Indicator Badge */}
                {hasAccess ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Access Granted</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-rose-600" />
                    <span>Restricted to {group.branchCode}</span>
                  </span>
                )}
              </div>

              {/* Group Title & Details */}
              <div className="mt-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  {!hasAccess && <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                  <span>{group.name}</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {group.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{group.memberCount} members</span>
                  <span>•</span>
                  <span>Lead: {group.ownerName}</span>
                </div>

                <div className="flex items-center gap-2">
                  {!group.isMember && (
                    <button
                      type="button"
                      onClick={(e) => handleJoinRequest(group, e)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                        hasAccess
                          ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      {hasAccess ? (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Join Cohort</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-rose-600" />
                          <span>Join (Branch Guard)</span>
                        </>
                      )}
                    </button>
                  )}

                  {hasAccess ? (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700">
                      <span>{group.isMember ? 'Enter Workspace' : 'Preview Space'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                      <span>Locked (Branch Blocked)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURITY ACCESS GUARD MODAL (When clicking another branch's group) */}
      {restrictedGroupAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-rose-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
                SBTE ISOLATION PROTOCOL • ACCESS RESTRICTED
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">
                Cannot Enter {restrictedGroupAttempt.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                This cohort is strictly reserved for verified students and faculty of the{' '}
                <strong className="text-rose-700">{restrictedGroupAttempt.branchName || restrictedGroupAttempt.branchCode}</strong>{' '}
                department. Cross-branch access to departmental archives and design labs is prohibited.
              </p>
            </div>

            {/* Mismatch Credential Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Your Enrolled Branch:</span>
                <span className="font-extrabold text-indigo-700">
                  {currentUser.membership.departmentName || 'Mechanical'} ({studentBranchCode})
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Required Group Branch:</span>
                <span className="font-extrabold text-rose-700">
                  {restrictedGroupAttempt.branchName || restrictedGroupAttempt.branchCode} ({restrictedGroupAttempt.branchCode})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Student Roll Number:</span>
                <span className="font-mono font-bold text-slate-800">
                  {currentUser.membership.rollNumber || 'ME2024001'}
                </span>
              </div>
            </div>

            {/* Helper to switch branch to test permissions */}
            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs text-indigo-900 space-y-2">
              <div className="text-[11px] font-bold text-indigo-800">
                Want to test access to {restrictedGroupAttempt.branchCode} as a student of that branch?
              </div>
              <div className="flex gap-2">
                {restrictedGroupAttempt.branchCode === 'CE' && (
                  <button
                    onClick={() => {
                      switchStudentBranch('CE');
                      setSelectedGroup(restrictedGroupAttempt);
                      setRestrictedGroupAttempt(null);
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    Switch to Civil Student (Rahul) & Open
                  </button>
                )}
                {restrictedGroupAttempt.branchCode === 'CSE' && (
                  <button
                    onClick={() => {
                      switchStudentBranch('CSE');
                      setSelectedGroup(restrictedGroupAttempt);
                      setRestrictedGroupAttempt(null);
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    Switch to CSE Student (Sneha) & Open
                  </button>
                )}
                {restrictedGroupAttempt.branchCode !== 'CE' && restrictedGroupAttempt.branchCode !== 'CSE' && (
                  <button
                    onClick={() => {
                      switchStudentBranch('ME');
                      setRestrictedGroupAttempt(null);
                    }}
                    className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setRestrictedGroupAttempt(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Understand & Return to My Groups
            </button>
          </div>
        </div>
      )}

      {/* AUTHORIZED GROUP WORKSPACE MODAL */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-3xl w-full h-[620px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                    {selectedGroup.branchCode || 'OPEN'} • {selectedGroup.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified Branch Enrollee</span>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold mt-2 text-white">
                  {selectedGroup.name}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedGroup.memberCount} members • Coordinator: <strong>{selectedGroup.ownerName}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedGroup(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-slate-50 text-xs font-semibold shrink-0">
              <button
                onClick={() => setGroupTab('feed')}
                className={`py-3 px-4 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                  groupTab === 'feed'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Departmental Discussions & Notices</span>
              </button>
              <button
                onClick={() => setGroupTab('notes')}
                className={`py-3 px-4 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                  groupTab === 'notes'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Lab Manuals & Practical Archives</span>
              </button>
              <button
                onClick={() => setGroupTab('members')}
                className={`py-3 px-4 border-b-2 cursor-pointer transition flex items-center gap-1.5 ${
                  groupTab === 'members'
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Roster ({selectedGroup.memberCount})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {/* FEED TAB */}
              {groupTab === 'feed' && (
                <div className="space-y-4">
                  {/* Post new message */}
                  <form onSubmit={handlePostDiscussion} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Ask a question or share notes with ${selectedGroup.branchCode || 'cohort'} classmates...`}
                      value={newDiscussionText}
                      onChange={(e) => setNewDiscussionText(e.target.value)}
                      className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!newDiscussionText.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>

                  {/* Discussions list */}
                  <div className="space-y-3">
                    {(localDiscussions[selectedGroup.id] || [
                      {
                        id: 'd-fallback',
                        author: selectedGroup.ownerName,
                        role: 'Group Admin',
                        text: `Welcome to the official ${selectedGroup.name}. All verified enrollees may participate in course discussions and lab reviews.`,
                        time: 'Official Announcement',
                      },
                    ]).map((msg) => (
                      <div key={msg.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{msg.author}</span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-indigo-50 text-indigo-700">
                              {msg.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NOTES TAB */}
              {groupTab === 'notes' && (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        SBTE Board Syllabus & Laboratory Index (Semester 3)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        PDF • 2.8 MB • Certified by SBTE Academic Board Patna
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Downloading official SBTE syllabus...')}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        Practical Experiment Manual & Record Templates
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        PDF • 4.1 MB • Approved for 2024-25 Laboratory Marks
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Downloading lab record templates...')}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MEMBERS TAB */}
              {groupTab === 'members' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{selectedGroup.ownerName}</span>
                      <span className="text-[10px] text-slate-500 block">Faculty In-charge & Administrator</span>
                    </div>
                    <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded">
                      FACULTY HEAD
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Prashant Kumar</span>
                      <span className="text-[10px] text-slate-500 block">Roll: ME2024001 • Class Representative</span>
                    </div>
                    <span className="text-indigo-700 font-bold text-[10px] bg-indigo-50 px-2 py-0.5 rounded">
                      STUDENT REP
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Rahul Singh</span>
                      <span className="text-[10px] text-slate-500 block">Roll: CE2024002 • Active Peer</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Active Enrollee</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Sneha Kumari</span>
                      <span className="text-[10px] text-slate-500 block">Roll: CSE2024005 • Active Peer</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Active Enrollee</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
