import React, { useState, useEffect } from 'react';
import { CustomCategory, NewsArticle, CategoryType } from '../types';
import {
  DEFAULT_BASE_CATEGORIES,
  getCustomCategories,
  saveCustomCategories,
  getAllManagedArticles,
  saveAllManagedArticles,
  saveOrUpdateArticle,
  deleteManagedArticle,
  resetToFactoryArticles,
  getCustomRssFeeds,
  saveCustomRssFeeds,
  CustomRssFeed,
  checkAdminPassword,
  setAdminPassword,
  saveCategoryToServer,
  deleteCategoryFromServer,
  fetchServerArticles,
  fetchServerCategories,
  fetchServerAffiliates,
  saveAffiliateToServer,
  deleteAffiliateFromServer,
  AffiliateLink,
  fetchServerFeeds,
  saveFeedToServer,
  deleteFeedFromServer
} from '../utils/customDataManager';
import {
  X, Plus, Trash2, Edit, Lock, Database, Layers, FileText, Save, Download, Upload, CheckCircle, ExternalLink, ShieldCheck, AlertCircle, Rss, Search, RotateCcw, TrendingUp
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onDataUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active subtab
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'feeds' | 'affiliates' | 'backup'>('articles');

  // Articles State
  const [articlesList, setArticlesList] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [artSuccessMsg, setArtSuccessMsg] = useState<string | null>(null);

  // Categories State
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [newCatId, setNewCatId] = useState<string>('');
  const [newCatLabel, setNewCatLabel] = useState<string>('');
  const [newCatOrder, setNewCatOrder] = useState<string>('99'); 
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);

  // RSS State
  const [rssFeeds, setRssFeeds] = useState<CustomRssFeed[]>(() => getCustomRssFeeds());
  const [feedName, setFeedName] = useState<string>('');
  const [feedUrl, setFeedUrl] = useState<string>('');
  const [feedCategory, setFeedCategory] = useState<string>('tech');
  const [feedSuccessMsg, setFeedSuccessMsg] = useState<string | null>(null);

  // Affiliates State
  const [affiliatesList, setAffiliatesList] = useState<AffiliateLink[]>([]);
  const [isEditingAffId, setIsEditingAffId] = useState<string | null>(null);
  const [affCatId, setAffCatId] = useState<string>('default');
  const [affTitle, setAffTitle] = useState<string>('');
  const [affUrl, setAffUrl] = useState<string>('');
  const [affSuccessMsg, setAffSuccessMsg] = useState<string | null>(null);

  // Form Article State
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<{
    titlePt: string; titleEn: string; source: string; sourceCategory: string; author: string; link: string; summaryPt: string; keyTakeaway: string; tags: string; readTime: string; isPeerReviewed: boolean;
  }>({
    titlePt: '', titleEn: '', source: '', sourceCategory: 'education', author: '', link: '', summaryPt: '', keyTakeaway: '', tags: '', readTime: '5 min', isPeerReviewed: true,
  });

  // Password Change State
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
    const list = await fetchServerArticles();
    setArticlesList(list);
    const cats = await fetchServerCategories();
    setCustomCategories(cats);
    const affs = await fetchServerAffiliates();
    setAffiliatesList(affs);
    const fds = await fetchServerFeeds();
    setRssFeeds(fds);
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      refreshArticles();
    } else {
      setAuthError('Senha incorreta. Tente novamente.');
    }
  };

  // Funções de Artigos
  const handleStartEdit = (art: NewsArticle) => {
    setIsEditingId(art.id);
    setArticleForm({
      titlePt: art.titlePt || art.title, 
      titleEn: art.title || '', 
      source: art.source || '', 
      sourceCategory: art.sourceCategory || 'education', 
      author: art.author || '', 
      link: art.link || '', 
      summaryPt: art.summaryPt || art.summary || '', 
      keyTakeaway: art.keyTakeaway || '', 
      tags: (art.tags || []).join(', '), 
      readTime: art.readTime || '5 min', 
      isPeerReviewed: art.isPeerReviewed ?? true,
    });
    document.getElementById('admin-scrollable-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditingId(null);
    setArticleForm({
      titlePt: '', titleEn: '', source: '', sourceCategory: 'education', author: '', link: '', summaryPt: '', keyTakeaway: '', tags: '', readTime: '5 min', isPeerReviewed: true,
    });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.titlePt.trim() || !articleForm.summaryPt.trim()) { alert('Preencha pelo menos o Título em Português e o Resumo!'); return; }

    const articleToSave: NewsArticle = {
      id: isEditingId ? isEditingId : `art-${Date.now()}`,
      title: articleForm.titleEn.trim() || articleForm.titlePt.trim(), 
      titlePt: articleForm.titlePt.trim(), 
      source: articleForm.source.trim() || 'Periódico Científico / Agência', 
      sourceCategory: articleForm.sourceCategory as CategoryType, 
      author: articleForm.author.trim() || 'Redação Científica', 
      link: articleForm.link.trim(), 
      pubDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), 
      summary: articleForm.summaryPt.trim(), 
      summaryPt: articleForm.summaryPt.trim(), 
      keyTakeaway: articleForm.keyTakeaway.trim(), 
      readTime: articleForm.readTime.trim() || '5 min', 
      isPeerReviewed: articleForm.isPeerReviewed, 
      tags: articleForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      const updated = await saveOrUpdateArticle(articleToSave);
      setArticlesList(updated);
      handleCancelEdit();
      setArtSuccessMsg(isEditingId ? 'Artigo atualizado com sucesso!' : 'Novo artigo publicado!');
      setTimeout(() => setArtSuccessMsg(null), 4000);
      onDataUpdated();
    } catch (err: any) { alert(err?.message || 'Erro ao publicar artigo no servidor'); }
  };

  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (confirm(`Deseja realmente EXCLUIR do servidor o artigo:\n"${title}"?`)) {
      const updated = await deleteManagedArticle(articleId);
      setArticlesList(updated);
      if (isEditingId === articleId) handleCancelEdit();
      onDataUpdated();
    }
  };

  const handleResetFactory = async () => {
    if (confirm('Tem certeza que deseja restaurar o acervo com os artigos originais no servidor?')) {
      const defaultArts = await resetToFactoryArticles();
      setArticlesList(defaultArts);
      onDataUpdated();
    }
  };

  // Funções de Categoria
  const handleEditCategory = (cat: CustomCategory) => {
    setNewCatId(cat.id); setNewCatLabel(cat.label); setNewCatOrder((cat.order ?? 99).toString()); setIsEditingCategory(true);
    document.getElementById('admin-scrollable-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditCategory = () => {
    setNewCatId(''); setNewCatLabel(''); setNewCatOrder('99'); setIsEditingCategory(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;
    const id = (newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
    const newCat: CustomCategory = { id, label: newCatLabel.trim(), isCustom: true, order: parseInt(newCatOrder) || 99 };
    try {
      const updated = await saveCategoryToServer(newCat);
      setCustomCategories(updated);
      handleCancelEditCategory();
      setCatSuccessMsg(`Área salva com sucesso!`);
      setTimeout(() => setCatSuccessMsg(null), 4000);
      onDataUpdated();
    } catch (err) { alert('Erro ao salvar área'); }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm(`Remover esta área do servidor?`)) {
      const updated = await deleteCategoryFromServer(catId);
      setCustomCategories(updated);
      if (newCatId === catId) handleCancelEditCategory();
      onDataUpdated();
    }
  };

  // Funções de RSS
  const handleAddRssFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim() || !feedUrl.trim()) return;
    const newFeed: CustomRssFeed = { id: `feed-${Date.now()}`, name: feedName.trim(), url: feedUrl.trim(), category: feedCategory, enabled: true };
    try {
      const updated = await saveFeedToServer(newFeed);
      setRssFeeds(updated);
      setFeedName(''); setFeedUrl('');
      setFeedSuccessMsg(`Fonte salva na nuvem!`);
      setTimeout(() => setFeedSuccessMsg(null), 4000);
    } catch (err) { alert('Erro ao salvar Feed'); }
  };

  const handleToggleFeed = async (feed: CustomRssFeed) => {
    try {
      const updatedFeed = { ...feed, enabled: !feed.enabled };
      const updated = await saveFeedToServer(updatedFeed);
      setRssFeeds(updated);
    } catch (err) { alert('Erro ao atualizar Feed'); }
  };

  const handleDeleteFeed = async (id: string) => {
    if (confirm('Remover fonte RSS de todos os aparelhos?')) {
      try {
        const updated = await deleteFeedFromServer(id);
        setRssFeeds(updated);
      } catch (err) { alert('Erro ao excluir Feed'); }
    }
  };

  // Funções de Afiliados (AGORA COM ID ÚNICO E LIXEIRA)
  const handleSaveAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affTitle.trim() || !affUrl.trim()) return;
    
    const newAffiliate: AffiliateLink = { 
      id: isEditingAffId ? isEditingAffId : `aff-${Date.now()}`, // ID único para permitir vários na mesma área
      categoryId: affCatId, 
      title: affTitle.trim(), 
      url: affUrl.trim() 
    };
    
    try {
      const updated = await saveAffiliateToServer(newAffiliate);
      setAffiliatesList(updated);
      setIsEditingAffId(null);
      setAffTitle(''); setAffUrl('');
      setAffSuccessMsg('Link de parceiro salvo com sucesso!');
      setTimeout(() => setAffSuccessMsg(null), 4000);
      onDataUpdated();
    } catch (err) { alert('Erro ao salvar link'); }
  };

  const handleStartEditAffiliate = (aff: AffiliateLink) => {
    setIsEditingAffId(aff.id);
    setAffCatId(aff.categoryId || 'default'); 
    setAffTitle(aff.title); 
    setAffUrl(aff.url);
    document.getElementById('admin-scrollable-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditAffiliate = () => {
    setIsEditingAffId(null);
    setAffCatId('default');
    setAffTitle('');
    setAffUrl('');
  };

  const handleDeleteAffiliate = async (id: string) => {
    if (confirm('Deseja realmente remover este link da sua vitrine?')) {
      try {
        const updated = await deleteAffiliateFromServer(id);
        setAffiliatesList(updated);
        if (isEditingAffId === id) handleCancelEditAffiliate();
        onDataUpdated();
      } catch (err) {
        alert('Erro ao excluir link');
      }
    }
  };

  // Funções de Backup e Senha
  const handleExportBackup = () => {
    const backupData = { version: '2.0', exportedAt: new Date().toISOString(), customCategories, articles: articlesList, rssFeeds };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ract-backup-completo-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.customCategories) { setCustomCategories(parsed.customCategories); saveCustomCategories(parsed.customCategories); }
        if (parsed.articles) { saveAllManagedArticles(parsed.articles); setArticlesList(parsed.articles); }
        if (parsed.rssFeeds) { setRssFeeds(parsed.rssFeeds); saveCustomRssFeeds(parsed.rssFeeds); }
        alert('Backup importado com sucesso!'); onDataUpdated();
      } catch (err) { alert('Erro ao importar arquivo JSON.'); }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassInput.trim()) return;
    setAdminPassword(newPassInput.trim());
    setNewPassInput('');
    setPassSuccessMsg('Senha atualizada com sucesso!');
    setTimeout(() => setPassSuccessMsg(null), 4000);
  };

  // Variáveis para exibição
  const allAvailableCategories = customCategories && customCategories.length > 0 ? customCategories : DEFAULT_BASE_CATEGORIES;
  const displayedArticles = articlesList.filter((art) => {
    if (articleCategoryFilter !== 'all' && art.sourceCategory !== articleCategoryFilter) return false;
    if (articleSearchQuery.trim()) {
      const q = articleSearchQuery.toLowerCase();
      return (art.titlePt || art.title || '').toLowerCase().includes(q) || (art.source || '').toLowerCase().includes(q) || (art.author || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#181818] border border-stone-300 dark:border-stone-800 rounded-xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-[#F9F9F8] dark:bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">Painel de Controle Editorial <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">Área Restrita</span></h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Gerencie artigos, links e a monetização do portal.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-4 border border-stone-200 dark:border-stone-700"><Lock className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-1">Acesso do Administrador</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">Digite a chave para gerenciar o portal.</p>
            <p className="text-[12px] text-rose-600 dark:text-rose-400 font-bold mb-6">(Dica de senha padrão: admin2026)</p>
            
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Digite a senha..." className="w-full px-3.5 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900" autoFocus />
              {authError && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{authError}</p>}
              <button type="submit" className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-sm font-semibold hover:bg-stone-800 cursor-pointer">Entrar no Painel</button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 px-5 pt-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 shrink-0 overflow-x-auto">
              <button onClick={() => setActiveTab('articles')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer shrink-0 ${activeTab === 'articles' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}><FileText className="w-3.5 h-3.5" /><span>Acervo</span></button>
              <button onClick={() => setActiveTab('feeds')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer shrink-0 ${activeTab === 'feeds' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}><Rss className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /><span>Fontes RSS</span></button>
              <button onClick={() => setActiveTab('categories')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer shrink-0 ${activeTab === 'categories' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}><Layers className="w-3.5 h-3.5" /><span>Áreas</span></button>
              <button onClick={() => setActiveTab('affiliates')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer shrink-0 ${activeTab === 'affiliates' ? 'border-amber-600 text-amber-700 dark:text-amber-400' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}><TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" /><span>Monetização</span></button>
              <button onClick={() => setActiveTab('backup')} className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 cursor-pointer shrink-0 ${activeTab === 'backup' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}><Database className="w-3.5 h-3.5" /><span>Configurações</span></button>
            </div>

            <div id="admin-scrollable-content" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: ARTICLES (LAYOUT COMPLETO RESTAURADO) */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  {artSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{artSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveArticle} className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        {isEditingId ? <><Edit className="w-3.5 h-3.5 text-amber-600" /> Editar Artigo Selecionado</> : <><Plus className="w-3.5 h-3.5 text-blue-600" /> Cadastrar Novo Artigo</>}
                      </h4>
                      {isEditingId && <button type="button" onClick={handleCancelEdit} className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer">Cancelar Edição</button>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Título em Português *</label>
                        <input type="text" required value={articleForm.titlePt} onChange={(e) => setArticleForm({ ...articleForm, titlePt: e.target.value })} placeholder="Ex: Novo telescópio espacial..." className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded focus:outline-none focus:border-stone-900 dark:focus:border-stone-300" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Área / Categoria *</label>
                        <select value={articleForm.sourceCategory} onChange={(e) => setArticleForm({ ...articleForm, sourceCategory: e.target.value })} className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded focus:outline-none">
                          {allAvailableCategories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Periódico / Fonte / Agência</label>
                        <input type="text" value={articleForm.source} onChange={(e) => setArticleForm({ ...articleForm, source: e.target.value })} placeholder="Ex: Nature, Reuters, MIT..." className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Autor(es) / Jornalista</label>
                        <input type="text" value={articleForm.author} onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })} placeholder="Ex: Dra. Alice Smith" className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Link Original (URL / DOI)</label>
                        <input type="url" value={articleForm.link} onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })} placeholder="https://exemplo.com/noticia" className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Resumo / Síntese em Português *</label>
                        <textarea required rows={3} value={articleForm.summaryPt} onChange={(e) => setArticleForm({ ...articleForm, summaryPt: e.target.value })} placeholder="Síntese da notícia, descobertas..." className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded resize-y" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Ponto Chave / Insight</label>
                        <input type="text" value={articleForm.keyTakeaway} onChange={(e) => setArticleForm({ ...articleForm, keyTakeaway: e.target.value })} placeholder="Ex: Primeira evidência de água..." className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Tags (separadas por vírgula)</label>
                        <input type="text" value={articleForm.tags} onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })} placeholder="Astronomia, NASA..." className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                        <input type="checkbox" checked={articleForm.isPeerReviewed} onChange={(e) => setArticleForm({ ...articleForm, isPeerReviewed: e.target.checked })} className="rounded border-stone-300 dark:border-stone-700" />
                        <span>Publicação com Revisão por Pares (Peer-Reviewed)</span>
                      </label>

                      <div className="flex items-center gap-2">
                        {isEditingId && <button type="button" onClick={handleCancelEdit} className="px-3.5 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer">Cancelar</button>}
                        <button type="submit" className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5">
                          <Save className="w-3.5 h-3.5" /> {isEditingId ? 'Salvar Alterações' : 'Publicar Artigo'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* UI DE BUSCA E LISTAGEM */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                          Catálogo ({displayedArticles.length})
                        </h4>
                      </div>
                      <button onClick={handleResetFactory} className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-xs hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer" title="Restaura os artigos originais">
                        <RotateCcw className="w-3 h-3" /> Restaurar Padrão
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                        <input type="text" value={articleSearchQuery} onChange={(e) => setArticleSearchQuery(e.target.value)} placeholder="Filtrar por título, fonte ou autor..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg" />
                      </div>
                      <select value={articleCategoryFilter} onChange={(e) => setArticleCategoryFilter(e.target.value)} className="px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shrink-0">
                        <option value="all">Todas as Áreas ({articlesList.length})</option>
                        {allAvailableCategories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                      </select>
                    </div>

                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800 max-h-[450px] overflow-y-auto">
                      {displayedArticles.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-500">Nenhum artigo encontrado com esse filtro.</div>
                      ) : (
                        displayedArticles.map((art) => (
                          <div key={art.id} className={`p-3 sm:p-3.5 flex items-start justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors ${isEditingId === art.id ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">{art.sourceCategory}</span>
                                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">{art.source}</span>
                              </div>
                              <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{art.titlePt || art.title}</h5>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => handleStartEdit(art)} className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                              {art.link && <a href={art.link} target="_blank" rel="noreferrer" className="p-1.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
                              <button onClick={() => handleDeleteArticle(art.id, art.titlePt || art.title)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MONETIZATION (COM LIXEIRA E INFINITOS) */}
              {activeTab === 'affiliates' && (
                <div className="space-y-6">
                  {affSuccessMsg && <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> <span>{affSuccessMsg}</span></div>}
                  <form onSubmit={handleSaveAffiliate} className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> {isEditingAffId ? 'Editar Link de Afiliado' : 'Configurar Link (Amazon, Mercado Livre...)'}
                      </h4>
                      {isEditingAffId && <button type="button" onClick={handleCancelEditAffiliate} className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer">Cancelar Edição</button>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Área do Artigo Sugerida *</label>
                        <select value={affCatId} onChange={(e) => setAffCatId(e.target.value)} className="w-full px-3 py-2 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded focus:outline-none">
                          <option value="default">📘 Padrão Geral (Exibe na vitrine de todas as áreas)</option>
                          {allAvailableCategories.filter(c => c.id !== 'all').map((c) => (<option key={c.id} value={c.id}>🔸 Área: {c.label}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Título do Produto / Livro *</label>
                        <input type="text" required value={affTitle} onChange={(e) => setAffTitle(e.target.value)} placeholder="Ex: Cosmos (Carl Sagan)" className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Link URL (Qualquer loja) *</label>
                        <input type="url" required value={affUrl} onChange={(e) => setAffUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded font-mono" />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end"><button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Salvar Link</button></div>
                  </form>
                  
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">Links Ativos na Vitrine ({affiliatesList.length})</h4>
                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800 max-h-[300px] overflow-y-auto">
                      {affiliatesList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-500">Nenhum link configurado ainda.</div>
                      ) : (
                        affiliatesList.map((aff) => {
                          const categoryName = aff.categoryId === 'default' ? 'Padrão Geral' : allAvailableCategories.find(c => c.id === aff.categoryId)?.label || aff.categoryId;
                          return (
                            <div key={aff.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5"><span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${aff.categoryId === 'default' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}`}>{categoryName}</span></div>
                                <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{aff.title}</p>
                                <a href={aff.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 font-mono truncate hover:underline">{aff.url}</a>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => handleStartEditAffiliate(aff)} className="p-1.5 rounded text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800 transition-colors cursor-pointer" title="Editar link"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteAffiliate(aff.id)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer" title="Apagar link"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FEEDS */}
              {activeTab === 'feeds' && (
                <div className="space-y-6">
                  {feedSuccessMsg && <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> <span>{feedSuccessMsg}</span></div>}
                  <form onSubmit={handleAddRssFeed} className="p-4 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-blue-600" /> Adicionar Nova Fonte RSS</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Agência</label><input type="text" required value={feedName} onChange={(e) => setFeedName(e.target.value)} className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" /></div>
                      <div><label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">URL (XML)</label><input type="url" required value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded font-mono" /></div>
                      <div><label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Área</label><select value={feedCategory} onChange={(e) => setFeedCategory(e.target.value)} className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded">{allAvailableCategories.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}</select></div>
                    </div>
                    <div className="pt-2 flex justify-end"><button type="submit" className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"><Save className="w-3 h-3 inline mr-1" /> Salvar Feed</button></div>
                  </form>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">Feeds Ativos ({rssFeeds.length})</h4>
                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800">
                      {rssFeeds.map((feed) => (
                        <div key={feed.id} className="p-3 flex items-center justify-between gap-3 text-xs"><div className="min-w-0"><div className="flex items-center gap-2"><span className="font-bold text-stone-900 dark:text-stone-100">{feed.name}</span><span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">{feed.category}</span></div><span className="block text-[11px] text-stone-400 font-mono truncate">{feed.url}</span></div><div className="flex items-center gap-2 shrink-0"><button onClick={() => handleToggleFeed(feed)} className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${feed.enabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>{feed.enabled ? 'Ativo' : 'Pausado'}</button><button onClick={() => handleDeleteFeed(feed.id)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></div></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {catSuccessMsg && <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" /><span>{catSuccessMsg}</span></div>}
                  <form onSubmit={handleAddCategory} className={`p-4 sm:p-5 border rounded-xl space-y-3 ${isEditingCategory ? 'bg-amber-50/50 border-amber-200' : 'bg-stone-50 border-stone-200 dark:bg-stone-900/60 dark:border-stone-800'}`}>
                    <div className="flex items-center justify-between"><h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">{isEditingCategory ? <><Edit className="w-3.5 h-3.5 text-amber-600" /> Editar Área</> : <><Plus className="w-3.5 h-3.5 text-blue-600" /> Criar Área</>}</h4>{isEditingCategory && <button type="button" onClick={handleCancelEditCategory} className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer">Cancelar Edição</button>}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">Nome</label><input type="text" required value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" /></div>
                      <div><label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">ID</label><input type="text" value={newCatId} onChange={(e) => setNewCatId(e.target.value)} disabled={isEditingCategory} className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded font-mono disabled:opacity-50" /></div>
                      <div><label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1 text-blue-700 dark:text-blue-400">Posição no Menu</label><input type="number" min="1" value={newCatOrder} onChange={(e) => setNewCatOrder(e.target.value)} className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-blue-300 dark:border-blue-700 rounded font-bold text-center text-blue-700 dark:text-blue-400" /></div>
                    </div>
                    <div className="pt-2 flex justify-end"><button type="submit" className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Salvar Área</button></div>
                  </form>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">Áreas ({allAvailableCategories.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allAvailableCategories.map((c) => (
                        <div key={c.id} className={`p-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg flex items-center justify-between ${isEditingCategory && newCatId === c.id ? 'ring-2 ring-amber-300' : ''}`}><div className="flex items-center gap-3"><div className="w-6 h-6 rounded bg-stone-100 dark:bg-stone-900 flex items-center justify-center font-bold text-[10px] text-stone-500">{c.order ?? 99}</div><div><span className="text-xs font-bold text-stone-900 dark:text-stone-100">{c.label}</span><span className="block text-[10px] text-stone-400 font-mono">ID: {c.id}</span></div></div>{c.id !== 'all' ? (<div className="flex items-center gap-1.5 shrink-0"><button onClick={() => handleEditCategory(c)} className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"><Trash2 className="w-4 h-4" /></button></div>) : (<span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Principal</span>)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BACKUP & SECURITY */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-600" /> Backup Completo</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Baixe um arquivo com todos os artigos ({articlesList.length}), áreas e feeds cadastrados.</p>
                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <button onClick={handleExportBackup} className="px-3.5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-800"><Download className="w-3.5 h-3.5" /> Exportar Backup</button>
                      <label className="px-3.5 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700"><Upload className="w-3.5 h-3.5" /> Restaurar Arquivo<input type="file" accept=".json" onChange={handleImportBackup} className="hidden" /></label>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-600" /> Segurança do Admin</h4>
                    {passSuccessMsg && <p className="text-xs text-emerald-600 font-medium">{passSuccessMsg}</p>}
                    <div className="max-w-xs space-y-2">
                      <input type="password" value={newPassInput} onChange={(e) => setNewPassInput(e.target.value)} placeholder="Nova senha..." className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded" />
                      <button type="submit" className="px-3.5 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded text-xs font-semibold cursor-pointer">Trocar Senha de Acesso</button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
