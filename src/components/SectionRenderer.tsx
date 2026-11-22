import React, { useState } from 'react';
import {
  AlertTriangle,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Compass,
  Copy,
  FileCode2,
  Table2,
} from 'lucide-react';
import type { ContentBlock, FormulaBlockData, SectionData } from '../types/content';
import {
  getCorrectionsForFormula,
  getCorrectionsForSection,
  getFormulaVerificationStatus,
} from '../data/corrections';
import { MathBlock } from './MathBlock';
import { VerificationNotice, VerificationStatusLabel } from './VerificationNotice';

const PART_LABELS: Record<string, string> = {
  A: 'Formula Name',
  B: 'Formula',
  C: 'Meaning of Symbols',
  D: 'Conceptual Explanation',
  E: 'Conditions & Assumptions',
  F: 'Derivation',
  G: 'Worked Examples',
  H: 'Interpretation',
  I: 'Common Mistakes',
  J: 'Related Formulas',
};

interface FormulaCardProps {
  block: FormulaBlockData;
  moduleId: number;
  sectionId: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onNavigate: (path: string) => void;
}

const FormulaCard: React.FC<FormulaCardProps> = ({
  block,
  isBookmarked,
  onToggleBookmark,
  onNavigate,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showFullRaw, setShowFullRaw] = useState(false);

  const status = getFormulaVerificationStatus(block.formulaId);
  const corrections = getCorrectionsForFormula(block.formulaId);

  const detailOrder = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const;

  return (
    <div
      id={`formula-${block.formulaId}`}
      className="rounded-xl border border-[#D4E2D8] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden shadow-[0_1px_2px_rgba(20,83,45,0.04)]"
    >
      {/* Formula Header */}
      <div className="px-5 py-3.5 bg-[#F4F9F5] dark:bg-[#16231B] border-b border-[#E2ECE4] dark:border-[#203026] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-[#14532D] dark:text-[#86EFAC] bg-[#DCFCE7] dark:bg-[#143321] px-2 py-0.5 rounded">
            {block.formulaId}
          </span>
          <h4 className="text-sm sm:text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            {block.title}
          </h4>
          <span className="text-[#9AB0A2] dark:text-[#3A5243]">·</span>
          <VerificationStatusLabel status={status} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-label={isBookmarked ? 'Remove formula bookmark' : 'Bookmark formula'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-[#DCFCE7] text-[#14532D] dark:bg-[#14532D] dark:text-[#DCFCE7]'
                : 'text-[#647067] hover:bg-[#E7F0EA] dark:text-[#93A89B] dark:hover:bg-[#1E2E24]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-[#4B5850] dark:text-[#A8BCB0] hover:bg-[#E7F0EA] dark:hover:bg-[#1E2E24] cursor-pointer"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Formula Body (Always visible) */}
      <div className="p-5 space-y-4">
        {block.formulaBody && <MathBlock plainText={block.formulaBody} />}

        {/* Attached Verification / Correction Notices */}
        {corrections.map((entry) => (
          <VerificationNotice key={entry.id} entry={entry} onNavigate={onNavigate} />
        ))}

        {/* Structured A-J Parts */}
        {expanded && (
          <div className="space-y-3 pt-1">
            {detailOrder.map((letter) => {
              const content = block.parts[letter];
              if (!content) return null;
              const cleaned = content
                .replace(
                  /^(SYMBOLS|CONCEPT|CONDITIONS(\s+AND\s+ASSUMPTIONS)?|DERIVATION(\s*\([^)]+\))?|ARGUMENT|WORKED\s+EXAMPLES?|EXAMPLES?|INTERPRETATION|COMMON\s+MISTAKES?|MISTAKES?|RELATED(\s+FORMULAS)?|DETECTION|ESTIMATION)\s*:?\s*/i,
                  ''
                )
                .trim();
              if (!cleaned) return null;

              const isMistake = letter === 'I';
              const isExample = letter === 'G';

              return (
                <div
                  key={letter}
                  className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    isMistake
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50'
                      : isExample
                      ? 'bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E2ECE4] dark:border-[#1E2E24]'
                      : 'bg-transparent border border-[#EEF3EF] dark:border-[#1C2A21]'
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#15803D] dark:text-[#4ADE80] mb-1">
                    {letter}. {PART_LABELS[letter]}
                  </div>
                  <div className="text-[#1F2C24] dark:text-[#D3E0D7] whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">
                    {cleaned}
                  </div>
                </div>
              );
            })}

            {/* Raw Verbatim Source Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowFullRaw((v) => !v)}
                className="text-xs text-[#647067] dark:text-[#93A89B] hover:text-[#15803D] dark:hover:text-[#4ADE80] underline underline-offset-2 cursor-pointer"
              >
                {showFullRaw ? 'Hide verbatim raw source block' : 'Inspect verbatim raw source block'}
              </button>
              {showFullRaw && (
                <pre className="mt-2 p-3 rounded-lg bg-[#F4F7F5] dark:bg-[#0B110E] border border-[#DCE6DF] dark:border-[#1E2E24] font-mono text-xs text-[#2C3A31] dark:text-[#BFD1C5] overflow-x-auto whitespace-pre">
                  {block.rawText}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CodeBlockView: React.FC<{ rawText: string }> = ({ rawText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(rawText).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-xl border border-[#24362B] bg-[#0F1712] text-[#E6F0E9] overflow-hidden">
      <div className="px-4 py-2 bg-[#16221B] border-b border-[#24362B] flex items-center justify-between text-xs text-[#93A89B]">
        <span className="inline-flex items-center gap-1.5 font-mono">
          <FileCode2 className="w-3.5 h-3.5 text-[#4ADE80]" />
          Code / Pseudocode Example
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#22342A] text-[#C8DACF] cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-[13px] font-mono leading-relaxed overflow-x-auto whitespace-pre">
        {rawText}
      </pre>
    </div>
  );
};

const TableBlockView: React.FC<{ title: string; rawText: string }> = ({ title, rawText }) => (
  <div className="rounded-xl border border-[#D4E2D8] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
    <div className="px-4 py-2.5 bg-[#F4F9F5] dark:bg-[#16231B] border-b border-[#E2ECE4] dark:border-[#203026] flex items-center gap-2 text-xs font-semibold text-[#14532D] dark:text-[#86EFAC]">
      <Table2 className="w-4 h-4 shrink-0" />
      <span>{title}</span>
    </div>
    <div className="p-4 overflow-x-auto">
      <pre className="font-mono text-xs leading-relaxed text-[#17211B] dark:text-[#DCE8E0] whitespace-pre tabular-nums">
        {rawText}
      </pre>
    </div>
  </div>
);

function renderContentBlock(
  block: ContentBlock,
  idx: number,
  moduleId: number,
  sectionId: string,
  bookmarkedIds: Set<string>,
  onToggleBookmark: (item: {
    id: string;
    kind: 'formula' | 'section' | 'module';
    label: string;
    moduleId: number;
    sectionId?: string;
    formulaId?: string;
  }) => void,
  onNavigate: (path: string) => void
) {
  if (block.type === 'formula') {
    const bmId = `formula:${block.formulaId}`;
    return (
      <FormulaCard
        key={`${sectionId}-f-${block.formulaId}-${idx}`}
        block={block}
        moduleId={moduleId}
        sectionId={sectionId}
        isBookmarked={bookmarkedIds.has(bmId)}
        onToggleBookmark={() =>
          onToggleBookmark({
            id: bmId,
            kind: 'formula',
            label: `${block.formulaId} ${block.title}`,
            moduleId,
            sectionId,
            formulaId: block.formulaId,
          })
        }
        onNavigate={onNavigate}
      />
    );
  }

  if (block.type === 'code') {
    return <CodeBlockView key={`${sectionId}-code-${idx}`} rawText={block.rawText} />;
  }

  if (block.type === 'table') {
    return (
      <TableBlockView
        key={`${sectionId}-tbl-${idx}`}
        title={block.title}
        rawText={block.rawText}
      />
    );
  }

  if (block.type === 'warning' || block.type === 'mistake') {
    return (
      <div
        key={`${sectionId}-warn-${idx}`}
        className="rounded-xl border border-amber-300/80 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/25 p-4 flex items-start gap-3"
      >
        <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed text-[#2C2415] dark:text-amber-100/90 whitespace-pre-wrap">
          <span className="font-semibold uppercase tracking-wide text-xs text-amber-800 dark:text-amber-300 mr-2">
            {block.type === 'warning' ? 'Warning:' : 'Common Mistake:'}
          </span>
          {block.text}
        </div>
      </div>
    );
  }

  if (block.type === 'ds-link') {
    return (
      <div
        key={`${sectionId}-ds-${idx}`}
        className="rounded-xl border border-[#BBDFC7] dark:border-[#234530] bg-[#F2FBF5] dark:bg-[#102217] p-4 flex items-start gap-3"
      >
        <Compass className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed text-[#1B3324] dark:text-[#CFE5D6] whitespace-pre-wrap">
          <span className="font-semibold uppercase tracking-wide text-xs text-[#14532D] dark:text-[#86EFAC] mr-2">
            Data Science Connection:
          </span>
          {block.text}
        </div>
      </div>
    );
  }

  // Regular text block — preserve structured whitespace & aligned sub-tables cleanly
  const hasAlignedColumns = block.rawText
    .split('\n')
    .filter((l) => /\S\s{3,}\S/.test(l)).length >= 3;

  if (hasAlignedColumns) {
    return (
      <div
        key={`${sectionId}-aligned-${idx}`}
        className="rounded-lg bg-[#F8FAF8] dark:bg-[#0E1712] border border-[#E5EFE7] dark:border-[#1E2E24] p-4 overflow-x-auto"
      >
        <pre className="font-mono text-xs sm:text-[13px] leading-relaxed text-[#1F2C24] dark:text-[#D3E0D7] whitespace-pre">
          {block.rawText}
        </pre>
      </div>
    );
  }

  return (
    <div
      key={`${sectionId}-txt-${idx}`}
      className="text-[15px] leading-[1.72] text-[#223027] dark:text-[#D1DFD6] whitespace-pre-wrap"
    >
      {block.rawText}
    </div>
  );
}

interface SectionRendererProps {
  section: SectionData;
  moduleId: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (item: {
    id: string;
    kind: 'formula' | 'section' | 'module';
    label: string;
    moduleId: number;
    sectionId?: string;
    formulaId?: string;
  }) => void;
  onNavigate: (path: string) => void;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  moduleId,
  isCompleted,
  onToggleComplete,
  bookmarkedIds,
  onToggleBookmark,
  onNavigate,
}) => {
  const sectionBmId = `section:${section.id}`;
  const isSectionBookmarked = bookmarkedIds.has(sectionBmId);

  // Section-level corrections that are not already attached to a specific formula card
  const sectionCorrections = getCorrectionsForSection(section.id).filter((c) => !c.formulaId);

  return (
    <section
      id={`section-${section.id}`}
      className="scroll-mt-24 pt-8 pb-6 border-b border-[#E3ECE5] dark:border-[#1E2E24] last:border-b-0 space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-mono font-medium text-[#15803D] dark:text-[#4ADE80]">
            Section {section.id} · ~{Math.max(1, Math.round(section.wordCount / 220))} min read
            {section.formulaIds.length > 0 && ` · ${section.formulaIds.length} formula${section.formulaIds.length > 1 ? 's' : ''}`}
          </div>
          <h3 className="text-xl font-bold text-[#17211B] dark:text-[#ECF2EE] font-editorial tracking-tight">
            {section.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onToggleBookmark({
                id: sectionBmId,
                kind: 'section',
                label: `${section.id} ${section.title}`,
                moduleId,
                sectionId: section.id,
              })
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isSectionBookmarked
                ? 'border-[#15803D] bg-[#DCFCE7] text-[#14532D] dark:bg-[#143321] dark:text-[#86EFAC]'
                : 'border-[#D7E3DA] dark:border-[#293D31] text-[#4B5850] dark:text-[#A8BCB0] hover:bg-[#F1F5F2] dark:hover:bg-[#1B2A21]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSectionBookmarked ? 'fill-current' : ''}`} />
            {isSectionBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>

          <button
            type="button"
            onClick={onToggleComplete}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isCompleted
                ? 'border-[#15803D] bg-[#15803D] text-white'
                : 'border-[#D7E3DA] dark:border-[#293D31] text-[#17211B] dark:text-[#ECF2EE] hover:border-[#15803D]'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-[#647067] dark:text-[#93A89B]" />
            )}
            {isCompleted ? 'Completed' : 'Mark complete'}
          </button>
        </div>
      </div>

      {/* Section-level verification notices (for non-formula tables/prose) */}
      {sectionCorrections.map((entry) => (
        <VerificationNotice key={entry.id} entry={entry} onNavigate={onNavigate} />
      ))}

      {/* All Content Blocks (100% lossless) */}
      <div className="space-y-4">
        {section.blocks.map((block, idx) =>
          renderContentBlock(
            block,
            idx,
            moduleId,
            section.id,
            bookmarkedIds,
            onToggleBookmark,
            onNavigate
          )
        )}
      </div>
    </section>
  );
};

export const IntroBlocksRenderer: React.FC<{
  blocks: ContentBlock[];
  moduleId: number;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (item: {
    id: string;
    kind: 'formula' | 'section' | 'module';
    label: string;
    moduleId: number;
    sectionId?: string;
    formulaId?: string;
  }) => void;
  onNavigate: (path: string) => void;
}> = ({ blocks, moduleId, bookmarkedIds, onToggleBookmark, onNavigate }) => {
  if (!blocks.length) return null;
  return (
    <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#15803D] dark:text-[#4ADE80]">
        <BookOpen className="w-4 h-4" />
        Module Overview (Original Source)
      </div>
      {blocks.map((b, idx) =>
        renderContentBlock(b, idx, moduleId, `${moduleId}.0`, bookmarkedIds, onToggleBookmark, onNavigate)
      )}
    </div>
  );
};
