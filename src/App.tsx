/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { UniversitiesView } from './components/UniversitiesView';
import { NewsArticle, CategoryType, CustomCategory } from './types';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { DEFAULT_BASE_CATEGORIES, getCustomCategories, getAllManagedArticles, fetchServerArticles, fetchServerCategories, fetchRssArticles, getAffiliateLinks, fetchServerAffiliates, AffiliateLink, fetchServerSponsors, SponsorBanner, fetchServerSocialNetworks, SocialNetwork } from './utils/customDataManager';
import { getOfflineArticles, saveArticleOffline, removeArticleOffline, getAutoTranslatePreference, setAutoTranslatePreference, getDarkModePreference, setDarkModePreference } from './utils/offlineStorage';
import { Bookmark, ShoppingCart, TrendingUp, ExternalLink, Mail, PlusCircle, Linkedin, Twitter, Github, Instagram, Facebook, Globe, X, Info } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>(() => getAffiliateLinks());
  const [sponsors, setSponsors] = useState<SponsorBanner[]>([]);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOfflineOnly, setShowOfflineOnly] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getDarkModePreference());
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [offlineArticles, setOfflineArticles] = useState<NewsArticle[]>(() => getOfflineArticles());
  const [autoTranslate, setAutoTranslate] = useState<boolean>(() => getAutoTranslatePreference());
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [isMobileVitrineOpen, setIsMobileVitrineOpen] = useState<boolean>(false);
  const [isMobileNewsletterOpen, setIsMobileNewsletterOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  const hasInitializedUrl = useRef(false);

  useEffect(() => { 
    fetchServerAffiliates().then(setAffiliates); 
    fetchServerSponsors().then(setSponsors); 
    fetchServerSocialNetworks().then(setSocialNetworks);
  }, []);

  useEffect(() => { 
    if (sponsors.length <= 1) return; 
    const interval = setInterval(() => { setCurrentSponsorIndex((prev) => (prev + 1) % sponsors.length); }, 6000); 
    return () => clearInterval(interval); 
  }, [sponsors.length]);

  useEffect(() => { setVisibleCount(12); }, [activeCategory, searchQuery, showOfflineOnly]);

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
  
  const handleDataUpdated = async () => { 
    const [arts, cats, affs, spon, soc] = await Promise.all([fetchServerArticles(), fetchServerCategories(), fetchServerAffiliates(), fetchServerSponsors(), fetchServerSocialNetworks()]); 
    setArticles(arts); setCustomCategories(cats); setAffiliates(affs); setSponsors(spon); setSocialNetworks(soc); setCurrentSponsorIndex(0); loadNewsFeed(true);
  };

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
    if (force) setIsRefreshing(true);
    if (typeof navigator !== 'undefined' && !navigator.onLine) { setLoading(false); setIsRefreshing(false); return; }
    try {
      const [articlesData, categoriesData, rssData] = await Promise.allSettled([fetchServerArticles(), fetchServerCategories(), fetchRssArticles()]);
      let combinedArticles: NewsArticle[] = [];
      if (articlesData.status === 'fulfilled' && Array.isArray(articlesData.value)) combinedArticles = [...articlesData.value];
      if (rssData.status === 'fulfilled' && Array.isArray(rssData.value)) combinedArticles = [...combinedArticles, ...rssData.value];
      const uniqueArticlesMap = new Map<string, NewsArticle>();
      combinedArticles.forEach(art => uniqueArticlesMap.set(art.id, art));
      let uniqueArticles = Array.from(uniqueArticlesMap.values());
      uniqueArticles.sort((a, b) => {
        const getTimestamp = (art: NewsArticle) => {
          if (art.id.startsWith('art-')) { const time = parseInt(art.id.replace('art-', '')); if (!isNaN(time) && time > 1000000000000) return time; }
          if (art.date) { const dateTime = new Date(art.date).getTime(); if (!isNaN(dateTime)) return dateTime; }
          return 0;
        };
        return getTimestamp(b) - getTimestamp(a);
      });
      setArticles(uniqueArticles);
      if (categoriesData.status === 'fulfilled' && Array.isArray(categoriesData.value)) setCustomCategories(categoriesData.value);
    } catch (err) { console.warn('Erro sync', err); } finally { setLoading(false); setIsRefreshing(false); }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasInitializedUrl.current) return; 

    if (articles.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const artId = urlParams.get('art');
      if (artId) {
        const found = articles.find(a => a.id === artId);
        if (found) setSelectedArticle(found);
      }
      hasInitializedUrl.current = true;
    }
  }, [articles]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasInitializedUrl.current) return; 

    const url = new URL(window.location.href);
    if (selectedArticle) {
      url.searchParams.set('art', selectedArticle.id);
      window.history.replaceState({}, '', url.toString());
    } else {
      if (url.searchParams.has('art')) {
        url.searchParams.delete('art');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [selectedArticle]);

  const handleToggleSaveOffline = (article: NewsArticle) => { const isSaved = offlineArticles.some((a) => a.id === article.id); if (isSaved) { removeArticleOffline(article.id); setOfflineArticles(getOfflineArticles()); } else { saveArticleOffline(article); setOfflineArticles(getOfflineArticles()); } };
  const savedIdsSet = useMemo(() => new Set(offlineArticles.map((a) => a.id)), [offlineArticles]);
  const displaySource = useMemo(() => showOfflineOnly || (!isOnline && articles.length === 0) ? offlineArticles : articles, [showOfflineOnly, isOnline, articles, offlineArticles]);
  
  const filteredArticles = useMemo(() => displaySource.filter((article) => { 
    if (activeCategory !== 'all' && article.sourceCategory !== activeCategory) return false; 
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); return (article.titlePt || '').toLowerCase().includes(q) || article.title.toLowerCase().includes(q) || (article.summaryPt || article.summary).toLowerCase().includes(q) || article.source.toLowerCase().includes(q); } 
    return true; 
  }), [displaySource, activeCategory, searchQuery]);

  const displayedArticles = useMemo(() => filteredArticles.slice(0, visibleCount), [filteredArticles, visibleCount]);

  const randomizedAffiliates = useMemo(() => {
    const shuffled = [...affiliates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [affiliates]);

  return (
    <div className={`${isDarkMode ? 'dark ' : ''}min-h-screen bg-[#f4f7fb] dark:bg-[#070b12] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300`}>
      <div className="print:hidden">
        <Header
          date={new Date().toLocaleDateString('pt-BR')}
          isOnline={isOnline}
          isRefreshing={isRefreshing}
          onRefresh={() => loadNewsFeed(true)}
          savedCount={offlineArticles.length}
          showOfflineOnly={showOfflineOnly}
          onToggleOfflineOnly={() => setShowOfflineOnly(prev => !prev)}
          autoTranslate={autoTranslate}
          onToggleAutoTranslate={() => { setAutoTranslate(!autoTranslate); setAutoTranslatePreference(!autoTranslate); }}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => { setIsDarkMode(!isDarkMode); setDarkModePreference(!isDarkMode); }}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => { setActiveCategory(cat); setShowOfflineOnly(false); }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoriesList={allCategoriesList}
          onOpenMobileVitrine={() => setIsMobileVitrineOpen(true)}
          onOpenMobileNewsletter={() => setIsMobileNewsletterOpen(true)}
        />
      </div>

      {/* HERO CIENTÍFICO */}
      <section className="print:hidden relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
                Radar científico independente
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-[-0.04em] leading-[0.98]">
                RADAR AUTÔNOMO
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300">
                  DE CIÊNCIAS E TECNOLOGIA
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                Descubra pesquisas, descobertas e conhecimento científico em um único radar.
                O RACT conecta publicações de diferentes áreas para facilitar a descoberta da ciência que está sendo produzida agora.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {['Ciências', 'Física', 'Astronomia', 'Tecnologia', 'Educação', 'Inteligência Artificial'].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-72">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-4">
                <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">Status</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-bold">
                  <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.7)]' : 'bg-red-400'}`} />
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-4">
                <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">Publicações</div>
                <div className="mt-2 text-xl font-black">{filteredArticles.length.toLocaleString('pt-BR')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 print:hidden">
        {!showOfflineOnly && activeCategory === 'universities' ? (
          <UniversitiesView />
        ) : (
          <>
            {/* BARRA DE CONTEXTO */}
            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0d131d] shadow-sm backdrop-blur">
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600 dark:text-cyan-400">
                      {showOfflineOnly ? 'Biblioteca offline' : activeCategory === 'all' ? 'Radar de publicações' : 'Filtro científico ativo'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight dark:text-white">
                    {activeCategory === 'all' ? 'Pesquisas em destaque' : allCategoriesList.find(c => c.id === activeCategory)?.name || 'Publicações selecionadas'}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-2 text-slate-600 dark:text-slate-300">
                    {filteredArticles.length.toLocaleString('pt-BR')} publicações
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-2 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Busca: “{searchQuery}” ×
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-3 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  <button
                    onClick={() => { setActiveCategory('all'); setShowOfflineOnly(false); }}
                    className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === 'all' && !showOfflineOnly ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    Todas
                  </button>
                  {allCategoriesList.slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setShowOfflineOnly(false); }}
                      className={`px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === cat.id && !showOfflineOnly ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-7 items-start">
              <div className="flex-1 w-full min-w-0">
                {/* PATROCÍNIO MOBILE */}
                <div className="block lg:hidden mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d131d] p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Apoio institucional</span>
                    <span className="text-[9px] text-slate-400">Publicidade</span>
                  </div>
                  {sponsors.length === 0 ? (
                    <div className="w-full h-[160px] rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                      <span className="text-slate-400 font-bold text-sm">Espaço patrocinador</span>
                      <span className="text-slate-400 text-[10px] mt-1">300 × 250</span>
                    </div>
                  ) : (
                    <a href={sponsors[currentSponsorIndex].linkUrl} target="_blank" rel="noreferrer" key={`mob-${sponsors[currentSponsorIndex].id}`} className="block relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 transition-colors">
                      <img src={sponsors[currentSponsorIndex].imageUrl} alt={sponsors[currentSponsorIndex].title} className="w-full h-[160px] sm:h-[200px] object-cover" />
                    </a>
                  )}
                  {sponsors.length > 1 && <div className="flex justify-center gap-1.5 mt-2.5">{sponsors.map((_, idx) => <span key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === currentSponsorIndex ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} />)}</div>}
                  <a href="mailto:leandro73baldocchi@gmail.com?subject=Orçamento%20para%20Anúncio%20no%20RACT" className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider transition-colors">
                    <Mail className="w-3.5 h-3.5" /> Anuncie no RACT
                  </a>
                </div>

                {/* GRID DE ARTIGOS */}
                {displayedArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {displayedArticles.map(article => (
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
                  <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d131d] p-12 text-center">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-lg">Nenhuma publicação encontrada</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tente alterar a categoria ou limpar a pesquisa.</p>
                    <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); setShowOfflineOnly(false); }} className="mt-5 px-5 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider">
                      Limpar filtros
                    </button>
                  </div>
                )}

                {filteredArticles.length > visibleCount && (
                  <div className="mt-10 flex justify-center pb-6">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 12)}
                      className="group px-6 py-3.5 bg-white dark:bg-[#0d131d] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-black text-[10px] uppercase tracking-[0.14em] rounded-xl shadow-sm hover:border-blue-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-all flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                      Carregar mais ({filteredArticles.length - visibleCount})
                    </button>
                  </div>
                )}
              </div>

              {/* SIDEBAR */}
              {!showOfflineOnly && (
                <aside className="hidden lg:block w-80 shrink-0 space-y-5">
                  {/* PATROCINADOR */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d131d] p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Apoio institucional</span>
                      <span className="text-[9px] text-slate-400">Publicidade</span>
                    </div>
                    {sponsors.length === 0 ? (
                      <div className="w-full h-[250px] rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
                        <span className="text-slate-400 font-black text-xl">300 × 250</span>
                        <span className="text-slate-400 text-xs mt-1">Espaço patrocinador</span>
                      </div>
                    ) : (
                      <a href={sponsors[currentSponsorIndex].linkUrl} target="_blank" rel="noreferrer" key={`desk-${sponsors[currentSponsorIndex].id}`} className="block overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400 transition-colors">
                        <img src={sponsors[currentSponsorIndex].imageUrl} alt={sponsors[currentSponsorIndex].title} className="w-full h-[250px] object-cover" />
                      </a>
                    )}
                    {sponsors.length > 1 && <div className="flex justify-center gap-1.5 mt-3">{sponsors.map((_, idx) => <span key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === currentSponsorIndex ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} />)}</div>}
                    <a href="mailto:leandro73baldocchi@gmail.com?subject=Orçamento%20para%20Anúncio%20no%20RACT" className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider transition-colors">
                      <Mail className="w-4 h-4" /> Anuncie no RACT
                    </a>
                  </div>

                  {/* VITRINE */}
                  {randomizedAffiliates.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d131d] shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm uppercase tracking-wider">Vitrine RACT</h3>
                            <p className="text-[9px] text-slate-400 uppercase tracking-wider">Seleções e recomendações</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 space-y-2.5 max-h-[430px] overflow-y-auto">
                        {randomizedAffiliates.map(aff => (
                          <a key={aff.id} href={aff.url} target="_blank" rel="noreferrer" className="group flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 hover:border-amber-400 hover:bg-white dark:hover:bg-slate-900 transition-all">
                            {aff.imageUrl ? (
                              <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img src={aff.imageUrl} alt={aff.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[8px] font-black text-amber-600 uppercase tracking-[0.15em] mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Recomendação</p>
                              <p className="font-bold text-[12px] leading-snug line-clamp-2 dark:text-slate-100">{aff.title}</p>
                              <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1 font-semibold">Ver oferta <ExternalLink className="w-3 h-3" /></p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NEWSLETTER */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d131d] shadow-sm overflow-hidden">
                    <div className="p-5 bg-gradient-to-br from-blue-700 to-indigo-800 text-white">
                      <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                        <Mail className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-base uppercase tracking-wider">Newsletter RACT</h3>
                      <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">Receba uma seleção de publicações científicas diretamente no seu e-mail.</p>
                    </div>
                    <div className="bg-white">
                      <iframe width="100%" height="320" src="https://f1baa2a4.sibforms.com/v2/serve/MUIFAIZama2f8WtOuv76-bvEFDjzQiq_QO67UcmlC7k_-Fnm2TZCFOypjijlOvo8K9TQzN56nAggcuIb4CQ0cHWKhVXvGi3Vzez5t5celarPJq9FRvApWgefr_Tzq5kO3XLLQpyhP78FypQkIvgw4Cz5MQ0nOL-ppT6HjScbGqiCzdAgUUDMjldQeJm2la52v-t4XhUD70u8TDAaTg==" frameBorder="0" scrolling="auto" allowFullScreen style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}></iframe>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </>
        )}
      </main>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="print:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">RACT</span>
              </div>
              <h3 className="text-lg font-black tracking-tight">Radar Autônomo de Ciências e Tecnologia</h3>
              <p className="mt-2 max-w-xl text-xs text-slate-400 leading-relaxed">
                Plataforma acadêmica independente dedicada à descoberta e à divulgação de pesquisas científicas.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                <span>© {new Date().getFullYear()} RACT</span>
                <span>•</span>
                <button onClick={() => setIsAboutModalOpen(true)} className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer">
                  Sobre / Transparência
                </button>
              </div>
            </div>

            {socialNetworks.length > 0 && (
              <div className="flex items-center justify-center md:justify-end flex-wrap gap-2">
                {socialNetworks.map(soc => (
                  <a key={soc.id} href={soc.url} target="_blank" rel="noreferrer" title={soc.name} className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white hover:border-cyan-400/40 transition-all">
                    {soc.icon === 'linkedin' && <Linkedin className="w-4 h-4" />}
                    {soc.icon === 'twitter' && <Twitter className="w-4 h-4" />}
                    {soc.icon === 'github' && <Github className="w-4 h-4" />}
                    {soc.icon === 'instagram' && <Instagram className="w-4 h-4" />}
                    {soc.icon === 'facebook' && <Facebook className="w-4 h-4" />}
                    {soc.icon === 'globe' && <Globe className="w-4 h-4" />}
                    {soc.icon === 'reddit' && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.25-1.25-1.25zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .466c.843.84 2.484.912 2.961.912.477 0 2.105-.072 2.961-.912a.33.33 0 0 0 0-.466.327.327 0 0 0-.466 0c-.32.32-1.152.617-2.495.617-1.359 0-2.191-.314-2.5-.617a.332.332 0 0 0-.23-.094z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>

      <ArticleDetailModal article={selectedArticle} isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} isSavedOffline={selectedArticle ? savedIdsSet.has(selectedArticle.id) : false} onToggleSaveOffline={handleToggleSaveOffline} autoTranslateDefault={autoTranslate} />
      <AdminDashboardModal isOpen={isAdminOpen} onClose={handleCloseAdmin} onDataUpdated={handleDataUpdated} />
      <Analytics />
    </div>
  );
}
