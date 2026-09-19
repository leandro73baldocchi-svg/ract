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
} from '../utils/customDataManager';
import {
  X,
  Plus,
  Trash2,
  Edit,
  Lock,
  Database,
  Layers,
  FileText,
  Save,
  Download,
  Upload,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Rss,
  Search,
  RotateCcw,
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

  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'feeds' | 'backup'>('articles');

  const [articlesList, setArticlesList] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [artSuccessMsg, setArtSuccessMsg] = useState<string | null>(null);

  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [newCatId, setNewCatId] = useState<string>('');
  const [newCatLabel, setNewCatLabel] = useState<string>('');
  const [newCatOrder, setNewCatOrder] = useState<string>('99'); // NOVO ESTADO DA ORDEM
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);

  const [rssFeeds, setRssFeeds] = useState<CustomRssFeed[]>(() => getCustomRssFeeds());
  const [feedName, setFeedName] = useState<string>('');
  const [feedUrl, setFeedUrl] = useState<string>('');
  const [feedCategory, setFeedCategory] = useState<string>('tech');
  const [feedSuccessMsg, setFeedSuccessMsg] = useState<string | null>(null);

  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState<{
    titlePt: string;
    titleEn: string;
    source: string;
    sourceCategory: string;
    author: string;
    link: string;
    summaryPt: string;
    keyTakeaway: string;
    tags: string;
    readTime: string;
    isPeerReviewed: boolean;
  }>({
    titlePt: '',
    titleEn: '',
    source: '',
    sourceCategory: 'education',
    author: '',
    link: '',
    summaryPt: '',
    keyTakeaway: '',
    tags: '',
    readTime: '5 min',
    isPeerReviewed: true,
  });

  const [newPassInput, setNewPassInput] = useState<string>('');
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchServerArticles().then(setArticlesList);
      fetchServerCategories().then(setCustomCategories);
    }
  }, [isOpen]);

  const refreshArticles = async () => {
    const list = await fetchServerArticles();
    setArticlesList(list);
    const cats = await fetchServerCategories();
    setCustomCategories(cats);
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
      setAuthError('Senha incorreta. (Dica padrão: admin2026)');
    }
  };

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
    const modalContent = document.getElementById('admin-scrollable-content');
    if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditingId(null);
    setArticleForm({
      titlePt: '',
      titleEn: '',
      source: '',
      sourceCategory: 'education',
      author: '',
      link: '',
      summaryPt: '',
      keyTakeaway: '',
      tags: '',
      readTime: '5 min',
      isPeerReviewed: true,
    });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.titlePt.trim() || !articleForm.summaryPt.trim()) {
      alert('Preencha pelo menos o Título em Português e o Resumo!');
      return;
    }

    const articleToSave: NewsArticle = {
      id: isEditingId ? isEditingId : `art-${Date.now()}`,
      title: articleForm.titleEn.trim() || articleForm.titlePt.trim(),
      titlePt: articleForm.titlePt.trim(),
      source: articleForm.source.trim() || 'Periódico Científico / Agência',
      sourceCategory: articleForm.sourceCategory as CategoryType,
      author: articleForm.author.trim() || 'Redação Científica',
      link: articleForm.link.trim() || 'https://ract.gov.br',
      pubDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      summary: articleForm.summaryPt.trim(),
      summaryPt: articleForm.summaryPt.trim(),
      keyTakeaway: articleForm.keyTakeaway.trim() || 'Descoberta incorporada e catalogada no acervo do portal.',
      readTime: articleForm.readTime.trim() || '5 min',
      isPeerReviewed: articleForm.isPeerReviewed,
      tags: articleForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const updated = await saveOrUpdateArticle(articleToSave);
      setArticlesList(updated);
      handleCancelEdit();

      setArtSuccessMsg(
        isEditingId
          ? 'Artigo atualizado com sucesso no servidor!'
          : 'Novo artigo publicado no servidor!'
      );
      setTimeout(() => setArtSuccessMsg(null), 4000);
      onDataUpdated();
    } catch (err: any) {
      alert(err?.message || 'Erro ao publicar artigo no servidor');
    }
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
    if (
      confirm(
        'Tem certeza que deseja restaurar o acervo com os artigos originais no servidor?'
      )
    ) {
      const defaultArts = await resetToFactoryArticles();
      setArticlesList(defaultArts);
      onDataUpdated();
      alert('Acervo restaurado no servidor com sucesso!');
    }
  };

  // Categories Handlers com a nova Ordem
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const id = (newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
    
    const newCat: CustomCategory = {
      id,
      label: newCatLabel.trim(),
      isCustom: true,
      order: parseInt(newCatOrder) || 99, // Converte a string para número
    };

    try {
      const updated = await saveCategoryToServer(newCat);
      setCustomCategories(updated);
      setNewCatId('');
      setNewCatLabel('');
      setNewCatOrder('99');
      setCatSuccessMsg(`Área "${newCat.label}" cadastrada e ordenada!`);
      setTimeout(() => setCatSuccessMsg(null), 4000);
      onDataUpdated();
    } catch (err: any) {
      alert(err?.message || 'Erro ao cadastrar área no servidor');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm(`Tem certeza que deseja remover esta área do servidor?`)) {
      const updated = await deleteCategoryFromServer(catId);
      setCustomCategories(updated);
      onDataUpdated();
    }
  };

  // RSS Feeds Handlers
  const handleAddRssFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedName.trim() || !feedUrl.trim()) return;

    const newFeed: CustomRssFeed = {
      id: `feed-${Date.now()}`,
      name: feedName.trim(),
      url: feedUrl.trim(),
      category: feedCategory,
      enabled: true,
    };

    const updated = [...rssFeeds, newFeed];
    setRssFeeds(updated);
    saveCustomRssFeeds(updated);
    setFeedName('');
    setFeedUrl('');
    setFeedSuccessMsg(`Fonte RSS / Agência "${newFeed.name}" adicionada com sucesso!`);
    setTimeout(() => setFeedSuccessMsg(null), 4000);
  };

  const handleToggleFeed = (id: string) => {
    const updated = rssFeeds.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    setRssFeeds(updated);
    saveCustomRssFeeds(updated);
  };

  const handleDeleteFeed = (id: string) => {
    if (confirm('Deseja remover esta fonte RSS?')) {
      const updated = rssFeeds.filter((f) => f.id !== id);
      setRssFeeds(updated);
      saveCustomRssFeeds(updated);
    }
  };

  // Backup Handlers
  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      customCategories,
      articles: articlesList,
      rssFeeds,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ract-acervo-completo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.customCategories && Array.isArray(parsed.customCategories)) {
          setCustomCategories(parsed.customCategories);
          saveCustomCategories(parsed.customCategories);
        }
        if (parsed.articles && Array.isArray(parsed.articles)) {
          saveAllManagedArticles(parsed.articles);
          setArticlesList(parsed.articles);
        }
        if (parsed.rssFeeds && Array.isArray(parsed.rssFeeds)) {
          setRssFeeds(parsed.rssFeeds);
          saveCustomRssFeeds(parsed.rssFeeds);
        }
        alert('Backup importado e restaurado com sucesso no portal!');
        onDataUpdated();
      } catch (err) {
        alert('Erro ao importar arquivo: formato JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassInput.trim()) return;
    setAdminPassword(newPassInput.trim());
    setNewPassInput('');
    setPassSuccessMsg('Senha de acesso administrativo atualizada com sucesso!');
    setTimeout(() => setPassSuccessMsg(null), 4000);
  };

  const allAvailableCategories = customCategories && customCategories.length > 0
    ? customCategories
    : DEFAULT_BASE_CATEGORIES;

  const displayedArticles = articlesList.filter((art) => {
    if (articleCategoryFilter !== 'all' && art.sourceCategory !== articleCategoryFilter) {
      return false;
    }
    if (articleSearchQuery.trim()) {
      const q = articleSearchQuery.toLowerCase();
      const matchTitle = (art.titlePt || art.title || '').toLowerCase().includes(q);
      const matchSource = (art.source || '').toLowerCase().includes(q);
      const matchAuthor = (art.author || '').toLowerCase().includes(q);
      return matchTitle || matchSource || matchAuthor;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#181818] border border-stone-300 dark:border-stone-800 rounded-xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 dark:border-stone-800 bg-[#F9F9F8] dark:bg-[#141414] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                Painel de Controle Editorial Completo (RACT)
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                  Área Restrita
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Gerencie todos os artigos, áreas do menu e feeds RSS.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-4 border border-stone-200 dark:border-stone-700">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">Acesso do Administrador Editorial</h3>
            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3 mt-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha..."
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-xs text-rose-600 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {authError}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-lg text-sm font-semibold hover:bg-stone-800 cursor-pointer"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Sub navigation bar */}
            <div className="flex items-center gap-2 px-5 pt-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('articles')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'articles' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Gerenciar Artigos</span>
              </button>

              <button
                onClick={() => setActiveTab('feeds')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'feeds' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500'
                }`}
              >
                <Rss className="w-3.5 h-3.5" />
                <span>Feeds RSS</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'categories' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Áreas e Categorias</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'backup' ? 'border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100' : 'border-transparent text-stone-500'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Backup</span>
              </button>
            </div>

            <div id="admin-scrollable-content" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: ARTICLES */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  {artSuccessMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> <span>{artSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveArticle} className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase flex items-center gap-1.5">
                        {isEditingId ? <><Edit className="w-3.5 h-3.5 text-amber-600" /> Editar Artigo</> : <><Plus className="w-3.5 h-3.5 text-blue-600" /> Novo Artigo</>}
                      </h4>
                      {isEditingId && <button type="button" onClick={handleCancelEdit} className="text-xs underline cursor-pointer">Cancelar Edição</button>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold mb-1">Título em Português *</label>
                        <input
                          type="text" required value={articleForm.titlePt}
                          onChange={(e) => setArticleForm({ ...articleForm, titlePt: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Área / Categoria *</label>
                        <select
                          value={articleForm.sourceCategory}
                          onChange={(e) => setArticleForm({ ...articleForm, sourceCategory: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        >
                          {allAvailableCategories.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Fonte / Agência</label>
                        <input
                          type="text" value={articleForm.source}
                          onChange={(e) => setArticleForm({ ...articleForm, source: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Autor / Jornalista</label>
                        <input
                          type="text" value={articleForm.author}
                          onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Link Original</label>
                        <input
                          type="url" value={articleForm.link}
                          onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold mb-1">Resumo em Português *</label>
                        <textarea
                          required rows={3} value={articleForm.summaryPt}
                          onChange={(e) => setArticleForm({ ...articleForm, summaryPt: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 cursor-pointer flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> {isEditingId ? 'Salvar Alterações' : 'Publicar Artigo'}
                      </button>
                    </div>
                  </form>

                  <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950 max-h-[450px] overflow-y-auto">
                    {displayedArticles.map((art) => (
                      <div key={art.id} className="p-3 border-b border-stone-200 flex justify-between gap-3">
                        <div>
                           <span className="text-[10px] font-bold">{art.sourceCategory}</span>
                           <h5 className="text-xs font-bold line-clamp-1">{art.titlePt || art.title}</h5>
                        </div>
                        <div className="flex gap-1.5">
                           <button onClick={() => handleStartEdit(art)} className="p-1.5"><Edit className="w-3.5 h-3.5"/></button>
                           <button onClick={() => handleDeleteArticle(art.id, art.titlePt)} className="p-1.5 text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: FEEDS */}
              {activeTab === 'feeds' && (
                <div className="space-y-6">
                   {feedSuccessMsg && <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2"><CheckCircle className="w-4 h-4" /> <span>{feedSuccessMsg}</span></div>}
                   
                   <form onSubmit={handleAddRssFeed} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold uppercase"><Plus className="w-3.5 h-3.5 text-blue-600 inline" /> Novo Feed</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                         <input type="text" required value={feedName} onChange={(e)=>setFeedName(e.target.value)} placeholder="Nome" className="px-3 py-1.5 text-xs border rounded"/>
                         <input type="url" required value={feedUrl} onChange={(e)=>setFeedUrl(e.target.value)} placeholder="URL do XML" className="px-3 py-1.5 text-xs border rounded"/>
                         <select value={feedCategory} onChange={(e)=>setFeedCategory(e.target.value)} className="px-3 py-1.5 text-xs border rounded">
                            {allAvailableCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                         </select>
                      </div>
                      <div className="flex justify-end"><button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs cursor-pointer">Salvar Feed</button></div>
                   </form>

                   <div className="border border-stone-200 rounded-xl divide-y">
                      {rssFeeds.map(feed => (
                         <div key={feed.id} className="p-3 flex justify-between items-center text-xs">
                            <div><strong>{feed.name}</strong> - {feed.category}</div>
                            <div className="flex gap-2">
                               <button onClick={()=>handleToggleFeed(feed.id)} className="px-2 py-1 rounded bg-stone-200">{feed.enabled ? 'Ativo' : 'Pausado'}</button>
                               <button onClick={()=>handleDeleteFeed(feed.id)} className="p-1.5 text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES COM ORDENAÇÃO */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {catSuccessMsg && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> <span>{catSuccessMsg}</span>
                    </div>
                  )}

                  {/* FORMULÁRIO COM O CAMPO ORDEM */}
                  <form onSubmit={handleAddCategory} className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Criar Área (Ou editar ordem de uma área existente)
                    </h4>
                    
                    <p className="text-[11px] text-stone-500">
                      Dica: Para mudar a posição de uma área que já existe, basta digitar o nome dela exatamente igual e escolher a nova posição.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Nome da Área *</label>
                        <input
                          type="text" required value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          placeholder="Ex: Tecnologia"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">ID (Opcional)</label>
                        <input
                          type="text" value={newCatId}
                          onChange={(e) => setNewCatId(e.target.value)}
                          placeholder="Ex: tech"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold mb-1">Posição no Menu (1, 2, 3...)</label>
                        <input
                          type="number" min="1" value={newCatOrder}
                          onChange={(e) => setNewCatOrder(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded font-bold text-center"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button type="submit" className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer">
                        <Save className="w-3.5 h-3.5 inline mr-1" /> Salvar Área / Ordem
                      </button>
                    </div>
                  </form>

                  {/* LISTA DE ÁREAS COM ORDEM EXIBIDA */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Áreas Ativas (Em Ordem de Exibição)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allAvailableCategories.map((c) => (
                        <div key={c.id} className="p-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-stone-100 dark:bg-stone-900 flex items-center justify-center font-bold text-[10px] text-stone-500">
                              {c.order ?? 0}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{c.label}</span>
                              <span className="block text-[10px] text-stone-400 font-mono">ID: {c.id}</span>
                            </div>
                          </div>
                          {c.id !== 'all' && (
                            <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BACKUP */}
              {activeTab === 'backup' && (
                 <div className="space-y-6">
                    <div className="p-4 bg-stone-50 border rounded-xl">
                       <h4 className="text-xs font-bold uppercase"><Database className="w-3.5 h-3.5 text-emerald-600 inline" /> Backup</h4>
                       <div className="flex gap-3 mt-3">
                          <button onClick={handleExportBackup} className="px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs">Exportar JSON</button>
                       </div>
                    </div>
                 </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
