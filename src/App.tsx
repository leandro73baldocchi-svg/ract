/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { NewsArticle, DailyBriefing, CategoryType } from './types';
import {
  getOfflineArticles,
  saveArticleOffline,
  removeArticleOffline,
  getAutoTranslatePreference,
  setAutoTranslatePreference,
  getDarkModePreference,
  setDarkModePreference,
} from './utils/offlineStorage';
import { BookOpen, AlertCircle, WifiOff } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOfflineOnly, setShowOfflineOnly] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getDarkModePreference());

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

  // Initial load
  useEffect(() => {
    loadNewsFeed(false);
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
      const [newsRes, briefingRes] = await Promise.allSettled([
        fetch(`/api/news${force ? '?force=true' : ''}`).then((r) => r.json()),
        fetch(`/api/daily-briefing${force ? '?force=true' : ''}`).then((r) => r.json()),
      ]);

      if (newsRes.status === 'fulfilled' && newsRes.value?.success) {
        setArticles(newsRes.value.articles || []);
      }

      if (briefingRes.status === 'fulfilled' && briefingRes.value?.success) {
        setBriefing(briefingRes.value.briefing);
      }
    } catch (err) {
      console.warn('Network sync notice:', err);
      if (offlineArticles.length > 0) {
        setErrorNotice('Rede instável: exibindo publicações armazenadas no dispositivo.');
      }
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

  // Current dataset to display
  const displaySource = useMemo(() => {
    if (showOfflineOnly || (!isOnline && articles.length === 0)) {
      return offlineArticles;
    }
    return articles;
  }, [showOfflineOnly, isOnline, articles, offlineArticles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
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
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (showOfflineOnly) setShowOfflineOnly(false);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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

        {/* Top Autonomous Executive Daily Briefing (Shown when in all or without offline filter) */}
        {!showOfflineOnly && activeCategory === 'all' && (
          <DailyBriefingCard
            briefing={briefing}
            isLoading={loading}
            autoTranslate={autoTranslate}
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

        {/* Current Category / Section Indicator */}
        <div className="mb-4 flex items-center justify-between text-xs font-mono-subtle text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-wider font-semibold text-stone-800 dark:text-stone-200">
              {showOfflineOnly
                ? 'Artigos Salvos Offline'
                : activeCategory === 'all'
                ? 'Publicações Recentes dos Periódicos'
                : activeCategory === 'education'
                ? 'Educação, PISA & Universidades'
                : activeCategory === 'biography'
                ? 'Grandes Nomes & Biografias da Ciência'
                : activeCategory === 'science'
                ? 'Ciência Geral & Pesquisa'
                : activeCategory === 'tech'
                ? 'Tecnologia & Computação'
                : activeCategory === 'ai'
                ? 'Inteligência Artificial & Algoritmos'
                : activeCategory === 'physics'
                ? 'Física, Quântica & CERN'
                : activeCategory === 'space'
                ? 'Espaço, Astrofísica & NASA'
                : 'Biotecnologia, Medicina & Saúde'}
            </span>
            <span>•</span>
            <span>{filteredArticles.length} {filteredArticles.length === 1 ? 'publicação' : 'publicações'}</span>
          </div>

          {searchQuery && (
            <span className="text-stone-600 dark:text-stone-400">
              Filtro ativo: "{searchQuery}"
            </span>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          /* Empty State */
          <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-10 text-center max-w-md mx-auto my-12">
            <BookOpen className="w-8 h-8 text-stone-400 dark:text-stone-600 mx-auto mb-3" />
            <h3 className="font-editorial text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
              {showOfflineOnly
                ? 'Nenhum artigo salvo para leitura offline'
                : 'Nenhuma publicação encontrada'}
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
      </main>

      {/* Minimal Editorial Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151515] py-6 text-xs text-stone-500 dark:text-stone-400 font-mono-subtle mt-12 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <strong className="text-stone-700 dark:text-stone-300">RADAR AUTÔNOMO DE CIÊNCIAS E TECNOLOGIA (RACT)</strong>
            <span className="hidden sm:inline mx-2">•</span>
            <span className="block sm:inline mt-0.5 sm:mt-0">Leitura offline & Tradução contínua</span>
          </div>
          <div className="text-stone-400 dark:text-stone-500 text-[11px]">
            Fontes: Nature • Science • CERN • Harvard • Cambridge • Oxford • Bolonha • MIT • USP • UNICAMP • ONU • PISA • NASA • Wired
          </div>
        </div>
      </footer>

      {/* Article Reader Modal */}
      <ArticleDetailModal
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isSavedOffline={selectedArticle ? savedIdsSet.has(selectedArticle.id) : false}
        onToggleSaveOffline={handleToggleSaveOffline}
        autoTranslateDefault={autoTranslate}
      />
    </div>
  );
}
