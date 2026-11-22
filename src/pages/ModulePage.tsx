import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  List,
  ShieldAlert,
} from 'lucide-react';
import {
  catalog,
  getPartById,
  loadModuleByNumber,
} from '../data/contentLoader';
import { getCorrectionsForModule } from '../data/corrections';
import { getQuizForModule } from '../data/quizzes';
import { getReferencesForModule } from '../data/references';
import type { ModuleData } from '../types/content';
import type { BookmarkItem, LearningProgressState } from '../utilities/storage';
import { IntroBlocksRenderer, SectionRenderer } from '../components/SectionRenderer';
import { QuizPanel } from '../components/QuizPanel';
import { renderModuleVisualizer } from '../visualizations/registry';

interface ModulePageProps {
  moduleNumber: number;
  targetSection?: string | null;
  targetFormula?: string | null;
  progress: LearningProgressState;
  onNavigate: (path: string) => void;
  onToggleSectionComplete: (sectionId: string, moduleId: number, allSectionIds: string[]) => void;
  onToggleModuleComplete: (moduleId: number, allSectionIds: string[]) => void;
  onToggleBookmark: (item: Omit<BookmarkItem, 'createdAt'>) => void;
  onRecordVisit: (moduleId: number, title: string, sectionId?: string) => void;
  onMarkQuizSolved: (questionId: string, correct: boolean) => void;
}

