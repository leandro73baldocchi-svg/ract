import React, { useState } from 'react';
import { CustomCategory, NewsArticle, CategoryType } from '../types';
import {
  DEFAULT_BASE_CATEGORIES,
  getCustomCategories,
  saveCustomCategories,
  getCustomArticles,
  saveCustomArticles,
  checkAdminPassword,
  setAdminPassword,
} from '../utils/customDataManager';
import {
  X,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Key,
  Database,
  Layers,
  FileText,
  Save,
  Download,
  Upload,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle
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

  // Active subtab in admin: 'categories' | 'articles' | 'backup'
  const [activeTab, setActiveTab] = useState<'categories' | 'articles' | 'backup'>('articles');

  // Custom categories state
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => getCustomCategories());
  const [newCatId, setNewCatId] = useState<string>('');
  const [newCatLabel, setNewCatLabel] = useState<string>('');
  const [catSuccessMsg, setCatSuccessMsg] = useState<string | null>(null);

  // Custom articles state
  const [customArticles, setCustomArticles] = useState<NewsArticle[]>(() => getCustomArticles());
  const [artSuccessMsg, setArtSuccessMsg] = useState<string | null>(null);

  // Form to add article
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
  }>({
    titlePt: '',
    titleEn: '',
    source: '',
    sourceCategory: 'psychology',
    author: '',
    link: '',
    summaryPt: '',
    keyTakeaway: '',
    tags: '',
    readTime: '5 min',
  });

  // Password change state
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
    } else {
      setAuthError('Senha incorreta. (Dica padrão: admin2026)');
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim()) return;

    const id = (newCatId.trim() || newCatLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')).toLowerCase();
    
    // Check duplication
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
    setCatSuccessMsg(`Área "${newCat.label}" adicionada com sucesso ao portal!`);
    setTimeout(() => setCatSuccessMsg(null), 4000);
    onDataUpdated();
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm(`Tem certeza que deseja remover esta área customizada?`)) {
      const updated = customCategories.filter((c) => c.id !== catId);
      setCustomCategories(updated);
      saveCustomCategories(updated);
      onDataUpdated();
    }
  };

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.titlePt.trim() || !articleForm.summaryPt.trim()) {
      alert('Preencha pelo menos o Título em Português e o Resumo!');
      return;
    }

    const newArt: NewsArticle = {
      id: `custom-${Date.now()}`,
      title: articleForm.titleEn.trim() || articleForm.titlePt.trim(),
      titlePt: articleForm.titlePt.trim(),
      source: articleForm.source.trim() || 'Periódico Científico',
      sourceCategory: articleForm.sourceCategory as CategoryType,
      author: articleForm.author.trim() || 'Pesquisador Responsável',
      link: articleForm.link.trim() || 'https://ract.gov.br',
      pubDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
      summary: articleForm.summaryPt.trim(),
      summaryPt: articleForm.summaryPt.trim(),
      keyTakeaway: articleForm.keyTakeaway.trim() || 'Publicação revisada e incorporada à base do portal.',
      readTime: articleForm.readTime.trim() || '5 min',
      isPeerReviewed: true,
      tags: articleForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const updated = [newArt, ...customArticles];
    setCustomArticles(updated);
    saveCustomArticles(updated);

    // Reset form
    setArticleForm({
      titlePt: '',
      titleEn: '',
      source: '',
      sourceCategory: articleForm.sourceCategory,
      author: '',
      link: '',
      summaryPt: '',
      keyTakeaway: '',
      tags: '',
      readTime: '5 min',
    });

    setArtSuccessMsg('Artigo publicado com sucesso no portal!');
    setTimeout(() => setArtSuccessMsg(null), 4000);
    onDataUpdated();
  };

  const handleDeleteArticle = (articleId: string) => {
    if (confirm('Deseja realmente excluir este artigo?')) {
      const updated = customArticles.filter((a) => a.id !== articleId);
      setCustomArticles(updated);
      saveCustomArticles(updated);
      onDataUpdated();
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customCategories,
      customArticles,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ract-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
        if (parsed.customArticles && Array.isArray(parsed.customArticles)) {
          setCustomArticles(parsed.customArticles);
          saveCustomArticles(parsed.customArticles);
        }
        alert('Backup restaurado com sucesso!');
        onDataUpdated();
      } catch (err) {
        alert('Erro ao importar arquivo: formato inválido.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#181818] border border-stone-300 dark:border-stone-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#F9F9F8] dark:bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                Painel Administrativo Interno (Área Restrita)
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                  Privado
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Gerencie áreas acadêmicas, cadastre novos artigos e customize os links sem alterar código.
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
            <h3 className="text-lg font-bold mb-1">Acesso do Administrador</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mb-6">
              Esta área secreta permite criar novas áreas de conhecimento (como Psicologia) e cadastrar artigos diretamente no portal.
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
                Senha inicial padrão: <strong className="font-mono text-stone-600 dark:text-stone-300">admin2026</strong>
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Sub navigation bar */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
              <button
                onClick={() => setActiveTab('articles')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'articles'
                    ? 'border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Gerenciar Artigos ({customArticles.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
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
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
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
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* TAB 1: ARTICLES */}
              {activeTab === 'articles' && (
                <div className="space-y-6">
                  {artSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{artSuccessMsg}</span>
                    </div>
                  )}

                  {/* Add New Article Form */}
                  <form onSubmit={handleAddArticle} className="p-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Publicar Novo Artigo / Estudo Acadêmico
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Título em Português *
                        </label>
                        <input
                          type="text"
                          required
                          value={articleForm.titlePt}
                          onChange={(e) => setArticleForm({ ...articleForm, titlePt: e.target.value })}
                          placeholder="Ex: Terapia Cognitiva e Neuroplasticidade em Adultos"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded focus:outline-none focus:border-stone-900 dark:focus:border-stone-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
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
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Periódico / Fonte / Universidade
                        </label>
                        <input
                          type="text"
                          value={articleForm.source}
                          onChange={(e) => setArticleForm({ ...articleForm, source: e.target.value })}
                          placeholder="Ex: American Psychological Association (APA)"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Autor(es) / Pesquisador(es)
                        </label>
                        <input
                          type="text"
                          value={articleForm.author}
                          onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                          placeholder="Ex: Dr. Marcelo Ramos & Equipe"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Link Original da Pesquisa / DOI / PDF
                        </label>
                        <input
                          type="url"
                          value={articleForm.link}
                          onChange={(e) => setArticleForm({ ...articleForm, link: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Resumo / Síntese Científica *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={articleForm.summaryPt}
                          onChange={(e) => setArticleForm({ ...articleForm, summaryPt: e.target.value })}
                          placeholder="Descreva as descobertas principais, metodologia e relevância do estudo..."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded resize-y"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Conclusão Prática / Ponto Chave
                        </label>
                        <input
                          type="text"
                          value={articleForm.keyTakeaway}
                          onChange={(e) => setArticleForm({ ...articleForm, keyTakeaway: e.target.value })}
                          placeholder="Ex: Intervenções breves aumentam a concentração em 30%."
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Tags (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          value={articleForm.tags}
                          onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                          placeholder="Psicologia, TCC, Neurociência"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Salvar e Publicar no Portal
                      </button>
                    </div>
                  </form>

                  {/* List of custom articles */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                      Artigos Cadastrados por Você ({customArticles.length})
                    </h4>

                    {customArticles.length === 0 ? (
                      <p className="text-xs text-stone-500 italic p-4 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-lg">
                        Nenhum artigo customizado adicionado ainda. Use o formulário acima para adicionar!
                      </p>
                    ) : (
                      <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-950">
                        {customArticles.map((art) => (
                          <div key={art.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                  {art.sourceCategory}
                                </span>
                                <span className="text-[11px] text-stone-500">{art.source}</span>
                                <span className="text-[11px] text-stone-400">• {art.pubDate}</span>
                              </div>
                              <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                                {art.titlePt || art.title}
                              </h5>
                              <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 mt-0.5">
                                {art.summaryPt || art.summary}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={art.link}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                title="Abrir link original"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteArticle(art.id)}
                                className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Excluir artigo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  {catSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{catSuccessMsg}</span>
                    </div>
                  )}

                  {/* Add New Category Form */}
                  <form onSubmit={handleAddCategory} className="p-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      Criar Nova Área de Conhecimento / Aba
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Nome da Área (ex: Filosofia, Sociologia, Direito) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          placeholder="Ex: Psicologia Clínica"
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                          Identificador do Sistema (Opcional)
                        </label>
                        <input
                          type="text"
                          value={newCatId}
                          onChange={(e) => setNewCatId(e.target.value)}
                          placeholder="Ex: psicologia-clinica"
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
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
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
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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

              {/* TAB 3: BACKUP & SECURITY */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  {/* Backup JSON */}
                  <div className="p-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      Backup e Restauração de Dados
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Baixe um arquivo de backup com todas as áreas e artigos que você cadastrou para guardar no seu computador ou transferir para outro navegador.
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleExportBackup}
                        className="px-3.5 py-2 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Exportar Backup (JSON)
                      </button>

                      <label className="px-3.5 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-stone-100">
                        <Upload className="w-3.5 h-3.5" />
                        Restaurar Backup
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
                  <form onSubmit={handleChangePassword} className="p-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
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
