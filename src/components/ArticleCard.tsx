import React, { useState, useEffect } from 'react';
import { NewsArticle } from '../types';
import { Bookmark, ExternalLink, ArrowRight, RefreshCw } from 'lucide-react';

interface ArticleCardProps {
  article: NewsArticle;
  autoTranslate: boolean;
  isSavedOffline: boolean;
  onToggleSaveOffline: (article: NewsArticle) => void;
  onOpenArticle: (article: NewsArticle) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  autoTranslate,
  isSavedOffline,
  onToggleSaveOffline,
  onOpenArticle,
}) => {
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedSummary, setTranslatedSummary] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => {
    if (!autoTranslate) return;
    if (article.titlePt && article.summaryPt) return;

    let isMounted = true;
    const translateText = async () => {
      setIsTranslating(true);
      try {
        const resTitle = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(article.title)}`);
        const dataTitle = await resTitle.json();
        const ptTitle = dataTitle[0].map((t: any) => t[0]).join('');

        const resSummary = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(article.summary)}`);
        const dataSummary = await resSummary.json();
        const ptSummary = dataSummary[0].map((t: any) => t[0]).join('');

        if (isMounted) { setTranslatedTitle(ptTitle); setTranslatedSummary(ptSummary); }
      } catch (error) { console.error('Erro na tradução', error); } finally { if (isMounted) setIsTranslating(false); }
    };
    translateText();
    return () => { isMounted = false; };
  }, [article.title, article.summary, autoTranslate, article.titlePt, article.summaryPt]);

  // Corrige o link para funcionar com manuais e RSS
  const originalLink = article.link || article.url;

  let displayTitle = article.title;
  let displaySummary = article.summary;

  if (autoTranslate) {
    if (article.titlePt) { displayTitle = article.titlePt; } else if (translatedTitle) { displayTitle = translatedTitle; }
    if (article.summaryPt) { displaySummary = article.summaryPt; } else if (translatedSummary) { displaySummary = translatedSummary; }
  }

  return (
    <article className="border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-md p-5 sm:p-6 flex flex-col justify-between hover:border-stone-400 dark:hover:border-stone-600 hover:shadow-xs transition-all duration-150 group">
      <div>
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono-subtle text-stone-500 dark:text-stone-400 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider truncate">
              {article.source}
            </span>
            {article.sourceCategory && (
              <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded border border-stone-200 dark:border-stone-700 shrink-0 capitalize">
                {article.sourceCategory}
              </span>
            )}
            {article.isPeerReviewed && (
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 shrink-0 font-medium">
                Revisado por Pares
              </span>
            )}
          </div>
          <span className="shrink-0 text-stone-400 dark:text-stone-500">{article.pubDate}</span>
        </div>

        <h3
          onClick={() => onOpenArticle(article)}
          className="font-editorial text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug cursor-pointer hover:text-stone-700 dark:hover:text-stone-300 transition-colors mb-2.5 flex items-start gap-2"
        >
          {isTranslating && !article.titlePt ? (
            <RefreshCw className="w-4 h-4 mt-1 animate-spin text-stone-300 shrink-0" />
          ) : null}
          <span>{displayTitle}</span>
        </h3>

        <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
          {displaySummary}
        </p>

        {article.keyTakeaway && (
          <div className="mb-4 text-xs bg-stone-50 dark:bg-[#202020] border-l-2 border-stone-500 dark:border-stone-400 pl-3 py-1.5 text-stone-800 dark:text-stone-200 italic transition-colors">
            "{article.keyTakeaway}"
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 mt-2 text-xs">
        <button
          onClick={() => onOpenArticle(article)}
          className="inline-flex items-center gap-1 font-semibold text-stone-900 dark:text-stone-200 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <span>Ler Artigo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSaveOffline(article)}
            title={isSavedOffline ? 'Salvo no dispositivo para ler offline' : 'Salvar no dispositivo para ler sem internet'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
              isSavedOffline
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                : 'text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-950 dark:hover:text-white font-medium'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${isSavedOffline ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isSavedOffline ? 'Salvo Offline' : 'Salvar Offline'}</span>
          </button>

          {originalLink && (
            <a
              href={originalLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir página oficial do periódico"
              className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