export const ModulePage: React.FC<ModulePageProps> = ({
  moduleNumber,
  targetSection,
  targetFormula,
  progress,
  onNavigate,
  onToggleSectionComplete,
  onToggleModuleComplete,
  onToggleBookmark,
  onRecordVisit,
  onMarkQuizSolved,
}) => {
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadModuleByNumber(moduleNumber).then((data) => {
      if (!active) return;
      setModuleData(data);
      setLoading(false);
      if (data) {
        onRecordVisit(data.number, `Module ${data.number}: ${data.title}`, targetSection || undefined);
      }
    });
    return () => {
      active = false;
    };
  }, [moduleNumber, targetSection, onRecordVisit]);

  // Smooth scroll to requested section or formula once loaded
  useEffect(() => {
    if (loading || !moduleData) return;
    const domId = targetFormula
      ? `formula-${targetFormula}`
      : targetSection
      ? `section-${targetSection}`
      : null;
    if (domId) {
      window.setTimeout(() => {
        const el = document.getElementById(domId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [loading, moduleData, targetSection, targetFormula]);

  const bookmarkedIds = useMemo(
    () => new Set(progress.bookmarks.map((b) => b.id)),
    [progress.bookmarks]
  );

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-[#647067] dark:text-[#93A89B]">
        Loading Module {moduleNumber}…
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">Module {moduleNumber} not found</h1>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="px-4 py-2 rounded-lg bg-[#15803D] text-white text-sm font-medium cursor-pointer"
        >
          Return Home
        </button>
      </div>
    );
  }

  const part = getPartById(moduleData.partId);
  const allSectionIds = moduleData.sections.map((s) => s.id);
  const completedCount = allSectionIds.filter((sid) =>
    progress.completedSections.includes(sid)
  ).length;
  const isModuleComplete = progress.completedModules.includes(moduleData.number);

  const prevMod = catalog.modules.find((m) => m.number === moduleData.number - 1);
  const nextMod = catalog.modules.find((m) => m.number === moduleData.number + 1);
  const moduleCorrections = getCorrectionsForModule(moduleData.number);
  const moduleRefs = getReferencesForModule(moduleData.number);
  const moduleQuizzes = getQuizForModule(moduleData.number);
  const visualizer = renderModuleVisualizer(moduleData.number);

  return (
    <article className="space-y-8 pb-12">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="text-xs text-[#647067] dark:text-[#93A89B] flex flex-wrap items-center gap-1.5"
      >
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-[#15803D] dark:hover:text-[#4ADE80] cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        {part && (
          <>
            <button
              type="button"
              onClick={() => onNavigate(`/subject/${part.slug}`)}
              className="hover:text-[#15803D] dark:hover:text-[#4ADE80] cursor-pointer"
            >
              Part {part.id}: {part.title}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-[#17211B] dark:text-[#ECF2EE] font-medium">
          Module {moduleData.number}
        </span>
      </nav>

      {/* Module Header */}
      <header className="rounded-2xl border border-[#D4E2D8] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-medium text-[#15803D] dark:text-[#4ADE80]">
              {moduleData.subPartCode}. {moduleData.subPartTitle} · MODULE {moduleData.number} of 48
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14532D] dark:text-[#ECF2EE]">
              {moduleData.title}
            </h1>
            <div className="text-xs font-mono tabular-nums text-[#647067] dark:text-[#93A89B] flex flex-wrap items-center gap-2">
              <span>{moduleData.sections.length} sections</span>
              <span>·</span>
              <span>{moduleData.formulaIds.length} formula blocks</span>
              <span>·</span>
              <span>{moduleData.wordCount.toLocaleString()} words</span>
              <span>·</span>
              <span>~{Math.max(3, Math.round(moduleData.wordCount / 220))} min study</span>
              {moduleCorrections.length > 0 && (
                <>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('/corrections')}
                    className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-sans font-medium hover:underline cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {moduleCorrections.length} audit note{moduleCorrections.length > 1 ? 's' : ''}
                  </button>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleModuleComplete(moduleData.number, allSectionIds)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
              isModuleComplete
                ? 'bg-[#15803D] border-[#15803D] text-white'
                : 'border-[#D4E2D8] dark:border-[#293D31] text-[#17211B] dark:text-[#ECF2EE] hover:border-[#15803D]'
            }`}
          >
            {isModuleComplete ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4 text-[#647067]" />
            )}
            {isModuleComplete ? 'Module Completed' : 'Mark Module Complete'}
          </button>
        </div>

        {/* Module Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono tabular-nums text-[#647067] dark:text-[#93A89B]">
            <span>Section Progress</span>
            <span>
              {completedCount}/{allSectionIds.length} completed
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E5EFE7] dark:bg-[#1E2E24] overflow-hidden">
            <div
              className="h-full bg-[#15803D] dark:bg-[#4ADE80] transition-all"
              style={{
                width: `${Math.round(
                  (completedCount / Math.max(1, allSectionIds.length)) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* In-Module Table of Contents */}
        <div className="pt-3 border-t border-[#E5EFE7] dark:border-[#1E2E24]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4B5850] dark:text-[#A8BCB0] mb-2">
            <List className="w-3.5 h-3.5 text-[#15803D] dark:text-[#4ADE80]" />
            In This Module
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {moduleData.sections.map((sec) => {
              const done = progress.completedSections.includes(sec.id);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`section-${sec.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-left text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#F2F8F4] dark:hover:bg-[#192820] text-[#2C3A31] dark:text-[#C8DACF] flex items-center gap-2 cursor-pointer"
                >
                  <span
                    className={`font-mono text-[11px] shrink-0 ${
                      done
                        ? 'text-[#15803D] dark:text-[#4ADE80] font-bold'
                        : 'text-[#647067] dark:text-[#8DA295]'
                    }`}
                  >
                    {done ? '✓' : sec.id}
                  </span>
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Module Intro Content (if original file had preamble before Section n.1) */}
      <IntroBlocksRenderer
        blocks={moduleData.introBlocks}
        moduleId={moduleData.number}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={onToggleBookmark}
        onNavigate={onNavigate}
      />

      {/* Interactive Visualization Sandbox */}
      {visualizer && <div>{visualizer}</div>}

      {/* All Numbered Sections (100% Lossless Source Content) */}
      <div>
        {moduleData.sections.map((sec) => (
          <SectionRenderer
            key={sec.id}
            section={sec}
            moduleId={moduleData.number}
            isCompleted={progress.completedSections.includes(sec.id)}
            onToggleComplete={() =>
              onToggleSectionComplete(sec.id, moduleData.number, allSectionIds)
            }
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={onToggleBookmark}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {/* Optional Supplementary Practice Quiz */}
      <QuizPanel
        questions={moduleQuizzes}
        quizCompleted={progress.quizCompleted}
        onMarkSolved={onMarkQuizSolved}
      />

      {/* Curated Supplementary External References */}
      {moduleRefs.length > 0 && (
        <section className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
              Further Reading &amp; Official Documentation
            </h3>
            <span className="text-xs text-[#647067] dark:text-[#93A89B]">
              Supplementary Material (External)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moduleRefs.map((ref) => (
              <a
                key={ref.id}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#E5EFE7] dark:border-[#1E2E24] hover:border-[#15803D] p-3.5 block transition-colors space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-[#14532D] dark:text-[#86EFAC]">
                    {ref.title}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#647067] shrink-0 mt-0.5" />
                </div>
                <div className="text-xs text-[#647067] dark:text-[#93A89B]">
                  {ref.creator} · {ref.type}
                </div>
                <p className="text-xs text-[#35463B] dark:text-[#BFD1C5]">{ref.topic}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Previous / Next Module Navigation */}
      <nav
        aria-label="Module sequence navigation"
        className="pt-4 border-t border-[#DDE8E0] dark:border-[#1E2E24] grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {prevMod ? (
          <button
            type="button"
            onClick={() => onNavigate(`/module/${prevMod.number}`)}
            className="text-left rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] hover:border-[#15803D] p-4 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[#647067] dark:text-[#93A89B]">
                Previous · Module {prevMod.number}
              </div>
              <div className="text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE] truncate">
                {prevMod.title}
              </div>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextMod && (
          <button
            type="button"
            onClick={() => onNavigate(`/module/${nextMod.number}`)}
            className="text-right rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] hover:border-[#15803D] p-4 flex items-center justify-end gap-3 transition-colors cursor-pointer"
          >
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-[#647067] dark:text-[#93A89B]">
                Next · Module {nextMod.number}
              </div>
              <div className="text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE] truncate">
                {nextMod.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
          </button>
        )}
      </nav>
    </article>
  );
};
