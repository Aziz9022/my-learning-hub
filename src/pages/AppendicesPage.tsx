import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { allFormulas, appendicesData } from '../data/contentLoader';
import { CORRECTION_LOG } from '../data/corrections';
import { MathBlock } from '../components/MathBlock';
import { VerificationNotice } from '../components/VerificationNotice';

interface AppendicesPageProps {
  initialTab?: string | null;
  onNavigate: (path: string) => void;
}

type AppLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

const APP_TABS: Array<{ letter: AppLetter; short: string }> = [
  { letter: 'A', short: 'A: Comparison Tables' },
  { letter: 'B', short: 'B: Symbol Glossary' },
  { letter: 'C', short: 'C: 410-Bullet Checklist' },
  { letter: 'D', short: 'D: Supplementary Topics' },
  { letter: 'E', short: 'E: Formula Index' },
  { letter: 'F', short: 'F: Quality Record' },
];

export const AppendicesPage: React.FC<AppendicesPageProps> = ({
  initialTab,
  onNavigate,
}) => {
  const validInitial =
    initialTab && ['A', 'B', 'C', 'D', 'E', 'F'].includes(initialTab.toUpperCase())
      ? (initialTab.toUpperCase() as AppLetter)
      : 'C';

  const [activeTab, setActiveTab] = useState<AppLetter>(validInitial);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<number>(0);
  const [showRawC, setShowRawC] = useState(false);

  const current = appendicesData[activeTab];
  const fd1 = useMemo(() => allFormulas.find((f) => f.id === 'F-D.1'), []);
  const metaCorrection = useMemo(
    () => CORRECTION_LOG.find((c) => c.id === 'CORR-10'),
    []
  );

  const filteredChecklist = useMemo(() => {
    const items = appendicesData.C?.checklist || [];
    const q = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      if (moduleFilter > 0 && item.moduleId !== moduleFilter) return false;
      if (!q) return true;
      return `${item.topic} ${item.moduleTitle} ${item.refText} module ${item.moduleId}`
        .toLowerCase()
        .includes(q);
    });
  }, [searchTerm, moduleFilter]);

  const filteredGlossary = useMemo(() => {
    const items = appendicesData.B?.glossary || [];
    const q = searchTerm.trim().toLowerCase();
    return items.filter((g) => {
      if (!q) return true;
      return `${g.symbol} ${g.meaning} ${g.category}`.toLowerCase().includes(q);
    });
  }, [searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <div className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
          ALL SIX ORIGINAL APPENDICES PRESERVED IN FULL
        </div>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#ECF2EE]">Appendices A–F</h1>
        <p className="text-sm text-[#4B5850] dark:text-[#A8BCB0]">
          Master comparison tables index, complete symbol glossary, searchable 410-bullet syllabus
          coverage checklist, supplementary advanced topics, formula index, and quality-check
          record.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#DDE8E0] dark:border-[#1E2E24] pb-3">
        {APP_TABS.map((t) => (
          <button
            key={t.letter}
            type="button"
            onClick={() => {
              setActiveTab(t.letter);
              setSearchTerm('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === t.letter
                ? 'bg-[#15803D] text-white'
                : 'bg-[#F1F5F2] dark:bg-[#1B2A21] text-[#35463B] dark:text-[#BFD1C5] hover:bg-[#DCFCE7] dark:hover:bg-[#23382C]'
            }`}
          >
            {t.short}
          </button>
        ))}
      </div>

      {/* Active Appendix Panel */}
      {current && (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[#17211B] dark:text-[#ECF2EE]">{current.title}</h2>
            <div className="text-xs font-mono text-[#647067] dark:text-[#93A89B] mt-0.5">
              {current.wordCount.toLocaleString()} words preserved verbatim
            </div>
          </div>

          {/* Appendix B: Interactive Glossary + Full Raw */}
          {activeTab === 'B' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search symbols (e.g. sigma, lambda, nabla, Big-O, subset)..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-white dark:bg-[#131D17] text-xs"
                />
              </div>
              <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F9F5] dark:bg-[#16231B] border-b border-[#E2ECE4] dark:border-[#203026] text-[#4B5850] dark:text-[#A8BCB0]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Symbol</th>
                        <th className="py-2.5 px-4 font-semibold">Meaning</th>
                        <th className="py-2.5 px-4 font-semibold">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF3EF] dark:divide-[#1C2A21]">
                      {filteredGlossary.map((g, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 font-mono font-semibold text-[#14532D] dark:text-[#86EFAC] whitespace-nowrap">
                            {g.symbol}
                          </td>
                          <td className="py-2.5 px-4 text-[#1F2C24] dark:text-[#D3E0D7]">
                            {g.meaning}
                          </td>
                          <td className="py-2.5 px-4 text-[#647067] dark:text-[#93A89B] whitespace-nowrap">
                            {g.category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <details className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4">
                <summary className="text-xs font-semibold text-[#15803D] dark:text-[#4ADE80] cursor-pointer">
                  View complete verbatim Appendix B text
                </summary>
                <pre className="mt-3 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto text-[#223027] dark:text-[#C8DACF]">
                  {current.rawText}
                </pre>
              </details>
            </div>
          )}

          {/* Appendix C: Searchable 410-Bullet Syllabus Coverage Checklist */}
          {activeTab === 'C' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search all 410 syllabus bullets..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-white dark:bg-[#131D17] text-xs"
                  />
                </div>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(Number(e.target.value))}
                  className="rounded-lg border border-[#D7E3DA] dark:border-[#293D31] bg-white dark:bg-[#131D17] px-3 py-2 text-xs"
                >
                  <option value={0}>All 48 Modules</option>
                  {Array.from({ length: 48 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Module {m}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowRawC((v) => !v)}
                  className="px-3 py-2 rounded-lg border border-[#D7E3DA] dark:border-[#293D31] text-xs font-medium cursor-pointer"
                >
                  {showRawC ? 'Interactive view' : 'Raw text view'}
                </button>
              </div>

              {showRawC ? (
                <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-4 overflow-x-auto">
                  <pre className="font-mono text-xs leading-relaxed whitespace-pre text-[#223027] dark:text-[#C8DACF]">
                    {current.rawText}
                  </pre>
                </div>
              ) : (
                <>
                  <div className="text-xs font-mono text-[#647067] dark:text-[#93A89B]">
                    Showing {filteredChecklist.length} of {appendicesData.C?.checklist?.length || 0}{' '}
                    syllabus bullets
                  </div>
                  <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] divide-y divide-[#EEF3EF] dark:divide-[#1C2A21]">
                    {filteredChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="font-mono text-[11px] text-[#15803D] dark:text-[#4ADE80] shrink-0">
                            #{item.id}
                          </span>
                          <span className="text-[#17211B] dark:text-[#ECF2EE]">{item.topic}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate(
                              item.sectionRefs[0]
                                ? `/module/${item.moduleId}?section=${encodeURIComponent(
                                    item.sectionRefs[0]
                                  )}`
                                : `/module/${item.moduleId}`
                            )
                          }
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-[#15803D] dark:text-[#4ADE80] hover:underline shrink-0 cursor-pointer"
                        >
                          Mod {item.moduleId} ({item.refText})
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Appendix D: Supplementary Topics + KaTeX F-D.1 */}
          {activeTab === 'D' && (
            <div className="space-y-4">
              {fd1 && (
                <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 space-y-3">
                  <div className="text-xs font-mono font-bold text-[#14532D] dark:text-[#86EFAC]">
                    {fd1.id} · {fd1.title}
                  </div>
                  <MathBlock plainText={fd1.formulaBody} />
                </div>
              )}
              <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 overflow-x-auto">
                <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#223027] dark:text-[#C8DACF]">
                  {current.rawText}
                </pre>
              </div>
            </div>
          )}

          {/* Appendix E: Interactive Clickable Formula Index */}
          {activeTab === 'E' && (
            <div className="space-y-4">
              {metaCorrection && (
                <VerificationNotice entry={metaCorrection} onNavigate={onNavigate} />
              )}
              <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] divide-y divide-[#EEF3EF] dark:divide-[#1C2A21]">
                {allFormulas.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      onNavigate(
                        f.moduleId === 0
                          ? '/appendices?tab=D'
                          : `/module/${f.moduleId}?formula=${encodeURIComponent(f.id)}`
                      )
                    }
                    className="w-full text-left px-4 py-2.5 hover:bg-[#F3F8F4] dark:hover:bg-[#18261E] flex items-center justify-between gap-3 text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-[#15803D] dark:text-[#4ADE80] w-14 shrink-0">
                        {f.id}
                      </span>
                      <span className="text-[#17211B] dark:text-[#ECF2EE] truncate">{f.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#647067] dark:text-[#8DA295] shrink-0">
                      {f.moduleId === 0 ? 'Appendix D' : `Module ${f.moduleId}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appendix A & F: Verbatim Preserved Content */}
          {(activeTab === 'A' || activeTab === 'F') && (
            <div className="space-y-4">
              {activeTab === 'F' && metaCorrection && (
                <VerificationNotice entry={metaCorrection} onNavigate={onNavigate} />
              )}
              <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 overflow-x-auto">
                <pre className="font-mono text-xs leading-relaxed whitespace-pre text-[#223027] dark:text-[#C8DACF]">
                  {current.rawText}
                </pre>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
