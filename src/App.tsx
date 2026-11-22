import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { HomePage } from './pages/HomePage';
import { SubjectPage } from './pages/SubjectPage';
import { ModulePage } from './pages/ModulePage';
import { FormulaLibraryPage } from './pages/FormulaLibraryPage';
import { QuickRevisionPage } from './pages/QuickRevisionPage';
import { CorrectionLogPage } from './pages/CorrectionLogPage';
import { AppendicesPage } from './pages/AppendicesPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { useLearningStore } from './utilities/storage';

interface ParsedRoute {
  pathname: string;
  params: URLSearchParams;
}

function parseHashRoute(): ParsedRoute {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  const normalized = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  return {
    pathname: normalized,
    params: new URLSearchParams(queryPart),
  };
}

export default function App() {
  const [route, setRoute] = useState<ParsedRoute>(() => parseHashRoute());
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    state: progress,
    setTheme,
    toggleSectionComplete,
    toggleModuleComplete,
    toggleBookmark,
    recordVisit,
    markQuizSolved,
    resetProgress,
  } = useLearningStore();

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Global Cmd/Ctrl + K shortcut for search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigate = useCallback((targetPath: string) => {
    const clean = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    window.location.hash = `#${clean}`;
    setRoute(parseHashRoute());
    if (!clean.includes('?section=') && !clean.includes('?formula=')) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const pageContent = useMemo(() => {
    const { pathname, params } = route;

    if (pathname === '/' || pathname === '') {
      return (
        <HomePage
          progress={progress}
          onNavigate={navigate}
          onOpenSearch={() => setSearchOpen(true)}
        />
      );
    }

    const subjectMatch = pathname.match(/^\/subject\/([a-z-]+)$/);
    if (subjectMatch) {
      return (
        <SubjectPage
          slug={subjectMatch[1]}
          progress={progress}
          onNavigate={navigate}
        />
      );
    }

    const moduleMatch = pathname.match(/^\/module\/(\d+)$/);
    if (moduleMatch) {
      return (
        <ModulePage
          moduleNumber={Number(moduleMatch[1])}
          targetSection={params.get('section')}
          targetFormula={params.get('formula')}
          progress={progress}
          onNavigate={navigate}
          onToggleSectionComplete={toggleSectionComplete}
          onToggleModuleComplete={toggleModuleComplete}
          onToggleBookmark={toggleBookmark}
          onRecordVisit={recordVisit}
          onMarkQuizSolved={markQuizSolved}
        />
      );
    }

    if (pathname === '/formulas') {
      return (
        <FormulaLibraryPage
          progress={progress}
          onNavigate={navigate}
          onToggleBookmark={toggleBookmark}
        />
      );
    }

    if (pathname === '/revision') {
      return <QuickRevisionPage onNavigate={navigate} />;
    }

    if (pathname === '/corrections') {
      return <CorrectionLogPage onNavigate={navigate} />;
    }

    if (pathname === '/appendices') {
      return (
        <AppendicesPage
          initialTab={params.get('tab')}
          onNavigate={navigate}
        />
      );
    }

    if (pathname === '/bookmarks') {
      return (
        <BookmarksPage
          progress={progress}
          onNavigate={navigate}
          onToggleBookmark={toggleBookmark}
        />
      );
    }

    return (
      <HomePage
        progress={progress}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
      />
    );
  }, [
    route,
    progress,
    navigate,
    toggleSectionComplete,
    toggleModuleComplete,
    toggleBookmark,
    recordVisit,
    markQuizSolved,
  ]);

  return (
    <>
      <Layout
        currentPath={route.pathname}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
        progress={progress}
        onSetTheme={setTheme}
        onResetProgress={resetProgress}
      >
        {pageContent}
      </Layout>

      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={navigate}
      />
    </>
  );
}
