import React, { useState, useMemo } from 'react';
import { CustomRssFeed } from '../utils/customDataManager';
import {
  X,
  Rss,
  ExternalLink,
  Search,
  CheckCircle,
  Layers,
  Radio,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';

interface PublicRssFeedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: CustomRssFeed[];
  activeCategory: string;
  onSelectCategoryFeed?: (category: string) => void;
  onRefreshFeeds?: () => void;
  isRefreshing?: boolean;
}

export const PublicRssFeedsModal: React.FC<PublicRssFeedsModalProps> = ({
  isOpen,
  onClose,
  feeds,
  activeCategory,
  onSelectCategoryFeed,
  onRefreshFeeds,
  isRefreshing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedFeedUrl, setCopiedFeedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUrl = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedFeedUrl(url);
      setTimeout(() => setCopiedFeedUrl(null), 2500);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    feeds.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set).sort();
  }, [feeds]);

  const filteredFeeds = useMemo(() => {
    return feeds.filter((f) => {
      const matchSearch =
        !searchQuery.trim() ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat =
        selectedCategory === 'all' || f.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [feeds, searchQuery, selectedCategory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#181818] border border-stone-300 dark:border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F7] dark:bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                Canais e Fontes RSS Científicas (RACT)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Rede de transmissão contínua de periódicos acadêmicos, agências e centros de pesquisa.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="px-4 sm:px-5 py-3 bg-stone-100/70 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-pulse" />
            <span>
              <strong>{feeds.length} fontes RSS ativas</strong> alimentam os artigos do RACT de forma ininterrupta.
            </span>
          </div>

          {onRefreshFeeds && (
            <button
              onClick={onRefreshFeeds}
              disabled={isRefreshing}
              className="px-2.5 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 font-medium text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Feeds</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar agência, periódico ou link RSS..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:border-stone-900 dark:focus:border-stone-300"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-48 px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none"
            >
              <option value="all">Todas as Áreas ({feeds.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()} ({feeds.filter((f) => f.category === cat).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feeds List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredFeeds.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500">
              Nenhuma fonte RSS encontrada com esse filtro de busca.
            </div>
          ) : (
            filteredFeeds.map((feed) => {
              const isCopied = copiedFeedUrl === feed.url;
              return (
                <div
                  key={feed.id}
                  className="p-3.5 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-400 dark:hover:border-stone-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {feed.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50">
                        {feed.category}
                      </span>
                      {feed.enabled !== false ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Pausado</span>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate select-all">
                      {feed.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* Filter Category shortcut in App */}
                    {onSelectCategoryFeed && (
                      <button
                        onClick={() => {
                          onSelectCategoryFeed(feed.category);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                        title={`Filtrar artigos desta área (${feed.category})`}
                      >
                        Ver Artigos
                      </button>
                    )}

                    {/* Copy RSS link */}
                    <button
                      onClick={() => handleCopyUrl(feed.url)}
                      className={`p-1.5 rounded border transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
                        isCopied
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-stone-950 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                      title="Copiar URL do feed RSS"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium text-emerald-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {/* Open direct feed XML in new tab */}
                    <a
                      href={feed.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Abrir feed XML na fonte"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-[#FAF9F7] dark:bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>
              Qualquer leitor de notícias ou agregador pode consumir estas fontes diretamente.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
