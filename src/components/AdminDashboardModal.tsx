import React, { useState, useEffect } from 'react';
import { CustomCategory, NewsArticle, CategoryType } from '../types';
import {
  DEFAULT_BASE_CATEGORIES, getCustomCategories, saveCustomCategories, getAllManagedArticles, saveAllManagedArticles, saveOrUpdateArticle, deleteManagedArticle, resetToFactoryArticles, getCustomRssFeeds, saveCustomRssFeeds, CustomRssFeed, checkAdminPassword, setAdminPassword, saveCategoryToServer, deleteCategoryFromServer, fetchServerArticles, fetchServerCategories, fetchServerAffiliates, saveAffiliateToServer, deleteAffiliateFromServer, AffiliateLink, fetchServerFeeds, saveFeedToServer, deleteFeedFromServer
} from '../utils/customDataManager';
import { X, Plus, Trash2, Edit, Lock, Database, Layers, FileText, Save, Download, Upload, CheckCircle, ExternalLink, ShieldCheck, AlertCircle, Rss, Search, RotateCcw, TrendingUp } from 'lucide-react';

interface AdminDashboardModalProps { isOpen: boolean; onClose: () => void; onDataUpdated: () => void; }

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose, onDataUpdated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'feeds' | 'affiliates' | 'backup'>('articles');

  const [articlesList, setArticlesList] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [artSuccessMsg, setArtSuccessMsg] = useState<string | null>(null);

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [newCatId, setNewCatId] = useState<string>('');
  const [newCatLabel, setNewCatLabel] = useState<string>('');
  const [newCatOrder, setNewCatOrder] = useState<string>('99'); 
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);

  const [rssFeeds, setRssFeeds] = useState<CustomRssFeed[]>(() => getCustomRssFeeds());
  const [feedName, setFeedName] = useState<string>('');
  const [feedUrl, setFeedUrl] = useState<string>('');
  const [feedCategory, setFeedCategory] = useState<string>('tech');
  const [feedSuccessMsg, setFeedSuccessMsg] = useState<string | null>(null);

  const [affiliatesList, setAffiliatesList] = useState<AffiliateLink[]>([]);
  const [isEditingAffId, setIsEditingAffId] = useState<string | null>(null);
  const [affCatId, setAffCatId] = useState<string>('default');
  const [affTitle, setAffTitle] = useState<string>('');
  const [affUrl, setAffUrl] = useState<string>('');
  const [affSuccessMsg, setAffSuccessMsg] = useState<string | null>(null);

  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<{ titlePt: string; titleEn: string; source: string; sourceCategory: string; author: string; link: string; summaryPt: string; keyTakeaway: string; tags: string; readTime: string; isPeerReviewed: boolean; }>({ titlePt: '', titleEn: '', source: '', sourceCategory: 'education', author: '', link: '', summaryPt: '', keyTakeaway: '', tags: '', readTime: '5 min', isPeerReviewed: true });

  const [newPassInput, setNewPassInput] = useState<string>('');
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchServerArticles().then(setArticlesList);
      fetchServerCategories().then(setCustomCategories);
      fetchServerAffiliates().then(setAffiliatesList);
      fetchServerFeeds().then(setRssFeeds);
    }
  }, [isOpen]);

  const refreshArticles = async () => {
    const list = await fetchServerArticles(); setArticlesList(list);
    const cats = await fetchServerCategories(); setCustomCategories(cats);
    const affs = await fetchServerAffiliates(); setAffiliatesList(affs);
    const fds = await fetchServerFeeds(); setRssFeeds(fds);
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(passwordInput)) { setIsAuthenticated(true); setAuthError(null); setPasswordInput(''); refreshArticles(); } 
    else { setAuthError('Senha incorreta. Tente novamente.'); }
  };

  // ARTIGOS
  const handleStartEdit = (art: NewsArticle) => {
    setIsEditingId(art.id);
    setArticleForm({ titlePt: art.titlePt || art.title, titleEn: art.title || '', source: art.source || '', sourceCategory: art.sourceCategory || 'education', author: art.author || '', link: art.link || '', summaryPt: art.summaryPt || art.summary || '', keyTakeaway: art.keyTakeaway || '', tags: (art.tags || []).join(', '), readTime: art.readTime || '5 min', isPeerReviewed: art.isPeerReviewed ?? true });
    document.getElementById('admin-scrollable-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleCancelEdit = () => { setIsEditingId(null); setArticleForm({ titlePt: '', titleEn: '', source: '', sourceCategory: 'education', author: '', link: '', summaryPt: '', keyTakeaway: '', tags: '', readTime: '5 min', isPeerReviewed: true }); };
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.titlePt.trim() || !articleForm.summaryPt.trim()) { alert('Preencha o Título e Resumo!'); return; }
    const articleToSave: NewsArticle = {
      id: isEditingId ? isEditingId : `art-${Date.now()}`, title: articleForm.titleEn.trim() || articleForm.titlePt.trim(), titlePt: articleForm.titlePt.trim(), source: articleForm.source.trim() || 'Periódico', sourceCategory: articleForm.sourceCategory as CategoryType, author: articleForm.author.trim() || 'Redação', link: articleForm.link.trim(), pubDate: new Date().toLocaleDateString('pt-BR'), summary: articleForm.summaryPt.trim(), summaryPt: articleForm.summaryPt.trim(), keyTakeaway: articleForm.keyTakeaway.trim(), readTime: articleForm.readTime.trim() || '5 min', isPeerReviewed: articleForm.isPeerReviewed, tags: articleForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try { const updated = await saveOrUpdateArticle(articleToSave); setArticlesList(updated); handleCancelEdit(); setArtSuccessMsg('Artigo salvo!'); setTimeout(() => setArtSuccessMsg(null), 4000); onDataUpdated(); } catch (err) { alert('Erro ao publicar artigo'); }
  };
  const handleDeleteArticle = async (id: string, title: string) => { if (confirm(`Excluir "${title}"?`)) { const updated = await deleteManagedArticle(id); setArticlesList(updated); if (isEditingId === id) handleCancelEdit(); onDataUpdated(); } };

  // AFILIADOS (MERCADO LIVRE / AMAZON)
  const handleSaveAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affTitle.trim() || !affUrl.trim()) return;
    const newAffiliate: AffiliateLink = {
      id: isEditingAffId ? isEditingAffId : `aff-${Date.now()}`, // <--- AGORA GERA UM ID ÚNICO E NÃO SOBRESCREVE!
      categoryId: affCatId,
      title: affTitle.trim(),
      url: affUrl.trim()
    };
    try {
      const updated = await saveAffiliateToServer(newAffiliate);
      setAffiliatesList(updated);
      setIsEditingAffId(null); setAffTitle(''); setAffUrl('');
      setAffSuccessMsg('Link salvo com sucesso!'); setTimeout(() => setAffSuccessMsg(null), 4000); onDataUpdated();
    } catch (err) { alert('Erro ao salvar link'); }
  };
  const handleStartEditAffiliate = (aff: AffiliateLink) => {
    setIsEditingAffId(aff.id); setAffCatId(aff.categoryId || 'default'); setAffTitle(aff.title); setAffUrl(aff.url);
    document.getElementById('admin-scrollable-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleCancelEditAffiliate = () => { setIsEditingAffId(null); setAffCatId('default'); setAffTitle(''); setAffUrl(''); };
  const handleDeleteAffiliate = async (id: string) => {
    if (confirm('Deseja remover este link da sua vitrine?')) {
      const updated = await deleteAffiliateFromServer(id);
      setAffiliatesList(updated);
      if (isEditingAffId === id) handleCancelEditAffiliate();
      onDataUpdated();
    }
  };

  // CATEGORIAS E FEEDS
  const handleAddCategory = async (e: React.FormEvent) => { e.preventDefault(); if (!newCatLabel.trim()) return; const id = (newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase(); const newCat: CustomCategory = { id, label: newCatLabel.trim(), isCustom: true, order: parseInt(newCatOrder) || 99 }; try { const updated = await saveCategoryToServer(newCat); setCustomCategories(updated); setNewCatId(''); setNewCatLabel(''); setNewCatOrder('99'); setIsEditingCategory(false); setCatSuccessMsg(`Área salva!`); setTimeout(() => setCatSuccessMsg(null), 4000); onDataUpdated(); } catch (err) { alert('Erro ao salvar área'); } };
  const handleAddRssFeed = async (e: React.FormEvent) => { e.preventDefault(); if (!feedName.trim() || !feedUrl.trim()) return; const newFeed: CustomRssFeed = { id: `feed-${Date.now()}`, name: feedName.trim(), url: feedUrl.trim(), category: feedCategory, enabled: true }; try { const updated = await saveFeedToServer(newFeed); setRssFeeds(updated); setFeedName(''); setFeedUrl(''); setFeedSuccessMsg(`Fonte salva na nuvem!`); setTimeout(() => setFeedSuccessMsg(null), 4000); } catch (err) { alert('Erro ao salvar Feed'); } };
  const handleToggleFeed = async (feed: CustomRssFeed) => { try { const updated = await saveFeedToServer({ ...feed, enabled: !feed.enabled }); setRssFeeds(updated); } catch (err) { alert('Erro'); } };
  const handleDeleteFeed = async (id: string) => { if (confirm('Remover fonte RSS?')) { const updated = await deleteFeedFromServer(id); setRssFeeds(updated); } };
  const handleDeleteCategory = async (catId: string) => { if (confirm(`Remover esta área?`)) { const updated = await deleteCategoryFromServer(catId); setCustomCategories(updated); onDataUpdated(); } };

  const allAvailableCategories = customCategories && customCategories.length > 0 ? customCategories : DEFAULT_BASE_CATEGORIES;
  const displayedArticles = articlesList.filter((art) => { if (articleCategoryFilter !== 'all' && art.sourceCategory !== articleCategoryFilter) return false; if (articleSearchQuery.trim()) { const q = articleSearchQuery.toLowerCase(); return (art.titlePt || art.title || '').toLowerCase().includes(q) || (art.source || '').toLowerCase().includes(q) || (art.author || '').toLowerCase().includes(q); } return true; });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#181818] border border-stone-300 dark:border-stone-800 rounded-xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-[#F9F9F8] dark:bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 flex justify-center items-center font-bold text-sm"><ShieldCheck className="w-4 h-4" /></div>
            <div><h2 className="font-bold text-base flex items-center gap-2">Painel de Controle Editorial</h2></div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-200 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-4 border"><Lock className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-1">Acesso do Administrador</h3>
            <p className="text-[12px] text-rose-600 font-bold mb-6">(Dica de senha: admin2026)</p>
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Senha..." className="w-full px-3.5 py-2 text-sm border rounded-lg" autoFocus />
              <button type="submit" className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-lg text-sm font-semibold cursor-pointer">Entrar</button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-5 pt-2.5 border-b bg-stone-50/70 shrink-0 overflow-x-auto">
              <button onClick={() => setActiveTab('articles')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer ${activeTab === 'articles' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}><FileText className="w-3.5 h-3.5" /><span>Acervo</span></button>
              <button onClick={() => setActiveTab('feeds')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer ${activeTab === 'feeds' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}><Rss className="w-3.5 h-3.5" /><span>Fontes RSS</span></button>
              <button onClick={() => setActiveTab('categories')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer ${activeTab === 'categories' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}><Layers className="w-3.5 h-3.5" /><span>Áreas</span></button>
              <button onClick={() => setActiveTab('affiliates')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer ${activeTab === 'affiliates' ? 'border-amber-600 text-amber-700' : 'border-transparent text-stone-500'}`}><TrendingUp className="w-3.5 h-3.5 text-amber-600" /><span>Monetização</span></button>
            </div>

            <div id="admin-scrollable-content" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* ABA MONETIZAÇÃO */}
              {activeTab === 'affiliates' && (
                <div className="space-y-6">
                  {affSuccessMsg && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex gap-2"><CheckCircle className="w-4 h-4" /> <span>{affSuccessMsg}</span></div>}
                  <form onSubmit={handleSaveAffiliate} className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-amber-700 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> {isEditingAffId ? 'Editar Link' : 'Configurar Novo Link de Afiliado (Amazon, Mercado Livre, Hotmart...)'}</h4>
                      {isEditingAffId && <button type="button" onClick={handleCancelEditAffiliate} className="text-xs text-stone-500 underline cursor-pointer">Cancelar Edição</button>}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold mb-1">Área Sugerida *</label>
                        <select value={affCatId} onChange={(e) => setAffCatId(e.target.value)} className="w-full px-3 py-2 text-xs border rounded">
                          <option value="default">📘 Padrão Geral (Combina com tudo)</option>
                          {allAvailableCategories.filter(c => c.id !== 'all').map((c) => (<option key={c.id} value={c.id}>🔸 Área: {c.label}</option>))}
                        </select>
                      </div>
                      <div><label className="block text-[11px] font-semibold mb-1">Título do Produto / Livro *</label><input type="text" required value={affTitle} onChange={(e) => setAffTitle(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded" /></div>
                      <div><label className="block text-[11px] font-semibold mb-1">Link URL (qualquer site) *</label><input type="url" required value={affUrl} onChange={(e) => setAffUrl(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded font-mono" /></div>
                    </div>
                    <div className="pt-2 flex justify-end"><button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold cursor-pointer"><Save className="w-3.5 h-3.5 inline mr-1" /> Salvar</button></div>
                  </form>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider">Sua Vitrine de Links ({affiliatesList.length})</h4>
                    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white divide-y max-h-[300px] overflow-y-auto">
                      {affiliatesList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-500">Nenhum link configurado ainda. Adicione um acima!</div>
                      ) : (
                        affiliatesList.map((aff) => {
                          const categoryName = aff.categoryId === 'default' ? 'Padrão Geral' : allAvailableCategories.find(c => c.id === aff.categoryId)?.label || aff.categoryId;
                          return (
                            <div key={aff.id} className="p-3 flex items-center justify-between gap-3 text-xs"><div className="min-w-0"><div className="flex items-center gap-2 mb-0.5"><span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-stone-100 text-stone-600">{categoryName}</span></div><p className="font-bold text-stone-900 truncate">{aff.title}</p><p className="text-[10px] text-blue-600 font-mono truncate">{aff.url}</p></div><div className="flex shrink-0"><button onClick={() => handleStartEditAffiliate(aff)} className="p-1.5 rounded text-stone-600 hover:bg-stone-200 cursor-pointer"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteAffiliate(aff.id)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"><Trash2 className="w-4 h-4" /></button></div></div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA ARTIGOS (Resumo) */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  {artSuccessMsg && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex gap-2"><CheckCircle className="w-4 h-4" /><span>{artSuccessMsg}</span></div>}
                  <form onSubmit={handleSaveArticle} className="p-4 bg-stone-50 border rounded-xl space-y-4">
                    <div className="flex justify-between"><h4 className="text-xs font-bold uppercase flex gap-1.5">{isEditingId ? 'Editar Artigo' : 'Novo Artigo'}</h4>{isEditingId && <button type="button" onClick={handleCancelEdit} className="text-xs underline text-stone-500">Cancelar</button>}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"><div className="sm:col-span-2"><input type="text" required value={articleForm.titlePt} onChange={(e) => setArticleForm({ ...articleForm, titlePt: e.target.value })} placeholder="Título..." className="w-full px-3 py-1.5 text-xs border rounded" /></div><div><select value={articleForm.sourceCategory} onChange={(e) => setArticleForm({ ...articleForm, sourceCategory: e.target.value })} className="w-full px-3 py-1.5 text-xs border rounded">{allAvailableCategories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}</select></div><div><input type="text" value={articleForm.source} onChange={(e) => setArticleForm({ ...articleForm, source: e.target.value })} placeholder="Fonte..." className="w-full px-3 py-1.5 text-xs border rounded" /></div><div><input type="text" value={articleForm.author} onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })} placeholder="Autor..." className="w-full px-3 py-1.5 text-xs border rounded" /></div><div><input type="url" value={articleForm.link} onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })} placeholder="Link..." className="w-full px-3 py-1.5 text-xs border rounded" /></div><div className="sm:col-span-2"><textarea required rows={3} value={articleForm.summaryPt} onChange={(e) => setArticleForm({ ...articleForm, summaryPt: e.target.value })} placeholder="Resumo..." className="w-full px-3 py-1.5 text-xs border rounded" /></div></div><div className="flex justify-end"><button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer">Salvar Artigo</button></div>
                  </form>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase tracking-wider">Catálogo ({displayedArticles.length})</h4></div>
                    <div className="flex gap-2"><div className="relative flex-1"><Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" /><input type="text" value={articleSearchQuery} onChange={(e) => setArticleSearchQuery(e.target.value)} placeholder="Filtrar..." className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg" /></div><select value={articleCategoryFilter} onChange={(e) => setArticleCategoryFilter(e.target.value)} className="px-3 py-1.5 text-xs border rounded-lg"><option value="all">Todas</option>{allAvailableCategories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}</select></div>
                    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white divide-y max-h-[300px] overflow-y-auto">{displayedArticles.map((art) => (<div key={art.id} className="p-3 flex justify-between gap-3 text-xs"><div className="min-w-0"><span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-stone-100 text-stone-700">{art.sourceCategory}</span><h5 className="text-xs font-bold mt-1 line-clamp-1">{art.titlePt || art.title}</h5></div><div className="flex shrink-0"><button onClick={() => handleStartEdit(art)} className="p-1.5 rounded text-stone-600 hover:bg-stone-200 cursor-pointer"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => handleDeleteArticle(art.id, art.titlePt || art.title)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></div></div>))}</div>
                  </div>
                </div>
              )}

              {/* OUTRAS ABAS (Resumo) */}
              {activeTab === 'feeds' && ( <div className="space-y-6"><form onSubmit={handleAddRssFeed} className="p-4 bg-stone-50 border rounded-xl space-y-3"><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input type="text" required value={feedName} onChange={(e) => setFeedName(e.target.value)} placeholder="Nome" className="px-3 py-1.5 text-xs border rounded" /><input type="url" required value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} placeholder="URL XML" className="px-3 py-1.5 text-xs border rounded" /><select value={feedCategory} onChange={(e) => setFeedCategory(e.target.value)} className="px-3 py-1.5 text-xs border rounded">{allAvailableCategories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}</select></div><button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer">Salvar Feed</button></form></div> )}
              {activeTab === 'categories' && ( <div className="space-y-6"><form onSubmit={handleAddCategory} className="p-4 bg-stone-50 border rounded-xl space-y-3"><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input type="text" required value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} placeholder="Nome" className="px-3 py-1.5 text-xs border rounded" /><input type="number" min="1" value={newCatOrder} onChange={(e) => setNewCatOrder(e.target.value)} className="px-3 py-1.5 text-xs border rounded" /></div><button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer">Salvar Área</button></form></div> )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
