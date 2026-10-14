import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Check,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const AccountantDashboard: React.FC = () => {
  const { currentUser, currentCollege } = useApp();
  const [activeTab, setActiveTab] = useState<'collections' | 'scholarships' | 'pending_dues' | 'audit'>('collections');
  const [verifiedScholarshipIds, setVerifiedScholarshipIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const recentTransactions = [
    {
      id: 'TXN-901',
      studentName: 'Prashant Kumar',
      rollNo: 'ME2024001',
      branch: 'Mechanical 3rd Sem',
      category: 'Tuition Fee (3rd Sem)',
      amount: '₹1,800',
      mode: 'UPI / SBI e-Pay',
      date: '20 Jul 2024, 09:15 AM',
      status: 'Reconciled',
      receiptNo: 'GPP/FEE/2024/7821',
    },
    {
      id: 'TXN-902',
      studentName: 'Rahul Singh',
      rollNo: 'CE2024002',
      branch: 'Civil 3rd Sem',
      category: 'Tuition & Workshop Fee',
      amount: '₹2,300',
      mode: 'Bank Challan (PNB Gulzarbagh)',
      date: '19 Jul 2024, 02:40 PM',
      status: 'Reconciled',
      receiptNo: 'GPP/FEE/2024/7819',
    },
    {
      id: 'TXN-903',
      studentName: 'Sneha Kumari',
      rollNo: 'CSE2024005',
      branch: 'Computer Science 3rd Sem',
      category: 'Tuition Fee',
      amount: '₹1,800',
      mode: 'Net Banking',
      date: '18 Jul 2024, 11:10 AM',
      status: 'Reconciled',
      receiptNo: 'GPP/FEE/2024/7804',
    },
  ];

  const scholarshipQueue = [
    {
      id: 'SCH-01',
      studentName: 'Amit Paswan',
      rollNo: 'ME2024018',
      branch: 'Mechanical 3rd Sem',
      scheme: 'Post-Matric Scholarship (PMS Bihar RTPS)',
      amount: '₹12,400 / Year',
      status: 'Awaiting Institutional Clearance',
      docRef: 'PMS_Application_ME018.pdf',
    },
    {
      id: 'SCH-02',
      studentName: 'Ravi Kumar',
      rollNo: 'CE2024032',
      branch: 'Civil 3rd Sem',
      scheme: 'Bihar Student Credit Card (MNSSBY / DRCC Patna)',
      amount: '₹35,000 / Year (Tuition + Hostel)',
      status: 'Awaiting Fee Demand Slip',
      docRef: 'DRCC_Loan_Allotment_Slip.pdf',
    },
  ];

  const handleClearScholarship = (id: string) => {
    setVerifiedScholarshipIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-emerald-50 text-emerald-800 px-2 py-0.5 font-bold border border-emerald-200">
                BURSAR & ACCOUNTS DESK // FINANCIAL COMPLIANCE
              </span>
              <span className="text-[10px] font-mono text-[#666]">TREASURY CELL</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Finance Desk: {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              Statutory Fee Collection & Scholarship Disbursement at{' '}
              <span className="font-semibold text-[#141414]">{currentCollege.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              State Treasury AG Bihar Audit Passed
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(20,20,20,0.06)]">
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Term Collection</div>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">₹6,84,000</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">380 Students Cleared</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Scholarship Claims</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">
              {scholarshipQueue.length - verifiedScholarshipIds.length} Pending
            </div>
            <div className="text-[11px] text-[#2563eb] font-mono mt-1">DRCC & PMS Portals</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Upcoming SBTE Exam Fee</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">₹1,500 / Student</div>
            <div className="text-[11px] text-[#666] font-mono mt-1">Portal opens Nov 01</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Fee Dues Rate</div>
            <div className="text-2xl font-serif font-bold text-emerald-700 mt-0.5">96.8% Paid</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">Lowest Dues in Division</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'collections', label: '01 // Reconciled Fee Transactions' },
          { id: 'scholarships', label: '02 // Scholarship & Credit Card Approvals' },
          { id: 'pending_dues', label: '03 // Pending Dues Demand Notice' },
          { id: 'audit', label: '04 // State Audit & Treasury Register' },
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

      {/* Tab 1: Collections */}
      {activeTab === 'collections' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-serif font-bold text-lg text-[#141414]">
              Recent Academic Fee Receipts
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roll, receipt, or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F7F4] border border-[rgba(20,20,20,0.12)] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F4] border-b border-[rgba(20,20,20,0.08)] font-mono text-[#666]">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Student & Roll</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(20,20,20,0.06)]">
                {recentTransactions
                  .filter((t) => t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || t.rollNo.includes(searchQuery))
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-[#F8F7F4]/50">
                      <td className="p-3 font-mono text-[#2563eb] font-semibold">{t.receiptNo}</td>
                      <td className="p-3 font-semibold text-[#141414]">
                        <div>{t.studentName}</div>
                        <div className="text-[10px] font-mono text-[#666]">{t.rollNo}</div>
                      </td>
                      <td className="p-3 text-[#666]">{t.branch}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{t.amount}</td>
                      <td className="p-3 text-[#666]">{t.mode}</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">{t.status}</td>
                      <td className="p-3 text-right">
                        <button className="text-[11px] text-[#2563eb] font-semibold hover:underline flex items-center gap-1 justify-end">
                          <Download className="w-3 h-3" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Scholarships */}
      {activeTab === 'scholarships' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-1">
            Government Scholarship & Student Credit Card Verification Queue
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Verify institutional bona-fide and fee certificates for Post-Matric Scholarship (PMS) & Bihar Student Credit Card (MNSSBY).
          </p>

          <div className="space-y-4">
            {scholarshipQueue.map((sch) => {
              const isCleared = verifiedScholarshipIds.includes(sch.id);
              return (
                <div
                  key={sch.id}
                  className={`p-4 border transition ${
                    isCleared ? 'bg-emerald-50/50 border-emerald-300' : 'bg-[#F8F7F4] border-[rgba(20,20,20,0.08)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#141414]">{sch.studentName}</span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 border">
                          Roll: {sch.rollNo}
                        </span>
                        <span className="text-[11px] text-[#2563eb] font-semibold">{sch.branch}</span>
                      </div>
                      <div className="text-xs text-[#141414] mt-1.5 font-medium">
                        Scheme: <span className="font-bold">{sch.scheme}</span>
                      </div>
                      <div className="text-xs font-mono text-emerald-700 font-bold mt-0.5">
                        Claimed Amount: {sch.amount} · Doc: {sch.docRef}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCleared ? (
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Institutional Seal Issued & Uploaded
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClearScholarship(sch.id)}
                          className="btn-pill text-xs px-3 py-1.5 bg-[#2563eb] text-white flex items-center gap-1.5 font-bold cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Issue Fee Demand Slip
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

      {/* Tab 3: Dues Notice */}
      {activeTab === 'pending_dues' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-2">
            Generate Pending Dues Circular
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Only 12 students out of 380 have pending semester fee balance.
          </p>
          <div className="p-4 bg-[#F8F7F4] border flex items-center justify-between">
            <span className="text-xs font-semibold text-[#141414]">
              Broadcast SMS / App notification to 12 students with unpaid fee dues
            </span>
            <button className="btn-pill text-xs px-3 py-1.5 bg-amber-600 text-white font-bold cursor-pointer">
              Send Gentle Reminder
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Audit */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
            Financial Ledger & Annual Reconciliation
          </h3>
          <div className="text-xs text-[#666] space-y-2">
            <p>• Treasury Account: SBTE Government Polytechnic Gulzarbagh Collection A/C #30819284910.</p>
            <p>• Daily reconciliation synced with SBI e-Collect gateway at 06:00 PM every working day.</p>
          </div>
        </div>
      )}
    </div>
  );
};
