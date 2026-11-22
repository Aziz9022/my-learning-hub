import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Bookmark, Search } from 'lucide-react';
import { allFormulas } from '../data/contentLoader';
import { getFormulaVerificationStatus } from '../data/corrections';
import type { PartId, VerificationStatus } from '../types/content';
import type { BookmarkItem, LearningProgressState } from '../utilities/storage';
import { MathBlock } from '../components/MathBlock';
import { VerificationStatusLabel } from '../components/VerificationNotice';

interface FormulaLibraryPageProps {
  progress: LearningProgressState;
  onNavigate: (path: string) => void;
  onToggleBookmark: (item: Omit<BookmarkItem, 'createdAt'>) => void;
}

export const FormulaLibraryPage: React.FC<FormulaLibraryPageProps> = ({
  progress,
  onNavigate,
  onToggleBookmark,
}) => {
  const [query, setQuery] = useState('');
  const [partFilter, setPartFilter] = useState<'ALL' | PartId>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VerificationStatus>('ALL');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const bookmarkedIds = useMemo(
    () => new Set(progress.bookmarks.map((b) => b.id)),
    [progress.bookmarks]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allFormulas.filter((f) => {
      if (partFilter !== 'ALL' && f.partId !== partFilter) return false;
      const st = getFormulaVerificationStatus(f.id);
      if (statusFilter !== 'ALL' && st !== statusFilter) return false;
      if (onlyBookmarked && !bookmarkedIds.has(`formula:${f.id}`)) return false;
      if (!q) return true;
      return `${f.id} ${f.title} ${f.formulaBody} ${f.parts.C || ''} ${f.parts.D || ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, partFilter, statusFilter, onlyBookmarked, bookmarkedIds]);

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <div className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
          COMPLETE FORMULA INDEX · {allFormulas.length} FORMULA BLOCKS (F1.1–F48.7 + F-D.1)
        </div>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#ECF2EE]">Formula Library</h1>
        <p className="text-sm text-[#4B5850] dark:text-[#A8BCB0]">
          Search all 237 indexed formulas and rules by ID, name, mathematical symbol, or topic.
          Every entry links straight to its complete A–J derivation and worked examples.
        </p>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID (F40.7), name (Bayes, SVD, Gini), symbol (sigma, lambda, det)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] text-sm focus:outline-none focus:border-[#15803D]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {([
              ['ALL', 'All Parts'],
              ['A', 'Part A: Math'],
              ['B', 'Part B: CS'],
              ['C', 'Part C: Stats'],
              ['D', 'Part D: DS'],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setPartFilter(val)}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                  partFilter === val
                    ? 'bg-[#15803D] text-white'
                    : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | VerificationStatus)}
              className="rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] px-2.5 py-1 text-xs"
            >
              <option value="ALL">All audit statuses</option>
              <option value="Verified">Verified</option>
              <option value="Correction made">Correction made</option>
              <option value="Not independently checked">Not independently checked</option>
            </select>

            <label className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={onlyBookmarked}
                onChange={(e) => setOnlyBookmarked(e.target.checked)}
                className="accent-[#15803D]"
              />
              Bookmarked only
            </label>
          </div>
        </div>
      </div>

      <div className="text-xs font-mono text-[#647067] dark:text-[#93A89B]">
        Showing {filtered.length} of {allFormulas.length} formula blocks
      </div>

      {/* Formula Cards */}
      <div className="space-y-4">
        {filtered.map((f) => {
          const status = getFormulaVerificationStatus(f.id);
          const bmId = `formula:${f.id}`;
          const isSaved = bookmarkedIds.has(bmId);
          const jumpPath =
            f.moduleId === 0
              ? '/appendices?tab=D'
              : `/module/${f.moduleId}?formula=${encodeURIComponent(f.id)}`;

          return (
            <div
              key={f.id}
              className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#14532D] dark:text-[#86EFAC] bg-[#DCFCE7] dark:bg-[#143321] px-2 py-0.5 rounded">
                    {f.id}
                  </span>
                  <h2 className="text-base font-bold text-[#17211B] dark:text-[#ECF2EE]">
                    {f.title}
                  </h2>
                  <span className="text-[#9AB0A2] dark:text-[#3A5243]">·</span>
                  <VerificationStatusLabel status={status} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleBookmark({
                        id: bmId,
                        kind: 'formula',
                        label: `${f.id} ${f.title}`,
                        moduleId: f.moduleId,
                        sectionId: f.sectionId,
                        formulaId: f.id,
                      })
                    }
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      isSaved
                        ? 'bg-[#DCFCE7] text-[#14532D] dark:bg-[#143321] dark:text-[#86EFAC]'
                        : 'text-[#647067] hover:bg-[#F1F5F2] dark:text-[#93A89B] dark:hover:bg-[#1B2A21]'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(jumpPath)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#15803D] dark:text-[#4ADE80] hover:bg-[#DCFCE7]/50 dark:hover:bg-[#143321] cursor-pointer"
                  >
                    {f.moduleId === 0 ? 'Appendix D' : `Module ${f.moduleId} (§${f.sectionId})`}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {f.formulaBody && <MathBlock plainText={f.formulaBody} compact />}

              {f.parts.C && (
                <p className="text-xs leading-relaxed text-[#4B5850] dark:text-[#A8BCB0]">
                  <strong className="text-[#17211B] dark:text-[#ECF2EE]">Symbols:</strong>{' '}
                  {f.parts.C.replace(/^SYMBOLS\s*:?\s*/i, '').trim()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
