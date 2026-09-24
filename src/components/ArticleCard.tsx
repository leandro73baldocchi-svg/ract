import React, { useState, useEffect } from 'react';
import { NewsArticle } from '../types';
import { Bookmark, ExternalLink, ArrowRight, RefreshCw, Share2, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState<boolean>(false);

  // Lógica de Tradução
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

  // Lógica de Compartilhar Link
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?art=${article.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  let displayTitle = article.title;
  let displaySummary = article.summary;

  if (autoTranslate) {
    if (article.titlePt) { displayTitle = article.titlePt; } else if (translatedTitle) { displayTitle = translatedTitle; }
    if (article.summaryPt) { displaySummary = article.summaryPt; } else if (translatedSummary) { displaySummary = translatedSummary; }
  }

  return (
    <article className="border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-stone-400 dark:hover:border-stone-600 hover:shadow-md transition-all duration-150 group">
      <div>
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono-subtle text-stone-500 dark:text-stone-400 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider truncate">{article.source}</span>
            {article.sourceCategory && (
              <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded border border-stone-200 dark:border-stone-700 shrink-0 capitalize">
                {article.sourceCategory === 'education' ? 'Educação' : article.sourceCategory === 'health' ? 'Saúde' : article.sourceCategory === 'biotech' ? 'Biotecnologia' : article.sourceCategory === 'physics' ? 'Física' : article.sourceCategory === 'math' ? 'Matemática' : article.sourceCategory === 'astronomy' ? 'Astronomia' : article.sourceCategory === 'geology' ? 'Geologia' : article.sourceCategory === 'tech' ? 'Tecnologia' : article.sourceCategory === 'ai' ? 'IA' : article.sourceCategory === 'universities' ? 'Universidades' : 'Ciência'}
              </span>
            )}
            {article.isPeerReviewed && (<span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800 shrink-0 font-medium">Revisado</span>)}
          </div>
          <span className="shrink-0 text-stone-400 dark:text-stone-500">{article.pubDate}</span>
        </div>

        <h3 onClick={() => onOpenArticle(article)} className="font-editorial text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug cursor-pointer hover:text-stone-700 dark:hover:text-stone-300 transition-colors mb-2.5 flex items-start gap-2">
          {isTranslating && !article.titlePt ? (<RefreshCw className="w-4 h-4 mt-1 animate-spin text-stone-300 shrink-0" />) : null}
          <span>{displayTitle}</span>
        </h3>

        <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">{displaySummary}</p>

        {article.keyTakeaway && (
          <div className="mb-4 text-xs bg-stone-50 dark:bg-[#202020] border-l-2 border-stone-500 dark:border-stone-400 pl-3 py-1.5 text-stone-800 dark:text-stone-200 italic transition-colors">"{article.keyTakeaway}"</div>
        )}
      </div>

      {/* FOOTER DO CARTÃO TOTALMENTE REFEITO COM COMPARTILHAR E ORIGINAL CLARO */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 mt-2">
        <button onClick={() => onOpenArticle(article)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-md text-xs font-bold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer shadow-sm">
          <span>Ler Resumo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {article.link && (
            <a href={article.link} target="_blank" rel="noopener noreferrer" title="Ler publicação original" className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-xs border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-bold transition-colors shadow-sm">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Original</span>
            </a>
          )}
          
          <button onClick={handleShare} title="Copiar link para WhatsApp/LinkedIn" className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-xs border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer shadow-sm">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Link'}</span>
          </button>

          <button onClick={() => onToggleSaveOffline(article)} title="Salvar para ler depois" className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border shadow-sm ${isSavedOffline ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100' : 'text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
            <Bookmark className={`w-3.5 h-3.5 ${isSavedOffline ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};
