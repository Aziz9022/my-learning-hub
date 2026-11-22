import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { allFormulas } from '../data/contentLoader';
import { CORRECTION_LOG, getFormulaVerificationStatus } from '../data/corrections';
import type { VerificationStatus } from '../types/content';
import { VerificationNotice } from '../components/VerificationNotice';

interface CorrectionLogPageProps {
  onNavigate: (path: string) => void;
}

export const CorrectionLogPage: React.FC<CorrectionLogPageProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VerificationStatus>('ALL');

  const counts = useMemo(() => {
    const corr = CORRECTION_LOG.filter((c) => c.status === 'Correction made').length;
    const ver = CORRECTION_LOG.filter((c) => c.status === 'Verified').length;
    const needs = CORRECTION_LOG.filter((c) => c.status === 'Needs verification').length;
    const formulaUnchecked = allFormulas.filter(
      (f) => getFormulaVerificationStatus(f.id) === 'Not independently checked'
    ).length;
    const formulaVerified = allFormulas.filter(
      (f) => getFormulaVerificationStatus(f.id) === 'Verified'
    ).length;
    return { corr, ver, needs, formulaUnchecked, formulaVerified };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CORRECTION_LOG.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (!q) return true;
      return `${c.id} ${c.moduleId} ${c.sectionId} ${c.formulaId || ''} ${c.category} ${c.originalStatement} ${c.correctedStatement} ${c.explanation}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <div className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
          TRANSPARENT FACT-CHECKING &amp; THREE-LAYER AUDIT
        </div>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#ECF2EE]">Correction Log</h1>
        <p className="text-sm leading-relaxed text-[#4B5850] dark:text-[#A8BCB0]">
          Original educational content is never silently altered. Every genuine error or precision
          gap identified during our mathematical, algorithmic, and cross-reference audit preserves
          the verbatim source text in Layer 1, states the verified correction in Layer 2, and
          provides the explanation and authoritative reference in Layer 3.
        </p>
      </header>

      {/* Honest Audit Coverage Dashboard */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono tabular-nums">
        <div className="rounded-xl border border-amber-300/70 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-4">
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">{counts.corr}</div>
          <div className="font-sans text-xs font-medium text-amber-900/80 dark:text-amber-200/80 mt-0.5">
            Corrections Made
          </div>
        </div>
        <div className="rounded-xl border border-[#BBDFC7] dark:border-[#234530] bg-[#F2FBF5] dark:bg-[#102217] p-4">
          <div className="text-2xl font-bold text-[#15803D] dark:text-[#4ADE80]">
            {counts.formulaVerified}
          </div>
          <div className="font-sans text-xs font-medium text-[#14532D] dark:text-[#A6D8B8] mt-0.5">
            Formulas Directly Checked
          </div>
        </div>
        <div className="rounded-xl border border-sky-300/70 dark:border-sky-800/60 bg-sky-50/50 dark:bg-sky-950/20 p-4">
          <div className="text-2xl font-bold text-sky-800 dark:text-sky-300">{counts.needs}</div>
          <div className="font-sans text-xs font-medium text-sky-900/80 dark:text-sky-200/80 mt-0.5">
            Needs Local Runtime Check
          </div>
        </div>
        <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4">
          <div className="text-2xl font-bold text-[#4B5850] dark:text-[#B5C6BC]">
            {counts.formulaUnchecked}
          </div>
          <div className="font-sans text-xs font-medium text-[#647067] dark:text-[#93A89B] mt-0.5">
            Not Independently Checked
          </div>
        </div>
      </section>

      {/* Honest Scope Disclosure */}
      <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4 text-xs leading-relaxed text-[#3D4B42] dark:text-[#B5C6BC]">
        <strong className="text-[#17211B] dark:text-[#ECF2EE]">Honest Verification Scope:</strong>{' '}
        Automated scripts audited 100% of section headings (277/277), formula IDs (237/237),
        internal cross-references, and Appendix C mappings (410/410). Mathematical theorems,
        complexities, and representative numerical examples across Parts A–D ({counts.formulaVerified}{' '}
        formula blocks plus {counts.corr} corrected items) were directly audited and recomputed.
        The remaining {counts.formulaUnchecked} formula blocks are honestly tagged{' '}
        <em>Not independently checked</em> so you always know what has been independently audited.
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search corrections by module, formula ID, category, or keyword..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-white dark:bg-[#131D17] text-xs focus:outline-none focus:border-[#15803D]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['ALL', 'Correction made', 'Verified', 'Needs verification'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#15803D] text-white'
                  : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5]'
              }`}
            >
              {st === 'ALL' ? 'All Entries' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Correction Entries */}
      <div className="space-y-4">
        {filtered.map((entry) => (
          <div key={entry.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-mono text-[#647067] dark:text-[#93A89B]">
                {entry.moduleId === 0
                  ? `Appendices · ${entry.sectionId}`
                  : `Module ${entry.moduleId} · Section ${entry.sectionId}${
                      entry.formulaId ? ` · ${entry.formulaId}` : ''
                    }`}
              </span>
              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    entry.moduleId === 0
                      ? '/appendices?tab=F'
                      : entry.formulaId
                      ? `/module/${entry.moduleId}?formula=${encodeURIComponent(entry.formulaId)}`
                      : `/module/${entry.moduleId}?section=${encodeURIComponent(entry.sectionId)}`
                  )
                }
                className="inline-flex items-center gap-1 font-medium text-[#15803D] dark:text-[#4ADE80] hover:underline cursor-pointer"
              >
                Jump to source <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <VerificationNotice entry={entry} onNavigate={onNavigate} />
          </div>
        ))}
      </div>
    </div>
  );
};
