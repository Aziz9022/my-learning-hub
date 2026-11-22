import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface RecentItem {
  moduleId: number;
  sectionId?: string;
  title: string;
  visitedAt: number;
}

export interface BookmarkItem {
  id: string; // e.g., "formula:F1.1" or "section:12.6" or "module:40"
  kind: 'formula' | 'section' | 'module';
  label: string;
  moduleId: number;
  sectionId?: string;
  formulaId?: string;
  createdAt: number;
}

export interface LearningProgressState {
  theme: ThemeMode;
  completedSections: string[]; // section IDs like "1.1", "12.6"
  completedModules: number[]; // module numbers 1..48
  bookmarks: BookmarkItem[];
  recentlyViewed: RecentItem[];
  lastVisited: RecentItem | null;
  quizCompleted: Record<string, boolean>; // quiz question ID -> solved correctly
}

const STORAGE_KEY = 'my_learning_library_state_v1';

const DEFAULT_STATE: LearningProgressState = {
  theme: 'light',
  completedSections: [],
  completedModules: [],
  bookmarks: [],
  recentlyViewed: [],
  lastVisited: null,
  quizCompleted: {},
};

function readInitialState(): LearningProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<LearningProgressState>;
    return {
      theme: parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : 'light',
      completedSections: Array.isArray(parsed.completedSections) ? parsed.completedSections : [],
      completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
      lastVisited: parsed.lastVisited ?? null,
      quizCompleted: parsed.quizCompleted && typeof parsed.quizCompleted === 'object' ? parsed.quizCompleted : {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement;
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  root.classList.toggle('dark', isDark);
}

export function useLearningStore() {
  const [state, setState] = useState<LearningProgressState>(() => readInitialState());

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in restricted browsing modes
    }
  }, [state]);

  // Apply theme & listen to system color scheme changes when in 'system' mode
  useEffect(() => {
    applyThemeToDocument(state.theme);
    if (state.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeToDocument('system');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [state.theme]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  const toggleSectionComplete = useCallback((sectionId: string, moduleId: number, allModuleSectionIds: string[]) => {
    setState((prev) => {
      const exists = prev.completedSections.includes(sectionId);
      const nextSections = exists
        ? prev.completedSections.filter((id) => id !== sectionId)
        : [...prev.completedSections, sectionId];

      // Auto-sync module completion if all sections in the module are completed
      const allDone =
        allModuleSectionIds.length > 0 &&
        allModuleSectionIds.every((sid) => nextSections.includes(sid));
      let nextModules = prev.completedModules;
      if (allDone && !nextModules.includes(moduleId)) {
        nextModules = [...nextModules, moduleId];
      } else if (!allDone && exists && nextModules.includes(moduleId)) {
        nextModules = nextModules.filter((m) => m !== moduleId);
      }
      return {
        ...prev,
        completedSections: nextSections,
        completedModules: nextModules,
      };
    });
  }, []);

  const toggleModuleComplete = useCallback((moduleId: number, allModuleSectionIds: string[]) => {
    setState((prev) => {
      const isComplete = prev.completedModules.includes(moduleId);
      if (isComplete) {
        return {
          ...prev,
          completedModules: prev.completedModules.filter((m) => m !== moduleId),
          completedSections: prev.completedSections.filter(
            (sid) => !allModuleSectionIds.includes(sid)
          ),
        };
      }
      const nextSections = Array.from(
        new Set([...prev.completedSections, ...allModuleSectionIds])
      );
      return {
        ...prev,
        completedModules: [...prev.completedModules, moduleId],
        completedSections: nextSections,
      };
    });
  }, []);

  const toggleBookmark = useCallback((item: Omit<BookmarkItem, 'createdAt'>) => {
    setState((prev) => {
      const exists = prev.bookmarks.some((b) => b.id === item.id);
      if (exists) {
        return {
          ...prev,
          bookmarks: prev.bookmarks.filter((b) => b.id !== item.id),
        };
      }
      return {
        ...prev,
        bookmarks: [{ ...item, createdAt: Date.now() }, ...prev.bookmarks],
      };
    });
  }, []);

  const recordVisit = useCallback((moduleId: number, title: string, sectionId?: string) => {
    setState((prev) => {
      const entry: RecentItem = { moduleId, sectionId, title, visitedAt: Date.now() };
      const filtered = prev.recentlyViewed.filter(
        (r) => !(r.moduleId === moduleId && r.sectionId === sectionId)
      );
      return {
        ...prev,
        lastVisited: entry,
        recentlyViewed: [entry, ...filtered].slice(0, 10),
      };
    });
  }, []);

  const markQuizSolved = useCallback((questionId: string, correct: boolean) => {
    setState((prev) => ({
      ...prev,
      quizCompleted: { ...prev.quizCompleted, [questionId]: correct },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...DEFAULT_STATE,
      theme: prev.theme,
    }));
  }, []);

  return {
    state,
    setTheme,
    toggleSectionComplete,
    toggleModuleComplete,
    toggleBookmark,
    recordVisit,
    markQuizSolved,
    resetProgress,
  };
}
