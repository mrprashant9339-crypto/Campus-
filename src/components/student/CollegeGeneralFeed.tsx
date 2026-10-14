import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { PostCategory, NotificationPriority, BulletinScope, Post, Announcement, UserRole } from '../../types';
import { Badges } from '../common/Badges';
import {
  Pin,
  CheckCircle2,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Send,
  Paperclip,
  Flame,
  Megaphone,
  MessageCircle,
  BookOpen,
  Target,
  Trophy,
  Calendar,
  HelpCircle,
  Building,
  Home,
  ShieldCheck,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Clock,
  UserCheck,
  Sliders,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  X,
  Users,
} from 'lucide-react';

export const CollegeGeneralFeed: React.FC = () => {
  const {
    posts,
    addPost,
    toggleLikePost,
    addComment,
    announcements,
    addAnnouncement,
    acknowledgeAnnouncement,
    currentCollege,
    currentUser,
    currentRole,
    switchStudentBranch,
    switchRole,
  } = useApp();

  // Active Role and Branch Metadata derived from currentUser
  const userBranchCode =
    (currentUser?.membership?.branchCode as 'ME' | 'CE' | 'CSE' | 'EE') ||
    (currentUser?.profile?.branchCode as 'ME' | 'CE' | 'CSE' | 'EE') ||
    'ME';

  const userBranchName = useMemo(() => {
    if (currentUser?.membership?.branchName) return currentUser.membership.branchName;
    switch (userBranchCode) {
      case 'CE':
        return 'Civil Engineering';
      case 'CSE':
        return 'Computer Science & Engineering';
      case 'EE':
        return 'Electrical Engineering';
      case 'ME':
      default:
        return 'Mechanical Engineering';
    }
  }, [currentUser?.membership?.branchName, userBranchCode]);

  const userHostelBlock =
    currentUser?.membership?.hostelBlock ||
    currentUser?.profile?.hostelBlock ||
    (currentRole === 'warden' ? 'Blocks 1, 2 & 3' : 'Hostel 1 (Senior Boys)');

  const isUserHosteller =
    currentUser?.membership?.isHosteller ??
    currentUser?.profile?.isHosteller ??
    (currentRole === 'warden' || currentRole === 'student');

  // Primary Bulletin Scope: Departmental vs Hostel vs General Academic vs All
  const [activeScope, setActiveScope] = useState<BulletinScope>('departmental');

  // Role Perspective Filter: 'tailored' (filters by current role & branch metadata) vs 'all_roles' (unfiltered audience)
  const [rolePerspective, setRolePerspective] = useState<'tailored' | 'all_roles'>('tailored');

  // Specific Sub-Filters
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<'my_branch' | 'ME' | 'CE' | 'CSE' | 'EE' | 'all'>('my_branch');
  const [selectedHostelBlock, setSelectedHostelBlock] = useState<'all' | 'Block 1' | 'Block 2' | 'Girls Wing' | 'Central Mess'>('all');
  const [activeCategory, setActiveCategory] = useState<PostCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyPinnedOrUrgent, setOnlyPinnedOrUrgent] = useState(false);

  // Composer Modal State
  const [showComposer, setShowComposer] = useState(false);
  const [composerType, setComposerType] = useState<'announcement' | 'post'>('announcement');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newScope, setNewScope] = useState<'departmental' | 'hostel' | 'general_academic'>('departmental');
  const [newBranch, setNewBranch] = useState<'ME' | 'CE' | 'CSE' | 'ALL'>('ME');
  const [newHostelBlock, setNewHostelBlock] = useState('Blocks 1, 2 & 3');
  const [newPriority, setNewPriority] = useState<NotificationPriority>('normal');
  const [newCategory, setNewCategory] = useState<PostCategory>('official');
  const [newRequiresAck, setNewRequiresAck] = useState(false);
  const [newIsPinned, setNewIsPinned] = useState(false);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // ---------------------------------------------------------------------------
  // FILTERING SYSTEM FOR BULLETIN FEED
  // 1. Scope filter: Departmental, Hostel, General Academic, or All
  // 2. Role metadata filter: tailored to active role (student vs faculty vs warden)
  // 3. Branch metadata filter: matches active branch (ME, CE, CSE, EE)
  // 4. Hostel block filter: matches residential wing or specific block
  // 5. Category filter & keyword search
  // ---------------------------------------------------------------------------

  const effectiveBranch = selectedBranchFilter === 'my_branch' ? userBranchCode : selectedBranchFilter;

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      // 1. Role Metadata Filter (when rolePerspective === 'tailored')
      if (rolePerspective === 'tailored') {
        const isAdmin = currentRole === 'college_admin' || currentRole === 'platform_admin';
        if (!isAdmin) {
          if (ann.targetRoles && ann.targetRoles.length > 0) {
            const hasRoleMatch = ann.targetRoles.includes(currentRole);
            if (!hasRoleMatch) return false;
          } else {
            // Heuristic check on targetGroup
            const tg = ann.targetGroup.toLowerCase();
            if (currentRole === 'student') {
              if (tg.includes('faculty only') || tg.includes('faculty & lab instructors') || tg.includes('wardens, caretakers')) {
                return false;
              }
            } else if (currentRole === 'teacher' || currentRole === 'hod') {
              if (tg.includes('hostel mess members') && activeScope !== 'hostel') {
                return false;
              }
            } else if (currentRole === 'warden') {
              // Wardens see hostel notices and institutional directives
            }
          }
        }
      }

      // 2. Scope Filter
      if (activeScope === 'departmental') {
        const isDept = ann.scopeType === 'departmental' || (!ann.scopeType && ann.branchCode);
        if (!isDept) return false;
        if (effectiveBranch !== 'all' && ann.branchCode && ann.branchCode !== 'ALL' && ann.branchCode !== effectiveBranch) {
          return false;
        }
      } else if (activeScope === 'hostel') {
        const isHostel =
          ann.scopeType === 'hostel' ||
          ann.targetGroup.toLowerCase().includes('hostel') ||
          ann.title.toLowerCase().includes('hostel') ||
          ann.title.toLowerCase().includes('mess');
        if (!isHostel) return false;
        if (selectedHostelBlock !== 'all') {
          const blockMatch =
            (ann.hostelBlock && ann.hostelBlock.includes(selectedHostelBlock)) ||
            ann.targetGroup.includes(selectedHostelBlock);
          if (!blockMatch) return false;
        }
      } else if (activeScope === 'general_academic') {
        const isGeneral =
          ann.scopeType === 'general_academic' ||
          (!ann.branchCode && !ann.scopeType && !ann.targetGroup.toLowerCase().includes('hostel'));
        if (!isGeneral) return false;
      }

      // 3. Urgent / Pinned filter
      if (onlyPinnedOrUrgent && !ann.isPinned && ann.priority === 'normal') {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          ann.title.toLowerCase().includes(q) ||
          ann.body.toLowerCase().includes(q) ||
          ann.authorName.toLowerCase().includes(q) ||
          ann.targetGroup.toLowerCase().includes(q) ||
          (ann.branchName && ann.branchName.toLowerCase().includes(q)) ||
          (ann.branchCode && ann.branchCode.toLowerCase().includes(q)) ||
          (ann.departmentName && ann.departmentName.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      return true;
    });
  }, [announcements, rolePerspective, currentRole, activeScope, effectiveBranch, selectedHostelBlock, onlyPinnedOrUrgent, searchQuery]);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // 1. Scope Filter
      if (activeScope === 'departmental') {
        const isDept =
          post.scopeType === 'departmental' ||
          (post.branchCode && post.branchCode !== 'ALL') ||
          post.category === 'academic';
        if (!isDept) return false;
        if (effectiveBranch !== 'all' && post.branchCode && post.branchCode !== 'ALL' && post.branchCode !== effectiveBranch) {
          return false;
        }
      } else if (activeScope === 'hostel') {
        const isHostel =
          post.scopeType === 'hostel' ||
          post.title.toLowerCase().includes('hostel') ||
          post.body.toLowerCase().includes('hostel') ||
          post.title.toLowerCase().includes('mess');
        if (!isHostel) return false;
      } else if (activeScope === 'general_academic') {
        const isGeneral =
          post.scopeType === 'general_academic' ||
          post.category === 'official' ||
          post.category === 'achievement';
        if (!isGeneral) return false;
      }

      // 2. Category Filter
      if (activeCategory !== 'all' && post.category !== activeCategory) {
        return false;
      }

      // 3. Pinned filter
      if (onlyPinnedOrUrgent && !post.isPinned) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          post.title.toLowerCase().includes(q) ||
          post.body.toLowerCase().includes(q) ||
          post.authorName.toLowerCase().includes(q) ||
          (post.branchName && post.branchName.toLowerCase().includes(q)) ||
          (post.branchCode && post.branchCode.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      return true;
    });
  }, [posts, activeScope, effectiveBranch, activeCategory, onlyPinnedOrUrgent, searchQuery]);

  // Dynamic Scope counters for badges (factoring in role & branch metadata)
  const scopeCounts = useMemo(() => {
    const checkRoleMatch = (ann: Announcement) => {
      if (rolePerspective !== 'tailored') return true;
      if (currentRole === 'college_admin' || currentRole === 'platform_admin') return true;
      if (ann.targetRoles && ann.targetRoles.length > 0) {
        return ann.targetRoles.includes(currentRole);
      }
      const tg = ann.targetGroup.toLowerCase();
      if (currentRole === 'student' && (tg.includes('faculty only') || tg.includes('faculty & lab instructors'))) {
        return false;
      }
      return true;
    };

    const deptAnns = announcements.filter(
      (a) =>
        checkRoleMatch(a) &&
        (a.scopeType === 'departmental' || (!a.scopeType && a.branchCode)) &&
        (a.branchCode === userBranchCode || a.branchCode === 'ALL' || !a.branchCode)
    ).length;

    const hostelAnns = announcements.filter(
      (a) =>
        checkRoleMatch(a) &&
        (a.scopeType === 'hostel' ||
          a.targetGroup.toLowerCase().includes('hostel') ||
          a.title.toLowerCase().includes('hostel') ||
          a.title.toLowerCase().includes('mess'))
    ).length;

    const genAnns = announcements.filter(
      (a) =>
        checkRoleMatch(a) &&
        (a.scopeType === 'general_academic' ||
          (!a.branchCode && !a.scopeType && !a.targetGroup.toLowerCase().includes('hostel')))
    ).length;

    return {
      departmental: deptAnns,
      hostel: hostelAnns,
      general_academic: genAnns,
      total: deptAnns + hostelAnns + genAnns,
    };
  }, [announcements, rolePerspective, currentRole, userBranchCode]);

  // Publish Form Handler
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    if (composerType === 'announcement') {
      addAnnouncement({
        title: newTitle.trim(),
        body: newBody.trim(),
        priority: newPriority,
        targetGroup:
          newScope === 'departmental'
            ? `${newBranch === 'ALL' ? 'All Departments' : `${newBranch} Engineering`} Cohort`
            : newScope === 'hostel'
            ? `Hostel Residents (${newHostelBlock})`
            : 'Entire College & Academic Network',
        requiresAck: newRequiresAck,
        isPinned: newIsPinned,
        scopeType: newScope,
        branchCode: newScope === 'departmental' ? newBranch : undefined,
        branchName:
          newScope === 'departmental'
            ? newBranch === 'ME'
              ? 'Mechanical Engineering'
              : newBranch === 'CE'
              ? 'Civil Engineering'
              : newBranch === 'CSE'
              ? 'Computer Science & Engineering'
              : 'All Polytechnic Departments'
            : undefined,
        hostelBlock: newScope === 'hostel' ? newHostelBlock : undefined,
      });
    } else {
      addPost({
        title: newTitle.trim(),
        body: newBody.trim(),
        category: newCategory,
        visibility: 'college',
        scopeType: newScope,
        branchCode: newScope === 'departmental' ? newBranch : undefined,
        branchName:
          newScope === 'departmental'
            ? newBranch === 'ME'
              ? 'Mechanical Engineering'
              : newBranch === 'CE'
              ? 'Civil Engineering'
              : newBranch === 'CSE'
              ? 'Computer Science & Engineering'
              : 'All Polytechnic Departments'
            : undefined,
        hostelBlock: newScope === 'hostel' ? newHostelBlock : undefined,
      });
    }

    setNewTitle('');
    setNewBody('');
    setShowComposer(false);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    addComment(postId, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-5 py-2 px-3 sm:px-4"
    >
      {/* ===================================================================== */}
      {/* COLLEGE BULLETIN HEADER & ROLE IDENTITY BANNER                       */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-indigo-900/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-inner">
                🏛️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    CAMPUS GAZETTE & BULLETIN SYSTEM
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                    LIVE TELEMETRY
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentCollege.name} — Official Bulletin Feed
                </h1>
              </div>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
              Chronological statutory dispatches, branch syllabi updates, hostel welfare notices, and general academic circulars under SBTE Bihar.
            </p>
          </div>

          <button
            onClick={() => setShowComposer(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Broadcast Bulletin / Post</span>
          </button>
        </div>

        {/* Dynamic User Role & Branch Metadata Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-slate-300">
              <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                <span>Active User Metadata:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 font-bold text-white border border-white/10 flex items-center gap-1">
                <span>Role:</span>
                <strong className="text-amber-300 uppercase">{currentRole}</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 font-bold text-white border border-white/10 flex items-center gap-1">
                <span>Branch:</span>
                <strong className="text-indigo-300 font-mono">{userBranchCode}</strong>
                <span className="text-slate-400 hidden sm:inline">({userBranchName})</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 font-bold text-white border border-white/10 flex items-center gap-1">
                <Home className="w-3 h-3 text-amber-300" />
                <span>{isUserHosteller ? userHostelBlock : 'Day Scholar'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 font-bold text-emerald-300 border border-white/10">
                ✓ Institutional Clearance
              </span>
            </div>

            {/* Role Perspective Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-medium px-1.5">Audience Stream:</span>
              <button
                onClick={() => setRolePerspective('tailored')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  rolePerspective === 'tailored'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Filter dispatches tailored to your current role and branch metadata"
              >
                <Target className="w-3 h-3" />
                <span>Role-Tailored ({currentRole.toUpperCase()})</span>
              </button>
              <button
                onClick={() => setRolePerspective('all_roles')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
                  rolePerspective === 'all_roles'
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Show all campus dispatches regardless of audience"
              >
                <Users className="w-3 h-3" />
                <span>All Roles</span>
              </button>
            </div>
          </div>

          {/* Quick Perspective Simulator Bar for Testing Cross-Role & Branch Adaptation */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
            <span className="text-[11px] text-indigo-200/90 font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Role & Branch Metadata:</span>
            </span>

            <div className="flex flex-wrap items-center gap-1 text-[11px]">
              <button
                onClick={() => {
                  switchRole('student');
                  switchStudentBranch('ME');
                  setSelectedBranchFilter('my_branch');
                }}
                className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer border ${
                  currentRole === 'student' && userBranchCode === 'ME'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                }`}
              >
                Student (ME)
              </button>
              <button
                onClick={() => {
                  switchRole('student');
                  switchStudentBranch('CE');
                  setSelectedBranchFilter('my_branch');
                }}
                className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer border ${
                  currentRole === 'student' && userBranchCode === 'CE'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                }`}
              >
                Student (CE)
              </button>
              <button
                onClick={() => {
                  switchRole('student');
                  switchStudentBranch('CSE');
                  setSelectedBranchFilter('my_branch');
                }}
                className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer border ${
                  currentRole === 'student' && userBranchCode === 'CSE'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                }`}
              >
                Student (CSE)
              </button>
              <button
                onClick={() => {
                  switchRole('teacher');
                  setSelectedBranchFilter('my_branch');
                }}
                className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer border ${
                  currentRole === 'teacher'
                    ? 'bg-indigo-400 text-slate-950 border-indigo-300 font-extrabold shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                }`}
              >
                Faculty (ME)
              </button>
              <button
                onClick={() => {
                  switchRole('hod');
                  setSelectedBranchFilter('my_branch');
                }}
                className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer border ${
                  currentRole === 'hod'
                    ? 'bg-purple-400 text-slate-950 border-purple-300 font-extrabold shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                }`}
              >
                HOD (ME)
              </button>
              <button
                onClick={() => {
                  switchRole('warden');
                  setActiveScope('hostel');
                }}
                className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer border ${
                  currentRole === 'warden'
                    ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-extrabold shadow-xs'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/15'
                }`}
              >
                Hostel Warden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PRIMARY SCOPE TOGGLE BAR (DEPARTMENTAL / HOSTEL / GENERAL ACADEMIC)  */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs space-y-2.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* 1. Departmental Scope Button */}
          <button
            onClick={() => {
              setActiveScope('departmental');
              setSelectedBranchFilter('my_branch');
            }}
            className={`p-3.5 rounded-xl transition text-left cursor-pointer flex flex-col justify-between gap-1.5 border relative overflow-hidden ${
              activeScope === 'departmental'
                ? 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className={`w-4 h-4 ${activeScope === 'departmental' ? 'text-amber-300' : 'text-indigo-600'}`} />
                <span className="font-extrabold text-xs">Departmental</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeScope === 'departmental'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {scopeCounts.departmental}
              </span>
            </div>
            <div className="text-[11px] truncate flex items-center gap-1 opacity-90">
              <span className="font-semibold text-slate-300">Branch:</span>
              <span className="font-mono font-bold text-amber-300">{effectiveBranch === 'all' ? 'ALL' : effectiveBranch}</span>
              <span className="text-[10px] truncate text-slate-400">({userBranchName.split(' ')[0]})</span>
            </div>
          </button>

          {/* 2. Hostel Scope Button */}
          <button
            onClick={() => setActiveScope('hostel')}
            className={`p-3.5 rounded-xl transition text-left cursor-pointer flex flex-col justify-between gap-1.5 border relative overflow-hidden ${
              activeScope === 'hostel'
                ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-slate-900 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className={`w-4 h-4 ${activeScope === 'hostel' ? 'text-amber-300' : 'text-amber-600'}`} />
                <span className="font-extrabold text-xs">Hostel & Mess</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeScope === 'hostel'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {scopeCounts.hostel}
              </span>
            </div>
            <div className="text-[11px] truncate opacity-90">
              <span className="text-slate-300">{isUserHosteller ? userHostelBlock : 'Residential Welfare'}</span>
            </div>
          </button>

          {/* 3. General Academic Scope Button */}
          <button
            onClick={() => setActiveScope('general_academic')}
            className={`p-3.5 rounded-xl transition text-left cursor-pointer flex flex-col justify-between gap-1.5 border relative overflow-hidden ${
              activeScope === 'general_academic'
                ? 'bg-gradient-to-br from-purple-950 via-purple-900 to-slate-900 text-white border-purple-600 shadow-md ring-2 ring-purple-500/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className={`w-4 h-4 ${activeScope === 'general_academic' ? 'text-amber-300' : 'text-purple-600'}`} />
                <span className="font-extrabold text-xs">General Academic</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeScope === 'general_academic'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {scopeCounts.general_academic}
              </span>
            </div>
            <div className="text-[11px] truncate opacity-90">
              <span className="text-slate-300">SBTE Bihar & Exams</span>
            </div>
          </button>

          {/* 4. Unified Feed Button */}
          <button
            onClick={() => setActiveScope('all')}
            className={`p-3.5 rounded-xl transition text-left cursor-pointer flex flex-col justify-between gap-1.5 border relative overflow-hidden ${
              activeScope === 'all'
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white border-slate-600 shadow-md ring-2 ring-slate-500/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${activeScope === 'all' ? 'text-amber-400' : 'text-slate-600'}`} />
                <span className="font-extrabold text-xs">All Bulletins</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeScope === 'all'
                    ? 'bg-slate-100 text-slate-900 font-black'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {scopeCounts.total}
              </span>
            </div>
            <div className="text-[11px] truncate opacity-90">
              <span className="text-slate-300">Unified Central Feed</span>
            </div>
          </button>
        </div>

        {/* Sub-Filter Controls for Active Scope */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 px-1 text-xs">
          {/* Branch-Specific Filter Chips when in Departmental scope */}
          {activeScope === 'departmental' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-extrabold text-slate-600 flex items-center gap-1 text-[11px]">
                <Filter className="w-3 h-3 text-indigo-600" />
                <span>Branch Filter:</span>
              </span>
              <button
                onClick={() => setSelectedBranchFilter('my_branch')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedBranchFilter === 'my_branch'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                My Branch ({userBranchCode})
              </button>
              <button
                onClick={() => setSelectedBranchFilter('ME')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedBranchFilter === 'ME'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Mechanical (ME)
              </button>
              <button
                onClick={() => setSelectedBranchFilter('CE')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedBranchFilter === 'CE'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Civil (CE)
              </button>
              <button
                onClick={() => setSelectedBranchFilter('CSE')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedBranchFilter === 'CSE'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Computer Science (CSE)
              </button>
              <button
                onClick={() => setSelectedBranchFilter('EE')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedBranchFilter === 'EE'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Electrical (EE)
              </button>
              <button
                onClick={() => setSelectedBranchFilter('all')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedBranchFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                All Departments
              </button>
            </div>
          )}

          {/* Hostel-Specific Block Filters when in Hostel scope */}
          {activeScope === 'hostel' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-extrabold text-slate-600 flex items-center gap-1 text-[11px]">
                <Home className="w-3 h-3 text-amber-600" />
                <span>Hostel Wing:</span>
              </span>
              <button
                onClick={() => setSelectedHostelBlock('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedHostelBlock === 'all'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                All Hostel Wings
              </button>
              <button
                onClick={() => setSelectedHostelBlock('Block 1')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedHostelBlock === 'Block 1'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Hostel 1 (Senior Boys)
              </button>
              <button
                onClick={() => setSelectedHostelBlock('Block 2')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedHostelBlock === 'Block 2'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Hostel 2 (Junior Boys)
              </button>
              <button
                onClick={() => setSelectedHostelBlock('Girls Wing')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedHostelBlock === 'Girls Wing'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Girls Wing (Hostel 3)
              </button>
              <button
                onClick={() => setSelectedHostelBlock('Central Mess')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  selectedHostelBlock === 'Central Mess'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Central Mess Bay
              </button>
            </div>
          )}

          {/* General Academic Scope Note */}
          {activeScope === 'general_academic' && (
            <div className="flex items-center gap-2 text-[11px] text-purple-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Showing statutory circulars from SBTE Bihar, State Board Examination Cell, and Principal Office.</span>
            </div>
          )}

          {/* Quick toggle for Pinned / Urgent only */}
          <button
            onClick={() => setOnlyPinnedOrUrgent(!onlyPinnedOrUrgent)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ml-auto flex items-center gap-1.5 border ${
              onlyPinnedOrUrgent
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Pin className="w-3 h-3 text-rose-600" />
            <span>{onlyPinnedOrUrgent ? 'Showing Pinned/Urgent Only' : 'Filter Urgent'}</span>
          </button>
        </div>

        {/* Active Filters Summary Strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-700">Active Filter:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold">
              Scope: {activeScope.toUpperCase()}
            </span>
            {activeScope === 'departmental' && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">
                Branch: {effectiveBranch}
              </span>
            )}
            {activeScope === 'hostel' && selectedHostelBlock !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold">
                Wing: {selectedHostelBlock}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              Audience: {rolePerspective === 'tailored' ? `Tailored (${currentRole})` : 'All Campus'}
            </span>
            <span className="text-slate-400">
              ({filteredAnnouncements.length} Dispatches)
            </span>
          </div>

          {(selectedBranchFilter !== 'my_branch' || selectedHostelBlock !== 'all' || onlyPinnedOrUrgent || searchQuery || rolePerspective !== 'tailored') && (
            <button
              onClick={() => {
                setSelectedBranchFilter('my_branch');
                setSelectedHostelBlock('all');
                setOnlyPinnedOrUrgent(false);
                setSearchQuery('');
                setRolePerspective('tailored');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Subfilters</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SEARCH & CATEGORY PILLS BAR                                         */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bulletins by title, instructor, department, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setActiveCategory('official')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'official'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📢 Official
          </button>
          <button
            onClick={() => setActiveCategory('academic')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'academic'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📖 Academic
          </button>
          <button
            onClick={() => setActiveCategory('discussion')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              activeCategory === 'discussion'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            💬 Discussion
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: STATUTORY & OFFICIAL DISPATCHES (ANNOUNCEMENTS)           */}
      {/* ===================================================================== */}
      {filteredAnnouncements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Priority Bulletins & Gazette Dispatches ({filteredAnnouncements.length})
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Scope: {activeScope.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            {filteredAnnouncements.map((ann) => {
              const isUrgent = ann.priority === 'emergency' || ann.priority === 'high';
              const isAcknowledged = ann.acknowledgedByMe;

              return (
                <div
                  key={ann.id}
                  className={`bg-white rounded-2xl border shadow-xs transition overflow-hidden p-5 space-y-3 ${
                    ann.priority === 'emergency'
                      ? 'border-rose-300 ring-2 ring-rose-200 bg-rose-50/20'
                      : ann.isPinned
                      ? 'border-amber-300 ring-1 ring-amber-200/70 bg-amber-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Badge Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Scope Badge */}
                      {ann.scopeType === 'departmental' ? (
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <Building className="w-3 h-3 text-indigo-600" />
                          <span>DEPT // {ann.branchCode || 'GENERAL'}</span>
                        </span>
                      ) : ann.scopeType === 'hostel' ? (
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Home className="w-3 h-3 text-amber-600" />
                          <span>HOSTEL // {ann.hostelBlock || 'ALL WINGS'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          <span>GENERAL ACADEMIC // SBTE</span>
                        </span>
                      )}

                      {/* Priority Badge */}
                      {ann.priority === 'emergency' && (
                        <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>EMERGENCY DIRECTIVE</span>
                        </span>
                      )}
                      {ann.priority === 'high' && (
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          HIGH PRIORITY
                        </span>
                      )}
                      {ann.isPinned && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5 text-amber-600" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ann.createdAt}</span>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                      {ann.body}
                    </p>
                  </div>

                  {/* Footer Meta & Acknowledgment Action */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2 text-slate-500">
                      <span className="font-bold text-slate-800">{ann.authorName}</span>
                      <span>•</span>
                      <span className="text-[11px]">{ann.authorRole}</span>
                      <span>•</span>
                      <span className="text-[11px] text-indigo-600 font-medium">{ann.targetGroup}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ann.requiresAck && (
                        <div>
                          {isAcknowledged ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Acknowledged</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => acknowledgeAnnouncement(ann.id)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Acknowledge Notice</span>
                            </button>
                          )}
                        </div>
                      )}

                      <span className="text-[11px] text-slate-400 font-mono">
                        Read: {ann.readCount}/{ann.totalTarget}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Announcements Matching Filter State */}
      {filteredAnnouncements.length === 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-2.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-lg">
            📢
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">No Official Dispatches Match Active Filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No priority circulars match scope <strong className="text-slate-700 font-mono">[{activeScope}]</strong>, branch <strong className="text-slate-700 font-mono">[{effectiveBranch}]</strong>, and audience <strong className="text-slate-700 font-mono">[{rolePerspective === 'tailored' ? currentRole : 'All Roles'}]</strong>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                setSelectedBranchFilter('all');
                setRolePerspective('all_roles');
              }}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer border border-indigo-200"
            >
              Show All Branch Dispatches
            </button>
            <button
              onClick={() => setActiveScope('all')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              View Unified Central Feed
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: COMMUNITY & CAMPUS FEED POSTS                             */}
      {/* ===================================================================== */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Peer & Departmental Discussions ({filteredPosts.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Filtered by: <strong>{activeScope.toUpperCase()}</strong>
          </span>
        </div>

        {filteredPosts.length === 0 && filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">No announcements match this filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active bulletins for this specific scope ({activeScope}) and branch ({effectiveBranch}).
            </p>
            <button
              onClick={() => {
                setActiveScope('all');
                setSelectedBranchFilter('all');
                setActiveCategory('all');
                setSearchQuery('');
                setOnlyPinnedOrUrgent(false);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reset Filters & Show All
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-2xl border shadow-xs transition overflow-hidden ${
                post.isPinned ? 'border-amber-300 ring-1 ring-amber-200/60' : 'border-slate-200'
              }`}
            >
              {/* Post Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">{post.authorName}</span>
                        {post.authorVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                        {post.authorBadges && post.authorBadges.length > 0 && (
                          <Badges badges={post.authorBadges} variant="chip" maxChips={2} />
                        )}
                        {post.isPinned && (
                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {post.authorRole} • {post.groupName || 'College General'} • {post.createdAt}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {post.scopeType && (
                      <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {post.scopeType === 'departmental'
                          ? `DEPT (${post.branchCode || 'ME'})`
                          : post.scopeType === 'hostel'
                          ? 'HOSTEL'
                          : 'ACADEMIC'}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Title & Body */}
                <h3 className="font-bold text-sm text-slate-900 mt-3 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                  {post.body}
                </p>

                {/* Attachment if present */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-700"
                      >
                        <Paperclip className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold">{att.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({att.size})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Action Bar */}
              <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 font-semibold transition cursor-pointer ${
                      post.hasLiked ? 'text-rose-600' : 'hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-600' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() =>
                      setExpandedComments({
                        ...expandedComments,
                        [post.id]: !expandedComments[post.id],
                      })
                    }
                    className="flex items-center gap-1.5 font-semibold hover:text-indigo-600 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} Comments</span>
                  </button>
                </div>

                <button
                  onClick={() => alert(`Copied in-app link to "${post.title}"`)}
                  className="flex items-center gap-1 text-[11px] font-semibold hover:text-slate-900 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Comment Section */}
              {(expandedComments[post.id] || post.comments.length > 0) && (
                <div className="p-4 bg-slate-50/40 border-t border-slate-100 space-y-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {c.authorName} ({c.authorRole})
                        </span>
                        <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-700 mt-1">{c.body}</p>
                    </div>
                  ))}

                  {/* Comment input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a constructive academic comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ===================================================================== */}
      {/* BROADCAST BULLETIN / POST COMPOSER MODAL                             */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showComposer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Create Bulletin / Announcement
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Scoped by department, hostel wing, or general academic network
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComposer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setComposerType('announcement')}
                  className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    composerType === 'announcement'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Official Announcement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setComposerType('post')}
                  className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    composerType === 'post'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Peer Discussion Post</span>
                </button>
              </div>

              <form onSubmit={handlePublish} className="space-y-3.5 text-xs">
                {/* 1. Target Scope Selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Announcement Target Scope
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewScope('departmental')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        newScope === 'departmental'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-4 h-4 mx-auto mb-1 text-indigo-600" />
                      <span>Departmental</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewScope('hostel')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        newScope === 'hostel'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Home className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                      <span>Hostel Wing</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewScope('general_academic')}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        newScope === 'general_academic'
                          ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <span>General Academic</span>
                    </button>
                  </div>
                </div>

                {/* If Departmental, pick branch */}
                {newScope === 'departmental' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Target Academic Branch / Department
                    </label>
                    <select
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="ME">Mechanical Engineering (ME)</option>
                      <option value="CE">Civil Engineering (CE)</option>
                      <option value="CSE">Computer Science & Engineering (CSE)</option>
                      <option value="ALL">All Departments (College-Wide Academic)</option>
                    </select>
                  </div>
                )}

                {/* If Hostel, pick block */}
                {newScope === 'hostel' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Hostel Wing / Residence
                    </label>
                    <select
                      value={newHostelBlock}
                      onChange={(e) => setNewHostelBlock(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Blocks 1, 2 & 3">All Resident Hostellers (Blocks 1, 2 & 3)</option>
                      <option value="Hostel 1 (Senior Boys)">Hostel 1 (Senior Boys Block A)</option>
                      <option value="Hostel 2 (Junior Boys)">Hostel 2 (Junior Boys Block B)</option>
                      <option value="Hostel 3 (Girls Wing)">Hostel 3 (Girls Wing)</option>
                      <option value="Central Mess Bay">Central Dining Hall & Mess</option>
                    </select>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Bulletin Headline / Subject
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Workshop schedule change or mess meeting notice..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Announcement Body Instructions
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide full official text, deadlines, room numbers, or contact personnel..."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Priority & Statutory Ack for Announcements */}
                {composerType === 'announcement' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Priority Tier</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as any)}
                        className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold"
                      >
                        <option value="normal">Normal Dispatch (Standard)</option>
                        <option value="high">High Priority (Urgent Badge)</option>
                        <option value="emergency">🚨 Emergency Statutory Directive</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRequiresAck}
                          onChange={(e) => setNewRequiresAck(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span className="font-bold text-slate-700">Requires Student Ack</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newIsPinned}
                          onChange={(e) => setNewIsPinned(e.target.checked)}
                          className="rounded text-amber-600"
                        />
                        <span className="font-bold text-slate-700">Pin to Top</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="flex-1 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                  >
                    Broadcast Bulletin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
