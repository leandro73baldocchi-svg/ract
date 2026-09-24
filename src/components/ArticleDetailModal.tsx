import React, { useState, useEffect } from 'react';
import { NewsArticle } from '../types';
import { X, Bookmark, ExternalLink, Share2, Check, RefreshCw } from 'lucide-react';

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
  autoTranslateDefault
}) => {
  const [copied, setCopied] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!isOpen || !article) { setTranslatedTitle(''); setTranslatedSummary(''); return; }
    if (!autoTranslateDefault) return;
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
  }, [article, isOpen, autoTranslateDefault]);

  if (!isOpen || !article) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/?art=${article.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const originalLink = article.link || article.url;

  let displayTitle = article.title;
  let displaySummary = article.summary;

  if (autoTranslateDefault) {
    if (article.titlePt) { displayTitle = article.titlePt; } else if (translatedTitle) { displayTitle = translatedTitle; }
    if (article.summaryPt) { displaySummary = article.summaryPt; } else if (translatedSummary) { displaySummary = translatedSummary; }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FBFBFA] dark:bg-[#151515] w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER DO MODAL */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111111] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded shrink-0">
              {article.sourceCategory}
            </span>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 shrink-0">
              {article.source}
            </span>
            <span className="text-xs text-stone-400 shrink-0">• {article.pubDate || article.date}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors shrink-0 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO ARTIGO */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="max-w-2xl mx-auto">
            
            {/* BARRA DE BOTÕES DISCRETA */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button onClick={() => onToggleSaveOffline(article)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border cursor-pointer ${isSavedOffline ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100' : 'text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                <Bookmark className={`w-3.5 h-3.5 ${isSavedOffline ? 'fill-current' : ''}`} />
                <span>Salvar</span>
              </button>

              <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Compartilhar'}</span>
              </button>

              {originalLink && (
                <a href={originalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Artigo Original</span>
                </a>
              )}
            </div>

            {/* Título e Metadados */}
            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-50 leading-tight mb-6 flex items-start gap-3">
              {isTranslating && !article.titlePt ? (<RefreshCw className="w-5 h-5 mt-2 animate-spin text-stone-300 shrink-0" />) : null}
              <span>{displayTitle}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600 dark:text-stone-400 mb-8 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider text-[11px] font-bold text-stone-400 dark:text-stone-500">Fonte:</span>
                {article.source}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider text-[11px] font-bold text-stone-400 dark:text-stone-500">Autor:</span>
                {article.authors?.join(', ') || article.author || 'Equipe Editorial'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider text-[11px] font-bold text-stone-400 dark:text-stone-500">Data:</span>
                {article.pubDate || article.date}
              </div>
            </div>

            {article.keyTakeaway && (
              <div className="mb-8 p-5 bg-stone-100 dark:bg-[#1E1E1E] rounded-xl border-l-4 border-stone-800 dark:border-stone-400 text-stone-900 dark:text-stone-100 font-medium italic text-sm sm:text-base">
                "{article.keyTakeaway}"
              </div>
            )}

            {/* PROPORÇÃO PERFEITA DE PARÁGRAFOS RESTAURADA */}
            <div className="prose prose-stone dark:prose-invert max-w-none font-serif text-base sm:text-lg leading-relaxed text-stone-800 dark:text-stone-300">
              {displaySummary.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
