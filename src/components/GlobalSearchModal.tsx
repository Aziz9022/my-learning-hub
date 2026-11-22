import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Calculator, CheckSquare, Search, ShieldAlert, X } from 'lucide-react';
import { allFormulas, appendicesData, catalog } from '../data/contentLoader';
import { CORRECTION_LOG } from '../data/corrections';

interface SearchResultItem {
  id: string;
  kind: 'module' | 'section' | 'formula' | 'checklist' | 'correction';
  title: string;
  subtitle: string;
  path: string;
}

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  open,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const results = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return catalog.modules.slice(0, 8).map((m) => ({
        id: `mod-${m.number}`,
        kind: 'module',
        title: `Module ${m.number}: ${m.title}`,
        subtitle: `Part ${m.partId} · ${m.subPartCode} ${m.subPartTitle} · ${m.sections.length} sections`,
        path: `/module/${m.number}`,
      }));
    }

    const out: SearchResultItem[] = [];

    // 1. Modules
    for (const m of catalog.modules) {
      if (
        `module ${m.number} ${m.title} ${m.subPartTitle}`.toLowerCase().includes(q)
      ) {
        out.push({
          id: `mod-${m.number}`,
          kind: 'module',
          title: `Module ${m.number}: ${m.title}`,
          subtitle: `Part ${m.partId} · ${m.subPartCode} · ${m.formulaCount} formulas`,
          path: `/module/${m.number}`,
        });
      }
      // 2. Numbered sections
      for (const s of m.sections) {
        if (`${s.id} ${s.title}`.toLowerCase().includes(q)) {
          out.push({
            id: `sec-${s.id}`,
            kind: 'section',
            title: `${s.id} ${s.title}`,
            subtitle: `Module ${m.number}: ${m.title}`,
            path: `/module/${m.number}?section=${encodeURIComponent(s.id)}`,
          });
        }
      }
    }

    // 3. All 237 Formulas (by ID, title, symbols, body)
    for (const f of allFormulas) {
      const haystack = `${f.id} ${f.title} ${f.formulaBody} ${f.parts.C || ''}`.toLowerCase();
      if (haystack.includes(q)) {
        out.push({
          id: `f-${f.id}`,
          kind: 'formula',
          title: `${f.id} — ${f.title}`,
          subtitle:
            f.moduleId === 0
              ? 'Appendix D · Information Theory'
              : `Module ${f.moduleId} · Section ${f.sectionId}`,
          path:
            f.moduleId === 0
              ? '/appendices?tab=D'
              : `/module/${f.moduleId}?formula=${encodeURIComponent(f.id)}`,
        });
      }
    }

    // 4. Correction log
    for (const c of CORRECTION_LOG) {
      if (
        `${c.id} ${c.formulaId || ''} ${c.category} ${c.originalStatement} ${c.correctedStatement}`
          .toLowerCase()
          .includes(q)
      ) {
        out.push({
          id: `corr-${c.id}`,
          kind: 'correction',
          title: `${c.id}: ${c.status} (${c.formulaId || `Section ${c.sectionId}`})`,
          subtitle: c.correctedStatement.slice(0, 95) + '…',
          path: '/corrections',
        });
      }
    }

    // 5. Appendix C 410-bullet syllabus checklist
    const checklist = appendicesData.C?.checklist || [];
    for (const item of checklist) {
      if (item.topic.toLowerCase().includes(q)) {
        out.push({
          id: `chk-${item.id}`,
          kind: 'checklist',
          title: item.topic,
          subtitle: `Syllabus Bullet #${item.id} · Module ${item.moduleId} (${item.refText})`,
          path: item.sectionRefs[0]
            ? `/module/${item.moduleId}?section=${encodeURIComponent(item.sectionRefs[0])}`
            : `/module/${item.moduleId}`,
        });
      }
      if (out.length >= 36) break;
    }

    return out.slice(0, 32);
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-[#D4E2D8] dark:border-[#24362B] bg-white dark:bg-[#131D17] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5EFE7] dark:border-[#1E2E24]">
          <Search className="w-5 h-5 text-[#15803D] dark:text-[#4ADE80] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 48 modules, 277 sections, 237 formulas (e.g. F12.6, Bayes, SVD, Gini)..."
            className="w-full bg-transparent text-sm text-[#17211B] dark:text-[#ECF2EE] placeholder-[#647067] dark:placeholder-[#8DA295] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-md text-[#647067] hover:text-[#17211B] dark:text-[#93A89B] dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#EEF3EF] dark:divide-[#1C2A21]">
          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#647067] dark:text-[#93A89B]">
              No matching modules, sections, formulas, or syllabus topics found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-[#F3F8F4] dark:hover:bg-[#18261E] flex items-start gap-3 transition-colors cursor-pointer"
              >
                <div className="mt-0.5 text-[#15803D] dark:text-[#4ADE80] shrink-0">
                  {item.kind === 'formula' ? (
                    <Calculator className="w-4 h-4" />
                  ) : item.kind === 'correction' ? (
                    <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : item.kind === 'checklist' ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[#17211B] dark:text-[#ECF2EE] truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#647067] dark:text-[#93A89B] truncate">
                    {item.subtitle}
                  </div>
                </div>
                <span className="text-[11px] font-mono uppercase text-[#647067] dark:text-[#8DA295] shrink-0">
                  {item.kind}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-[#F8FAF8] dark:bg-[#0E1712] border-t border-[#E5EFE7] dark:border-[#1E2E24] flex items-center justify-between text-[11px] text-[#647067] dark:text-[#93A89B]">
          <span>Tip: Search by formula ID (e.g. F40.7), symbol, or topic</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
