/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { UniversitiesView } from './components/UniversitiesView';
import { NewsArticle, CategoryType, CustomCategory } from './types';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { DEFAULT_BASE_CATEGORIES, getCustomCategories, getAllManagedArticles, fetchServerArticles, fetchServerCategories, fetchRssArticles, getAffiliateLinks, fetchServerAffiliates, AffiliateLink, fetchServerSponsors, SponsorBanner } from './utils/customDataManager';
import { getOfflineArticles, saveArticleOffline, removeArticleOffline, getAutoTranslatePreference, setAutoTranslatePreference, getDarkModePreference, setDarkModePreference } from './utils/offlineStorage';
import { Bookmark, ShoppingCart, TrendingUp, ExternalLink, Mail, X, PlusCircle } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [affiliates, setAffiliates] = useState<AffiliateLink[]>(() => getAffiliateLinks());
  
  const [sponsors, setSponsors] = useState<SponsorBanner[]>([]);
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

  useEffect(() => { 
    fetchServerAffiliates().then(setAffiliates); 
    fetchServerSponsors().then(setSponsors);
  }, []);

  useEffect(() => {
    if (sponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSponsorIndex((prev) => (prev + 1) % sponsors.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sponsors.length]);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, searchQuery, showOfflineOnly]);

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
    const [arts, cats, affs, spon] = await Promise.all([fetchServerArticles(), fetchServerCategories(), fetchServerAffiliates(), fetchServerSponsors()]); 
    setArticles(arts); setCustomCategories(cats); setAffiliates(affs); setSponsors(spon);
    setCurrentSponsorIndex(0);
    loadNewsFeed(true);
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
      
      if (articlesData.status === 'fulfilled' && Array.isArray(articlesData.value)) {
        combinedArticles = [...articlesData.value];
      }
      if (rssData.status === 'fulfilled' && Array.isArray(rssData.value)) {
        combinedArticles = [...combinedArticles, ...rssData.value];
      }

      const uniqueArticlesMap = new Map<string, NewsArticle>();
      combinedArticles.forEach(art => uniqueArticlesMap.set(art.id, art));
      let uniqueArticles = Array.from(uniqueArticlesMap.values());

      uniqueArticles.sort((a, b) => {
        const getTimestamp = (art: NewsArticle) => {
          if (art.id.startsWith('art-')) {
            const time = parseInt(art.id.replace('art-', ''));
            if (!isNaN(time) && time > 1000000000000) return time;
          }
          if (art.date) {
            const dateTime = new Date(art.date).getTime();
            if (!isNaN(dateTime)) return dateTime;
          }
          return 0;
        };
        return getTimestamp(b) - getTimestamp(a);
      });

      setArticles(uniqueArticles);

      if (categoriesData.status === 'fulfilled' && Array.isArray(categoriesData.value)) setCustomCategories(categoriesData.value);
    } catch (err) { console.warn('Erro sync', err); } finally { setLoading(false); setIsRefreshing(false); }
  };

  const handleToggleSaveOffline = (article: NewsArticle) => { const isSaved = offlineArticles.some((a) => a.id === article.id); if (isSaved) { removeArticleOffline(article.id); setOfflineArticles(getOfflineArticles()); } else { saveArticleOffline(article); setOfflineArticles(getOfflineArticles()); } };
  const savedIdsSet = useMemo(() => new Set(offlineArticles.map((a) => a.id)), [offlineArticles]);
  const displaySource = useMemo(() => showOfflineOnly || (!isOnline && articles.length === 0) ? offlineArticles : articles, [showOfflineOnly, isOnline, articles, offlineArticles]);
  
  const filteredArticles = useMemo(() => displaySource.filter((article) => { 
    if (activeCategory !== 'all' && article.sourceCategory !== activeCategory) return false; 
    if (searchQuery.trim()) { 
      const q = searchQuery.toLowerCase(); 
      return (article.titlePt || '').toLowerCase().includes(q) || article.title.toLowerCase().includes(q) || (article.summaryPt || article.summary).toLowerCase().includes(q) || article.source.toLowerCase().includes(q); 
    } 
    return true; 
  }), [displaySource, activeCategory, searchQuery]);

  const displayedArticles = useMemo(() => filteredArticles.slice(0, visibleCount), [filteredArticles, visibleCount]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark ' : ''}bg-[#FBFBFA] dark:bg-[#101010] text-[#1A1A1A] flex flex-col font-sans transition-colors duration-200`}>
      <div className="print:hidden">
        <Header date={new Date().toLocaleDateString('pt-BR')} isOnline={isOnline} isRefreshing={isRefreshing} onRefresh={() => loadNewsFeed(true)} savedCount={offlineArticles.length} showOfflineOnly={showOfflineOnly} onToggleOfflineOnly={() => setShowOfflineOnly(prev => !prev)} autoTranslate={autoTranslate} onToggleAutoTranslate={() => { setAutoTranslate(!autoTranslate); setAutoTranslatePreference(!autoTranslate); }} isDarkMode={isDarkMode} onToggleDarkMode={() => { setIsDarkMode(!isDarkMode); setDarkModePreference(!isDarkMode); }} activeCategory={activeCategory} onSelectCategory={(cat) => { setActiveCategory(cat); setShowOfflineOnly(false); }} searchQuery={searchQuery} onSearchChange={setSearchQuery} categoriesList={allCategoriesList} onOpenMobileVitrine={() => setIsMobileVitrineOpen(true)} onOpenMobileNewsletter={() => setIsMobileNewsletterOpen(true)} />
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 print:hidden">
        {!showOfflineOnly && activeCategory === 'universities' ? ( <UniversitiesView /> ) : (
          <>
            <div className="mb-4 flex items-center justify-between text-xs text-stone-500 border-b pb-2">
              <span className="uppercase font-semibold text-stone-800 dark:text-stone-200">{activeCategory === 'all' ? 'Todas as Publicações' : 'Filtro Ativo'} • {filteredArticles.length} publicações</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 w-full min-w-0">
                
                {/* NOVO: CARROSSEL DE PATROCINADORES NO CELULAR (Some no PC) */}
                <div className="block lg:hidden mb-6 bg-[#FDFDFC] dark:bg-[#121212] border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
                    Apoio & Patrocínio
                  </span>
                  {sponsors.length === 0 ? (
                    <div className="w-full h-[160px] bg-stone-50 dark:bg-[#1A1A1A] rounded flex flex-col items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-700">
                      <div className="text-stone-400 dark:text-stone-600 font-bold text-sm mb-1">Espaço Patrocinador</div>
                    </div>
                  ) : (
                    <a 
                      href={sponsors[currentSponsorIndex].linkUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      key={`mob-${sponsors[currentSponsorIndex].id}`}
                      className="w-full relative block overflow-hidden rounded border border-stone-200 dark:border-stone-800 hover:border-blue-400 transition-colors animate-in fade-in zoom-in-[0.98] duration-500"
                    >
                      <img 
                        src={sponsors[currentSponsorIndex].imageUrl} 
                        alt={sponsors[currentSponsorIndex].title} 
                        className="w-full h-[160px] sm:h-[200px] object-cover" 
                      />
                    </a>
                  )}
                  {sponsors.length > 1 && (
                    <div className="flex items-center gap-1.5 mt-2.5">
                      {sponsors.map((_, idx) => (
                        <span key={idx} className={`block w-1.5 h-1.5 rounded-full transition-colors ${idx === currentSponsorIndex ? 'bg-blue-600 dark:bg-blue-500' : 'bg-stone-200 dark:bg-stone-700'}`}></span>
                      ))}
                    </div>
                  )}
                  <a href="mailto:leandro73baldocchi@gmail.com?subject=Orçamento%20para%20Anúncio%20no%20RACT" className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                    <Mail className="w-3.5 h-3.5" /> Anuncie no RACT
                  </a>
                </div>
                {/* FIM DO CARROSSEL MOBILE */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {displayedArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} autoTranslate={autoTranslate} isSavedOffline={savedIdsSet.has(article.id)} onToggleSaveOffline={handleToggleSaveOffline} onOpenArticle={setSelectedArticle} />
                  ))}
                </div>
                
                {filteredArticles.length > visibleCount && (
                  <div className="mt-10 flex justify-center pb-6">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 12)}
                      className="px-6 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs uppercase tracking-wider rounded-full shadow-sm hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Carregar mais publicações ({filteredArticles.length - visibleCount} restantes)
                    </button>
                  </div>
                )}
              </div>

              {!showOfflineOnly && (
                <aside className="hidden lg:block w-72 shrink-0 space-y-6">
                  
                  {/* CARROSSEL DE PATROCINADORES NO DESKTOP (Some no celular) */}
                  <div className="bg-[#FDFDFC] dark:bg-[#121212] border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center transition-colors">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
                      Apoio & Patrocínio
                    </span>
                    
                    {sponsors.length === 0 ? (
                      <div className="w-full h-[250px] bg-stone-50 dark:bg-[#1A1A1A] rounded flex flex-col items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer">
                        <div className="text-stone-400 dark:text-stone-600 font-bold text-lg mb-1">300 x 250</div>
                        <div className="text-stone-400 dark:text-stone-600 text-xs">Seja um Patrocinador</div>
                      </div>
                    ) : (
                      <a 
                        href={sponsors[currentSponsorIndex].linkUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        key={`desk-${sponsors[currentSponsorIndex].id}`}
                        className="w-full relative block overflow-hidden rounded border border-stone-200 dark:border-stone-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors animate-in fade-in zoom-in-[0.98] duration-500"
                        title={sponsors[currentSponsorIndex].title}
                      >
                        <img 
                          src={sponsors[currentSponsorIndex].imageUrl} 
                          alt={sponsors[currentSponsorIndex].title} 
                          className="w-full h-[250px] object-cover" 
                        />
                      </a>
                    )}

                    {sponsors.length > 1 && (
                      <div className="flex items-center gap-1.5 mt-3">
                        {sponsors.map((_, idx) => (
                          <span 
                            key={idx} 
                            className={`block w-1.5 h-1.5 rounded-full transition-colors ${idx === currentSponsorIndex ? 'bg-blue-600 dark:bg-blue-500' : 'bg-stone-200 dark:bg-stone-700'}`}
                          ></span>
                        ))}
                      </div>
                    )}
                    
                    <a 
                      href="mailto:leandro73baldocchi@gmail.com?subject=Orçamento%20para%20Anúncio%20no%20RACT" 
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Mail className="w-4 h-4" /> Anuncie no RACT
                    </a>
                  </div>

                  {affiliates.length > 0 && (
                    <div className="bg-[#FDFDFC] dark:bg-[#121212] border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <h3 className="font-bold text-sm uppercase tracking-wider dark:text-stone-100">Vitrine RACT</h3>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {affiliates.map(aff => (
                          <a key={aff.id} href={aff.url} target="_blank" rel="noreferrer" className="group block p-3 bg-white dark:bg-[#1A1A1A] border border-stone-200 dark:border-stone-800 rounded-lg hover:border-amber-400 hover:shadow-md transition-all cursor-pointer">
                            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1.5 flex gap-1.5"><ShoppingCart className="w-3 h-3" /> Recomendação</p>
                            <p className="font-bold text-[13px] mb-1.5 group-hover:text-amber-700 dark:text-stone-100 leading-snug">{aff.title}</p>
                            <p className="text-[10px] text-stone-500 flex gap-1">Ver Oferta <ExternalLink className="w-3 h-3" /></p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-[#FDFDFC] dark:bg-[#121212] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-[#181818]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider">Newsletter</h3>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug">Receba as principais publicações científicas direto no seu e-mail.</p>
                    </div>
                    <div className="bg-white"><iframe width="100%" height="320" src="https://f1baa2a4.sibforms.com/v2/serve/MUIFAIZama2f8WtOuv76-bvEFDjzQiq_QO67UcmlC7k_-Fnm2TZCFOypjijlOvo8K9TQzN56nAggcuIb4CQ0cHWKhVXvGi3Vzez5t5celarPJq9FRvApWgefr_Tzq5kO3XLLQpyhP78FypQkIvgw4Cz5MQ0nOL-ppT6HjScbGqiCzdAgUUDMjldQeJm2la52v-t4XhUD70u8TDAaTg==" frameBorder="0" scrolling="auto" allowFullScreen style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}></iframe></div>
                  </div>
                </aside>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151515] py-6 text-xs text-stone-500 dark:text-stone-400 font-mono-subtle mt-12 transition-colors print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div><strong className="text-stone-700 dark:text-stone-300">RADAR AUTÔNOMO DE CIÊNCIAS E TECNOLOGIA (RACT)</strong></div>
        </div>
      </footer>

      {isMobileVitrineOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-[#FDFDFC] dark:bg-[#121212] w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-[#181818] rounded-t-2xl shrink-0">
              <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-600" /><h3 className="font-bold text-base text-stone-900 dark:text-stone-100 uppercase tracking-wider">Vitrine RACT</h3></div>
              <button onClick={() => setIsMobileVitrineOpen(false)} className="p-2 rounded-full text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {affiliates.length === 0 ? (
                <p className="text-center text-sm text-stone-500 py-10">Nenhuma oferta disponível.</p>
              ) : (
                affiliates.map(aff => (
                  <a key={aff.id} href={aff.url} target="_blank" rel="noreferrer" className="group block p-4 bg-white dark:bg-[#1A1A1A] border border-stone-200 dark:border-stone-800 rounded-xl active:border-amber-400 transition-all cursor-pointer">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" /> Recomendação Especial</p>
                    <p className="font-bold text-sm text-stone-900 dark:text-stone-100 mb-2 leading-snug">{aff.title}</p>
                    <p className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 bg-stone-100 dark:bg-stone-800 w-fit px-2 py-1 rounded">Ver Oferta <ExternalLink className="w-3 h-3" /></p>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isMobileNewsletterOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-base text-stone-900 uppercase tracking-wider">Assinar Newsletter</h3></div>
              <button onClick={() => setIsMobileNewsletterOpen(false)} className="p-2 rounded-full text-stone-500 hover:bg-stone-200 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-white overflow-y-auto">
              <iframe width="100%" height="350" src="https://f1baa2a4.sibforms.com/v2/serve/MUIFAIZama2f8WtOuv76-bvEFDjzQiq_QO67UcmlC7k_-Fnm2TZCFOypjijlOvo8K9TQzN56nAggcuIb4CQ0cHWKhVXvGi3Vzez5t5celarPJq9FRvApWgefr_Tzq5kO3XLLQpyhP78FypQkIvgw4Cz5MQ0nOL-ppT6HjScbGqiCzdAgUUDMjldQeJm2la52v-t4XhUD70u8TDAaTg==" frameBorder="0" scrolling="auto" allowFullScreen style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}></iframe>
            </div>
          </div>
        </div>
      )}

      <ArticleDetailModal article={selectedArticle} isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)} isSavedOffline={selectedArticle ? savedIdsSet.has(selectedArticle.id) : false} onToggleSaveOffline={handleToggleSaveOffline} autoTranslateDefault={autoTranslate} />
      <AdminDashboardModal isOpen={isAdminOpen} onClose={handleCloseAdmin} onDataUpdated={handleDataUpdated} />
      <Analytics />
    </div>
  );
}
