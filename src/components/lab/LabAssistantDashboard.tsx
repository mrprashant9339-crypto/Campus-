import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Search,
  Check,
  Plus,
  Calendar,
  Activity,
  ClipboardList,
  ShieldCheck,
} from 'lucide-react';

export const LabAssistantDashboard: React.FC = () => {
  const { currentUser, currentCollege } = useApp();
  const [activeTab, setActiveTab] = useState<'labs' | 'equipment' | 'practical_attendance' | 'consumables'>('labs');
  const [markedSession, setMarkedSession] = useState<string | null>(null);

  const labRooms = [
    {
      code: 'LAB-ME-01',
      name: 'Thermal Engineering & Heat Engine Lab',
      supervisor: 'Mr. Suresh Prasad (Faculty)',
      capacity: '32 Students / Batch',
      currentBatch: 'ME 3rd Sem (Batch A: Roll 001–030)',
      status: 'Active Practical in Session',
    },
    {
      code: 'LAB-ME-02',
      name: 'Fluid Mechanics & Hydraulic Machinery Lab',
      supervisor: 'Dr. Anand Kishore (Faculty)',
      capacity: '30 Students / Batch',
      currentBatch: 'Scheduled 02:00 PM',
      status: 'Ready',
    },
    {
      code: 'LAB-ME-03',
      name: 'Central Machine Shop & CNC Turning Center',
      supervisor: 'Er. Manoj Pandey (Supt.)',
      capacity: '40 Students / Batch',
      currentBatch: 'ME 5th Sem (Batch B)',
      status: 'Active Practical in Session',
    },
    {
      code: 'LAB-ME-04',
      name: 'CAD / CAM Computer Practical Laboratory',
      supervisor: 'Prof. Sunil Kumar',
      capacity: '45 Workstations',
      currentBatch: 'ME 3rd Sem CAD Simulation',
      status: 'Active',
    },
  ];

  const equipmentList = [
    {
      id: 'EQ-01',
      name: 'Universal Testing Machine (UTM 40-Tonne)',
      lab: 'Strength of Materials Lab',
      condition: 'Operational',
      lastCalibrated: '15 Aug 2024',
      nextService: 'Dec 2024',
      safetyStatus: 'Verified ✓',
    },
    {
      id: 'EQ-02',
      name: 'CNC 2-Axis Lathe Trainer (Siemens Sinumerik 808D)',
      lab: 'Central Machine Shop',
      condition: 'Operational',
      lastCalibrated: '01 Sep 2024',
      nextService: 'Nov 2024',
      safetyStatus: 'Emergency Stop Tested ✓',
    },
    {
      id: 'EQ-03',
      name: 'Pelton Wheel Impulse Turbine Test Rig',
      lab: 'Fluid Mechanics Lab',
      condition: 'Operational',
      lastCalibrated: '20 Jul 2024',
      nextService: 'Jan 2025',
      safetyStatus: 'Flow Metrology Verified ✓',
    },
    {
      id: 'EQ-04',
      name: 'Single Cylinder 4-Stroke Diesel Engine Rig with Eddy Dynamometer',
      lab: 'Thermal Engg Lab',
      condition: 'Needs Oil Top-Up',
      lastCalibrated: '10 Jun 2024',
      nextService: 'Overdue (3 Days)',
      safetyStatus: 'Caution ⚠️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-amber-50 text-amber-800 px-2 py-0.5 font-bold border border-amber-200">
                PRACTICAL LABS & WORKSHOP DESK // TECHNICAL SERVICES
              </span>
              <span className="text-[10px] font-mono text-[#666]">MECHANICAL BLOCK</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Workshop Superintendent: {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              In-Charge of Practical Apparatus, Safety & Workshop Sessions at{' '}
              <span className="font-semibold text-[#141414]">{currentCollege.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Workshop Safety Audit 2026 Cleared
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(20,20,20,0.06)]">
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Active Lab Rooms</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">6 Labs</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">100% Power & Air Sync</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Equipment Units</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">48 Machines</div>
            <div className="text-[11px] text-[#2563eb] font-mono mt-1">47 Operational · 1 Service</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Today's Batches</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">8 Batches</div>
            <div className="text-[11px] text-[#666] font-mono mt-1">192 Students Scheduled</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Safety Incidents</div>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">0</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">140 Days Incident-Free</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'labs', label: '01 // Laboratory Roster & Schedule' },
          { id: 'equipment', label: '02 // Machine Calibration & Service' },
          { id: 'practical_attendance', label: '03 // Batch Practical Log' },
          { id: 'consumables', label: '04 // Workshop Raw Materials & Tools' },
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

      {/* Tab 1: Labs */}
      {activeTab === 'labs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labRooms.map((l) => (
            <div key={l.code} className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-[#2563eb]/10 text-[#2563eb] px-2 py-0.5">
                  {l.code}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                    l.status.includes('Active')
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {l.status}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-[#141414] mt-2">{l.name}</h3>
              <div className="mt-3 space-y-1 text-xs text-[#666]">
                <div>Faculty In-Charge: <span className="font-semibold text-[#141414]">{l.supervisor}</span></div>
                <div>Capacity: <span className="font-mono">{l.capacity}</span></div>
                <div>Current Practical: <span className="font-bold text-[#2563eb]">{l.currentBatch}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Equipment */}
      {activeTab === 'equipment' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-lg text-[#141414] mb-3">
            Heavy Machinery Calibration & Safety Register
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] border-b border-[rgba(20,20,20,0.08)] font-mono text-[#666]">
                <tr>
                  <th className="p-3">Apparatus ID & Title</th>
                  <th className="p-3">Installed In</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3">Last Calibration</th>
                  <th className="p-3">Safety Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,20,20,0.06)]">
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="hover:bg-[#F8F7F4]/50">
                    <td className="p-3 font-semibold text-[#141414]">
                      <div className="font-mono text-[11px] text-[#2563eb]">{eq.id}</div>
                      <div>{eq.name}</div>
                    </td>
                    <td className="p-3 text-[#666]">{eq.lab}</td>
                    <td className="p-3 font-semibold">
                      <span className={eq.condition.includes('Needs') ? 'text-amber-600' : 'text-emerald-700'}>
                        {eq.condition}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[#666]">{eq.lastCalibrated}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold">{eq.safetyStatus}</td>
                    <td className="p-3 text-right">
                      <button className="text-[11px] text-[#2563eb] font-semibold hover:underline">
                        Log Service
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Practical Attendance */}
      {activeTab === 'practical_attendance' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-2">
            Practical Session Roll Call & Machine Assignment
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Mark attendance for 3rd Semester Mechanical Batch A (Thermodynamics & Steam Engines Practical).
          </p>

          <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-[#141414]">Today's Session: ME301 Lab Practical #04</div>
              <div className="text-[11px] text-[#666] mt-0.5">
                Experiment: Separating & Throttling Calorimeter Dryness Fraction Calculation
              </div>
            </div>

            {markedSession ? (
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                28/30 Present (Logged into SBTE Portal)
              </span>
            ) : (
              <button
                onClick={() => setMarkedSession('marked')}
                className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white font-bold cursor-pointer"
              >
                Mark Batch Present (Quick Scan)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Consumables */}
      {activeTab === 'consumables' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
            Workshop Raw Stock & Consumables Ledger
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-[#F8F7F4] border">
              <div className="text-[#666]">M.S. Mild Steel Flat Bars (25x6mm)</div>
              <div className="text-lg font-bold text-[#141414] mt-1">140 Meters In Stock</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Sufficient for 3rd Sem Fitting</div>
            </div>
            <div className="p-3 bg-[#F8F7F4] border">
              <div className="text-[#666]">Water-Soluble Cutting Coolant</div>
              <div className="text-lg font-bold text-[#141414] mt-1">45 Liters</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Lathe sump replenished</div>
            </div>
            <div className="p-3 bg-[#F8F7F4] border">
              <div className="text-[#666]">Welding Electrodes (E6013 Gauge 10)</div>
              <div className="text-lg font-bold text-[#141414] mt-1">12 Packets</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Foundry shop store</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
