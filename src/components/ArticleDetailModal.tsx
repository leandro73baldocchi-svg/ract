import React, { useState, useEffect } from 'react';
import { NewsArticle, ArticleDeepDive } from '../types';
import { X, ExternalLink, Bookmark, Check } from 'lucide-react';

interface ArticleDetailModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
  isSavedOffline: boolean;
  onToggleSaveOffline: (article: NewsArticle) => void;
  autoTranslateDefault: boolean;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  isOpen,
  onClose,
  isSavedOffline,
  onToggleSaveOffline,
  autoTranslateDefault,
}) => {
  const [deepDive, setDeepDive] = useState<ArticleDeepDive | null>(null);
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);
  const [usePortuguese, setUsePortuguese] = useState<boolean>(autoTranslateDefault);

  useEffect(() => {
    setUsePortuguese(autoTranslateDefault);
  }, [autoTranslateDefault, article]);

  // Load deep dive analysis when article opens
  useEffect(() => {
    if (!isOpen || !article) {
      setDeepDive(null);
      return;
    }

    // If article already has cached deep-dive analysis from offline storage
    if (article.cachedDeepDive) {
      setDeepDive(article.cachedDeepDive);
      return;
    }

    let isMounted = true;
    const fetchDeepDive = async () => {
      setLoadingDeepDive(true);
      try {
        const res = await fetch('/api/deep-dive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            summary: article.summary,
            source: article.source,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setDeepDive(data.analysis);
          }
        }
      } catch (err) {
        console.warn('Could not fetch deep-dive analysis (offline or server error):', err);
      } finally {
        if (isMounted) setLoadingDeepDive(false);
      }
    };

    fetchDeepDive();

    return () => {
      isMounted = false;
    };
  }, [isOpen, article]);

  if (!isOpen || !article) return null;

  const title = usePortuguese ? (article.titlePt || article.title) : article.title;
  const summary = usePortuguese ? (article.summaryPt || article.summary) : article.summary;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#181818] border border-stone-300 dark:border-stone-800 rounded-xl max-w-2xl w-full my-auto shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between bg-[#FAFAFA] dark:bg-[#141414] transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono-subtle text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              {article.source}
            </span>
            <span>•</span>
            <span>{article.pubDate}</span>
            {article.isPeerReviewed && (
              <>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400">Revisado por Pares</span>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Translation and Offline Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
            {/* Translation switch */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded text-xs font-medium">
              <button
                onClick={() => setUsePortuguese(true)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  usePortuguese
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                Português (Traduzido)
              </button>
              <button
                onClick={() => setUsePortuguese(false)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  !usePortuguese
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                English (Original)
              </button>
            </div>

            {/* Offline save status toggle */}
            <button
              onClick={() => onToggleSaveOffline({ ...article, cachedDeepDive: deepDive || undefined })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                isSavedOffline
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              {isSavedOffline ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Salvo para Leitura Offline</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Salvar para Ler Offline</span>
                </>
              )}
            </button>
          </div>

          {/* Title and Overview */}
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 leading-snug mb-3">
              {title}
            </h2>
            <div className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
              {summary}
            </div>
          </div>

          {/* Deep-Dive Scientific Analysis */}
          {loadingDeepDive ? (
            <div className="bg-stone-50 dark:bg-[#202020] border border-stone-200 dark:border-stone-800 rounded-lg p-5 animate-pulse space-y-3">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/3"></div>
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-full"></div>
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-5/6"></div>
            </div>
          ) : deepDive ? (
            <div className="bg-[#FAF9F7] dark:bg-[#1F1F1F] border border-stone-200 dark:border-stone-800 rounded-lg p-5 sm:p-6 space-y-4 text-xs sm:text-sm transition-colors">
              <h3 className="font-mono-subtle text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-800 pb-2">
                Análise & Significado Científico
              </h3>

              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-1">Por que esta descoberta é relevante:</span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{deepDive.whyItMatters}</p>
              </div>

              {deepDive.potentialImpact && (
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-1">Impacto no mundo real:</span>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{deepDive.potentialImpact}</p>
                </div>
              )}

              {deepDive.simplifiedExplanation && (
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-1">Explicação simplificada:</span>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{deepDive.simplifiedExplanation}</p>
                </div>
              )}

              {deepDive.keyTerms && deepDive.keyTerms.length > 0 && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block mb-2">Termos e Conceitos:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {deepDive.keyTerms.map((term, i) => (
                      <div key={i} className="p-2.5 bg-white dark:bg-[#282828] border border-stone-200 dark:border-stone-700 rounded">
                        <span className="font-medium text-stone-900 dark:text-stone-100 block text-xs">{term.term}</span>
                        <span className="text-stone-600 dark:text-stone-300 text-[11px] leading-tight block mt-0.5">
                          {term.definition}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* External Link Section */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-stone-500 dark:text-stone-400">
              Artigo catalogado da base oficial de {article.source}.
            </span>
            {article.link && (
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-medium transition-colors"
              >
                <span>Acessar Publicação Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
