import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  ShieldAlert,
  BookOpen,
  FileText,
  Calendar,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  time: string;
  tags?: string[];
}

export const CampusCopilotModal: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    currentUser,
    currentRole,
    currentCollege,
    assignments,
    notes,
    announcements,
    verifications,
  } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'copilot',
      text: `नमस्ते ${currentUser.fullName}! मैं आपका AAVRIT Campus Copilot हूँ। मैं आपके वर्तमान रोल (${currentRole.toUpperCase()}) और ${currentCollege.name} के प्राइवेट डेटाबेस के आधार पर अधिकृत उत्तर देने के लिए तैयार हूँ।`,
      time: 'Just now',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isCopilotOpen) return null;

  // Role-specific sample prompt recommendations
  const studentPrompts = [
    'मेरे pending assignments क्या हैं?',
    'Thermodynamics Unit 1 के notes कहाँ हैं?',
    'आज की classes और lab का schedule क्या है?',
    'Upcoming technical events कौन से हैं?',
  ];

  const teacherPrompts = [
    'Section ME-3A के लिए assignment reminder announcement ड्राफ्ट करो।',
    'Thermodynamics Second Law पर 3 numerical questions बनाओ।',
    'मेरी क्लास में कितने छात्रों ने Assignment 2 जमा किया है?',
  ];

  const adminPrompts = [
    'वर्तमान में कितने student verification requests pending हैं?',
    'College की attendance और active student metrics का सारांश दें।',
    'Emergency notice broadcast करने के क्या नियम हैं?',
  ];

  const activePrompts =
    currentRole === 'student'
      ? studentPrompts
      : currentRole === 'teacher' || currentRole === 'hod'
      ? teacherPrompts
      : adminPrompts;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: 'Now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('assignment') || qLower.includes('ड्यू') || qLower.includes('due') || qLower.includes('pending')) {
        if (currentRole === 'student') {
          reply = `📋 **आपके Pending Assignments (${currentCollege.name}):**\n\n1. **Thermodynamics (ME301) — Assignment 2**\n   - विषय: Second Law & Carnot Efficiency\n   - अंतिम तिथि: **18 October 2024 (11:59 PM)**\n   - स्थिति: आपका submission समीक्षाधीन है (18/20 Marks प्राप्त)।\n\n2. **Engineering Mechanics (ME302) — Assignment 1**\n   - विषय: Truss Equilibrium & Method of Sections\n   - अंतिम तिथि: **22 October 2024**\n   - स्थिति: अभी जमा नहीं हुआ है (Pending)।`;
        } else {
          reply = `📊 **ME-3A Assignments Overview (Faculty View):**\n- **Assignment 2 (Thermodynamics):** 46 में से 34 छात्रों ने जमा कर दिया है (74% submission rate)।\n- 22 उत्तर पुस्तिकाओं की ग्रेडिंग पूरी हो चुकी है। 12 कापियां जांची जानी शेष हैं।`;
        }
      } else if (qLower.includes('note') || qLower.includes('नोट्स') || qLower.includes('thermodynamics') || qLower.includes('lami')) {
        reply = `📚 **संबंधित Verified Notes (Notes Vault से):**\n\n1. **Thermodynamics — Unit 1 Notes & First Law Formulary** (2.4 MB PDF)\n   - फैकल्टी: Mr. Suresh Prasad द्वारा अधिकृत\n   - कवर: Zeroth & First Law, Closed System Energy Balance.\n\n2. **Engineering Mechanics — Unit 2 Static Equilibrium (Lami's Theorem)** (4.8 MB PDF)\n   - फैकल्टी: Ms. Priya Sharma\n   - कवर: Lami Theorem numericals & FBD derivations.\n\n*(आप 'Notes Vault' टैब में जाकर सीधे 1-क्लिक से PDF डाउनलोड कर सकते हैं।)*`;
      } else if (qLower.includes('schedule') || qLower.includes('class') || qLower.includes('आज') || qLower.includes('टाइम')) {
        reply = `🕐 **आज की कक्षाएं (ME 3rd Sem, Section A):**\n- **10:00 AM - 11:00 AM:** Thermodynamics (Room 204 • Mr. Suresh Prasad)\n- **12:00 PM - 02:00 PM:** Mechanics Practical Lab (Lab 2 • Ms. Priya Sharma)\n- **03:00 PM:** Coding & Robotics Club Meeting (Workshop Block)`;
      } else if (qLower.includes('announcement') || qLower.includes('ड्राफ्ट') || qLower.includes('draft')) {
        reply = `📢 **ड्राफ्ट किया गया Announcement:**\n\n**Title:** Reminder: Thermodynamics Assignment 2 Submission\n**Priority:** High (Orange)\n**Target:** ME 3rd Sem — Section A\n\n"सभी छात्र ध्यान दें कि असाइनमेंट 2 (Second Law of Thermodynamics) की अंतिम तिथि 18 अक्टूबर रात 11:59 बजे तक है। कृपया अपने हस्तलिखित समाधान की स्पष्ट PDF AAVRIT पोर्टल पर अपलोड करें।"\n\n*(क्या आप इसे अभी Teacher Console से सीधे पब्लिश करना चाहते हैं?)*`;
      } else if (qLower.includes('verification') || qLower.includes('pending') || qLower.includes('सत्यापन')) {
        const pendingCount = verifications.filter((v) => v.status === 'pending').length;
        reply = `🛡️ **Verification Backlog Status (${currentCollege.name}):**\n- कुल लंबित आवेदन: **${pendingCount} छात्र**\n- उच्च OCR स्कोर (>90%): Rahul Singh (ME 3A) एवं Aman Verma (ME 3B)\n- औसत सत्यापन समय: <24 घंटे\n\n*(आप Admin Console > Verification Queue में जाकर दस्तावेज़ देख सकते हैं और 1-क्लिक से Approve कर सकते हैं।)*`;
      } else if (qLower.includes('event') || qLower.includes('fest') || qLower.includes('इवेंट')) {
        reply = `🎉 **Upcoming Campus Events:**\n\n1. **Tech Fest 2025 — Innovate for Tomorrow**\n   - आयोजक: GPP Student Tech Council\n   - दिनांक: 14–15 Feb 2025 (Main Auditorium)\n   - स्थिति: आपका रजिस्ट्रेशन सुरक्षित है (QR Ticket: GPP-TF25-TICK-00194)\n\n2. **Inter-College Drone & Rover Sprint (NIT Patna)**\n   - Layer B Network Event (₹50,000 Prize Pool)\n   - रजिस्ट्रेशन खुला है।`;
      } else {
        reply = `AAVRIT Campus Copilot ने आपके प्रश्न का विश्लेषण किया है: "${query}"।\n\nसुरक्षा प्रोटोकॉल के तहत, यह जानकारी आपके कॉलेज (${currentCollege.name}) के टेनेंट RLS नियमों और आपके वर्तमान रोल (${currentRole.toUpperCase()}) के अनुसार फ़िल्टर की गई है। क्या आप इस संबंध में कोई विशिष्ट दस्तावेज़ या रिकॉर्ड देखना चाहते हैं?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          sender: 'copilot',
          text: reply,
          time: 'Just now',
        },
      ]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[620px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">AAVRIT Campus Copilot</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                  RBAC Permission-Aware AI
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Acting for: <strong className="text-white">{currentUser.fullName}</strong> ({currentRole.toUpperCase()}) • {currentCollege.code}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCopilotOpen(false)}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {m.sender === 'user' ? 'ME' : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1.5 ${
                    m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic pl-11">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
              <span>Scanning authorized tenant database...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
            Suggested Prompts for your Role ({currentRole}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Copilot anything about your courses, assignments, fests, or timetable..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
