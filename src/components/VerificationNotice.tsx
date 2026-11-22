import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import type { CorrectionEntry, VerificationStatus } from '../types/content';

export const VerificationStatusLabel: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  if (status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D] dark:text-[#4ADE80]">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        Verified
      </span>
    );
  }
  if (status === 'Correction made') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        Correction made
      </span>
    );
  }
  if (status === 'Needs verification') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-sky-400">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        Needs verification
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#647067] dark:text-[#93A89B]">
      <HelpCircle className="w-3.5 h-3.5 shrink-0" />
      Not independently checked
    </span>
  );
};

interface VerificationNoticeProps {
  entry: CorrectionEntry;
  onNavigate?: (hashPath: string) => void;
}

/**
 * Transparent Three-Layer Verification Panel:
 *   Layer 1 (Expandable): Original source statement preserved verbatim
 *   Layer 2: Verified or corrected statement clearly presented
 *   Layer 3: Verification explanation, reason, and reference link
 */
export const VerificationNotice: React.FC<VerificationNoticeProps> = ({ entry, onNavigate }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const isCorrection = entry.status === 'Correction made';
  const isNeedsCheck = entry.status === 'Needs verification';

  const containerStyle = isCorrection
    ? 'border-amber-300/80 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/25'
    : isNeedsCheck
    ? 'border-sky-300/80 dark:border-sky-800/60 bg-sky-50/70 dark:bg-sky-950/25'
    : 'border-[#BBDFC7] dark:border-[#234530] bg-[#F2FBF5] dark:bg-[#102217]';

  const isInternalRef = entry.referenceUrl.startsWith('#');

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${containerStyle}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            {entry.id}
          </span>
          <span className="text-[#647067] dark:text-[#93A89B]">·</span>
          <VerificationStatusLabel status={entry.status} />
          <span className="text-[#647067] dark:text-[#93A89B]">·</span>
          <span className="text-[#4B5850] dark:text-[#A8BCB0]">{entry.category}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#14532D] dark:text-[#86EFAC] hover:underline cursor-pointer"
        >
          {showOriginal ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          {showOriginal ? 'Hide original source statement' : 'View original source statement'}
        </button>
      </div>

      {/* Layer 1: Original Source Statement (Expandable) */}
      {showOriginal && (
        <div className="rounded-lg border border-[#D7E3DA] dark:border-[#26382D] bg-white/90 dark:bg-[#0C130F] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#647067] dark:text-[#93A89B] mb-1">
            Layer 1 — Original Source Statement (Preserved Verbatim)
          </div>
          <p className="font-mono text-xs leading-relaxed text-[#35463B] dark:text-[#BFD1C5] whitespace-pre-wrap">
            {entry.originalStatement}
          </p>
        </div>
      )}

      {/* Layer 2: Verified or Corrected Explanation */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#4B5850] dark:text-[#9DB2A5] mb-1">
          {isCorrection
            ? 'Layer 2 — Corrected Statement'
            : isNeedsCheck
            ? 'Layer 2 — Verification Caveat'
            : 'Layer 2 — Verified Result'}
        </div>
        <p className="text-sm leading-relaxed text-[#17211B] dark:text-[#ECF2EE]">
          {entry.correctedStatement}
        </p>
      </div>

      {/* Layer 3: Verification Note & Reference */}
      <div className="pt-2 border-t border-black/8 dark:border-white/10 space-y-1.5 text-xs text-[#3D4B42] dark:text-[#B5C6BC]">
        <p>
          <strong className="text-[#17211B] dark:text-[#ECF2EE]">Verification note:</strong>{' '}
          {entry.explanation}
        </p>
        <p>
          <strong className="text-[#17211B] dark:text-[#ECF2EE]">Reason:</strong>{' '}
          {entry.reasonForCorrection}
        </p>
        <div className="pt-0.5">
          <strong className="text-[#17211B] dark:text-[#ECF2EE]">Reference:</strong>{' '}
          {isInternalRef ? (
            <button
              type="button"
              onClick={() => onNavigate?.(entry.referenceUrl.slice(1))}
              className="text-[#15803D] dark:text-[#4ADE80] hover:underline font-medium cursor-pointer"
            >
              {entry.referenceTitle}
            </button>
          ) : (
            <a
              href={entry.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#15803D] dark:text-[#4ADE80] hover:underline font-medium"
            >
              {entry.referenceTitle}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
