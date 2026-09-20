/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { UniversitiesView } from './components/UniversitiesView';
import { NewsArticle, DailyBriefing, CategoryType, CustomCategory } from './types';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { DEFAULT_BASE_CATEGORIES, getCustomCategories, getAllManagedArticles, fetchServerArticles, fetchServerCategories, getShowRadarBriefingPreference, setShowRadarBriefingPreference, fetchRssArticles, getAffiliateLinks, fetchServerAffiliates, AffiliateLink } from './utils/customDataManager';
import { getOfflineArticles, saveArticleOffline, removeArticleOffline, getAutoTranslatePreference, setAutoTranslatePreference, getDarkModePreference, setDarkModePreference } from './utils/offlineStorage';
import { BookOpen, AlertCircle, WifiOff, ShoppingCart, TrendingUp, ExternalLink } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>(() => getAffiliateLinks());
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOfflineOnly, setShowOfflineOnly] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getDarkModePreference());
  const [showRadarBriefing, setShowRadarBriefing] = useState<boolean>(() => getShowRadarBriefingPreference());
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [offlineArticles, setOfflineArticles] = useState<NewsArticle[]>(() => getOfflineArticles());
  const [autoTranslate, setAutoTranslate] = useState<boolean>(() => getAutoTranslatePreference());
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => { fetchServerAffiliates().then(setAffiliates); }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkUrlForAdmin = () => {
      const p = new URLSearchParams(window.location.search);
      if (p.has('admin') || window.location.hash.includes('admin') || window.location.pathname.endsWith('/admin')) setIsAdminOpen(true);
      else setIsAdminOpen(false);
    };
    checkUrlForAdmin(); window.addEventListener('popstate', checkUrlForAdmin); window.addEventListener('hashchange', checkUrlForAdmin);
    return () => { window.removeEventListener('popstate', checkUrlForAdmin); window.removeEventListener('hashchange', checkUrlForAdmin); };
  }, []);

  const handleCloseAdmin = () => { setIsAdminOpen(false); if (typeof window !== 'undefined') window.history.replaceState({}, '', window.location.pathname); };
  const handleDataUpdated = async () => { const [arts, cats, affs] = await Promise.all([fetchServerArticles(), fetchServerCategories(), fetchServerAffiliates()]); setArticles(arts); setCustomCategories(cats); setAffiliates(affs); };
  const allCategoriesList = useMemo(() => customCategories?.length > 0 ? customCategories : DEFAULT_BASE_CATEGORIES, [customCategories]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) { document.documentElement.classList.add('dark'); document.body.classList.add('dark'); document.body.style.backgroundColor = '#101010'; document.body.style.color = '#E8E8E8'; } 
      else { document.documentElement.classList.remove('dark'); document.body.classList.remove('dark'); document.body.style.backgroundColor = '#FBFBFA'; document.body.style.color = '#1A1A1A'; }
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true); const handleOffline = () => { setIsOnline(false); setShowOfflineOnly(true); };
    window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => { loadNewsFeed(false); const interval = setInterval(() => loadNewsFeed(false), 30000); return () => clearInterval(interval); }, []);

  const loadNewsFeed = async (force: boolean = false) => {
    if (force) setIsRefreshing(true); setErrorNotice(null);
    if (typeof navigator !== 'undefined' && !navigator.onLine) { setLoading(false); setIsRefreshing(false); return; }
    try {
      const [articlesData, categoriesData, rssData] = await Promise.allSettled([fetchServerArticles(), fetchServerCategories(), fetchRssArticles()]);
      let combinedArticles: NewsArticle[] = [];
      if (articlesData.status === 'fulfilled' && Array.isArray(articlesData.value)) combinedArticles = [...articlesData.value];
      if (rssData.status === 'fulfilled' && Array.isArray(rssData.value)) combinedArticles = [...combinedArticles, ...rssData.value];
      setArticles(combinedArticles);
      if (categoriesData.status === 'fulfilled' && Array.isArray(categoriesData.value)) setCustomCategories(categoriesData.value);
    } catch (err) { console.warn('Erro sync', err); } finally { setLoading(false); setIsRefreshing(false); }
  };

  const handleToggleSaveOffline = (article: NewsArticle) => { const isSaved = offlineArticles.some((a) => a.id === article.id); if (isSaved) { removeArticleOffline(article.id); setOfflineArticles(getOfflineArticles()); } else { saveArticleOffline(article); setOfflineArticles(getOfflineArticles()); } };
  const savedIdsSet = useMemo(() => new Set(offlineArticles.map((a) => a.id)), [offlineArticles]);
  const displaySource = useMemo(() => showOfflineOnly || (!isOnline && articles.length === 0) ? offlineArticles : articles, [showOfflineOnly, isOnline, articles, offlineArticles]);
  const filteredArticles = useMemo(() => displaySource.filter((article) => { if (activeCategory !== 'all' && article.sourceCategory !== activeCategory) return false; if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); return (article.titlePt || '').toLowerCase().includes(q) || article.title.toLowerCase().includes(q) || (article.summaryPt || article.summary).toLowerCase().includes(q) || article.source.toLowerCase().includes(q); } return true; }), [displaySource, activeCategory, searchQuery]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark ' : ''}bg-[#FBFBFA] dark:bg-[#101010] text-[#1A1A1A] flex flex-col font-sans transition-colors duration-200`}>
      <Header date={new Date().toLocaleDateString('pt-BR')} isOnline={isOnline} isRefreshing={isRefreshing} onRefresh={() => loadNewsFeed(true)} savedCount={offlineArticles.length} showOfflineOnly={showOfflineOnly} onToggleOfflineOnly={() => setShowOfflineOnly(prev => !prev)} autoTranslate={autoTranslate} onToggleAutoTranslate={() => { setAutoTranslate(!autoTranslate); setAutoTranslatePreference(!autoTranslate); }} isDarkMode={isDarkMode} onToggleDarkMode={() => { setIsDarkMode(!isDarkMode); setDarkModePreference(!isDarkMode); }} showRadarBriefing={showRadarBriefing} onToggleRadarBriefing={() => { setShowRadarBriefing(!showRadarBriefing); setShowRadarBriefingPreference(!showRadarBriefing); }} activeCategory={activeCategory} onSelectCategory={(cat) => { setActiveCategory(cat); setShowOfflineOnly(false); }} searchQuery={searchQuery} onSearchChange={setSearchQuery} categoriesList={allCategoriesList} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {!showOfflineOnly && activeCategory === 'universities' ? ( <UniversitiesView /> ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-xs text-stone-500 border-b pb-2">
              <span className="uppercase font-semibold text-stone-800 dark:text-stone-200">{activeCategory === 'all' ? 'Todas as Publicações' : 'Filtro Ativo'} • {filteredArticles.length} publicações</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Esquerda: Notícias */}
              <div className="flex-1 w-full min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} autoTranslate={autoTranslate} isSavedOffline={savedIdsSet.has(article.id)} onToggleSaveOffline={handleToggleSaveOffline} onOpenArticle={setSelectedArticle} />
                  ))}
                </div>
              </div>

              {/* Direita: Vitrine RACT com Scroll e Links Universais */}
              {!showOfflineOnly && affiliates.length > 0 && (
                <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24">
                  <div className="bg-[#FDFDFC] dark:bg-[#121212] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <h3 className="font-bold text-sm uppercase tracking-wider dark:text-stone-100">Vitrine RACT</h3>
                    </div>
                    
                    {/* ESTA É A ÁREA DE SCROLL (PODE TER 100 LIVROS AQUI DENTRO) */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {affiliates.map(aff => (
                        <a key={aff.id} href={aff.url} target="_blank" rel="noreferrer" className="group block p-3 bg-white dark:bg-[#1A1A1A] border rounded-lg hover:border-amber-400 hover:shadow-md transition-all cursor-pointer">
                          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1.5 flex gap-1.5"><ShoppingCart className="w-3 h-3" /> Recomendação</p>
                          <p className="font-bold text-[13px] mb-1.5 group-hover:text-amber-700 dark:text-stone-100 leading-snug">{aff.title}</p>
                          <p className="text-[10px] text-stone-500 flex gap-1">Ver Oferta <ExternalLink className="w-3 h-3" /></p>
                        </a>
                      ))}
                    </div>
                    
                    <p className="text-[9px] text-stone-400 mt-5 pt-4 border-t text-center leading-tight">
                      *Ao adquirir um item nesta vitrine, você apoia diretamente a manutenção do portal sem nenhum custo adicional.
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

      <ArticleDetailModal article={selectedArticle} isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} isSavedOffline={selectedArticle ? savedIdsSet.has(selectedArticle.id) : false} onToggleSaveOffline={handleToggleSaveOffline} autoTranslateDefault={autoTranslate} />
      <AdminDashboardModal isOpen={isAdminOpen} onClose={handleCloseAdmin} onDataUpdated={handleDataUpdated} />
      
      {/* O Motor de Análise do Vercel rodando em segundo plano */}
      <Analytics />
    </div>
  );
}
