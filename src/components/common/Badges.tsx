import React, { useState } from 'react';
import { AchievementBadge, BadgeRarity, BadgeCategory } from '../../types';
import {
  Award,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  X,
  Star,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface BadgesProps {
  badges: AchievementBadge[];
  variant?: 'chip' | 'card' | 'grid';
  maxChips?: number;
  interactive?: boolean;
  className?: string;
  showCategoryFilters?: boolean;
}

export const getRarityTheme = (rarity: BadgeRarity) => {
  switch (rarity) {
    case 'diamond':
      return {
        pillBg: 'bg-gradient-to-r from-cyan-50 via-indigo-50 to-purple-50 text-indigo-900 border-indigo-200/80',
        ring: 'ring-indigo-400/40',
        cardBg: 'from-slate-900 via-indigo-950 to-purple-950 text-white border-indigo-500/40',
        glow: 'shadow-indigo-500/20',
        badgeColor: 'text-cyan-400',
        tagBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
        label: 'Diamond Tier',
      };
    case 'gold':
      return {
        pillBg: 'bg-amber-50 text-amber-900 border-amber-300',
        ring: 'ring-amber-400/40',
        cardBg: 'from-amber-950 via-slate-900 to-amber-900 text-white border-amber-500/40',
        glow: 'shadow-amber-500/20',
        badgeColor: 'text-amber-400',
        tagBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
        label: 'Gold Tier',
      };
    case 'silver':
      return {
        pillBg: 'bg-slate-100 text-slate-800 border-slate-300',
        ring: 'ring-slate-300',
        cardBg: 'from-slate-800 via-slate-900 to-slate-950 text-white border-slate-400/30',
        glow: 'shadow-slate-500/10',
        badgeColor: 'text-slate-300',
        tagBg: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
        label: 'Silver Tier',
      };
    case 'bronze':
    default:
      return {
        pillBg: 'bg-orange-50 text-orange-900 border-orange-200',
        ring: 'ring-orange-300',
        cardBg: 'from-stone-900 via-stone-950 to-amber-950 text-white border-orange-500/30',
        glow: 'shadow-orange-500/10',
        badgeColor: 'text-amber-500',
        tagBg: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
        label: 'Bronze Tier',
      };
  }
};

export const BadgeDetailModal: React.FC<{
  badge: AchievementBadge | null;
  onClose: () => void;
}> = ({ badge, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!badge) return null;

  const theme = getRarityTheme(badge.rarity);

  const copyCredential = () => {
    navigator.clipboard.writeText(badge.credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className={`p-6 bg-gradient-to-br ${theme.cardBg} relative overflow-hidden text-white`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${theme.tagBg}`}>
              {theme.label}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {badge.category} Merit
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 shadow-md">
              {badge.icon}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>{badge.name}</span>
                {badge.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 font-medium leading-snug">
                {badge.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Credential Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Institutional Merit Criteria
            </h4>
            <p className="text-slate-600 mt-1 leading-relaxed">
              {badge.description}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Issuing Body:</span>
              <strong className="text-slate-900 text-right">{badge.issuer}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date Conferred:</span>
              <strong className="text-slate-900">{badge.dateEarned}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Verification Status:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Digitally Sealed & Verified</span>
              </span>
            </div>
          </div>

          {/* Cryptographic Credential Identifier */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Permanent Credential ID:
            </span>
            <div className="mt-1 p-2.5 bg-slate-100 border border-slate-300/80 rounded-xl flex items-center justify-between font-mono text-[11px] text-slate-800">
              <span className="truncate">{badge.credentialId}</span>
              <button
                onClick={copyCredential}
                className="ml-2 text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            AAVRIT Academic Trust Store
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export const Badges: React.FC<BadgesProps> = ({
  badges,
  variant = 'chip',
  maxChips = 2,
  interactive = true,
  className = '',
  showCategoryFilters = false,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'all'>('all');

  if (!badges || badges.length === 0) return null;

  // Variant 1: Compact Chip (for Campus Feed headers, Author info, compact previews)
  if (variant === 'chip') {
    const displayed = badges.slice(0, maxChips);
    const remaining = badges.length - maxChips;

    return (
      <>
        <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
          {displayed.map((badge) => {
            const theme = getRarityTheme(badge.rarity);
            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => interactive && setSelectedBadge(badge)}
                title={`${badge.name}: ${badge.tagline}`}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition ${theme.pillBg} ${
                  interactive ? 'hover:scale-105 hover:shadow-xs cursor-pointer' : ''
                }`}
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </button>
            );
          })}

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => interactive && setSelectedBadge(badges[maxChips])}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 px-1.5 py-0.5 rounded-md hover:bg-indigo-50 transition cursor-pointer"
            >
              +{remaining} more
            </button>
          )}
        </div>

        {selectedBadge && (
          <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
        )}
      </>
    );
  }

  // Variant 2: Single Card representation
  if (variant === 'card') {
    const badge = badges[0];
    const theme = getRarityTheme(badge.rarity);
    return (
      <>
        <div
          onClick={() => interactive && setSelectedBadge(badge)}
          className={`p-4 rounded-2xl border bg-white shadow-xs hover:shadow-md transition cursor-pointer border-slate-200 ${className}`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
              {badge.icon}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pillBg}`}>
              {theme.label}
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-slate-900 mt-2 flex items-center gap-1">
            <span>{badge.name}</span>
            {badge.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{badge.tagline}</p>
        </div>

        {selectedBadge && (
          <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
        )}
      </>
    );
  }

  // Variant 3: Full Grid / Showcase (for StudentProfile.tsx and dedicated badges tab)
  const filteredBadges =
    activeCategory === 'all'
      ? badges
      : badges.filter((b) => b.category === activeCategory);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category filter tabs if requested */}
      {showCategoryFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
          {[
            { id: 'all', label: `All Badges (${badges.length})` },
            { id: 'academic', label: 'Academic' },
            { id: 'contribution', label: 'Top Contributor' },
            { id: 'research', label: 'Research & Labs' },
            { id: 'leadership', label: 'Leadership' },
            { id: 'attendance', label: 'Attendance' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          const theme = getRarityTheme(badge.rarity);
          return (
            <div
              key={badge.id}
              onClick={() => interactive && setSelectedBadge(badge)}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer group`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl group-hover:scale-110 transition">
                    {badge.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pillBg}`}>
                    {theme.label}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 mt-2.5 flex items-center gap-1">
                  <span>{badge.name}</span>
                  {badge.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Earned {badge.dateEarned}</span>
                <span className="font-bold text-indigo-600 group-hover:underline flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedBadge && (
        <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      )}
    </div>
  );
};
