import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { VerificationAuditEvent, VerificationAuditCategory, User } from '../types';
import { AuditLogService } from '../services/auditLogService';
import {
  ShieldCheck,
  Lock,
  Terminal,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
  FileText,
  Hash,
  Database,
  Cpu,
  Fingerprint,
  Mail,
  Phone,
  Shield,
  Layers,
} from 'lucide-react';

interface SecurityAuditLogProps {
  /** Optional custom user to inspect. If not provided, inspects currentUser */
  targetUser?: User;
  /** Whether the log is rendered inside a modal or inline */
  variant?: 'embedded' | 'standalone' | 'compact';
  /** Max blocks to show initially */
  initialLimit?: number;
  /** Callback to trigger email verification modal */
  onTriggerEmailVerification?: () => void;
  /** Callback to trigger phone verification modal */
  onTriggerPhoneVerification?: () => void;
}

export const SecurityAuditLog: React.FC<SecurityAuditLogProps> = ({
  targetUser,
  variant = 'standalone',
  initialLimit,
  onTriggerEmailVerification,
  onTriggerPhoneVerification,
}) => {
  const { currentUser, openEmailVerification, openPhoneOtpVerification } = useApp();
  const activeUser = targetUser || currentUser;

  const [auditLogs, setAuditLogs] = useState<VerificationAuditEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<{
    valid: boolean;
    timestamp: string;
    total: number;
  } | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedLedger, setCopiedLedger] = useState(false);

  // Load user audit logs
  const loadLogs = () => {
    const logs = AuditLogService.getUserAuditLogs(activeUser.id);
    setAuditLogs(logs);
    const integrity = AuditLogService.verifyChainIntegrity(logs);
    setIntegrityStatus({
      valid: integrity.isValid,
      timestamp: integrity.verifiedAt,
      total: integrity.totalBlocks,
    });
  };

  useEffect(() => {
    loadLogs();

    const handleUpdate = (e: any) => {
      if (e.detail?.userId === activeUser.id) {
        loadLogs();
      }
    };

    window.addEventListener('aavrit-audit-log-updated', handleUpdate);
    return () => {
      window.removeEventListener('aavrit-audit-log-updated', handleUpdate);
    };
  }, [activeUser.id]);

  const handleVerifyChain = () => {
    setIsVerifyingIntegrity(true);
    setTimeout(() => {
      const integrity = AuditLogService.verifyChainIntegrity(auditLogs);
      setIntegrityStatus({
        valid: integrity.isValid,
        timestamp: new Date().toLocaleTimeString(),
        total: integrity.totalBlocks,
      });
      setIsVerifyingIntegrity(false);
    }, 600);
  };

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportLedger = (format: 'text' | 'json') => {
    const content = AuditLogService.exportAuditTrail(auditLogs, format);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${activeUser.id}-${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLedgerToClipboard = () => {
    const text = AuditLogService.exportAuditTrail(auditLogs, 'text');
    navigator.clipboard?.writeText(text);
    setCopiedLedger(true);
    setTimeout(() => setCopiedLedger(false), 2000);
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    let result = [...auditLogs];

    if (selectedCategory !== 'all') {
      result = result.filter((log) => log.eventType === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (log) =>
          log.title.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          log.hash.toLowerCase().includes(q) ||
          log.nodeId.toLowerCase().includes(q) ||
          log.formattedTime.toLowerCase().includes(q)
      );
    }

    // Sort descending by block number (newest first)
    return result.sort((a, b) => b.blockNumber - a.blockNumber);
  }, [auditLogs, selectedCategory, searchQuery]);

  const displayedLogs = initialLimit ? filteredLogs.slice(0, initialLimit) : filteredLogs;

  const categories = [
    { id: 'all', label: 'ALL_EVENTS' },
    { id: 'email_verified', label: 'EMAIL' },
    { id: 'phone_otp_verified', label: 'MOBILE_OTP' },
    { id: 'institutional_seal', label: 'REGISTRAR_SEAL' },
    { id: 'doc_ocr_verified', label: 'OCR_ID_CARD' },
    { id: 'account_roster_matched', label: 'ROSTER_MATCH' },
  ];

  return (
    <div className="font-mono text-black bg-[#fafafa] border border-black rounded-none shadow-none text-xs selection:bg-black selection:text-white">
      {/* Technical Terminal Top Bar */}
      <div className="bg-black text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-black">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-none animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-xs uppercase text-white font-mono">
                [SEC_AUDIT_LOG // SYSTEM_LEDGER]
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 border border-zinc-700">
                CHAIN: SHA-256 IMMUTABLE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight">
              SUBJECT: {activeUser.fullName} // UID: {activeUser.id} // TENANT: GPP-PATNA
            </p>
          </div>
        </div>

        {/* Chain Integrity Pulse Badge */}
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 px-2.5 py-1 text-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              INTEGRITY: {integrityStatus?.valid ? '100% VALID' : 'ANOMALY DETECTED'}
            </span>
            <span className="text-zinc-500">//</span>
            <span>{auditLogs.length} BLOCKS COMMITTED</span>
          </div>

          <button
            onClick={handleVerifyChain}
            disabled={isVerifyingIntegrity}
            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Re-verify cryptographic SHA-256 hash chaining"
          >
            <RefreshCw className={`w-3 h-3 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
            <span>{isVerifyingIntegrity ? 'VERIFYING...' : 'CHECK CHAIN'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter Pills */}
      <div className="p-3 bg-white border-b border-black/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 text-[10px] uppercase font-bold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white border-black'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
                }`}
              >
                [{cat.label}]
              </button>
            );
          })}
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-zinc-500" />
            <input
              type="text"
              placeholder="SEARCH HASH / ACTOR / EVENT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 pl-7 pr-2 py-1 text-[11px] font-mono uppercase focus:outline-none focus:border-black placeholder:text-zinc-400"
            />
          </div>

          <button
            onClick={() => handleExportLedger('text')}
            className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-black border border-black text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
            title="Download immutable ledger audit file"
          >
            <Download className="w-3 h-3" />
            <span>EXPORT</span>
          </button>

          <button
            onClick={handleCopyLedgerToClipboard}
            className="px-2.5 py-1 bg-white hover:bg-zinc-100 text-black border border-black text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
            title="Copy audit log trail to clipboard"
          >
            {copiedLedger ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLedger ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>
      </div>

      {/* Main Ledger Content: Granular Monochromatic Block Feed */}
      <div className="divide-y divide-black/15 bg-white">
        {displayedLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-mono space-y-2">
            <Terminal className="w-6 h-6 mx-auto text-zinc-400" />
            <div>// NO VERIFICATION LOG BLOCKS MATCHED QUERY</div>
            <div className="text-[10px] text-zinc-400">
              FILTER: {selectedCategory.toUpperCase()} | SEARCH: "{searchQuery}"
            </div>
          </div>
        ) : (
          displayedLogs.map((log) => {
            const isExpanded = expandedBlockId === log.id;
            const isLatest = log.blockNumber === auditLogs.length;

            return (
              <div
                key={log.id}
                className={`p-3.5 hover:bg-zinc-50/80 transition font-mono text-xs ${
                  isLatest ? 'bg-zinc-50/40' : ''
                }`}
              >
                {/* Block Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Block Number Tag */}
                    <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold tracking-wider">
                      BLOCK #{String(log.blockNumber).padStart(3, '0')}
                    </span>

                    {/* Event Type Monochromatic Pill */}
                    <span className="bg-zinc-100 border border-zinc-400 text-black px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                      [{log.eventType.replace(/_/g, ' ')}]
                    </span>

                    {/* Event Title */}
                    <span className="font-bold text-black text-xs tracking-tight">
                      {log.title}
                    </span>

                    {isLatest && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-400 px-1 py-0.2 font-bold uppercase">
                        [LATEST HEAD]
                      </span>
                    )}
                  </div>

                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 sm:text-right">
                    <span className="font-mono bg-zinc-100 px-1.5 py-0.5 border border-zinc-300 text-zinc-800">
                      {log.formattedDate} @ {log.formattedTime}
                    </span>
                    <span className="text-zinc-500 font-semibold">[COMMITTED]</span>
                  </div>
                </div>

                {/* Event Description */}
                <p className="mt-2 text-[11px] text-zinc-800 leading-relaxed font-mono">
                  {log.details}
                </p>

                {/* Actor, Node, and Gateway Info */}
                <div className="mt-2 pt-2 border-t border-dashed border-zinc-200 flex flex-wrap items-center justify-between gap-y-1 gap-x-4 text-[10px] text-zinc-600">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      <strong className="text-zinc-900">ACTOR:</strong> {log.actor}
                    </span>
                    <span>//</span>
                    <span>
                      <strong className="text-zinc-900">NODE:</strong> {log.nodeId}
                    </span>
                    {log.ipAddress && (
                      <>
                        <span>//</span>
                        <span>
                          <strong className="text-zinc-900">IP:</strong> {log.ipAddress}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Hashes and Expand Details Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyHash(log.hash, log.id)}
                      className="px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 text-[9px] flex items-center gap-1 cursor-pointer"
                      title="Copy block SHA hash"
                    >
                      <Hash className="w-2.5 h-2.5 text-zinc-500" />
                      <span>{log.hash.slice(0, 10)}...</span>
                      {copiedHash === log.id && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => setExpandedBlockId(isExpanded ? null : log.id)}
                      className="text-[10px] text-zinc-800 underline hover:text-black cursor-pointer flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? '[- HIDE RAW]' : '[+ RAW DATA]'}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Raw Monochromatic Metadata Box */}
                {isExpanded && (
                  <div className="mt-2.5 p-3 bg-zinc-900 text-zinc-200 text-[10px] border border-black space-y-1.5 overflow-x-auto">
                    <div className="text-zinc-400 uppercase font-bold text-[9px] border-b border-zinc-800 pb-1 flex justify-between">
                      <span>RAW METADATA LEDGER PAYLOAD (JSON)</span>
                      <span>BLOCK HASH: {log.hash}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <div>
                          <strong className="text-zinc-400">PREVIOUS BLOCK HASH:</strong>{' '}
                          <span className="text-amber-300 font-mono">{log.prevHash}</span>
                        </div>
                        <div>
                          <strong className="text-zinc-400">CURRENT BLOCK HASH:</strong>{' '}
                          <span className="text-emerald-300 font-mono">{log.hash}</span>
                        </div>
                        <div>
                          <strong className="text-zinc-400">TIMESTAMP (ISO):</strong>{' '}
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                      <div>
                        <div>
                          <strong className="text-zinc-400">SEAL / CERT CODE:</strong>{' '}
                          <span className="text-white">
                            {log.metadata.sealCode || log.metadata.securityToken || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <strong className="text-zinc-400">VALIDATION METHOD:</strong>{' '}
                          <span>{log.metadata.authMethod || 'OFFICIAL_CREDENTIAL_KEY'}</span>
                        </div>
                        <div>
                          <strong className="text-zinc-400">CONFIDENCE:</strong>{' '}
                          <span>{log.metadata.confidenceScore ? `${(log.metadata.confidenceScore * 100).toFixed(1)}%` : '100% CERTIFIED'}</span>
                        </div>
                      </div>
                    </div>
                    <pre className="mt-1 pt-1 border-t border-zinc-800 text-[9px] text-zinc-400 whitespace-pre-wrap">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Monochromatic Technical Footer & Live Verification Actions */}
      <div className="bg-[#f0f0f0] p-3 border-t border-black text-[10px] flex flex-col md:flex-row items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2 text-zinc-700">
          <Lock className="w-3.5 h-3.5 text-black" />
          <span>
            IMMUTABILITY GUARANTEE: APPEND-ONLY CHAIN // TAMPER REJECT PROTOCOL ACTIVE
          </span>
        </div>

        {/* Quick Verification Triggers if user is missing verification */}
        <div className="flex items-center gap-2">
          {!activeUser.emailVerified && (
            <button
              onClick={onTriggerEmailVerification || openEmailVerification}
              className="px-2 py-1 bg-black text-white hover:bg-zinc-800 font-bold text-[10px] cursor-pointer flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-white" />
              <span>[TRIGGER EMAIL VERIFICATION]</span>
            </button>
          )}

          {!activeUser.phoneVerified && (
            <button
              onClick={onTriggerPhoneVerification || (() => openPhoneOtpVerification())}
              className="px-2 py-1 bg-black text-white hover:bg-zinc-800 font-bold text-[10px] cursor-pointer flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-white" />
              <span>[TRIGGER MOBILE OTP]</span>
            </button>
          )}

          <span className="text-zinc-400">|</span>
          <span className="text-zinc-500">SBTE BIHAR TRUST LEDGER v2.4</span>
        </div>
      </div>
    </div>
  );
};
