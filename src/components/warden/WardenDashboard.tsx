import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Search,
  Check,
  X,
  ShieldCheck,
  DoorOpen,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export const WardenDashboard: React.FC = () => {
  const { currentUser, currentCollege } = useApp();
  const [activeTab, setActiveTab] = useState<'attendance' | 'allotment' | 'complaints' | 'leave_passes'>('attendance');
  const [approvedPassIds, setApprovedPassIds] = useState<string[]>([]);

  const hostelBlocks = [
    { name: 'Kautilya Hostel (Block A)', capacity: 160, occupied: 154, warden: 'Kunal Kishor', type: 'Boys Residence' },
    { name: 'Aryabhatta Hostel (Block B)', capacity: 140, occupied: 132, warden: 'Kunal Kishor', type: 'Boys Residence' },
  ];

  const pendingLeavePasses = [
    {
      id: 'pass-01',
      studentName: 'Aman Verma',
      rollNo: 'ME2024003',
      room: 'Block A, Room 204',
      destination: 'Hometown: Gaya, Bihar',
      purpose: 'Family wedding ceremony',
      departureDate: '11 Oct 2026',
      returnDate: '14 Oct 2026',
      parentContact: '+91 94310 11229',
    },
    {
      id: 'pass-02',
      studentName: 'Ritesh Kumar',
      rollNo: 'CE2024019',
      room: 'Block B, Room 112',
      destination: 'Local Guardian: Boring Road, Patna',
      purpose: 'Festival weekend with relatives',
      departureDate: 'Today, 06:00 PM',
      returnDate: 'Tomorrow, 08:00 PM',
      parentContact: '+91 98350 44551',
    },
  ];

  const complaintsList = [
    {
      id: 'cmp-01',
      room: 'Room 214 (Block A)',
      category: 'Electrical',
      issue: 'Ceiling fan regulator sparking; requires electrician urgent visit.',
      status: 'In Progress',
      loggedAt: 'Today, 08:30 AM',
    },
    {
      id: 'cmp-02',
      room: 'Mess Committee Block A',
      category: 'Food Quality',
      issue: 'Evening tea snacks quality review requested by 2nd year mess representatives.',
      status: 'Resolved',
      loggedAt: 'Yesterday',
    },
  ];

  const handleApproveLeavePass = (id: string) => {
    setApprovedPassIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-50 text-amber-800 px-2 py-0.5 font-bold border border-amber-200">
                HOSTEL ADMINISTRATION & RESIDENTIAL WELFARE
              </span>
              <span className="text-[10px] font-mono text-[#666]">CURFEW 08:30 PM</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Hostel Warden Desk: {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              Residential Supervision & Student Safety at{' '}
              <span className="font-semibold text-[#141414]">{currentCollege.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Biometric Curfew Turnstile Online
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(20,20,20,0.06)]">
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Resident Scholars</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">286 Students</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">95.3% Capacity Full</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Pending Outing Passes</div>
            <div className="text-2xl font-serif font-bold text-amber-600 mt-0.5">
              {pendingLeavePasses.length - approvedPassIds.length} Requests
            </div>
            <div className="text-[11px] text-[#2563eb] font-mono mt-1">Night Leaves Awaiting Sign</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Tonight In-Campus</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">278 Present</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">8 on Authorized Leave</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Open Complaints</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">1 Open</div>
            <div className="text-[11px] text-[#666] font-mono mt-1">Maintenance Ticket Assigned</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'attendance', label: '01 // Night Roll Call & Curfew Ledger' },
          { id: 'leave_passes', label: '02 // Night Outing & Leave Passes' },
          { id: 'allotment', label: '03 // Room Allotment & Blocks' },
          { id: 'complaints', label: '04 // Hostel Maintenance & Mess' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 font-semibold transition border-b-2 -mb-px cursor-pointer ${
              activeTab === t.id
                ? 'border-[#2563eb] text-[#2563eb]'
                : 'border-transparent text-[#666] hover:text-[#141414]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Night Roll Call */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#141414]">
                Night Attendance Ledger (Curfew Check: 08:30 PM)
              </h3>
              <p className="text-xs text-[#666]">
                Hostel gate biometric turnstile sync. Unaccounted absences after 09:00 PM notify registered guardian via SMS.
              </p>
            </div>
            <button className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white font-bold cursor-pointer">
              Initiate Block A Roll Call
            </button>
          </div>

          <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#141414]">Block A Ground Floor (Rooms 101 - 120)</span>
              <span className="font-mono text-emerald-700 font-bold">100% Accounted (40/40 Present)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#141414]">Block A 1st Floor (Rooms 201 - 220)</span>
              <span className="font-mono text-emerald-700 font-bold">39/40 Present (1 on approved leave)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#141414]">Block B Complete</span>
              <span className="font-mono text-emerald-700 font-bold">100% Accounted</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Leave Passes */}
      {activeTab === 'leave_passes' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-1">
            Outstation Leave & Overnight Outing Pass Approvals
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Requires guardian telephonic verification prior to digital gate pass issuance.
          </p>

          <div className="space-y-4">
            {pendingLeavePasses.map((pass) => {
              const isApproved = approvedPassIds.includes(pass.id);
              return (
                <div
                  key={pass.id}
                  className={`p-4 border transition ${
                    isApproved ? 'bg-emerald-50/50 border-emerald-300' : 'bg-[#F8F7F4] border-[rgba(20,20,20,0.08)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#141414]">{pass.studentName}</span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 border">
                          {pass.rollNo}
                        </span>
                        <span className="text-[11px] text-[#2563eb] font-semibold">{pass.room}</span>
                      </div>
                      <div className="text-xs text-[#141414] mt-1.5 font-medium">
                        Destination: <span className="font-bold">{pass.destination}</span> ({pass.purpose})
                      </div>
                      <div className="text-[11px] text-[#666] font-mono mt-0.5">
                        Duration: {pass.departureDate} → {pass.returnDate} · Guardian Phone: {pass.parentContact}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Gate Pass Signed & Sent to Security
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApproveLeavePass(pass.id)}
                          className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white flex items-center gap-1.5 font-bold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Gate Pass
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Allotment */}
      {activeTab === 'allotment' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostelBlocks.map((b, i) => (
            <div key={i} className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#141414]">{b.name}</h3>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 border">{b.type}</span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-[#666]">
                <div>Capacity: <span className="font-bold text-[#141414]">{b.capacity} beds</span></div>
                <div>Occupancy: <span className="font-bold text-emerald-700">{b.occupied} beds</span> ({b.capacity - b.occupied} vacant)</div>
                <div>Superintendent: <span className="font-mono text-[#141414]">{b.warden}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Complaints */}
      {activeTab === 'complaints' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
            Hostel Maintenance & Mess Grievances
          </h3>
          <div className="space-y-3">
            {complaintsList.map((c) => (
              <div key={c.id} className="p-3.5 bg-[#F8F7F4] border flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#141414]">{c.room} — {c.category}</div>
                  <div className="text-[11px] text-[#666] mt-0.5">{c.issue}</div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                    c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
