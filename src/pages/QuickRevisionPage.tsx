import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { quickRevisionData } from '../data/contentLoader';
import type { PartId } from '../types/content';

interface QuickRevisionPageProps {
  onNavigate: (path: string) => void;
}

type RevisionTab = 'conditions' | 'mistakes' | 'tables' | 'definitions';

export const QuickRevisionPage: React.FC<QuickRevisionPageProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<RevisionTab>('conditions');
  const [partFilter, setPartFilter] = useState<'ALL' | PartId>('ALL');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const conditions = useMemo(
    () =>
      quickRevisionData.conditions.filter((item) => {
        if (partFilter !== 'ALL' && item.partId !== partFilter) return false;
        if (!q) return true;
        return `${item.formulaId} ${item.title} ${item.text}`.toLowerCase().includes(q);
      }),
    [partFilter, q]
  );

  const mistakes = useMemo(
    () =>
      quickRevisionData.mistakes.filter((item) => {
        if (partFilter !== 'ALL' && item.partId !== partFilter) return false;
        if (!q) return true;
        return `${item.source} ${item.text}`.toLowerCase().includes(q);
      }),
    [partFilter, q]
  );

  const tables = useMemo(
    () =>
      quickRevisionData.tables.filter((item) => {
        if (partFilter !== 'ALL' && item.partId !== partFilter) return false;
        if (!q) return true;
        return `${item.title} ${item.rawText}`.toLowerCase().includes(q);
      }),
    [partFilter, q]
  );

  const definitions = useMemo(
    () =>
      quickRevisionData.definitions.filter((item) => {
        if (partFilter !== 'ALL' && item.partId !== partFilter) return false;
        if (!q) return true;
        return `${item.title} ${item.text}`.toLowerCase().includes(q);
      }),
    [partFilter, q]
  );

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <div className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
          EXAM &amp; CONCEPT REVIEW · SUPPLEMENTING FULL MODULE CONTENT
        </div>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#ECF2EE]">Quick Revision</h1>
        <p className="text-sm text-[#4B5850] dark:text-[#A8BCB0]">
          Rapidly review validity conditions, common pitfalls, comparison tables, and plain-English
          intuition extracted directly from the original modules. Click any entry to jump to the
          full explanation.
        </p>
      </header>

      {/* Tabs & Filters */}
      <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {([
            ['conditions', `Conditions & Assumptions (${quickRevisionData.conditions.length})`],
            ['mistakes', `Common Mistakes (${quickRevisionData.mistakes.length})`],
            ['tables', `Comparison Tables (${quickRevisionData.tables.length})`],
            ['definitions', `Core Intuition (${quickRevisionData.definitions.length})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                tab === key
                  ? 'bg-[#15803D] text-white'
                  : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter revision items..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] text-xs focus:outline-none focus:border-[#15803D]"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['ALL', 'A', 'B', 'C', 'D'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPartFilter(p)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono cursor-pointer ${
                  partFilter === p
                    ? 'bg-[#14532D] text-white dark:bg-[#22C55E] dark:text-[#0C130F]'
                    : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#4B5850] dark:text-[#A8BCB0]'
                }`}
              >
                {p === 'ALL' ? 'All' : `Part ${p}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'conditions' && (
        <div className="space-y-3">
          {conditions.map((c, idx) => (
            <div
              key={`${c.formulaId}-${idx}`}
              className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE]">
                  <span className="font-mono text-xs text-[#15803D] dark:text-[#4ADE80] mr-2">
                    {c.formulaId}
                  </span>
                  {c.title}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      c.moduleId === 0
                        ? '/appendices?tab=D'
                        : `/module/${c.moduleId}?formula=${encodeURIComponent(c.formulaId)}`
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D] dark:text-[#4ADE80] hover:underline shrink-0 cursor-pointer"
                >
                  Module {c.moduleId} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#35463B] dark:text-[#BFD1C5] whitespace-pre-wrap">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'mistakes' && (
        <div className="space-y-3">
          {mistakes.map((m, idx) => (
            <div
              key={`${m.sectionId}-${idx}`}
              className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/15 p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  {m.source}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/module/${m.moduleId}?section=${encodeURIComponent(m.sectionId)}`
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D] dark:text-[#4ADE80] hover:underline shrink-0 cursor-pointer"
                >
                  Module {m.moduleId} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#2C2415] dark:text-amber-100/85 whitespace-pre-wrap">
                {m.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === 'tables' && (
        <div className="space-y-4">
          {tables.map((t, idx) => (
            <div
              key={`${t.sectionId}-${idx}`}
              className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden"
            >
              <div className="px-4 py-3 bg-[#F4F9F5] dark:bg-[#16231B] border-b border-[#E2ECE4] dark:border-[#203026] flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#14532D] dark:text-[#86EFAC]">
                  {t.title}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/module/${t.moduleId}?section=${encodeURIComponent(t.sectionId)}`
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D] dark:text-[#4ADE80] hover:underline shrink-0 cursor-pointer"
                >
                  Module {t.moduleId} (§{t.sectionId}) <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-xs leading-relaxed text-[#17211B] dark:text-[#DCE8E0] whitespace-pre tabular-nums">
                  {t.rawText}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'definitions' && (
        <div className="space-y-3">
          {definitions.map((d, idx) => (
            <div
              key={`${d.sectionId}-${idx}`}
              className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE]">
                  {d.title}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(`/module/${d.moduleId}`)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D] dark:text-[#4ADE80] hover:underline shrink-0 cursor-pointer"
                >
                  Module {d.moduleId} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[#35463B] dark:text-[#BFD1C5]">
                {d.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
