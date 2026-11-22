import React, { useEffect, useState } from 'react';
import {
  ArrowUp,
  BookMarked,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Layers,
  Menu,
  Monitor,
  Moon,
  RotateCcw,
  Search,
  ShieldCheck,
  Sun,
  X,
} from 'lucide-react';
import { catalog } from '../data/contentLoader';
import type { LearningProgressState, ThemeMode } from '../utilities/storage';
import { ConfirmModal } from './ConfirmModal';

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  progress: LearningProgressState;
  onSetTheme: (theme: ThemeMode) => void;
  onResetProgress: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  progress,
  onSetTheme,
  onResetProgress,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({
    A: true,
    B: false,
    C: false,
    D: false,
  });
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Auto-expand the active part in sidebar when navigating to a module
  useEffect(() => {
    const mMatch = currentPath.match(/^\/module\/(\d+)/);
    if (mMatch) {
      const mod = catalog.modules.find((m) => m.number === Number(mMatch[1]));
      if (mod) {
        setExpandedParts((prev) => ({ ...prev, [mod.partId]: true }));
      }
    }
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Back-to-top scroll watcher
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const topNavItems = [
    { label: 'Home', path: '/' },
    { label: 'Formulas', path: '/formulas' },
    { label: 'Quick Revision', path: '/revision' },
    { label: 'Correction Log', path: '/corrections' },
    { label: 'Appendices', path: '/appendices' },
  ];

  const isNavActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };

  const completedCount = progress.completedModules.length;
  const totalMods = catalog.meta.totalModules;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Progress Summary Strip */}
      <div className="px-4 py-3.5 border-b border-[#E3ECE5] dark:border-[#1E2E24]">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-[#4B5850] dark:text-[#A8BCB0]">Course Progress</span>
          <span className="font-mono tabular-nums font-semibold text-[#15803D] dark:text-[#4ADE80]">
            {completedCount}/{totalMods} modules
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#E3ECE5] dark:bg-[#1E2E24] overflow-hidden">
          <div
            className="h-full bg-[#15803D] dark:bg-[#4ADE80] transition-all duration-300"
            style={{ width: `${Math.round((completedCount / totalMods) * 100)}%` }}
          />
        </div>
      </div>

      {/* Scrollable Curriculum Tree */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5" aria-label="Curriculum navigation">
        <div>
          <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#647067] dark:text-[#8DA295]">
            Subjects (Parts A–D)
          </div>
          <div className="space-y-1">
            {catalog.parts.map((part) => {
              const partMods = catalog.modules.filter((m) => m.partId === part.id);
              const partDone = partMods.filter((m) =>
                progress.completedModules.includes(m.number)
              ).length;
              const isOpen = !!expandedParts[part.id];
              const isSubjectPage = currentPath === `/subject/${part.slug}`;

              return (
                <div key={part.id} className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedParts((prev) => ({ ...prev, [part.id]: !prev[part.id] }))
                      }
                      aria-label={`Toggle Part ${part.id} modules`}
                      className="p-1.5 rounded-md text-[#647067] hover:bg-[#EDF3EE] dark:text-[#93A89B] dark:hover:bg-[#1B2A21] cursor-pointer"
                    >
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/subject/${part.slug}`)}
                      className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-sm font-medium transition-colors cursor-pointer ${
                        isSubjectPage
                          ? 'bg-[#DCFCE7] text-[#14532D] dark:bg-[#143321] dark:text-[#86EFAC]'
                          : 'text-[#17211B] dark:text-[#ECF2EE] hover:bg-[#EDF3EE] dark:hover:bg-[#1B2A21]'
                      }`}
                    >
                      <span className="truncate">
                        {part.id}. {part.shortTitle}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-[#647067] dark:text-[#8DA295] ml-1 shrink-0">
                        {partDone}/{partMods.length}
                      </span>
                    </button>
                  </div>

                  {isOpen && (
                    <div className="ml-5 pl-2 border-l border-[#DCE6DF] dark:border-[#203026] space-y-0.5 py-0.5">
                      {partMods.map((mod) => {
                        const active = currentPath.startsWith(`/module/${mod.number}`);
                        const done = progress.completedModules.includes(mod.number);
                        return (
                          <button
                            key={mod.number}
                            type="button"
                            onClick={() => onNavigate(`/module/${mod.number}`)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                              active
                                ? 'bg-[#15803D] text-white font-medium'
                                : 'text-[#3D4B42] dark:text-[#B5C6BC] hover:bg-[#EDF3EE] dark:hover:bg-[#1B2A21]'
                            }`}
                          >
                            <span className="truncate">
                              <span className="font-mono opacity-75 mr-1">{mod.number}.</span>
                              {mod.title}
                            </span>
                            {done && (
                              <span
                                className={`text-[10px] font-mono shrink-0 ${
                                  active ? 'text-[#DCFCE7]' : 'text-[#15803D] dark:text-[#4ADE80]'
                                }`}
                              >
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Tools */}
        <div>
          <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#647067] dark:text-[#8DA295]">
            Study Tools
          </div>
          <div className="space-y-0.5">
            {[
              { label: `Formula Library (${catalog.meta.totalFormulas})`, path: '/formulas', icon: Calculator },
              { label: 'Quick Revision', path: '/revision', icon: Layers },
              { label: 'Correction Log', path: '/corrections', icon: ShieldCheck },
              { label: 'Appendices (A–F)', path: '/appendices', icon: FileText },
              { label: `Saved Bookmarks (${progress.bookmarks.length})`, path: '/bookmarks', icon: BookMarked },
            ].map((item) => {
              const Icon = item.icon;
              const active = currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#DCFCE7] text-[#14532D] dark:bg-[#143321] dark:text-[#86EFAC]'
                      : 'text-[#35463B] dark:text-[#BFD1C5] hover:bg-[#EDF3EE] dark:hover:bg-[#1B2A21]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer: Theme Switcher, Download ZIP, Reset Progress */}
      <div className="p-3.5 border-t border-[#E3ECE5] dark:border-[#1E2E24] space-y-2.5 bg-[#F4F8F5] dark:bg-[#101914]">
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#E6EFE8] dark:bg-[#19261E] p-1">
          {([
            ['light', 'Light', Sun],
            ['dark', 'Dark', Moon],
            ['system', 'Auto', Monitor],
          ] as const).map(([mode, label, Icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSetTheme(mode)}
              className={`flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                progress.theme === mode
                  ? 'bg-white dark:bg-[#15803D] text-[#14532D] dark:text-white shadow-xs'
                  : 'text-[#4B5850] dark:text-[#93A89B] hover:text-[#17211B] dark:hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <a
            href="./My-Learning-Library-Project.zip"
            download="My-Learning-Library-Project.zip"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#14532D] dark:text-[#86EFAC] hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            Download ZIP
          </a>

          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#647067] hover:text-rose-600 dark:text-[#93A89B] dark:hover:text-rose-400 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] dark:bg-[#0C130F] text-[#17211B] dark:text-[#ECF2EE]">
      {/* Strict 3-Zone Top Header Bar */}
      <header className="sticky top-0 z-30 h-15 border-b border-[#DDE8E0] dark:border-[#1E2E24] bg-white/95 dark:bg-[#101914]/95 backdrop-blur-sm">
        <div className="h-full max-w-[1440px] mx-auto px-4 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark + Mobile Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#35463B] dark:text-[#BFD1C5] hover:bg-[#EDF3EE] dark:hover:bg-[#1B2A21] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 text-left cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="w-8 h-8 rounded-lg bg-[#15803D] text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="font-editorial font-bold text-base sm:text-lg tracking-tight text-[#14532D] dark:text-[#ECF2EE]">
                My Learning Library
              </span>
            </button>
          </div>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {topNavItems.map((item) => {
              const active = isNavActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#DCFCE7] text-[#14532D] dark:bg-[#143321] dark:text-[#86EFAC]'
                      : 'text-[#4B5850] dark:text-[#A8BCB0] hover:text-[#17211B] dark:hover:text-white hover:bg-[#F1F5F2] dark:hover:bg-[#1B2A21]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action (Global Search) */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#D4E2D8] dark:border-[#293D31] bg-[#F8FAF8] dark:bg-[#15201A] hover:border-[#15803D] text-sm text-[#4B5850] dark:text-[#BFD1C5] whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#15803D] dark:text-[#4ADE80]" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[11px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-[#0C130F] border border-[#DCE6DF] dark:border-[#26382D] text-[#647067] dark:text-[#8DA295]">
              ⌘K
            </kbd>
          </button>
        </div>
      </header>

      {/* Main Shell */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-[#DDE8E0] dark:border-[#1E2E24] bg-white dark:bg-[#111B15] sticky top-15 h-[calc(100vh-3.75rem)]">
          {sidebarContent}
        </aside>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative w-80 max-w-[85vw] bg-white dark:bg-[#111B15] h-full shadow-2xl z-10 flex flex-col">
              <div className="h-15 px-4 border-b border-[#DDE8E0] dark:border-[#1E2E24] flex items-center justify-between">
                <span className="font-editorial font-bold text-[#14532D] dark:text-[#ECF2EE]">
                  Navigation
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close drawer"
                  className="p-1.5 rounded-md text-[#647067]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 min-h-0">{sidebarContent}</div>
            </aside>
          </div>
        )}

        {/* Main Page Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-10 py-8">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-[#15803D] hover:bg-[#14532D] text-white shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* In-App Confirmation Modal for Progress Reset */}
      <ConfirmModal
        open={showResetModal}
        title="Reset Learning Progress?"
        description="This will clear all completed sections, completed modules, saved bookmarks, quiz checks, and recent history stored in this browser. Your theme preference will be kept."
        confirmLabel="Reset Progress"
        onConfirm={() => {
          onResetProgress();
          setShowResetModal(false);
        }}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
