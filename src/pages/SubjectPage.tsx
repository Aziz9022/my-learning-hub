import React from 'react';
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { catalog, getPartBySlug } from '../data/contentLoader';
import { getReferencesForPart } from '../data/references';
import type { LearningProgressState } from '../utilities/storage';

interface SubjectPageProps {
  slug: string;
  progress: LearningProgressState;
  onNavigate: (path: string) => void;
}

export const SubjectPage: React.FC<SubjectPageProps> = ({
  slug,
  progress,
  onNavigate,
}) => {
  const part = getPartBySlug(slug);
  if (!part) {
    return (
      <div className="py-12 text-center space-y-3">
        <h1 className="text-2xl font-bold">Subject not found</h1>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="px-4 py-2 rounded-lg bg-[#15803D] text-white text-sm font-medium cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const partMods = catalog.modules.filter((m) => m.partId === part.id);
  const totalSecs = partMods.reduce((acc, m) => acc + m.sections.length, 0);
  const doneSecs = partMods
    .flatMap((m) => m.sections)
    .filter((s) => progress.completedSections.includes(s.id)).length;
  const pct = Math.round((doneSecs / Math.max(1, totalSecs)) * 100);
  const references = getReferencesForPart(part.id);

  return (
    <div className="space-y-8 pb-10">
      {/* Breadcrumb */}
      <div className="text-xs text-[#647067] dark:text-[#93A89B] flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-[#15803D] dark:hover:text-[#4ADE80] cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <span className="text-[#17211B] dark:text-[#ECF2EE] font-medium">
          Part {part.id}: {part.title}
        </span>
      </div>

      {/* Subject Header */}
      <header className="rounded-2xl border border-[#D4E2D8] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-6 space-y-4">
        <div className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
          PART {part.id} · Modules {part.moduleRange[0]}–{part.moduleRange[1]} · {partMods.length}{' '}
          Modules · {totalSecs} Numbered Sections
        </div>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#ECF2EE]">{part.title}</h1>
        <p className="text-sm sm:text-base leading-relaxed text-[#425248] dark:text-[#B5C6BC]">
          {part.description}
        </p>

        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between text-xs font-mono tabular-nums">
            <span className="text-[#4B5850] dark:text-[#A8BCB0] font-sans">Subject Completion</span>
            <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
              {doneSecs}/{totalSecs} sections ({pct}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#E5EFE7] dark:bg-[#1E2E24] overflow-hidden">
            <div
              className="h-full bg-[#15803D] dark:bg-[#4ADE80] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Sub-Part Groupings & Modules */}
      <div className="space-y-8">
        {part.subParts.map((sp) => {
          const spModules = partMods.filter((m) => m.subPartCode === sp.code);
          return (
            <section key={sp.code} className="space-y-3.5">
              <div className="flex items-baseline gap-2.5 border-b border-[#DDE8E0] dark:border-[#1E2E24] pb-2">
                <span className="font-mono text-xs font-bold text-[#15803D] dark:text-[#4ADE80]">
                  {sp.code}
                </span>
                <h2 className="text-xl font-bold text-[#17211B] dark:text-[#ECF2EE]">
                  {sp.title}
                </h2>
              </div>

              <div className="space-y-3">
                {spModules.map((mod) => {
                  const modDone = progress.completedModules.includes(mod.number);
                  const modSecDone = mod.sections.filter((s) =>
                    progress.completedSections.includes(s.id)
                  ).length;

                  return (
                    <div
                      key={mod.number}
                      className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] hover:border-[#15803D] transition-colors p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono text-[#647067] dark:text-[#93A89B]">
                            <span className="font-semibold text-[#15803D] dark:text-[#4ADE80]">
                              MODULE {mod.number}
                            </span>
                            <span>·</span>
                            <span>{mod.sections.length} sections</span>
                            <span>·</span>
                            <span>{mod.formulaCount} formulas</span>
                            <span>·</span>
                            <span>~{Math.max(3, Math.round(mod.wordCount / 220))} min</span>
                            {modDone && (
                              <>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1 text-[#15803D] dark:text-[#4ADE80] font-sans font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                                </span>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onNavigate(`/module/${mod.number}`)}
                            className="text-left text-lg font-bold text-[#17211B] dark:text-[#ECF2EE] hover:text-[#15803D] dark:hover:text-[#4ADE80] transition-colors cursor-pointer"
                          >
                            {mod.title}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onNavigate(`/module/${mod.number}`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F2F8F4] dark:bg-[#192820] hover:bg-[#15803D] hover:text-white text-xs font-semibold text-[#14532D] dark:text-[#86EFAC] transition-colors cursor-pointer shrink-0"
                        >
                          Open Module
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Numbered Sections Quick Links */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-[#EEF3EF] dark:border-[#1C2A21]">
                        {mod.sections.map((sec) => {
                          const isSecDone = progress.completedSections.includes(sec.id);
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() =>
                                onNavigate(
                                  `/module/${mod.number}?section=${encodeURIComponent(sec.id)}`
                                )
                              }
                              className="text-left text-xs py-1 px-2 rounded hover:bg-[#F2F8F4] dark:hover:bg-[#192820] text-[#35463B] dark:text-[#BFD1C5] flex items-center gap-1.5 cursor-pointer"
                            >
                              <span
                                className={`font-mono text-[11px] shrink-0 ${
                                  isSecDone
                                    ? 'text-[#15803D] dark:text-[#4ADE80] font-bold'
                                    : 'text-[#647067] dark:text-[#8DA295]'
                                }`}
                              >
                                {isSecDone ? '✓' : sec.id}
                              </span>
                              <span className="truncate">{sec.title}</span>
                            </button>
                          );
                        })}
                      </div>

                      {modSecDone > 0 && !modDone && (
                        <div className="text-[11px] font-mono text-[#15803D] dark:text-[#4ADE80]">
                          Progress: {modSecDone}/{mod.sections.length} sections completed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Curated Supplementary External References */}
      {references.length > 0 && (
        <section className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#17211B] dark:text-[#ECF2EE]">
              Supplementary External References for {part.title}
            </h2>
            <span className="text-xs text-[#647067] dark:text-[#93A89B]">
              Supplementary Material · External Academic Resources
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {references.map((ref) => (
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
    </div>
  );
};
