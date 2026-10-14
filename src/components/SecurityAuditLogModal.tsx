import React from 'react';
import { SecurityAuditLog } from './SecurityAuditLog';
import { User } from '../types';
import { X, ShieldCheck, Terminal, Maximize2 } from 'lucide-react';

interface SecurityAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User;
  onTriggerEmailVerification?: () => void;
  onTriggerPhoneVerification?: () => void;
}

export const SecurityAuditLogModal: React.FC<SecurityAuditLogModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onTriggerEmailVerification,
  onTriggerPhoneVerification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border-2 border-black shadow-2xl overflow-hidden font-mono">
        {/* Top Control Bar */}
        <div className="bg-black text-white px-4 py-3 flex items-center justify-between border-b border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">
              TERMINAL // SECURITY AUDIT LOG & IMMUTABLE TRUST LEDGER
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto">
          <SecurityAuditLog
            targetUser={targetUser}
            variant="standalone"
            onTriggerEmailVerification={() => {
              onClose();
              if (onTriggerEmailVerification) onTriggerEmailVerification();
            }}
            onTriggerPhoneVerification={() => {
              onClose();
              if (onTriggerPhoneVerification) onTriggerPhoneVerification();
            }}
          />
        </div>
      </div>
    </div>
  );
};
