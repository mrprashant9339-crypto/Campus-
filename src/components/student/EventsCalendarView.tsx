import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicCalendarItem, CalendarEventType } from '../../types';
import { INITIAL_CALENDAR_ITEMS } from '../../mockAcademicData';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  FileText,
  GraduationCap,
  Sun,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
  CalendarCheck,
  ChevronRight as ChevronRightIcon,
  X,
  ExternalLink,
} from 'lucide-react';

interface EventsCalendarViewProps {
  onSelectEvent?: (eventId: string) => void;
}

export const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({ onSelectEvent }) => {
  const { setActiveNavTab } = useApp();
  const [calendarItems, setCalendarItems] = useState<AcademicCalendarItem[]>(INITIAL_CALENDAR_ITEMS);
  const [selectedType, setSelectedType] = useState<CalendarEventType | 'all'>('all');

  // Month navigation: default to October 2024 (where current assignments/exams/holidays are scheduled)
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2024-10-18');
  const [selectedItemDetail, setSelectedItemDetail] = useState<AcademicCalendarItem | null>(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToCurrent = () => {
    setCurrentYear(2024);
    setCurrentMonth(9); // October
    setSelectedDateStr('2024-10-18');
  };

  // Filter items by type
  const filteredItems = useMemo(() => {
    if (selectedType === 'all') return calendarItems;
    return calendarItems.filter((i) => i.type === selectedType);
  }, [calendarItems, selectedType]);

  // Counts by category
  const countsByType = useMemo(() => {
    return {
      all: calendarItems.length,
      assignment: calendarItems.filter((i) => i.type === 'assignment').length,
      exam: calendarItems.filter((i) => i.type === 'exam').length,
      holiday: calendarItems.filter((i) => i.type === 'holiday').length,
      event: calendarItems.filter((i) => i.type === 'event').length,
    };
  }, [calendarItems]);

  // Calendar grid calculations
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      items: AcademicCalendarItem[];
    }[] = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        items: [],
      });
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;

      // Check which items fall on this day (exact date or within date range)
      const dayItems = filteredItems.filter((item) => {
        if (item.endDate) {
          return dateStr >= item.date && dateStr <= item.endDate;
        }
        return item.date === dateStr;
      });

      days.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        items: dayItems,
      });
    }

    // Next month padding to fill out 35 or 42 cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        items: [],
      });
    }

    return days;
  }, [currentYear, currentMonth, filteredItems]);

  // Selected date items
  const selectedDateItems = useMemo(() => {
    return filteredItems.filter((item) => {
      if (item.endDate) {
        return selectedDateStr >= item.date && selectedDateStr <= item.endDate;
      }
      return item.date === selectedDateStr;
    });
  }, [filteredItems, selectedDateStr]);

  // Nearest upcoming items across calendar
  const upcomingItems = useMemo(() => {
    return [...calendarItems]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [calendarItems]);

  const getTypeStyle = (type: CalendarEventType) => {
    switch (type) {
      case 'assignment':
        return {
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          pillBg: 'bg-amber-500 text-white',
          border: 'border-amber-300',
          dot: 'bg-amber-500',
          label: 'Assignment Deadline',
          icon: <FileText className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'exam':
        return {
          bg: 'bg-purple-600',
          lightBg: 'bg-purple-50 border-purple-200 text-purple-900',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
          pillBg: 'bg-purple-600 text-white',
          border: 'border-purple-300',
          dot: 'bg-purple-600',
          label: 'Examination / CAT',
          icon: <GraduationCap className="w-3.5 h-3.5 text-purple-600" />,
        };
      case 'holiday':
        return {
          bg: 'bg-emerald-600',
          lightBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          pillBg: 'bg-emerald-600 text-white',
          border: 'border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'Campus Holiday',
          icon: <Sun className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'event':
        return {
          bg: 'bg-blue-600',
          lightBg: 'bg-blue-50 border-blue-200 text-blue-900',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
          pillBg: 'bg-blue-600 text-white',
          border: 'border-blue-300',
          dot: 'bg-blue-600',
          label: 'Fest / Competition',
          icon: <Sparkles className="w-3.5 h-3.5 text-blue-600" />,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Quick Milestones Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-700 block">
              Deadlines
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {countsByType.assignment} Upcoming
            </span>
          </div>
        </div>

        <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-xs flex items-center gap-2.5">
          <div className="p-2 bg-purple-600 text-white rounded-lg shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-700 block">
              Examinations
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {countsByType.exam} Scheduled
            </span>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">
              Campus Holidays
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {countsByType.holiday} Recesses
            </span>
          </div>
        </div>

        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-700 block">
              Fests & Events
            </span>
            <span className="font-extrabold text-slate-800 text-sm">
              {countsByType.event} Activities
            </span>
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Calendar Toolbar: Month Selector & Category Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Month / Year Navigator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white rounded-lg transition text-slate-700 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-xs font-black text-slate-900 tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white rounded-lg transition text-slate-700 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleJumpToCurrent}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer"
            >
              Current Term
            </button>
          </div>

          {/* Color-Coded Category Legend & Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Markers ({countsByType.all})
            </button>

            <button
              onClick={() => setSelectedType('assignment')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer border ${
                selectedType === 'assignment'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedType === 'assignment' ? 'bg-white' : 'bg-amber-500'
                }`}
              />
              <span>Assignments ({countsByType.assignment})</span>
            </button>

            <button
              onClick={() => setSelectedType('exam')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer border ${
                selectedType === 'exam'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                  : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedType === 'exam' ? 'bg-white' : 'bg-purple-600'
                }`}
              />
              <span>Exams ({countsByType.exam})</span>
            </button>

            <button
              onClick={() => setSelectedType('holiday')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer border ${
                selectedType === 'holiday'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedType === 'holiday' ? 'bg-white' : 'bg-emerald-600'
                }`}
              />
              <span>Holidays ({countsByType.holiday})</span>
            </button>

            <button
              onClick={() => setSelectedType('event')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer border ${
                selectedType === 'event'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedType === 'event' ? 'bg-white' : 'bg-blue-600'
                }`}
              />
              <span>Fests ({countsByType.event})</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Left = Monthly Grid, Right = Selected Date Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Calendar Grid (2 cols) */}
          <div className="lg:col-span-2 space-y-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
              <span className="text-rose-500">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDateStr;
                const hasItems = cell.items.length > 0;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDateStr(cell.dateStr);
                      }
                    }}
                    className={`min-h-[82px] sm:min-h-[92px] p-1.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                      !cell.isCurrentMonth
                        ? 'opacity-30 bg-slate-50 border-transparent cursor-not-allowed'
                        : isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-200'
                        : hasItems
                        ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        : 'border-slate-100 bg-white hover:bg-slate-50/40'
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-extrabold'
                            : cell.dateStr === '2024-10-08'
                            ? 'bg-amber-400 text-slate-900 font-extrabold'
                            : 'text-slate-700'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Item count tag if multiple */}
                      {cell.items.length > 0 && (
                        <div className="flex items-center gap-0.5">
                          {cell.items.slice(0, 3).map((item, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                getTypeStyle(item.type).dot
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Item Pills in cell */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {cell.items.slice(0, 2).map((item) => {
                        const style = getTypeStyle(item.type);
                        return (
                          <div
                            key={item.id}
                            title={`${item.title} (${style.label})`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDateStr(cell.dateStr);
                              setSelectedItemDetail(item);
                            }}
                            className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${style.pillBg}`}
                          >
                            <span className="truncate">{item.title}</span>
                          </div>
                        );
                      })}
                      {cell.items.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-500 block text-right">
                          +{cell.items.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Date Schedule & Action Drawer */}
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Selected Date Schedule
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h4>
                </div>
                <span className="text-xs font-bold bg-white text-indigo-700 border border-slate-200 px-2 py-0.5 rounded-full">
                  {selectedDateItems.length} Events
                </span>
              </div>

              {/* Items List for Selected Day */}
              {selectedDateItems.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateItems.map((item) => {
                    const style = getTypeStyle(item.type);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-xl border ${style.lightBg} space-y-2 relative overflow-hidden`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {style.icon}
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${style.badgeBg}`}
                            >
                              {item.badgeLabel}
                            </span>
                          </div>
                          {item.priority === 'critical' && (
                            <span className="text-[9px] font-bold uppercase bg-rose-600 text-white px-1.5 py-0.5 rounded">
                              Mandatory
                            </span>
                          )}
                        </div>

                        <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                          {item.title}
                        </h5>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          {item.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{item.time}</span>
                            </div>
                          )}
                          {item.venueOrRoom && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{item.venueOrRoom}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Action CTA */}
                        <div className="pt-2 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedItemDetail(item)}
                            className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer"
                          >
                            Full Details →
                          </button>

                          {item.actionType === 'assignment' && (
                            <button
                              onClick={() => setActiveNavTab('student_home')}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition cursor-pointer"
                            >
                              Submit PDF
                            </button>
                          )}

                          {item.actionType === 'event' && (
                            <button
                              onClick={() => {
                                if (item.referenceId && onSelectEvent) {
                                  onSelectEvent(item.referenceId);
                                } else {
                                  alert(`Opening passes for ${item.title}`);
                                }
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition cursor-pointer"
                            >
                              Register Pass
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    No scheduled exams or deadlines on this day
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click any highlighted date on the calendar with color dots to inspect scheduled events.
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Next Milestones Mini-List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Next Term Deadlines</span>
                <span className="text-indigo-600 text-[10px]">Upcoming</span>
              </h4>

              <div className="space-y-2">
                {upcomingItems.map((item) => {
                  const style = getTypeStyle(item.type);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedDateStr(item.date);
                        setSelectedItemDetail(item);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200/80 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold text-slate-800 truncate block text-[11px]">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.date} • {item.badgeLabel}
                        </span>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Item Full Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    getTypeStyle(selectedItemDetail.type).badgeBg
                  }`}
                >
                  {selectedItemDetail.badgeLabel}
                </span>
                {selectedItemDetail.priority && (
                  <span className="text-[10px] font-bold text-slate-500">
                    Priority: {selectedItemDetail.priority.toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {selectedItemDetail.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedItemDetail.subjectOrOrganizer || 'College Academic Affairs'}
              </p>
            </div>

            {/* Timings & Room Info Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CalendarIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Date:</strong> {selectedItemDetail.date}
                  {selectedItemDetail.endDate && ` to ${selectedItemDetail.endDate}`}
                </span>
              </div>
              {selectedItemDetail.time && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Timing:</strong> {selectedItemDetail.time}
                  </span>
                </div>
              )}
              {selectedItemDetail.venueOrRoom && (
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Venue / Room:</strong> {selectedItemDetail.venueOrRoom}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-xs text-slate-600 leading-relaxed">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-1">
                Official Description & Guidelines:
              </h5>
              <p>{selectedItemDetail.description}</p>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  alert(
                    `Added "${selectedItemDetail.title}" to your personal calendar notifications!`
                  );
                }}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Add to Reminders</span>
              </button>

              <button
                onClick={() => {
                  setSelectedItemDetail(null);
                  if (selectedItemDetail.actionType === 'assignment') {
                    setActiveNavTab('student_home');
                  }
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
