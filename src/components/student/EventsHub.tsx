import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Event } from '../../types';
import { EventsCalendarView } from './EventsCalendarView';
import {
  Calendar,
  MapPin,
  Users,
  Award,
  QrCode,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Ticket,
  CalendarDays,
  LayoutGrid,
  Wifi,
  WifiOff,
  Database,
} from 'lucide-react';

export const EventsHub: React.FC = () => {
  const { events, registerForEvent, currentCollege, currentUser, isOffline, toggleOfflineSimulation } = useApp();
  const [activeView, setActiveView] = useState<'calendar' | 'cards'>('calendar');
  const [filter, setFilter] = useState<'all' | 'my_college' | 'inter_college' | 'registered'>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents = events.filter((e) => {
    if (filter === 'my_college') return e.scope === 'college';
    if (filter === 'inter_college') return e.scope === 'inter_college';
    if (filter === 'registered') return e.isRegistered;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4 py-2">
      {/* Campus Wi-Fi & Firestore Offline Persistence Alert Banner */}
      <div
        className={`p-3.5 px-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition ${
          isOffline
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
              isOffline ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {isOffline ? <WifiOff className="w-5 h-5 animate-pulse" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm">
                {isOffline ? 'Campus Wi-Fi Disconnected' : 'Campus Wi-Fi Connected'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isOffline
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-indigo-200 text-indigo-900'
                }`}
              >
                Firestore Offline Persistence Active
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isOffline
                ? `Academic calendar dates, examination schedules, and ${events.filter((e) => e.isRegistered).length} registered passes remain cached locally in IndexedDB without Wi-Fi.`
                : 'All event schedules and passes are stored in Firestore with local multi-tab cache for seamless offline access.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={toggleOfflineSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
              isOffline
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Toggle simulated campus Wi-Fi outage to verify offline persistence"
          >
            {isOffline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Reconnect Campus Wi-Fi</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulate Campus Wi-Fi Outage</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-extrabold text-slate-900">
              Campus Events & Academic Calendar (S-18)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assignment deadlines, examination schedules, state holidays, technical fests, and verified passes
          </p>
        </div>

        {/* View Switcher: Calendar View vs Cards View */}
        <div className="flex items-center gap-2">
          <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-100 text-xs font-bold">
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'calendar'
                  ? 'bg-white shadow-xs text-indigo-700 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Calendar View</span>
            </button>
            <button
              onClick={() => setActiveView('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === 'cards'
                  ? 'bg-white shadow-xs text-indigo-700 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Fests & Passes ({events.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Calendar View or Cards Grid */}
      {activeView === 'calendar' ? (
        <EventsCalendarView
          onSelectEvent={(eventId) => {
            const ev = events.find((e) => e.id === eventId);
            if (ev) setSelectedEvent(ev);
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Filter Tabs for Cards View */}
          <div className="flex justify-end">
            <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filter === 'all' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setFilter('my_college')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filter === 'my_college' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
                }`}
              >
                My College
              </button>
              <button
                onClick={() => setFilter('inter_college')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filter === 'inter_college' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
                }`}
              >
                Inter-College
              </button>
              <button
                onClick={() => setFilter('registered')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  filter === 'registered' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-600'
                }`}
              >
                My Passes
              </button>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Banner Header */}
                <div className={`p-5 bg-gradient-to-r ${evt.bannerGradient} text-white relative`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-xs">
                      {evt.scope === 'college' ? 'Private College Fest' : '🌐 Inter-College Competition'}
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {evt.registeredCount}/{evt.capacity} Filled
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white mt-2 leading-tight">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    Organizer: {evt.organizerName} {evt.collegeName ? `• ${evt.collegeName}` : ''}
                  </p>
                </div>

                {/* Event Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1 text-xs text-slate-700 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{evt.startAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {evt.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
                    >
                      View Details (S-19) →
                    </button>

                    {evt.isRegistered ? (
                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>View QR Pass</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          registerForEvent(evt.id);
                          alert(`Successfully registered for ${evt.title}! Generated Digital Event Ticket.`);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail & Pass Modal (S-19) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Header */}
            <div className={`p-5 bg-gradient-to-r ${selectedEvent.bannerGradient} text-white relative`}>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-1 text-white/80 hover:text-white hover:bg-black/20 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                {selectedEvent.scope.toUpperCase()} EVENT
              </span>
              <h2 className="text-lg font-extrabold text-white mt-2">{selectedEvent.title}</h2>
              <p className="text-xs text-white/80 mt-0.5">
                {selectedEvent.organizerName} • Capacity: {selectedEvent.capacity}
              </p>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">About Event</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-slate-700">
                <div>
                  <strong>Eligibility:</strong> {selectedEvent.eligibility}
                </div>
                <div>
                  <strong>Schedule:</strong> {selectedEvent.startAt} to {selectedEvent.endAt || 'Evening'}
                </div>
                <div>
                  <strong>Venue:</strong> {selectedEvent.venue}
                </div>
              </div>

              {/* QR Pass if registered */}
              {selectedEvent.isRegistered && (
                <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRMED ENTRY TICKET</span>
                  </div>
                  <div className="w-28 h-28 bg-white p-2 mx-auto rounded-xl flex items-center justify-center text-slate-900 shadow-md">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <div className="font-mono text-xs font-bold tracking-widest text-indigo-200">
                    {selectedEvent.qrTicketCode || 'GPP-TF25-TICK-00194'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Scan this QR ticket at registration desk for badge check-in
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Status: <strong className="text-emerald-700">Published & Open</strong>
              </span>
              {!selectedEvent.isRegistered && (
                <button
                  onClick={() => {
                    registerForEvent(selectedEvent.id);
                    setSelectedEvent({ ...selectedEvent, isRegistered: true });
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Register Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
