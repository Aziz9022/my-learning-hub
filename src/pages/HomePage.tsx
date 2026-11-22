import React, { useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  FileText,
  Layers,
  Search,
  ShieldCheck,
  Sigma,
  TrendingUp,
} from 'lucide-react';
import { catalog } from '../data/contentLoader';
import { CORRECTION_LOG } from '../data/corrections';
import type { LearningProgressState } from '../utilities/storage';

interface HomePageProps {
  progress: LearningProgressState;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

const PART_ICONS = {
  A: Sigma,
  B: Cpu,
  C: TrendingUp,
  D: Database,
};

export const HomePage: React.FC<HomePageProps> = ({
  progress,
  onNavigate,
  onOpenSearch,
}) => {
  const [showNotation, setShowNotation] = useState(false);

  const totalMods = catalog.meta.totalModules;
  const totalSecs = catalog.meta.totalSections;
  const completedMods = progress.completedModules.length;
  const completedSecs = progress.completedSections.length;
  const overallPct = Math.round((completedSecs / Math.max(1, totalSecs)) * 100);

  const continueTarget = progress.lastVisited
    ? progress.lastVisited.sectionId
      ? `/module/${progress.lastVisited.moduleId}?section=${encodeURIComponent(
          progress.lastVisited.sectionId
        )}`
      : `/module/${progress.lastVisited.moduleId}`
    : '/module/1';

  const continueLabel = progress.lastVisited
    ? `Continue: Module ${progress.lastVisited.moduleId}`
    : 'Start Module 1: Mathematical Foundations';

  const correctionsMadeCount = CORRECTION_LOG.filter(
    (c) => c.status === 'Correction made'
  ).length;

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Banner */}
      <section className="rounded-2xl border border-[#D4E2D8] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-6 sm:p-8 shadow-[0_1px_3px_rgba(20,83,45,0.05)]">
        <div className="text-xs font-mono font-medium text-[#15803D] dark:text-[#4ADE80] mb-2">
          Personal University Learning Platform · {totalMods} Modules · {totalSecs} Sections ·{' '}
          {catalog.meta.totalFormulas} Formula Blocks
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#14532D] dark:text-[#ECF2EE] mb-3">
          My Learning Library
        </h1>
        <p className="text-base leading-relaxed text-[#425248] dark:text-[#B5C6BC] max-w-2xl mb-6">
          A complete, interactive reference across Mathematics, Computer Science, Statistics, and
          Data Science. Every definition, derivation, worked example, comparison table, code
          snippet, and appendix from the original 124,750-word reference handbook is preserved in
          full — enhanced with KaTeX typesetting, interactive simulations, and transparent
          fact-checking.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate(continueTarget)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#14532D] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            {continueLabel}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4E2D8] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#0E1712] hover:border-[#15803D] text-sm font-medium text-[#17211B] dark:text-[#ECF2EE] transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
            Search Library
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-7 pt-6 border-t border-[#E5EFE7] dark:border-[#1E2E24] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#4B5850] dark:text-[#A8BCB0]">
                Overall Study Progress
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#15803D] dark:text-[#4ADE80]">
                {completedSecs}/{totalSecs} sections ({overallPct}%) · {completedMods}/{totalMods}{' '}
                modules
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E5EFE7] dark:bg-[#1E2E24] overflow-hidden">
              <div
                className="h-full bg-[#15803D] dark:bg-[#4ADE80] transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>

          <div className="flex sm:justify-end gap-5 text-xs font-mono tabular-nums text-[#4B5850] dark:text-[#A8BCB0]">
            <div>
              <div className="text-lg font-bold text-[#17211B] dark:text-[#ECF2EE]">
                {progress.bookmarks.length}
              </div>
              <div className="font-sans text-[11px] text-[#647067] dark:text-[#8DA295]">
                Bookmarks
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#17211B] dark:text-[#ECF2EE]">
                {correctionsMadeCount}
              </div>
              <div className="font-sans text-[11px] text-[#647067] dark:text-[#8DA295]">
                Logged Corrections
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Subject Categories */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#17211B] dark:text-[#ECF2EE]">
              Four Core Disciplines
            </h2>
            <p className="text-sm text-[#647067] dark:text-[#93A89B]">
              Follow the 48-module university prerequisite syllabus in order or jump directly to any
              subject.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {catalog.parts.map((part) => {
            const Icon = PART_ICONS[part.id];
            const partMods = catalog.modules.filter((m) => m.partId === part.id);
            const partSecs = partMods.flatMap((m) => m.sections);
            const doneSecs = partSecs.filter((s) =>
              progress.completedSections.includes(s.id)
            ).length;
            const doneMods = partMods.filter((m) =>
              progress.completedModules.includes(m.number)
            ).length;
            const pct = Math.round((doneSecs / Math.max(1, partSecs.length)) * 100);
            const partFormulas = partMods.reduce((acc, m) => acc + m.formulaCount, 0);

            return (
              <button
                key={part.id}
                type="button"
                onClick={() => onNavigate(`/subject/${part.slug}`)}
                className="group text-left rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] hover:border-[#15803D] dark:hover:border-[#4ADE80] p-5 transition-all shadow-[0_1px_2px_rgba(20,83,45,0.03)] hover:shadow-md cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg bg-[#DCFCE7] dark:bg-[#143321] text-[#14532D] dark:text-[#86EFAC] flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <div className="text-xs font-mono font-medium text-[#15803D] dark:text-[#4ADE80]">
                          PART {part.id} · Modules {part.moduleRange[0]}–{part.moduleRange[1]}
                        </div>
                        <h3 className="text-lg font-bold text-[#17211B] dark:text-[#ECF2EE] group-hover:text-[#15803D] dark:group-hover:text-[#4ADE80] transition-colors">
                          {part.title}
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#647067] group-hover:text-[#15803D] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-[#4B5850] dark:text-[#A8BCB0]">
                    {part.description}
                  </p>

                  <div className="text-xs text-[#647067] dark:text-[#8DA295] font-mono tabular-nums">
                    {partMods.length} modules · {partSecs.length} sections · {partFormulas} formulas
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#EEF3EF] dark:border-[#1C2A21]">
                  <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#647067] dark:text-[#93A89B]">
                    <span>{doneMods}/{partMods.length} modules complete</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#E6EFE8] dark:bg-[#1E2E24] overflow-hidden">
                    <div
                      className="h-full bg-[#15803D] dark:bg-[#4ADE80]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Study Tools Quick Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            title: 'Formula Library',
            meta: `${catalog.meta.totalFormulas} blocks (F1.1–F48.7 + F-D.1)`,
            desc: 'Search every formula by ID, symbol, or topic with KaTeX rendering.',
            path: '/formulas',
            icon: Calculator,
          },
          {
            title: 'Quick Revision',
            meta: 'Definitions · Conditions · Pitfalls',
            desc: 'Rapid exam review across key assumptions, mistakes, and comparison tables.',
            path: '/revision',
            icon: Layers,
          },
          {
            title: 'Correction Log',
            meta: `${correctionsMadeCount} verified corrections`,
            desc: 'Transparent three-layer audit of mathematical, complexity, and index fixes.',
            path: '/corrections',
            icon: ShieldCheck,
          },
          {
            title: 'Appendices A–F',
            meta: '410-bullet checklist · Glossary',
            desc: 'All six original appendices including searchable syllabus checklist & notation.',
            path: '/appendices',
            icon: FileText,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.path}
              type="button"
              onClick={() => onNavigate(card.path)}
              className="text-left rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] hover:border-[#15803D] p-4 space-y-2 transition-colors cursor-pointer"
            >
              <Icon className="w-5 h-5 text-[#15803D] dark:text-[#4ADE80]" />
              <div className="font-semibold text-sm text-[#17211B] dark:text-[#ECF2EE]">
                {card.title}
              </div>
              <div className="text-[11px] font-mono text-[#15803D] dark:text-[#4ADE80]">
                {card.meta}
              </div>
              <p className="text-xs leading-relaxed text-[#647067] dark:text-[#93A89B]">
                {card.desc}
              </p>
            </button>
          );
        })}
      </section>

      {/* Recently Studied & Bookmarks */}
      {(progress.recentlyViewed.length > 0 || progress.bookmarks.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE]">
              <Clock className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
              Recently Studied
            </div>
            {progress.recentlyViewed.length === 0 ? (
              <p className="text-xs text-[#647067] dark:text-[#93A89B]">
                Open any module to track your study history automatically.
              </p>
            ) : (
              <ul className="divide-y divide-[#EEF3EF] dark:divide-[#1C2A21]">
                {progress.recentlyViewed.slice(0, 5).map((item, idx) => (
                  <li key={`${item.moduleId}-${item.sectionId || idx}`}>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate(
                          item.sectionId
                            ? `/module/${item.moduleId}?section=${encodeURIComponent(
                                item.sectionId
                              )}`
                            : `/module/${item.moduleId}`
                        )
                      }
                      className="w-full text-left py-2 text-xs hover:text-[#15803D] dark:hover:text-[#4ADE80] flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="font-mono text-[11px] text-[#647067] dark:text-[#8DA295] shrink-0">
                        Module {item.moduleId}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE]">
                <Bookmark className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
                Saved Bookmarks
              </div>
              {progress.bookmarks.length > 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('/bookmarks')}
                  className="text-xs font-medium text-[#15803D] dark:text-[#4ADE80] hover:underline cursor-pointer"
                >
                  View all ({progress.bookmarks.length})
                </button>
              )}
            </div>
            {progress.bookmarks.length === 0 ? (
              <p className="text-xs text-[#647067] dark:text-[#93A89B]">
                Bookmark any formula or section while studying for one-click revision.
              </p>
            ) : (
              <ul className="divide-y divide-[#EEF3EF] dark:divide-[#1C2A21]">
                {progress.bookmarks.slice(0, 5).map((bm) => (
                  <li key={bm.id}>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate(
                          bm.formulaId
                            ? bm.moduleId === 0
                              ? '/appendices?tab=D'
                              : `/module/${bm.moduleId}?formula=${encodeURIComponent(
                                  bm.formulaId
                                )}`
                            : bm.sectionId
                            ? `/module/${bm.moduleId}?section=${encodeURIComponent(
                                bm.sectionId
                              )}`
                            : `/module/${bm.moduleId}`
                        )
                      }
                      className="w-full text-left py-2 text-xs hover:text-[#15803D] dark:hover:text-[#4ADE80] flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="truncate font-medium">{bm.label}</span>
                      <span className="font-mono text-[11px] uppercase text-[#647067] dark:text-[#8DA295] shrink-0">
                        {bm.kind}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Original Reference Guide & Notation Conventions (Expandable, Preserved Verbatim) */}
      <section className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowNotation((v) => !v)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#F6FAF7] dark:hover:bg-[#17241C] transition-colors cursor-pointer"
        >
          <div>
            <div className="text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE]">
              Original Handbook Guide, A–J Formula Template &amp; Notation Conventions
            </div>
            <div className="text-xs text-[#647067] dark:text-[#93A89B]">
              Preserved verbatim from the opening front matter of Math_Stats_CS_DS_Reference.txt
            </div>
          </div>
          {showNotation ? (
            <ChevronDown className="w-5 h-5 text-[#647067]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#647067]" />
          )}
        </button>

        {showNotation && (
          <div className="px-5 pb-5 pt-2 border-t border-[#E5EFE7] dark:border-[#1E2E24] overflow-x-auto">
            <pre className="font-mono text-xs leading-relaxed text-[#223027] dark:text-[#C8DACF] whitespace-pre-wrap">
              {catalog.frontMatterIntro}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};
