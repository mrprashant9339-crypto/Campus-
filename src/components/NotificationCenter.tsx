import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';
import {
  Bell,
  GraduationCap,
  Calendar,
  MessageSquare,
  CheckCircle2,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
  PlusCircle,
  BookOpen,
  ArrowRight,
  User,
  Tag,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isExpandedView?: boolean;
  onToggleExpand?: () => void;
}

type TabType = 'all' | 'academic' | 'event' | 'message';
type FilterStatus = 'all' | 'unread' | 'high_priority';

// Subtle Web Audio chime synthesizer
const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio context autoplay errors
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  isExpandedView = false,
  onToggleExpand,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    toggleNotificationRead,
    deleteNotification,
    clearAllReadNotifications,
    addNotification,
    setActiveNavTab,
    unreadNotificationCount,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  // Categorize helper if category isn't explicitly set
  const resolveCategory = (item: NotificationItem): 'academic' | 'event' | 'message' => {
    if (item.category) return item.category;
    if (
      item.type === 'assignment_due' ||
      item.type === 'grade_posted' ||
      item.type === 'new_notice' ||
      item.type === 'verification' ||
      item.type === 'group_approval' ||
      item.type === 'announcement'
    ) {
      return 'academic';
    }
    if (item.type === 'event_reminder' || item.type === 'workshop') {
      return 'event';
    }
    return 'message';
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const category = resolveCategory(item);

      // Tab filter
      if (activeTab !== 'all' && category !== activeTab) {
        return false;
      }

      // Status filter
      if (filterStatus === 'unread' && item.isRead) {
        return false;
      }
      if (filterStatus === 'high_priority' && item.priority !== 'high' && item.priority !== 'emergency') {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchBody = item.body.toLowerCase().includes(query);
        const matchSender = item.sender?.name.toLowerCase().includes(query);
        const matchCourse = item.metadata?.course?.toLowerCase().includes(query);
        return matchTitle || matchBody || matchSender || matchCourse;
      }

      return true;
    });
  }, [notifications, activeTab, filterStatus, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      allUnread: notifications.filter((n) => !n.isRead).length,
      academic: 0,
      academicUnread: 0,
      event: 0,
      eventUnread: 0,
      message: 0,
      messageUnread: 0,
    };

    notifications.forEach((n) => {
      const cat = resolveCategory(n);
      if (cat === 'academic') {
        counts.academic++;
        if (!n.isRead) counts.academicUnread++;
      } else if (cat === 'event') {
        counts.event++;
        if (!n.isRead) counts.eventUnread++;
      } else if (cat === 'message') {
        counts.message++;
        if (!n.isRead) counts.messageUnread++;
      }
    });

    return counts;
  }, [notifications]);

  // Handle clicking an action button inside a notification
  const handleActionClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.actionUrl) {
      setActiveNavTab(notif.actionUrl);
      onClose();
    }
  };

  // Simulate new notifications for live testing
  const handleSimulate = (type: 'academic' | 'event' | 'message') => {
    setShowSimulateMenu(false);
    if (soundEnabled) playNotificationSound();

    if (type === 'academic') {
      addNotification({
        userId: 'usr-student-01',
        type: 'assignment_due',
        category: 'academic',
        priority: 'high',
        title: 'New Quiz Uploaded: Applied Mechanics MCQ Batch',
        body: 'Prof. Anil Kumar Singh posted an 8-question timed evaluation on Truss equilibrium. Due today by 6:00 PM.',
        isRead: false,
        actionLabel: 'Attempt Quiz',
        actionUrl: 'notes',
        sender: {
          name: 'Prof. Anil Kumar Singh',
          role: 'HOD • Mechanical Dept',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        },
        metadata: {
          course: 'ME302 - Mechanics',
          dueDate: 'Today, 6:00 PM',
          tag: 'Urgent MCQ',
        },
      });
    } else if (type === 'event') {
      addNotification({
        userId: 'usr-student-01',
        type: 'event_reminder',
        category: 'event',
        priority: 'high',
        title: 'Flash Alert: Drone Obstacle Arena Live Registration!',
        body: '30 additional slots opened for GPP Patna teams in the Inter-College UAV Challenge. Entry includes hardware test kit.',
        isRead: false,
        actionLabel: 'Claim Pass',
        actionUrl: 'events',
        sender: {
          name: 'Bihar Tech Conclave',
          role: 'Event Secretariat',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        },
        metadata: {
          location: 'Outdoor Arena Ground',
          eventTime: 'Saturday, 11:00 AM',
          tag: 'Limited Slots',
        },
      });
    } else {
      addNotification({
        userId: 'usr-student-01',
        type: 'message',
        category: 'message',
        priority: 'normal',
        title: 'Direct Message from Faculty Mentor',
        body: '"Prashant, your CAD 3D suspension arm design is approved for CNC milling tomorrow morning. Meet in workshop 3."',
        isRead: false,
        actionLabel: 'Reply to Mentor',
        actionUrl: 'groups',
        sender: {
          name: 'Mr. Suresh Prasad',
          role: 'Faculty Mentor',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        },
        metadata: {
          course: 'Fabrication Workshop',
          tag: '1-on-1 Feedback',
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="relative">
        {/* Backdrop for mobile / drawer view */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-50 md:hidden"
        />

        {/* Notification Center Main Window */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed md:absolute right-0 top-16 md:top-full md:mt-2 z-50 bg-white shadow-2xl border border-slate-200/90 rounded-2xl flex flex-col overflow-hidden ${
            isExpandedView
              ? 'inset-x-4 md:inset-x-auto md:right-4 md:w-[620px] max-h-[85vh] h-[750px]'
              : 'inset-x-2 sm:inset-x-auto sm:right-0 sm:w-[460px] md:w-[500px] max-h-[85vh] h-[660px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-indigo-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                    Notification Center
                  </h3>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-300">
                  Academic Updates • Event Alerts • Faculty & Peer Messages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Expand Toggle */}
              {onToggleExpand && (
                <button
                  onClick={onToggleExpand}
                  title={isExpandedView ? 'Standard view' : 'Expanded view'}
                  className="hidden md:inline-flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  {isExpandedView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Tabs: All, Academic, Events, Messages */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 pt-2">
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              {/* Tab 1: All */}
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>All</span>
                {tabCounts.allUnread > 0 ? (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px]">
                    {tabCounts.allUnread}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">({tabCounts.all})</span>
                )}
              </button>

              {/* Tab 2: Academic Updates */}
              <button
                onClick={() => setActiveTab('academic')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'academic'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate">Academic</span>
                {tabCounts.academicUnread > 0 ? (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {tabCounts.academicUnread}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">({tabCounts.academic})</span>
                )}
              </button>

              {/* Tab 3: Event Alerts */}
              <button
                onClick={() => setActiveTab('event')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'event'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">Events</span>
                {tabCounts.eventUnread > 0 ? (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {tabCounts.eventUnread}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">({tabCounts.event})</span>
                )}
              </button>

              {/* Tab 4: Messages */}
              <button
                onClick={() => setActiveTab('message')}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'message'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Messages</span>
                {tabCounts.messageUnread > 0 ? (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {tabCounts.messageUnread}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">({tabCounts.message})</span>
                )}
              </button>
            </div>

            {/* Sub-Filters and Quick Actions Bar */}
            <div className="flex items-center justify-between gap-2 py-2 mt-1">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter notices, subjects, senders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-1">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="bg-white border border-slate-200 text-slate-700 text-[11px] rounded-lg px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread Only</option>
                  <option value="high_priority">High Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Bulk Action & Simulation Utility Row */}
          <div className="bg-slate-100/80 px-3 py-1.5 border-b border-slate-200 text-[11px] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsAsRead}
                disabled={tabCounts.allUnread === 0}
                className="flex items-center gap-1 text-indigo-700 hover:text-indigo-900 disabled:opacity-40 font-semibold cursor-pointer disabled:cursor-not-allowed transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>

              <span className="text-slate-300">|</span>

              <button
                onClick={clearAllReadNotifications}
                className="flex items-center gap-1 text-slate-600 hover:text-rose-600 font-medium cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear read</span>
              </button>
            </div>

            {/* Test Simulation Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowSimulateMenu(!showSimulateMenu)}
                className="flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold cursor-pointer transition"
              >
                <PlusCircle className="w-3 h-3 text-emerald-600" />
                <span>Simulate Alert</span>
              </button>

              {showSimulateMenu && (
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-left">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulate Live Trigger
                  </div>
                  <button
                    onClick={() => handleSimulate('academic')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ Academic Due Quiz</span>
                  </button>
                  <button
                    onClick={() => handleSimulate('event')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>+ Flash Event Alert</span>
                  </button>
                  <button
                    onClick={() => handleSimulate('message')}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Faculty Direct Msg</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notification List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3">
                  {activeTab === 'academic' ? (
                    <GraduationCap className="w-7 h-7" />
                  ) : activeTab === 'event' ? (
                    <Calendar className="w-7 h-7" />
                  ) : activeTab === 'message' ? (
                    <MessageSquare className="w-7 h-7" />
                  ) : (
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-800">
                  {searchQuery
                    ? 'No matching notifications found'
                    : filterStatus === 'unread'
                    ? 'All caught up! Zero unread notifications'
                    : 'No notifications in this category'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  {searchQuery
                    ? `Try a different keyword or reset the search query.`
                    : `You will receive instant real-time alerts when professors, colleges, or peers update academic notices.`}
                </p>
                <button
                  onClick={() => handleSimulate(activeTab === 'all' ? 'academic' : activeTab)}
                  className="mt-4 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Send Test Notification</span>
                </button>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const category = resolveCategory(notif);
                const isSelected = selectedNotification?.id === notif.id;

                // Color accent themes per category
                const badgeTheme =
                  category === 'academic'
                    ? {
                        bg: 'bg-blue-50 border-blue-200 text-blue-700',
                        iconBg: 'bg-blue-100 text-blue-700',
                        badge: '🎓 Academic Update',
                        icon: <GraduationCap className="w-4 h-4" />,
                      }
                    : category === 'event'
                    ? {
                        bg: 'bg-amber-50 border-amber-200 text-amber-700',
                        iconBg: 'bg-amber-100 text-amber-700',
                        badge: '🎟️ Event Alert',
                        icon: <Calendar className="w-4 h-4" />,
                      }
                    : {
                        bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                        iconBg: 'bg-emerald-100 text-emerald-700',
                        badge: '💬 Direct Message',
                        icon: <MessageSquare className="w-4 h-4" />,
                      };

                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-xl border transition p-3 relative group ${
                      !notif.isRead
                        ? 'bg-indigo-50/50 border-indigo-200 shadow-xs'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    {/* Unread Glow Indicator */}
                    {!notif.isRead && (
                      <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100 animate-pulse" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Sender Avatar or Category Icon */}
                      <div className="relative shrink-0">
                        {notif.sender?.avatar ? (
                          <img
                            src={notif.sender.avatar}
                            alt={notif.sender.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-2xs ${badgeTheme.iconBg}`}
                          >
                            {badgeTheme.icon}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-white shadow-2xs ${badgeTheme.iconBg}`}
                        >
                          {category === 'academic' ? '🎓' : category === 'event' ? '🎟️' : '💬'}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="flex-1 min-w-0 pr-4">
                        {/* Tags and Category Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeTheme.bg}`}
                          >
                            {badgeTheme.badge}
                          </span>

                          {/* Priority badge if urgent/high */}
                          {(notif.priority === 'high' || notif.priority === 'emergency') && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                              Urgent
                            </span>
                          )}

                          {notif.metadata?.course && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {notif.metadata.course}
                            </span>
                          )}

                          {notif.metadata?.tag && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-100/60 text-indigo-700">
                              {notif.metadata.tag}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => setSelectedNotification(isSelected ? null : notif)}
                          className="font-bold text-xs sm:text-sm text-slate-900 leading-snug cursor-pointer hover:text-indigo-600 transition"
                        >
                          {notif.title}
                        </h4>

                        {/* Sender info */}
                        {notif.sender && (
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                            <span className="font-semibold text-slate-700">{notif.sender.name}</span>
                            <span>•</span>
                            <span className="truncate">{notif.sender.role}</span>
                          </div>
                        )}

                        {/* Message Snippet */}
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>

                        {/* Timestamp & Meta details */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {notif.createdAt}
                          </span>

                          {notif.metadata?.dueDate && (
                            <span className="text-rose-600 font-semibold flex items-center gap-1">
                              Due: {notif.metadata.dueDate}
                            </span>
                          )}

                          {notif.metadata?.location && (
                            <span className="text-amber-700 flex items-center gap-1">
                              📍 {notif.metadata.location}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
                          {/* Primary CTA if available */}
                          {notif.actionLabel && (
                            <button
                              onClick={() => handleActionClick(notif)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer transition"
                            >
                              <span>{notif.actionLabel}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {/* Toggle Read status */}
                          <button
                            onClick={() => toggleNotificationRead(notif.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            <span>{notif.isRead ? 'Mark unread' : 'Mark read'}</span>
                          </button>

                          {/* Dismiss Button */}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            title="Dismiss notification"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer Status Bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-medium">Campus Gateway Synced</span>
            </div>
            <div className="text-[11px]">
              Showing <strong className="text-slate-800">{filteredNotifications.length}</strong> alerts
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
