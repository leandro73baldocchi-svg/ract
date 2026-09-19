/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { UniversitiesView } from './components/UniversitiesView';
import { PublicRssFeedsModal } from './components/PublicRssFeedsModal';
import { NewsArticle, DailyBriefing, CategoryType, CustomCategory } from './types';
import { ACADEMIC_ARTICLES } from './data/academicArticles';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import {
  DEFAULT_BASE_CATEGORIES,
  getCustomCategories,
  getAllManagedArticles,
  getDeletedArticleIds,
  getCustomRssFeeds,
  CustomRssFeed,
  getShowRadarBriefingPreference,
  setShowRadarBriefingPreference,
  syncPortalWithServer,
} from './utils/customDataManager';
import {
  getOfflineArticles,
  saveArticleOffline,
  removeArticleOffline,
  getAutoTranslatePreference,
  setAutoTranslatePreference,
  getDarkModePreference,
  setDarkModePreference,
} from './utils/offlineStorage';
import { BookOpen, AlertCircle, WifiOff, Rss } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => ACADEMIC_ARTICLES);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(() => ({
    date: new Date().toLocaleDateString('pt-BR'),
    edition: "Edição Global Acadêmica",
    headline: "Avanços em Ciência, Educação e Tecnologias Críticas",
    executiveSummary: "Acompanhe as publicações de periódicos revisados por pares e repositórios acadêmicos internacionais.",
    keyBulletPoints: [
      "Estudos da OCDE e UNESCO demonstram impacto de metodologias investigativas na aprendizagem.",
      "Avanços em biotecnologia e genômica ampliam precisão diagnóstica.",
      "Novos modelos de computação e algoritmos abrem fronteiras na física e matemática aplicada."
    ],
    scienceHighlight: {
      title: "Publicações Abertas e Acessibilidade Científica",
      source: "Consórcio Acadêmico Global",
      impact: "Acesso universal a evidências científicas validadas."
    },
    techHighlight: {
      title: "Algoritmos Científicos e Engenharia Aplicada",
      source: "IEEE & MIT Tech",
      impact: "Modelagem de alta resolução para desafios globais."
    },
    sourcesActive: ["Nature", "Science", "UNESCO", "arXiv", "USP", "Oxford"],
    lastSync: new Date().toISOString()
  }));
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOfflineOnly, setShowOfflineOnly] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // RSS Feeds State & Modal
  const [rssFeeds, setRssFeeds] = useState<CustomRssFeed[]>(() => getCustomRssFeeds());
  const [isRssModalOpen, setIsRssModalOpen] = useState<boolean>(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getDarkModePreference());

  // Show / Hide Radar Briefing card (Defaults to false/hidden so articles appear immediately)
  const [showRadarBriefing, setShowRadarBriefing] = useState<boolean>(() => getShowRadarBriefingPreference());

  const handleToggleRadarBriefing = () => {
    setShowRadarBriefing((prev) => {
      const next = !prev;
      setShowRadarBriefingPreference(next);
      return next;
    });
  };

  // Custom Categories & Managed Articles (Secret Admin Panel)
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => {
    return getCustomCategories().filter((c) => c && c.id !== 'neurociencias' && c.id !== 'psico-social');
  });
  const [managedArticles, setManagedArticles] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [deletedIdsState, setDeletedIdsState] = useState<Set<string>>(() => getDeletedArticleIds());
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Check URL parameter or hash: ONLY opens if explicitly typed in the browser's address bar (e.g., /#admin, /admin, ?admin)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlForAdmin = () => {
      try {
        const fullUrl = window.location.href.toLowerCase();
        const search = window.location.search.toLowerCase();
        const hash = (window.location.hash || '').toLowerCase();
        const pathname = window.location.pathname.toLowerCase();
        const params = new URLSearchParams(window.location.search);

        const isAdminRequested =
          hash === '#admin' ||
          hash.startsWith('#admin') ||
          hash === '#painel' ||
          hash.startsWith('#painel') ||
          hash.includes('admin') ||
          params.has('admin') ||
          params.has('painel') ||
          params.has('gestao') ||
          pathname.endsWith('/admin') ||
          pathname.endsWith('/painel') ||
          fullUrl.includes('/#admin') ||
          search.includes('admin');

        setIsAdminOpen(isAdminRequested);
      } catch (err) {
        console.warn('Erro ao checar rota de admin:', err);
      }
    };

    checkUrlForAdmin();
    window.addEventListener('popstate', checkUrlForAdmin);
    window.addEventListener('hashchange', checkUrlForAdmin);

    // Polling de segurança leve caso a hash seja alterada sem disparo do evento
    const hashInterval = setInterval(checkUrlForAdmin, 500);

    return () => {
      window.removeEventListener('popstate', checkUrlForAdmin);
      window.removeEventListener('hashchange', checkUrlForAdmin);
      clearInterval(hashInterval);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    // Clean URL without reloading page
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('admin');
        url.searchParams.delete('gestao');
        url.searchParams.delete('painel');
        if (url.hash.toLowerCase().includes('admin') || url.hash.toLowerCase().includes('painel')) {
          url.hash = '';
        }
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + (url.hash || ''));
      } catch (e) {
        window.location.hash = '';
      }
    }
  };

  const handleDataUpdated = async () => {
    const synced = await syncPortalWithServer();
    if (synced) {
      setCustomCategories(synced.customCategories);
      setManagedArticles(synced.managedArticles);
      setRssFeeds(synced.customRssFeeds);
      setDeletedIdsState(new Set(synced.deletedArticleIds));
    } else {
      setCustomCategories(getCustomCategories());
      setManagedArticles(getAllManagedArticles());
      setRssFeeds(getCustomRssFeeds());
      setDeletedIdsState(getDeletedArticleIds());
    }
    loadNewsFeed(true);
  };

  const allCategoriesList = useMemo(() => {
    return [...DEFAULT_BASE_CATEGORIES, ...customCategories];
  }, [customCategories]);

  // Offline saved articles state
  const [offlineArticles, setOfflineArticles] = useState<NewsArticle[]>(() => getOfflineArticles());

  // Auto-translate preference state (defaults to true for Portuguese translation)
  const [autoTranslate, setAutoTranslate] = useState<boolean>(() => getAutoTranslatePreference());

  // Real-time network status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Sync dark class on <html>, <body>, and document styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.body.style.backgroundColor = '#101010';
        document.body.style.color = '#E8E8E8';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = '#FBFBFA';
        document.body.style.color = '#1A1A1A';
      }
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    setDarkModePreference(nextVal);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineOnly(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronização segura com o servidor na inicialização e atualização periódica suave
  useEffect(() => {
    let isMounted = true;
    let isSyncing = false;

    const pullServerUpdates = async () => {
      if (isSyncing || document.visibilityState !== 'visible') return;
      isSyncing = true;
      try {
        const synced = await syncPortalWithServer();
        if (synced && isMounted) {
          setCustomCategories(synced.customCategories);
          setManagedArticles(synced.managedArticles);
          setRssFeeds(synced.customRssFeeds);
          setDeletedIdsState(new Set(synced.deletedArticleIds));
        }
      } catch (e) {
        // Silencioso em caso de conexão instável
      } finally {
        isSyncing = false;
      }
    };

    pullServerUpdates();
    loadNewsFeed(false);

    // Verificação periódica a cada 8 segundos em segundo plano e ao focar a tela
    const intervalId = setInterval(pullServerUpdates, 8000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pullServerUpdates();
    };
    window.addEventListener('focus', pullServerUpdates);
    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('focus', pullServerUpdates);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const loadNewsFeed = async (force: boolean = false) => {
    if (force) setIsRefreshing(true);
    setErrorNotice(null);

    // If device is offline, rely directly on saved offline articles
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const activeFeeds = getCustomRssFeeds().filter((f) => f.enabled !== false);
      const [newsRes, briefingRes] = await Promise.allSettled([
        fetch(`/api/news${force ? '?force=true' : ''}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force, customFeeds: activeFeeds }),
        }).then((r) => r.json()),
        fetch(`/api/daily-briefing${force ? '?force=true' : ''}`).then((r) => r.json()),
      ]);

      if (newsRes.status === 'fulfilled' && newsRes.value?.success && Array.isArray(newsRes.value.articles) && newsRes.value.articles.length > 0) {
        setArticles(newsRes.value.articles);
      } else {
        // Client-side fallback: direct academic articles catalog
        setArticles(ACADEMIC_ARTICLES);
      }

      if (briefingRes.status === 'fulfilled' && briefingRes.value?.success) {
        setBriefing(briefingRes.value.briefing);
      } else {
        setBriefing({
          date: new Date().toLocaleDateString('pt-BR'),
          edition: "Edição Global Acadêmica",
          headline: "Avanços em Ciência, Educação e Tecnologias Críticas",
          executiveSummary: "Acompanhe as publicações de periódicos revisados por pares e repositórios acadêmicos internacionais.",
          keyBulletPoints: [
            "Estudos da OCDE e UNESCO demonstram impacto de metodologias investigativas na aprendizagem.",
            "Avanços em biotecnologia e genômica ampliam precisão diagnóstica.",
            "Novos modelos de computação e algoritmos abrem fronteiras na física e matemática aplicada."
          ],
          scienceHighlight: {
            title: "Publicações Abertas e Acessibilidade Científica",
            source: "Consórcio Acadêmico Global",
            impact: "Acesso universal a evidências científicas validadas."
          },
          techHighlight: {
            title: "Algoritmos Científicos e Engenharia Aplicada",
            source: "IEEE & MIT Tech",
            impact: "Modelagem de alta resolução para desafios globais."
          },
          sourcesActive: ["Nature", "Science", "UNESCO", "arXiv", "USP", "Oxford"],
          lastSync: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Network sync notice, activating direct client dataset:', err);
      setArticles(ACADEMIC_ARTICLES);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleToggleAutoTranslate = () => {
    const nextVal = !autoTranslate;
    setAutoTranslate(nextVal);
    setAutoTranslatePreference(nextVal);
  };

  const handleToggleSaveOffline = (article: NewsArticle) => {
    const isSaved = offlineArticles.some((a) => a.id === article.id);
    if (isSaved) {
      removeArticleOffline(article.id);
      setOfflineArticles(getOfflineArticles());
    } else {
      saveArticleOffline(article);
      setOfflineArticles(getOfflineArticles());
    }
  };

  const savedIdsSet = useMemo(() => {
    return new Set(offlineArticles.map((a) => a.id));
  }, [offlineArticles]);

  // Current dataset to display:
  // Merges user managed articles (custom edits/additions) with live aggregated articles from RSS feeds
  const displaySource = useMemo(() => {
    if (showOfflineOnly || (!isOnline && managedArticles.length === 0)) {
      return offlineArticles;
    }
    
    // Start with managed articles (which contains local edits, deletions, custom articles)
    const combined = [...managedArticles];
    const existingIds = new Set(managedArticles.map((a) => a.id));
    const deletedIds = deletedIdsState;

    // If live RSS feeds were fetched from /api/news, include those that aren't duplicated or deleted
    for (const art of articles) {
      if (!existingIds.has(art.id) && !deletedIds.has(art.id)) {
        combined.push(art);
      }
    }

    return combined;
  }, [showOfflineOnly, isOnline, managedArticles, articles, offlineArticles, deletedIdsState]);

  // Filter by publication origin: All, Peer-reviewed Academic Articles, or Live RSS News
  const [feedOriginFilter, setFeedOriginFilter] = useState<'all' | 'academic' | 'rss'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(18);

  // Reset pagination when active filters change
  useEffect(() => {
    setVisibleCount(18);
  }, [activeCategory, searchQuery, feedOriginFilter]);

  // Matches for category and search
  const categoryMatchedArticles = useMemo(() => {
    return displaySource.filter((article) => {
      // Category filter
      if (activeCategory !== 'all' && article.sourceCategory !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitlePt = (article.titlePt || '').toLowerCase().includes(q);
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSummary = (article.summaryPt || article.summary).toLowerCase().includes(q);
        const matchesSource = article.source.toLowerCase().includes(q);
        const matchesTags = article.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesTitlePt && !matchesTitle && !matchesSummary && !matchesSource && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [displaySource, activeCategory, searchQuery]);

  // Distinguish academic papers vs live RSS dispatches
  const isAcademicArticle = (a: NewsArticle) => {
    return Boolean(a.isPeerReviewed || a.articleType !== 'news' || a.fullArticle || a.doi);
  };

  const academicCount = useMemo(() => {
    return categoryMatchedArticles.filter(isAcademicArticle).length;
  }, [categoryMatchedArticles]);

  const rssCount = useMemo(() => {
    return categoryMatchedArticles.length - academicCount;
  }, [categoryMatchedArticles, academicCount]);

  // Filtered articles based on selected origin
  const filteredArticles = useMemo(() => {
    if (feedOriginFilter === 'academic') {
      return categoryMatchedArticles.filter(isAcademicArticle);
    }
    if (feedOriginFilter === 'rss') {
      return categoryMatchedArticles.filter((a) => !isAcademicArticle(a));
    }
    return categoryMatchedArticles;
  }, [categoryMatchedArticles, feedOriginFilter]);

  // Visible page slice
  const visibleArticles = useMemo(() => {
    return filteredArticles.slice(0, visibleCount);
  }, [filteredArticles, visibleCount]);

  const formattedDate = useMemo(() => {
    const d = new Date();
    const str = d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark ' : ''}bg-[#FBFBFA] dark:bg-[#101010] text-[#1A1A1A] dark:text-[#E8E8E8] flex flex-col font-sans selection:bg-stone-200 dark:selection:bg-stone-800 transition-colors duration-200`}>
      {/* Editorial Header with Menu Placed Immediately Below Masthead */}
      <Header
        date={formattedDate}
        isOnline={isOnline}
        isRefreshing={isRefreshing}
        onRefresh={() => loadNewsFeed(true)}
        savedCount={offlineArticles.length}
        showOfflineOnly={showOfflineOnly}
        onToggleOfflineOnly={() => setShowOfflineOnly((prev) => !prev)}
        autoTranslate={autoTranslate}
        onToggleAutoTranslate={handleToggleAutoTranslate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        showRadarBriefing={showRadarBriefing}
        onToggleRadarBriefing={handleToggleRadarBriefing}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (showOfflineOnly) setShowOfflineOnly(false);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoriesList={allCategoriesList}
        onOpenRssModal={() => setIsRssModalOpen(true)}
        rssFeedsCount={rssFeeds.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Connection Notice if Offline */}
        {!isOnline && (
          <div className="mb-6 p-3 bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded text-xs text-stone-800 dark:text-stone-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-stone-600 dark:text-stone-400 shrink-0" />
              <span>
                <strong>Modo Offline Ativo:</strong> Você está visualizando os artigos salvos no seu dispositivo para leitura sem internet.
              </span>
            </div>
            <span className="font-mono-subtle text-[11px] text-stone-500 dark:text-stone-400">RACT Offline</span>
          </div>
        )}

        {/* Temporary Error Notice */}
        {errorNotice && (
          <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              onClick={() => loadNewsFeed(true)}
              className="text-amber-900 dark:text-amber-300 underline font-medium hover:text-black dark:hover:text-white cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Top Autonomous Executive Daily Briefing (Shown only if enabled and in all category) */}
        {!showOfflineOnly && activeCategory === 'all' && showRadarBriefing && (
          <DailyBriefingCard
            briefing={briefing}
            isLoading={loading}
            autoTranslate={autoTranslate}
            onClose={() => handleToggleRadarBriefing()}
          />
        )}

        {/* Offline View Header if filtered */}
        {showOfflineOnly && (
          <div className="mb-5 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 px-3.5 py-2.5 rounded border border-stone-200 dark:border-stone-800">
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100">Leitura Offline:</span>
              <span className="ml-1 text-stone-600 dark:text-stone-400">
                {offlineArticles.length} {offlineArticles.length === 1 ? 'artigo salvo no dispositivo' : 'artigos salvos no dispositivo'}
              </span>
            </div>
            <button
              onClick={() => setShowOfflineOnly(false)}
              className="font-medium text-stone-900 dark:text-stone-100 underline hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer"
            >
              Voltar ao feed geral
            </button>
          </div>
        )}

        {/* Universities Special Directory Section */}
        {!showOfflineOnly && activeCategory === 'universities' ? (
          <UniversitiesView />
        ) : (
          <>
            {/* Current Category / Section Indicator with Origin Filters */}
            <div className="mb-5 border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-subtle text-stone-500 dark:text-stone-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="uppercase tracking-wider font-semibold text-stone-800 dark:text-stone-200">
                    {showOfflineOnly
                      ? 'Artigos Salvos Offline'
                      : activeCategory === 'all'
                      ? 'Todas as Publicações Científicas'
                      : activeCategory === 'biography'
                      ? 'Biografias e Vida & Obra'
                      : activeCategory === 'education'
                      ? 'Educação & Aprendizado'
                      : activeCategory === 'biotech'
                      ? 'Biotecnologia & Genômica'
                      : activeCategory === 'health'
                      ? 'Saúde & Medicina'
                      : activeCategory === 'physics'
                      ? 'Física & Quântica'
                      : activeCategory === 'math'
                      ? 'Matemática Pura & Aplicada'
                      : activeCategory === 'astronomy'
                      ? 'Astronomia & Cosmologia'
                      : activeCategory === 'geology'
                      ? 'Geologia & Ciências da Terra'
                      : activeCategory === 'tech'
                      ? 'Tecnologia & Computação'
                      : activeCategory === 'ai'
                      ? 'Inteligência Artificial & Dados'
                      : 'Feed de Ciências'}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {filteredArticles.length} {filteredArticles.length === 1 ? 'publicação' : 'publicações'}
                  </span>
                </div>

                {searchQuery ? (
                  <span className="text-stone-600 dark:text-stone-400">
                    Filtro ativo: "{searchQuery}"
                  </span>
                ) : !showOfflineOnly && (
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      onClick={() => setFeedOriginFilter('all')}
                      className={`px-2.5 py-1 text-[11px] font-sans rounded-md transition-colors cursor-pointer ${
                        feedOriginFilter === 'all'
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800'
                      }`}
                    >
                      Todas ({categoryMatchedArticles.length})
                    </button>
                    <button
                      onClick={() => setFeedOriginFilter('academic')}
                      className={`px-2.5 py-1 text-[11px] font-sans rounded-md transition-colors cursor-pointer ${
                        feedOriginFilter === 'academic'
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800'
                      }`}
                      title="Artigos revisados por pares e acervo acadêmico com leitura completa"
                    >
                      Artigos Acadêmicos ({academicCount})
                    </button>
                    {rssCount > 0 && (
                      <button
                        onClick={() => setFeedOriginFilter('rss')}
                        className={`px-2.5 py-1 text-[11px] font-sans rounded-md transition-colors cursor-pointer ${
                          feedOriginFilter === 'rss'
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800'
                        }`}
                        title="Últimos despachos das agências internacionais (MIT, CERN, Nature, etc.)"
                      >
                        Despachos RSS ({rssCount})
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Articles Grid or Loading */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-5 animate-pulse h-56 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4 mb-3"></div>
                      <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-4/5 mb-2"></div>
                      <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-2/3 mb-4"></div>
                      <div className="h-3 bg-stone-100 dark:bg-stone-850 rounded w-full mb-1"></div>
                      <div className="h-3 bg-stone-100 dark:bg-stone-850 rounded w-5/6"></div>
                    </div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3 mt-4"></div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      autoTranslate={autoTranslate}
                      isSavedOffline={savedIdsSet.has(article.id)}
                      onToggleSaveOffline={handleToggleSaveOffline}
                      onOpenArticle={setSelectedArticle}
                    />
                  ))}
                </div>

                {/* Pagination / Load More Button */}
                {visibleCount < filteredArticles.length && (
                  <div className="flex flex-col items-center justify-center pt-4 pb-2">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 18)}
                      className="px-6 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#181818] text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-stone-400 dark:hover:border-stone-600 transition-all shadow-xs cursor-pointer"
                    >
                      Carregar mais publicações ({visibleArticles.length} de {filteredArticles.length})
                    </button>
                    <span className="text-[11px] font-mono-subtle text-stone-500 dark:text-stone-400 mt-2">
                      Exibindo {visibleArticles.length} de {filteredArticles.length} publicações disponíveis
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-10 text-center max-w-md mx-auto my-12">
                <BookOpen className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
                <h3 className="font-editorial text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                  {showOfflineOnly
                    ? 'Nenhum artigo salvo para leitura offline'
                    : 'Nenhuma publicação encontrada nesta área'}
                </h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs mb-4 leading-relaxed">
                  {showOfflineOnly
                    ? 'Clique no botão "Salvar Offline" em qualquer artigo do feed para lê-lo a qualquer momento, mesmo sem internet.'
                    : 'Ajuste os filtros de categoria ou altere o termo de busca pesquisado.'}
                </p>
                {showOfflineOnly ? (
                  <button
                    onClick={() => setShowOfflineOnly(false)}
                    className="px-3.5 py-1.5 rounded text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    Ver feed com todos os artigos
                  </button>
                ) : searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-1.5 rounded text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    Limpar Busca
                  </button>
                ) : null}
              </div>
            )}
          </>
        )}
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151515] py-6 text-xs text-stone-500 dark:text-stone-400 font-mono-subtle mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <strong className="text-stone-700 dark:text-stone-300">RADAR AUTÔNOMO DE CIÊNCIAS E TECNOLOGIA (RACT)</strong>
            <span className="hidden sm:inline mx-2">•</span>
            <span className="block sm:inline mt-0.5 sm:mt-0">Leitura offline & Tradução contínua</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] flex-wrap justify-center sm:justify-end">
            <span className="text-stone-400 dark:text-stone-500">
              Nature • Science • CERN • Harvard • Cambridge • MIT • NASA • ScienceDaily • Wired
            </span>
            <button
              onClick={() => setIsRssModalOpen(true)}
              className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline font-medium cursor-pointer"
            >
              <Rss className="w-3 h-3" />
              <span>Ver Todos os Feeds RSS ({rssFeeds.length})</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Public RSS Feeds Directory Modal */}
      <PublicRssFeedsModal
        isOpen={isRssModalOpen}
        onClose={() => setIsRssModalOpen(false)}
        feeds={rssFeeds}
        activeCategory={activeCategory}
        onSelectCategoryFeed={(cat) => {
          setActiveCategory(cat);
          if (showOfflineOnly) setShowOfflineOnly(false);
        }}
        onRefreshFeeds={() => loadNewsFeed(true)}
        isRefreshing={isRefreshing}
      />

      {/* Article Reader Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isSavedOffline={selectedArticle ? savedIdsSet.has(selectedArticle.id) : false}
        onToggleSaveOffline={handleToggleSaveOffline}
        autoTranslateDefault={autoTranslate}
      />

      {/* Secret Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        onDataUpdated={handleDataUpdated}
      />
    </div>
  );
}
