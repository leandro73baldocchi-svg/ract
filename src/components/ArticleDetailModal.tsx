import React, { useState, useEffect } from 'react';
import { NewsArticle, FullArticleContent, ArticleDeepDive } from '../types';
import { generateAcademicFullArticle } from '../utils/academicGenerator';
import { X, ExternalLink, Bookmark, Check, Printer, Copy, FileText, Globe, Quote, Share2, RefreshCw } from 'lucide-react';

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
  const [usePortuguese, setUsePortuguese] = useState<boolean>(autoTranslateDefault);
  const [fullContent, setFullContent] = useState<FullArticleContent | null>(null);
  const [deepDive, setDeepDive] = useState<ArticleDeepDive | null>(null);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedSummary, setTranslatedSummary] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  useEffect(() => { setUsePortuguese(autoTranslateDefault); }, [autoTranslateDefault, article]);

  // Busca do Conteúdo Extra
  useEffect(() => {
    if (!isOpen || !article) { setFullContent(null); setDeepDive(null); return; }
    if (article.fullArticle) { setFullContent(article.fullArticle); return; }
    let isMounted = true;
    const fetchFullArticle = async () => {
      setLoadingContent(true);
      try {
        const res = await fetch('/api/article-full', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(article) });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.fullArticle && isMounted) { setFullContent(data.fullArticle); if (data.deepDive) setDeepDive(data.deepDive); return; }
        }
        if (isMounted) { const fallbackData = generateAcademicFullArticle(article); setFullContent(fallbackData.fullArticle); setDeepDive(fallbackData.deepDive); }
      } catch (err) {
        if (isMounted) { const fallbackData = generateAcademicFullArticle(article); setFullContent(fallbackData.fullArticle); setDeepDive(fallbackData.deepDive); }
      } finally { if (isMounted) setLoadingContent(false); }
    };
    fetchFullArticle();
    return () => { isMounted = false; };
  }, [isOpen, article]);

  // A TRADUÇÃO BLINDADA DO MODAL
  useEffect(() => {
    if (!isOpen || !article) { setTranslatedTitle(''); setTranslatedSummary(''); return; }
    if (!autoTranslateDefault) return;
    if (article.titlePt && article.summaryPt) return;

    let isMounted = true;

    const fetchTranslation = async (text: string) => {
      if (!text) return '';
      const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
      try {
        const res = await fetch(googleUrl);
        if (!res.ok) throw new Error('Bloqueado');
        const data = await res.json();
        return data[0].map((t: any) => t[0]).join('');
      } catch (err) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleUrl)}`;
          const resProxy = await fetch(proxyUrl);
          const dataProxy = await resProxy.json();
          return dataProxy[0].map((t: any) => t[0]).join('');
        } catch (proxyErr) { return text; }
      }
    };

    const translateText = async () => {
      setIsTranslating(true);
      try {
        const ptTitle = await fetchTranslation(article.title);
        
        // Fatiamos os parágrafos para proteger o Google de travar
        const paragraphs = article.summary.split('\n');
        let ptSummaryArray = [];
        for (const p of paragraphs) {
          if (!p.trim()) { ptSummaryArray.push(''); continue; }
          const safeP = p.length > 1000 ? p.substring(0, 1000) + '...' : p;
          const ptP = await fetchTranslation(safeP);
          ptSummaryArray.push(ptP);
        }
        const ptSummary = ptSummaryArray.join('\n');

        if (isMounted) { setTranslatedTitle(ptTitle); setTranslatedSummary(ptSummary); }
      } catch (error) { console.error('Erro', error); } finally { if (isMounted) setIsTranslating(false); }
    };
    translateText();
    return () => { isMounted = false; };
  }, [article, isOpen, autoTranslateDefault]);

  if (!isOpen || !article) return null;

  const title = usePortuguese ? (article.titlePt || translatedTitle || article.title) : article.title;
  const abstract = fullContent ? (usePortuguese ? (fullContent.abstractPt || translatedSummary || fullContent.abstract) : fullContent.abstract) : (usePortuguese ? (article.summaryPt || translatedSummary || article.summary) : article.summary);
  const introduction = fullContent ? (usePortuguese ? fullContent.introductionPt : fullContent.introduction) : null;
  const methodology = fullContent ? (usePortuguese ? fullContent.methodologyPt : fullContent.methodology) : null;
  const results = fullContent ? (usePortuguese ? fullContent.resultsPt : fullContent.results) : null;
  const discussion = fullContent ? (usePortuguese ? fullContent.discussionPt : fullContent.discussion) : null;
  const conclusion = fullContent ? (usePortuguese ? fullContent.conclusionPt : fullContent.conclusion) : null;

  const originalUrl = article.link || article.url;
  const citationAbnt = fullContent?.citationAbnt || `${(article.author || article.source).toUpperCase()}. ${article.titlePt || article.title}. ${article.source}, ${article.pubDate}. Disponível em: <${originalUrl}>. Acesso em: ${new Date().toLocaleDateString('pt-BR')}.`;

  const handlePrint = () => { window.print(); };
  const handleCopyCitation = () => { if (navigator.clipboard) { navigator.clipboard.writeText(citationAbnt); setCopiedCitation(true); setTimeout(() => setCopiedCitation(false), 2500); } };
  const handleShareLink = () => { if (navigator.clipboard) { const url = `${window.location.origin}/?art=${article.id}`; navigator.clipboard.writeText(url); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2500); } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto print:static print:block print:p-0 print:bg-white" onClick={onClose}>
      <div className="printable-article bg-white dark:bg-[#161616] border border-stone-300 dark:border-stone-800 rounded-lg max-w-4xl w-full my-auto shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors print:m-0 print:overflow-visible print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:dark:bg-white print:block" onClick={(e) => e.stopPropagation()}>
        <div className="no-print border-b border-stone-200 dark:border-stone-800 px-5 sm:px-8 py-3.5 flex items-center justify-between bg-[#FBFBFA] dark:bg-[#121212] transition-colors print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono-subtle text-stone-500 dark:text-stone-400 truncate">
            <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">{article.source}</span>
            <span>•</span><span>{article.pubDate}</span>
          </div>

          <div className="flex items-center gap-2">
            {originalUrl && (
              <a href={originalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Artigo Original</span>
                <span className="sm:hidden">Original</span>
              </a>
            )}
            <button onClick={handleShareLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#202020] text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer">
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copiado' : 'Compartilhar'}</span>
            </button>
            <button onClick={handlePrint} id="btn-print-article" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#202020] text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer">
              <Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span className="hidden sm:inline">Imprimir Artigo</span>
              <span className="sm:hidden">Imprimir</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-10 max-h-[85vh] overflow-y-auto space-y-8 print:max-h-none print:overflow-visible print:p-0 print:text-black">
          <div className="no-print flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800 print:hidden">
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-1 rounded text-xs font-medium">
              <button onClick={() => setUsePortuguese(true)} className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${usePortuguese ? 'bg-white dark:bg-[#202020] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}`}>
                <Globe className="w-3 h-3" /><span>Português (Traduzido)</span>
              </button>
              <button onClick={() => setUsePortuguese(false)} className={`px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${!usePortuguese ? 'bg-white dark:bg-[#202020] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}`}>
                <span>Original (EN)</span>
              </button>
            </div>
          </div>

          <header className="space-y-4 print:pt-4">
            <div className="flex items-center gap-2 text-xs font-mono-subtle text-stone-500 dark:text-stone-400 uppercase tracking-wider print:text-black">
              <span>{article.source}</span><span>•</span><span>{article.pubDate}</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-extrabold text-stone-950 dark:text-stone-50 leading-tight print:text-black flex items-start gap-3">
              {isTranslating && !article.titlePt ? (<RefreshCw className="w-6 h-6 mt-2 animate-spin text-stone-300 shrink-0 print:hidden" />) : null}
              <span>{title}</span>
            </h1>
          </header>

          <section className="bg-stone-50 dark:bg-[#1A1A1A] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 rounded-lg space-y-2 print:bg-white print:border-stone-300 print:text-black">
            <div className="flex items-center gap-2 text-xs font-mono-subtle font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 print:text-black">
              <FileText className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 print:text-black" />
              <span>{usePortuguese ? 'Resumo da Pesquisa (Abstract)' : 'Abstract'}</span>
            </div>
            <div className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed italic print:text-black">
              {abstract.split('\n').map((paragraph, idx) => {
                if (!paragraph.trim()) return null;
                return <p key={idx} className="mb-4">{paragraph}</p>;
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
