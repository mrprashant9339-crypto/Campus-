import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Users,
  Award,
  Calendar,
  MessageSquare,
  Briefcase,
  CheckCircle2,
  Heart,
  Globe,
  ExternalLink,
  Send,
  Star,
  Check,
} from 'lucide-react';

export const AlumniDashboard: React.FC = () => {
  const { currentUser, currentCollege } = useApp();
  const [activeTab, setActiveTab] = useState<'mentorship' | 'network' | 'opportunities' | 'giving'>('mentorship');
  const [answeredRequestIds, setAnsweredRequestIds] = useState<string[]>([]);
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({});

  const mentorshipRequests = [
    {
      id: 'req-01',
      studentName: 'Prashant Kumar',
      rollNo: 'ME2024001',
      batch: '2023–2026',
      branch: 'Mechanical Engineering (3rd Sem)',
      topic: 'Guidance on Tata Motors DET Campus Interview & CAD Portfolio',
      message:
        'Respected Vikash bhaiya, I have built a Solar Rover project and hold CSWA certification. How should I prepare my portfolio for the Tata Motors Diploma Engineer Trainee (DET) drive?',
      date: 'Today, 11:30 AM',
    },
    {
      id: 'req-02',
      studentName: 'Sneha Kumari',
      rollNo: 'CSE2024005',
      batch: '2023–2026',
      branch: 'Computer Science & Engineering',
      topic: 'Transitioning from Polytechnic to B.Tech Lateral Entry (BCECE LEET)',
      message:
        'Wanted guidance on mathematics syllabus and recommended reference books for BCECE LEET examination.',
      date: 'Yesterday, 06:15 PM',
    },
  ];

  const batchmates = [
    {
      name: 'Rohan Verma',
      batch: 'Batch of 2024',
      branch: 'Mechanical Engg',
      currentOrg: 'Larsen & Toubro (L&T Construction)',
      designation: 'Junior Engineer',
      location: 'Patna / Mumbai',
    },
    {
      name: 'Pooja Anand',
      batch: 'Batch of 2024',
      branch: 'Electrical Engg',
      currentOrg: 'BSPHCL (Bihar Power Holding Corp)',
      designation: 'Sub-Station Operator',
      location: 'Muzaffarpur',
    },
    {
      name: 'Manish Pandey',
      batch: 'Batch of 2024',
      branch: 'Civil Engg',
      currentOrg: 'BCECE Lateral Entry Scholar',
      designation: 'Pursuing B.Tech @ MIT Muzaffarpur',
      location: 'Muzaffarpur',
    },
  ];

  const handleSendMentorshipReply = (id: string) => {
    if (!replyText[id]?.trim()) return;
    setAnsweredRequestIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[rgba(20,20,20,0.08)] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold border border-indigo-200">
                ALUMNI MENTORSHIP & LEGACY VAULT
              </span>
              <span className="text-[10px] font-mono text-[#666]">CLASS OF 2024</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#141414]">
              Welcome back, {currentUser.fullName}
            </h1>
            <p className="text-sm text-[#666] mt-1">
              Plant Engineer @ <span className="font-semibold text-[#141414]">Tata Motors</span> · Alumnus of{' '}
              {currentCollege.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-amber-50 text-amber-800 px-3 py-1.5 border border-amber-200 font-semibold flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              Verified Senior Mentor · 4.9/5 (18 mentees)
            </span>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(20,20,20,0.06)]">
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Junior Inquiries</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">
              {mentorshipRequests.length - answeredRequestIds.length} Pending
            </div>
            <div className="text-[11px] text-[#2563eb] font-mono mt-1">Direct Student Chats</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Alumni Network</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">1,420+</div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1">Connected across India</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Job Referrals</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">6 Open</div>
            <div className="text-[11px] text-[#666] font-mono mt-1">For 2025/2026 Diploma Batches</div>
          </div>
          <div className="p-3 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
            <div className="text-[10px] font-mono text-[#666] uppercase">Next Alumni Meet</div>
            <div className="text-2xl font-serif font-bold text-[#141414] mt-0.5">Nov 28</div>
            <div className="text-[11px] text-purple-600 font-mono mt-1">Annual SBTE Tech-Conclave</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(20,20,20,0.08)] bg-white px-4 gap-6 text-xs font-mono">
        {[
          { id: 'mentorship', label: '01 // Junior Mentorship Desk' },
          { id: 'network', label: '02 // Polytechnic Alumni Mesh' },
          { id: 'opportunities', label: '03 // Post Job / Referral' },
          { id: 'giving', label: '04 // Campus Grant & Sponsoring' },
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

      {/* Tab 1: Junior Mentorship */}
      {activeTab === 'mentorship' && (
        <div className="space-y-4">
          <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
            <h3 className="font-serif font-bold text-base text-[#141414] mb-1">
              Active Junior Guidance Queries
            </h3>
            <p className="text-xs text-[#666] mb-4">
              Enrolled students reaching out for career mentoring, project feedback, and campus interview tips.
            </p>

            <div className="space-y-4">
              {mentorshipRequests.map((req) => {
                const isAnswered = answeredRequestIds.includes(req.id);
                return (
                  <div
                    key={req.id}
                    className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#141414]">{req.studentName}</span>
                          <span className="text-[10px] font-mono text-[#666] bg-white px-1.5 py-0.5 border">
                            {req.rollNo}
                          </span>
                          <span className="text-[11px] text-[#2563eb] font-semibold">{req.branch}</span>
                        </div>
                        <div className="text-xs font-bold text-[#141414] mt-1.5">{req.topic}</div>
                      </div>
                      <span className="text-[10px] font-mono text-[#666]">{req.date}</span>
                    </div>

                    <p className="text-xs text-[#444] mt-2 bg-white p-3 border border-[rgba(20,20,20,0.06)] leading-relaxed">
                      "{req.message}"
                    </p>

                    {isAnswered ? (
                      <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Reply sent to {req.studentName}'s student inbox! Mentorship logged.
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type advice or offer Google Meet / phone time..."
                          value={replyText[req.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [req.id]: e.target.value })}
                          className="flex-1 text-xs bg-white border border-[rgba(20,20,20,0.12)] px-3 py-2 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSendMentorshipReply(req.id)}
                          className="btn-pill text-xs px-3 py-2 bg-[#2563eb] text-white flex items-center gap-1.5 font-bold cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send Guidance
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Alumni Mesh */}
      {activeTab === 'network' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-3">
            Polytechnic Alumni Network Directory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batchmates.map((b, i) => (
              <div key={i} className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)]">
                <div className="font-bold text-sm text-[#141414]">{b.name}</div>
                <div className="text-[11px] text-[#666] font-mono mt-0.5">
                  {b.branch} · {b.batch}
                </div>
                <div className="mt-2 text-xs font-semibold text-[#2563eb]">{b.currentOrg}</div>
                <div className="text-[11px] text-[#444]">{b.designation}</div>
                <div className="text-[10px] text-[#666] font-mono mt-2">📍 {b.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Opportunities */}
      {activeTab === 'opportunities' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-2">
            Post an Industry Job or Internship Referral
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Directly connect your current employer with high-performing diploma final year students.
          </p>
          <div className="p-4 bg-[#F8F7F4] border border-[rgba(20,20,20,0.06)] space-y-3">
            <input
              type="text"
              placeholder="Role Title (e.g. Graduate Trainee Engineer - Quality Assurance)"
              className="w-full text-xs bg-white border border-[rgba(20,20,20,0.12)] p-2.5 focus:outline-none"
            />
            <textarea
              rows={3}
              placeholder="Eligibility (Eligible Branches, min CGPA, required CAD / Python skills)..."
              className="w-full text-xs bg-white border border-[rgba(20,20,20,0.12)] p-2.5 focus:outline-none"
            />
            <button className="btn-pill text-xs px-4 py-2 bg-[#2563eb] text-white font-bold cursor-pointer">
              Broadcast to College Placement Cell
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Giving */}
      {activeTab === 'giving' && (
        <div className="bg-white border border-[rgba(20,20,20,0.08)] p-5">
          <h3 className="font-serif font-bold text-base text-[#141414] mb-2">
            Support Student Innovation Projects
          </h3>
          <p className="text-xs text-[#666] mb-4">
            Alumni sponsorships fund microcontroller dev-boards, 3D printing filaments, and robotic chassis for state hackathons.
          </p>
          <div className="p-4 bg-[#F8F7F4] border border-amber-200 bg-amber-50/50 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-amber-950">Active Campaign: Solar Seed Sowing Rover</div>
              <div className="text-[11px] text-amber-800 mt-0.5">Mechanical 3rd Sem Student Capstone · Target: ₹15,000 for Lithium Battery Pack</div>
            </div>
            <button className="btn-pill text-xs px-3 py-1.5 bg-amber-600 text-white font-bold">
              Contribute ₹1,000
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
