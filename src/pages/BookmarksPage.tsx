import React from 'react';
import { ArrowUpRight, Bookmark, Trash2 } from 'lucide-react';
import type { BookmarkItem, LearningProgressState } from '../utilities/storage';

interface BookmarksPageProps {
  progress: LearningProgressState;
  onNavigate: (path: string) => void;
  onToggleBookmark: (item: Omit<BookmarkItem, 'createdAt'>) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  progress,
  onNavigate,
  onToggleBookmark,
}) => {
  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-2">
        <div className="text-xs font-mono font-semibold text-[#15803D] dark:text-[#4ADE80]">
          PERSONAL STUDY COLLECTION · STORED LOCALLY IN YOUR BROWSER
        </div>
        <h1 className="text-3xl font-bold text-[#14532D] dark:text-[#ECF2EE]">Saved Bookmarks</h1>
        <p className="text-sm text-[#4B5850] dark:text-[#A8BCB0]">
          Quick access to formulas and sections you have flagged for deeper review or exam prep.
        </p>
      </header>

      {progress.bookmarks.length === 0 ? (
        <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] p-10 text-center space-y-3">
          <Bookmark className="w-8 h-8 text-[#9BB0A3] mx-auto" />
          <div className="text-base font-semibold text-[#17211B] dark:text-[#ECF2EE]">
            No bookmarks saved yet
          </div>
          <p className="text-xs text-[#647067] dark:text-[#93A89B] max-w-md mx-auto">
            Click the Save or Bookmark button on any formula card or module section to pin it here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/formulas')}
            className="px-4 py-2 rounded-lg bg-[#15803D] text-white text-xs font-semibold cursor-pointer"
          >
            Browse Formula Library
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#D7E3DA] dark:border-[#24362B] bg-white dark:bg-[#131D17] divide-y divide-[#EEF3EF] dark:divide-[#1C2A21]">
          {progress.bookmarks.map((bm) => {
            const target = bm.formulaId
              ? bm.moduleId === 0
                ? '/appendices?tab=D'
                : `/module/${bm.moduleId}?formula=${encodeURIComponent(bm.formulaId)}`
              : bm.sectionId
              ? `/module/${bm.moduleId}?section=${encodeURIComponent(bm.sectionId)}`
              : `/module/${bm.moduleId}`;

            return (
              <div
                key={bm.id}
                className="px-5 py-3.5 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => onNavigate(target)}
                  className="text-left min-w-0 flex-1 group cursor-pointer"
                >
                  <div className="text-sm font-semibold text-[#17211B] dark:text-[#ECF2EE] group-hover:text-[#15803D] dark:group-hover:text-[#4ADE80] truncate">
                    {bm.label}
                  </div>
                  <div className="text-xs font-mono text-[#647067] dark:text-[#93A89B]">
                    {bm.kind.toUpperCase()} ·{' '}
                    {bm.moduleId === 0 ? 'Appendix D' : `Module ${bm.moduleId}`}
                    {bm.sectionId ? ` · Section ${bm.sectionId}` : ''}
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate(target)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#15803D] dark:text-[#4ADE80] hover:bg-[#DCFCE7]/50 dark:hover:bg-[#143321] cursor-pointer"
                  >
                    Open <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(bm)}
                    aria-label="Remove bookmark"
                    className="p-1.5 rounded-md text-[#647067] hover:text-rose-600 dark:text-[#93A89B] dark:hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
