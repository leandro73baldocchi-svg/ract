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
import { NewsArticle, DailyBriefing, CategoryType, CustomCategory } from './types';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import {
  DEFAULT_BASE_CATEGORIES,
  getCustomCategories,
  getAllManagedArticles,
  fetchServerArticles,
  fetchServerCategories,
  getShowRadarBriefingPreference,
  setShowRadarBriefingPreference,
  fetchRssArticles,
  getAffiliateLinks,
  fetchServerAffiliates,
  AffiliateLink
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
import { BookOpen, AlertCircle, WifiOff, ShoppingCart, TrendingUp, ExternalLink } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>(() => getAffiliateLinks());
  
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

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getDarkModePreference());

  // Show / Hide Radar Briefing card
  const [showRadarBriefing, setShowRadarBriefing] = useState<boolean>(() => getShowRadarBriefingPreference());

  const handleToggleRadarBriefing = () => {
    setShowRadarBriefing((prev) => {
      const next = !prev;
      setShowRadarBriefingPreference(next);
      return next;
    });
  };

  // Custom Categories & Articles
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchServerAffiliates().then(setAffiliates);
  }, []);

  // Check URL parameter or hash: ONLY opens if explicitly typed in the browser's address bar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkUrlForAdmin = () => {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);

      if (
        params.has('admin') ||
        params.has('painel') ||
        params.has('gestao') ||
        search.includes('admin') ||
        search.includes('painel') ||
        hash.includes('admin') ||
        hash.includes('painel') ||
        pathname.endsWith('/admin') ||
        pathname.endsWith('/painel')
      ) {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }
    };

    checkUrlForAdmin();
    window.addEventListener('popstate', checkUrlForAdmin);
    window.addEventListener('hashchange', checkUrlForAdmin);
    return () => {
      window.removeEventListener('popstate', checkUrlForAdmin);
      window.removeEventListener('hashchange', checkUrlForAdmin);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      url.searchParams.delete('gestao');
      if (url.hash === '#admin' || url.hash === '#secreto') {
        url.hash = '';
      }
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const handleDataUpdated = async () => {
    const [arts, cats, affs] = await Promise.all([
      fetchServerArticles(),
      fetchServerCategories(),
      fetchServerAffiliates()
    ]);
    setArticles(arts);
    setCustomCategories(cats);
    setAffiliates(affs);
  };

  const allCategoriesList = useMemo(() => {
    if (customCategories && customCategories.length > 0) {
      return customCategories;
    }
    return DEFAULT_BASE_CATEGORIES;
  }, [customCategories]);

  // Offline saved articles state
  const [offlineArticles, setOfflineArticles] = useState<NewsArticle[]>(() => getOfflineArticles());

  // Auto-translate preference state
  const [autoTranslate, setAutoTranslate] = useState<boolean>(() => getAutoTranslatePreference());

  // Real-time network status
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Sync dark class
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

  useEffect(() => {
    loadNewsFeed(false);

    const onFocus = () => {
      loadNewsFeed(false);
    };
    window.addEventListener('focus', onFocus);

    const interval = setInterval(() => {
      loadNewsFeed(false);
    }, 20000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  const loadNewsFeed = async (force: boolean = false) => {
    if (force) setIsRefreshing(true);
    setErrorNotice(null);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const [articlesData, categoriesData, briefingRes, rssData] = await Promise.allSettled([
        fetchServerArticles(),
        fetchServerCategories(),
        fetch(`/api/daily-briefing${force ? '?force=true' : ''}`).then((r) => r.json()),
        fetchRssArticles()
      ]);

      let combinedArticles: NewsArticle[] = [];

      if (articlesData.status === 'fulfilled' && Array.isArray(articlesData.value)) {
        combinedArticles = [...articlesData.value];
      }

      if (rssData.status === 'fulfilled' && Array.isArray(rssData.value)) {
        combinedArticles = [...combinedArticles, ...rssData.value];
      }

      setArticles(combinedArticles);

      if (categoriesData.status === 'fulfilled' && Array.isArray(categoriesData.value)) {
        setCustomCategories(categoriesData.value);
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
      console.warn('Erro na sincronização com o servidor:', err);
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

  const displaySource = useMemo(() => {
    if (showOfflineOnly || (!isOnline && articles.length === 0)) {
      return offlineArticles;
    }
    return articles;
  }, [showOfflineOnly, isOnline, articles, offlineArticles]);

  const filteredArticles = useMemo(() => {
    return displaySource.filter((article) => {
      if (activeCategory !== 'all' && article.sourceCategory !== activeCategory) {
        return false;
      }
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
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
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

        {errorNotice && (
          <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button onClick={() => loadNewsFeed(true)} className="text-amber-900 dark:text-amber-300 underline font-medium hover:text-black dark:hover:text-white cursor-pointer">
              Tentar novamente
            </button>
          </div>
        )}

        {!showOfflineOnly && activeCategory === 'all' && showRadarBriefing && (
          <DailyBriefingCard
            briefing={briefing}
            isLoading={loading}
            autoTranslate={autoTranslate}
            onClose={() => handleToggleRadarBriefing()}
          />
        )}

        {showOfflineOnly && (
          <div className="mb-5 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 px-3.5 py-2.5 rounded border border-stone-200 dark:border-stone-800">
            <div>
              <span className="font-semibold text-stone-900 dark:text-stone-100">Leitura Offline:</span>
              <span className="ml-1 text-stone-600 dark:text-stone-400">
                {offlineArticles.length} {offlineArticles.length === 1 ? 'artigo salvo no dispositivo' : 'artigos salvos no dispositivo'}
              </span>
            </div>
            <button onClick={() => setShowOfflineOnly(false)} className="font-medium text-stone-900 dark:text-stone-100 underline hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer">
              Voltar ao feed geral
            </button>
          </div>
        )}

        {!showOfflineOnly && activeCategory === 'universities' ? (
          <UniversitiesView />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-xs font-mono-subtle text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wider font-semibold text-stone-800 dark:text-stone-200">
                  {showOfflineOnly ? 'Artigos Salvos Offline' : activeCategory === 'all' ? 'Todas as Publicações Científicas' : 'Feed de Ciências'}
                </span>
                <span>•</span>
                <span>{filteredArticles.length} {filteredArticles.length === 1 ? 'publicação' : 'publicações'}</span>
              </div>
              {searchQuery && (
                <span className="text-stone-600 dark:text-stone-400">Filtro ativo: "{searchQuery}"</span>
              )}
            </div>

            {/* DIVISÃO DE TELA: NOTÍCIAS (ESQUERDA) | VITRINE AMAZON (DIREITA) */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              {/* Lado Esquerdo: Área de Notícias */}
              <div className="flex-1 w-full min-w-0">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-5 animate-pulse h-56 flex flex-col justify-between">
                        <div>
                          <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4 mb-3"></div>
                          <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-4/5 mb-2"></div>
                          <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-2/3 mb-4"></div>
                          <div className="h-3 bg-stone-100 dark:bg-stone-850 rounded w-full mb-1"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredArticles.map((article) => (
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
                ) : (
                  <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-10 text-center max-w-md mx-auto my-12">
                    <BookOpen className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
                    <h3 className="font-editorial text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                      {showOfflineOnly ? 'Nenhum artigo salvo' : 'Nenhuma publicação encontrada'}
                    </h3>
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="mt-4 px-3.5 py-1.5 rounded text-xs font-medium bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 cursor-pointer">
                        Limpar Busca
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Lado Direito: VITRINE LATERAL DA AMAZON */}
              {!showOfflineOnly && affiliates.length > 0 && (
                <aside className="w-full lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-24">
                  <div className="bg-[#FDFDFC] dark:bg-[#121212] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100 dark:border-stone-800/60">
                      <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Vitrine RACT
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {affiliates.map(aff => (
                        <a 
                          key={aff.id} 
                          href={aff.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="group block p-3 bg-white dark:bg-[#1A1A1A] border border-stone-200 dark:border-stone-800 rounded-lg hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all cursor-pointer"
                        >
                          <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <ShoppingCart className="w-3 h-3" /> Recomendação
                          </p>
                          <p className="font-bold text-stone-900 dark:text-stone-100 text-[13px] mb-1.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
                            {aff.title}
                          </p>
                          <p className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            Ver na Amazon <ExternalLink className="w-3 h-3" />
                          </p>
                        </a>
                      ))}
                    </div>
                    
                    <p className="text-[9px] text-stone-400 dark:text-stone-600 mt-5 leading-tight text-center">
                      *Ao adquirir um item recomendado nesta vitrine, você apoia diretamente a manutenção do portal RACT sem nenhum custo adicional.
                    </p>
                  </div>
                </aside>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151515] py-6 text-xs text-stone-500 dark:text-stone-400 font-mono-subtle mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <strong className="text-stone-700 dark:text-stone-300">RADAR AUTÔNOMO DE CIÊNCIAS E TECNOLOGIA (RACT)</strong>
            <span className="hidden sm:inline mx-2">•</span>
            <span className="block sm:inline mt-0.5 sm:mt-0">Leitura offline & Tradução contínua</span>
          </div>
          <div className="text-stone-400 dark:text-stone-500 text-[11px]">
            Fontes: Nature • Science • CERN • Harvard • Cambridge • Oxford • MIT • USP • UNICAMP • NASA
          </div>
        </div>
      </footer>

      <ArticleDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isSavedOffline={selectedArticle ? savedIdsSet.has(selectedArticle.id) : false}
        onToggleSaveOffline={handleToggleSaveOffline}
        autoTranslateDefault={autoTranslate}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={handleCloseAdmin}
        onDataUpdated={handleDataUpdated}
      />
    </div>
  );
}
