import React, { useState, useEffect } from 'react';
import { NewsArticle } from '../types';
import { X, Bookmark, ExternalLink, Share2, Check, Printer, RefreshCw } from 'lucide-react';

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
        const resTitle = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ q: article.title })
        });
        const dataTitle = await resTitle.json();
        const ptTitle = dataTitle[0].map((t: any) => t[0]).join('');

        const resSummary = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ q: article.summary })
        });
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

  const handlePrint = () => { window.print(); };
  const originalLink = article.link || article.url;

  let displayTitle = article.title;
  let displaySummary = article.summary;

  if (autoTranslateDefault) {
    if (article.titlePt) { displayTitle = article.titlePt; } else if (translatedTitle) { displayTitle = translatedTitle; }
    if (article.summaryPt) { displaySummary = article.summaryPt; } else if (translatedSummary) { displaySummary = translatedSummary; }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:block print:relative print:z-auto">
      <div className="bg-[#FBFBFA] dark:bg-[#151515] w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden print:shadow-none print:max-h-none print:h-auto print:rounded-none">
        
        {/* CABEÇALHO DO MODAL - LIMPO E COM IMPRESSORA */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111111] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar text-xs">
            <span className="uppercase font-bold tracking-wider text-stone-900 dark:text-stone-100">{article.sourceCategory}</span>
            <span className="text-stone-400">•</span>
            <span className="font-medium text-stone-600 dark:text-stone-400">{article.source}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} title="Imprimir Artigo" className="p-1.5 rounded text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer">
              <Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} title="Fechar" className="p-1.5 rounded-full text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ÁREA DE LEITURA - PROPORÇÃO DE PARÁGRAFOS RESTAURADA */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 print:overflow-visible print:p-0">
          <div className="max-w-2xl mx-auto">
            
            <div className="hidden print:block mb-6 pb-4 border-b border-black">
               <h2 className="text-2xl font-black font-serif uppercase">Radar Autônomo de Ciências e Tecnologia (RACT)</h2>
               <p className="text-sm font-mono mt-1 text-gray-700">Relatório Acadêmico</p>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-50 leading-tight mb-5 flex items-start gap-3 print:text-black">
              {isTranslating && !article.titlePt ? (<RefreshCw className="w-5 h-5 mt-2 animate-spin text-stone-300 shrink-0 print:hidden" />) : null}
              <span>{displayTitle}</span>
            </h1>

            <div className="flex items-center gap-4 text-xs font-mono-subtle text-stone-500 dark:text-stone-400 mb-8 print:text-black">
              <span>{article.pubDate || article.date}</span>
              <span>•</span>
              <span>{article.authors?.join(', ') || article.author || 'Equipe Editorial'}</span>
            </div>

            {article.keyTakeaway && (
              <div className="mb-8 p-4 bg-stone-100 dark:bg-[#1E1E1E] rounded-lg border-l-4 border-stone-400 text-stone-800 dark:text-stone-200 font-medium italic text-sm print:bg-gray-100 print:border-black print:text-black">
                "{article.keyTakeaway}"
              </div>
            )}

            <div className="prose prose-stone dark:prose-invert max-w-none font-serif text-[15px] sm:text-base leading-relaxed text-stone-800 dark:text-stone-300 print:text-black">
              {displaySummary.split('\n').map((paragraph, idx) => {
                if (!paragraph.trim()) return null;
                return <p key={idx} className="mb-4">{paragraph}</p>;
              })}
            </div>
          </div>
        </div>

        {/* RODAPÉ DO MODAL - BOTÕES DE AÇÃO DISCRETOS */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#111111] flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
           <div className="flex items-center gap-2">
             <button onClick={() => onToggleSaveOffline(article)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors border cursor-pointer ${isSavedOffline ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100' : 'bg-white dark:bg-[#1A1A1A] text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
               <Bookmark className={`w-3.5 h-3.5 ${isSavedOffline ? 'fill-current' : ''}`} />
               <span>Salvar</span>
             </button>
             
             <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1A1A1A] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold transition-colors cursor-pointer">
               {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
               <span>{copied ? 'Copiado!' : 'Compartilhar (Link)'}</span>
             </button>
           </div>

           {originalLink && (
             <a href={originalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1A1A1A] text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold transition-colors cursor-pointer shadow-sm">
               <span>Artigo Original</span>
               <ExternalLink className="w-3.5 h-3.5" />
             </a>
           )}
        </div>

      </div>
    </div>
  );
};
