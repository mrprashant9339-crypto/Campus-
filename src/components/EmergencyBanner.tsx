import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, CheckCircle2, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const { emergencyNotice, acknowledgeAnnouncement } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!emergencyNotice || dismissed) return null;

  return (
    <div className="bg-[#fff5f5] border-b border-[#dc2626] px-6 sm:px-10 lg:px-14 py-3.5 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-1 border border-[#dc2626] text-[#dc2626] bg-[#dc2626]/10 shrink-0 mt-0.5">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#dc2626] font-bold">
                [CRITICAL EMERGENCY BROADCAST]
              </span>
              <span className="text-[10px] font-mono text-[#141414]/50">
                · SIGNER: {emergencyNotice.authorName.toUpperCase()} ({emergencyNotice.authorRole.toUpperCase()})
              </span>
            </div>
            <h4 className="font-serif text-lg font-bold text-[#141414] mt-0.5 tracking-tight">
              {emergencyNotice.title}
            </h4>
            <p className="text-xs text-[#141414]/80 mt-0.5 leading-relaxed font-sans">
              {emergencyNotice.body}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {emergencyNotice.requiresAck && !emergencyNotice.acknowledgedByMe ? (
            <button
              onClick={() => acknowledgeAnnouncement(emergencyNotice.id)}
              className="btn-pill warning text-[9px] py-1 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACKNOWLEDGE DIRECTIVE</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-[#2563eb] flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>ACKNOWLEDGED</span>
            </span>
          )}

          <button
            onClick={() => setDismissed(true)}
            title="Dismiss notice"
            className="p-1 text-[#141414]/60 hover:text-[#dc2626] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
