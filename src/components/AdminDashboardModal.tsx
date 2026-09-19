import React, { useState } from 'react';
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
  BookOpen,
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

  // Active subtab in admin: 'articles' | 'categories' | 'feeds' | 'backup'
  const [activeTab, setActiveTab] = useState<'articles' | 'categories' | 'feeds' | 'backup'>('articles');

  // All managed articles
  const [articlesList, setArticlesList] = useState<NewsArticle[]>(() => getAllManagedArticles());
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [artSuccessMsg, setArtSuccessMsg] = useState<string | null>(null);

  // Custom categories state
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [newCatId, setNewCatId] = useState<string>('');
  const [newCatLabel, setNewCatLabel] = useState<string>('');
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);

  // RSS Feeds state
  const [rssFeeds, setRssFeeds] = useState<CustomRssFeed[]>(() => getCustomRssFeeds());
  const [feedName, setFeedName] = useState<string>('');
  const [feedUrl, setFeedUrl] = useState<string>('');
  const [feedCategory, setFeedCategory] = useState<string>('tech');
  const [feedSuccessMsg, setFeedSuccessMsg] = useState<string | null>(null);

  // Form to add or edit article
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

  // Password change state
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshArticles = () => {
    const list = getAllManagedArticles();
    setArticlesList(list);
  };

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

  // Start editing existing article
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
    // Scroll to top of panel smoothly
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

  const handleSaveArticle = (e: React.FormEvent) => {
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

    saveOrUpdateArticle(articleToSave);
    refreshArticles();
    handleCancelEdit();

    setArtSuccessMsg(
      isEditingId
        ? 'Artigo atualizado com sucesso no portal!'
        : 'Novo artigo publicado e incluído no acervo com sucesso!'
    );
    setTimeout(() => setArtSuccessMsg(null), 4000);
    onDataUpdated();
  };

  const handleDeleteArticle = (articleId: string, title: string) => {
    if (confirm(`Deseja realmente EXCLUIR do portal o artigo:\n"${title}"?`)) {
      deleteManagedArticle(articleId);
      refreshArticles();
      if (isEditingId === articleId) handleCancelEdit();
      onDataUpdated();
    }
  };

  const handleResetFactory = () => {
    if (
      confirm(
        'Tem certeza que deseja restaurar todo o acervo original de fábrica? Isso recarregará os artigos padrão.'
      )
    ) {
      resetToFactoryArticles();
      refreshArticles();
      onDataUpdated();
      alert('Acervo restaurado com sucesso!');
    }
  };

  // Categories Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const id = (newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
    const allExisting = [...DEFAULT_BASE_CATEGORIES, ...customCategories];
    if (allExisting.some((c) => c.id === id)) {
      alert('Essa categoria ou identificador já existe!');
      return;
    }

    const newCat: CustomCategory = {
      id,
      label: newCatLabel.trim(),
      isCustom: true,
    };

    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    saveCustomCategories(updated);
    setNewCatId('');
    setNewCatLabel('');
    setCatSuccessMsg(`Área "${newCat.label}" adicionada com sucesso ao menu principal!`);
    setTimeout(() => setCatSuccessMsg(null), 4000);
    onDataUpdated();
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm(`Tem certeza que deseja remover esta área do menu?`)) {
      const updated = customCategories.filter((c) => c.id !== catId);
      setCustomCategories(updated);
      saveCustomCategories(updated);
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

  const allAvailableCategories = [...DEFAULT_BASE_CATEGORIES, ...customCategories];

  // Filtered articles list for admin table
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
                Gerencie todos os {articlesList.length} artigos do portal, adicione novos links, edite fontes e cadastre feeds RSS.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isAuthenticated ? (
          /* Login Screen */
          <div className="p-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 mb-4 border border-stone-200 dark:border-stone-700">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-1">Acesso do Administrador Editorial</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mb-6">
              Digite a chave de segurança para gerenciar todos os artigos, excluir publicações, editar textos ou adicionar links de notícias.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha de administrador..."
                  className="w-full px-3.5 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-sm font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
              >
                Entrar no Painel
              </button>

              <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-2">
                Senha padrão: <strong className="font-mono text-stone-600 dark:text-stone-300">admin2026</strong>
              </p>
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
                  activeTab === 'articles'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Gerenciar Todos os Artigos ({articlesList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('feeds')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'feeds'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <Rss className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Feeds RSS / Agências de Notícias ({rssFeeds.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'categories'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Áreas e Categorias ({allAvailableCategories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeTab === 'backup'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Backup e Segurança</span>
              </button>
            </div>

            {/* Content Area */}
            <div id="admin-scrollable-content" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* ========================================================= */}
              {/* TAB 1: ALL ARTICLES (ADD, EDIT, DELETE ANY) */}
              {/* ========================================================= */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  {artSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{artSuccessMsg}</span>
                    </div>
                  )}

                  {/* Form: Add or Edit Article */}
                  <form
                    onSubmit={handleSaveArticle}
                    className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        {isEditingId ? (
                          <>
                            <Edit className="w-3.5 h-3.5 text-amber-600" />
                            Editar Artigo Selecionado (ID: {isEditingId})
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-blue-600" />
                            Cadastrar Novo Artigo ou Notícia de Agência
                          </>
                        )}
                      </h4>

                      {isEditingId && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline cursor-pointer"
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Título em Português *
                        </label>
                        <input
                          type="text"
                          required
                          value={articleForm.titlePt}
                          onChange={(e) => setArticleForm({ ...articleForm, titlePt: e.target.value })}
                          placeholder="Ex: Novo telescópio espacial mapeia atmosfera de exoplanetas"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded focus:outline-none focus:border-stone-900 dark:focus:border-stone-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Área / Categoria *
                        </label>
                        <select
                          value={articleForm.sourceCategory}
                          onChange={(e) => setArticleForm({ ...articleForm, sourceCategory: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded focus:outline-none"
                        >
                          {allAvailableCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Periódico / Fonte / Agência de Notícias
                        </label>
                        <input
                          type="text"
                          value={articleForm.source}
                          onChange={(e) => setArticleForm({ ...articleForm, source: e.target.value })}
                          placeholder="Ex: Nature, Reuters, Agência FAPESP, MIT..."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Autor(es) / Jornalista / Pesquisador
                        </label>
                        <input
                          type="text"
                          value={articleForm.author}
                          onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                          placeholder="Ex: Dra. Alice Smith ou Redação"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Link Original da Notícia / DOI / PDF
                        </label>
                        <input
                          type="url"
                          value={articleForm.link}
                          onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })}
                          placeholder="https://exemplo.com/noticia"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Resumo / Síntese em Português *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={articleForm.summaryPt}
                          onChange={(e) => setArticleForm({ ...articleForm, summaryPt: e.target.value })}
                          placeholder="Síntese da notícia, descobertas e impacto científico..."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded resize-y"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Ponto Chave / Conclusão Prática
                        </label>
                        <input
                          type="text"
                          value={articleForm.keyTakeaway}
                          onChange={(e) => setArticleForm({ ...articleForm, keyTakeaway: e.target.value })}
                          placeholder="Ex: Primeira evidência direta de água na estratosfera."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Tags (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          value={articleForm.tags}
                          onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                          placeholder="Astronomia, NASA, Exoplanetas"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={articleForm.isPeerReviewed}
                          onChange={(e) => setArticleForm({ ...articleForm, isPeerReviewed: e.target.checked })}
                          className="rounded border-stone-300 dark:border-stone-700"
                        />
                        <span>Publicação com Revisão por Pares (Peer-Reviewed)</span>
                      </label>

                      <div className="flex items-center gap-2">
                        {isEditingId && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3.5 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition-colors cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {isEditingId ? 'Salvar Alterações no Artigo' : 'Publicar Artigo no Portal'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* List of ALL Articles with Search, Filter, Edit and Delete */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                          Catálogo Geral de Artigos Ativos ({displayedArticles.length} de {articlesList.length})
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Você pode editar o texto, corrigir informações ou excluir qualquer artigo que desejar.
                        </p>
                      </div>

                      <button
                        onClick={handleResetFactory}
                        className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-xs hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        title="Restaura os artigos originais caso tenha excluído algo por engano"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restaurar Padrão de Fábrica
                      </button>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                        <input
                          type="text"
                          value={articleSearchQuery}
                          onChange={(e) => setArticleSearchQuery(e.target.value)}
                          placeholder="Filtrar por título, fonte ou autor..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                        />
                      </div>

                      <select
                        value={articleCategoryFilter}
                        onChange={(e) => setArticleCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shrink-0"
                      >
                        <option value="all">Todas as Áreas ({articlesList.length})</option>
                        {allAvailableCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Articles List / Table */}
                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800 max-h-[450px] overflow-y-auto">
                      {displayedArticles.length === 0 ? (
                        <div className="p-8 text-center text-xs text-stone-500">
                          Nenhum artigo encontrado com esse filtro.
                        </div>
                      ) : (
                        displayedArticles.map((art) => (
                          <div
                            key={art.id}
                            className={`p-3 sm:p-3.5 flex items-start justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors ${
                              isEditingId === art.id ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                  {art.sourceCategory}
                                </span>
                                <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300">
                                  {art.source}
                                </span>
                                <span className="text-[11px] text-stone-400">• {art.pubDate}</span>
                              </div>

                              <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                                {art.titlePt || art.title}
                              </h5>

                              <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 mt-0.5">
                                {art.summaryPt || art.summary}
                              </p>
                            </div>

                            {/* Action Buttons: Edit, View Link, Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleStartEdit(art)}
                                className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Editar artigo"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {art.link && (
                                <a
                                  href={art.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                  title="Abrir link original"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              <button
                                onClick={() => handleDeleteArticle(art.id, art.titlePt || art.title)}
                                className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Excluir artigo do portal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: RSS FEEDS & NEWS AGENCIES */}
              {/* ========================================================= */}
              {activeTab === 'feeds' && (
                <div className="space-y-6">
                  {feedSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{feedSuccessMsg}</span>
                    </div>
                  )}

                  <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Rss className="w-4 h-4" />
                      Como funcionam os links das Agências de Notícias (Feeds RSS):
                    </p>
                    <p className="text-amber-800 dark:text-amber-300">
                      As agências distribuem links no formato <strong>RSS/XML</strong> (ex: Nature, Reuters, Agência Brasil, NASA, BBC Ciência).
                      O sistema consulta essas fontes para agregar notícias atualizadas. Você pode cadastrar novas agências abaixo ou desativar as existentes!
                    </p>
                  </div>

                  {/* Add Feed Form */}
                  <form onSubmit={handleAddRssFeed} className="p-4 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Adicionar Nova Fonte RSS / Agência Científica
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Nome da Agência / Revista *
                        </label>
                        <input
                          type="text"
                          required
                          value={feedName}
                          onChange={(e) => setFeedName(e.target.value)}
                          placeholder="Ex: Agência FAPESP ou BBC Ciência"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          URL do Feed RSS (XML) *
                        </label>
                        <input
                          type="url"
                          required
                          value={feedUrl}
                          onChange={(e) => setFeedUrl(e.target.value)}
                          placeholder="https://exemplo.com/feed.xml"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Área / Categoria de Destino
                        </label>
                        <select
                          value={feedCategory}
                          onChange={(e) => setFeedCategory(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        >
                          {allAvailableCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Salvar Nova Fonte de Notícias
                      </button>
                    </div>
                  </form>

                  {/* List of active feeds */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Fontes de Agências Ativas ({rssFeeds.length})
                    </h4>

                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950 divide-y divide-stone-200 dark:divide-stone-800">
                      {rssFeeds.map((feed) => (
                        <div key={feed.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 dark:text-stone-100">
                                {feed.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                {feed.category}
                              </span>
                            </div>
                            <span className="block text-[11px] text-stone-400 font-mono truncate">
                              {feed.url}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleFeed(feed.id)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                                feed.enabled
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                              }`}
                            >
                              {feed.enabled ? 'Ativo' : 'Pausado'}
                            </button>

                            <button
                              onClick={() => handleDeleteFeed(feed.id)}
                              className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Remover fonte"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: CATEGORIES / TABS */}
              {/* ========================================================= */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {catSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{catSuccessMsg}</span>
                    </div>
                  )}

                  {/* Add New Category Form */}
                  <form onSubmit={handleAddCategory} className="p-4 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Criar Nova Área de Conhecimento / Aba no Menu
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Nome da Área (ex: Filosofia, Sociologia, Direito) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          placeholder="Ex: Filosofia da Ciência"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Identificador do Sistema (Opcional)
                        </label>
                        <input
                          type="text"
                          value={newCatId}
                          onChange={(e) => setNewCatId(e.target.value)}
                          placeholder="Ex: filosofia-ciencia"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Adicionar Nova Área ao Menu
                      </button>
                    </div>
                  </form>

                  {/* List of all active areas */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Todas as Áreas Ativas no Portal
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allAvailableCategories.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              {c.label}
                            </span>
                            <span className="block text-[10px] text-stone-400 font-mono">
                              ID: {c.id}
                            </span>
                          </div>

                          {c.isCustom ? (
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Remover área"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                              Padrão
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: BACKUP & SECURITY */}
              {/* ========================================================= */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  {/* Backup JSON */}
                  <div className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      Backup Completo de Artigos e Configurações
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Baixe um arquivo de backup com absolutamente todos os artigos ({articlesList.length}), áreas customizadas e feeds cadastrados. Você pode restaurar em outro dispositivo a qualquer momento.
                    </p>

                    <div className="flex items-center gap-3 pt-2 flex-wrap">
                      <button
                        onClick={handleExportBackup}
                        className="px-3.5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-800 dark:hover:bg-white"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Exportar Backup Completo (JSON)
                      </button>

                      <label className="px-3.5 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-100">
                        <Upload className="w-3.5 h-3.5" />
                        Restaurar Arquivo de Backup
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Change Admin Password */}
                  <form onSubmit={handleChangePassword} className="p-4 sm:p-5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      Alterar Senha do Administrador
                    </h4>

                    {passSuccessMsg && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {passSuccessMsg}
                      </p>
                    )}

                    <div className="max-w-xs space-y-2">
                      <input
                        type="password"
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        placeholder="Digite a nova senha..."
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded text-xs font-semibold cursor-pointer"
                      >
                        Salvar Nova Senha
                      </button>
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
