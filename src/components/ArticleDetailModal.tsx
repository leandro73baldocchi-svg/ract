import React, { useState, useEffect } from 'react';
import { NewsArticle, FullArticleContent, ArticleDeepDive } from '../types';
import { generateAcademicFullArticle } from '../utils/academicGenerator';
import { X, ExternalLink, Bookmark, Check, Printer, Copy, FileText, Globe, Quote, Share2 } from 'lucide-react';

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
  
  // Variáveis para traduzir o Título e Resumo Base
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedSummary, setTranslatedSummary] = useState<string>('');

  useEffect(() => {
    setUsePortuguese(autoTranslateDefault);
  }, [autoTranslateDefault, article]);

  // Buscando o conteúdo completo
  useEffect(() => {
    if (!isOpen || !article) {
      setFullContent(null);
      setDeepDive(null);
      return;
    }

    if (article.fullArticle) {
      setFullContent(article.fullArticle);
      return;
    }

    let isMounted = true;
    const fetchFullArticle = async () => {
      setLoadingContent(true);
      try {
        const res = await fetch('/api/article-full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: article.id,
            title: article.title,
            titlePt: article.titlePt,
            summary: article.summary,
            summaryPt: article.summaryPt,
            source: article.source,
            sourceCategory: article.sourceCategory,
            author: article.author,
            pubDate: article.pubDate,
            link: article.link,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.fullArticle && isMounted) {
            setFullContent(data.fullArticle);
            if (data.deepDive) setDeepDive(data.deepDive);
            return;
          }
        }
        if (isMounted) {
          const fallbackData = generateAcademicFullArticle(article);
          setFullContent(fallbackData.fullArticle);
          setDeepDive(fallbackData.deepDive);
        }
      } catch (err) {
        if (isMounted) {
          const fallbackData = generateAcademicFullArticle(article);
          setFullContent(fallbackData.fullArticle);
          setDeepDive(fallbackData.deepDive);
        }
      } finally {
        if (isMounted) setLoadingContent(false);
      }
    };

    fetchFullArticle();

    return () => {
      isMounted = false;
    };
  }, [isOpen, article]);

  // Nova Engrenagem: Traduzir o Título e o Resumo Superior se não existir no banco
  useEffect(() => {
    if (!isOpen || !article) { setTranslatedTitle(''); setTranslatedSummary(''); return; }
    if (!autoTranslateDefault) return;
    if (article.titlePt && article.summaryPt) return;

    let isMounted = true;
    const translateText = async () => {
      try {
        const resTitle = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(article.title)}`);
        const dataTitle = await resTitle.json();
        const ptTitle = dataTitle[0].map((t: any) => t[0]).join('');

        // Limite gigante e seguro para o modal
        const safeSummary = article.summary.substring(0, 1800);
        const resSummary = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(safeSummary)}`);
        const dataSummary = await resSummary.json();
        const ptSummary = dataSummary[0].map((t: any) => t[0]).join('');

        if (isMounted) { setTranslatedTitle(ptTitle); setTranslatedSummary(ptSummary); }
      } catch (error) { console.error('Erro na tradução do modal', error); }
    };
    translateText();
    return () => { isMounted = false; };
  }, [article, isOpen, autoTranslateDefault]);


  if (!isOpen || !article) return null;

  // AGORA OS FIOS ESTÃO LIGADOS (Usando translatedTitle e translatedSummary)
  const title = usePortuguese 
    ? (article.titlePt || translatedTitle || article.title) 
    : article.title;

  const abstract = fullContent
    ? (usePortuguese ? (fullContent.abstractPt || translatedSummary || fullContent.abstract) : fullContent.abstract)
    : (usePortuguese ? (article.summaryPt || translatedSummary || article.summary) : article.summary);

  const introduction = fullContent ? (usePortuguese ? fullContent.introductionPt : fullContent.introduction) : null;
  const methodology = fullContent ? (usePortuguese ? fullContent.methodologyPt : fullContent.methodology) : null;
  const results = fullContent ? (usePortuguese ? fullContent.resultsPt : fullContent.results) : null;
  const discussion = fullContent ? (usePortuguese ? fullContent.discussionPt : fullContent.discussion) : null;
  const conclusion = fullContent ? (usePortuguese ? fullContent.conclusionPt : fullContent.conclusion) : null;

  const originalUrl = article.link || article.url;

  const citationAbnt = fullContent?.citationAbnt ||
    `${(article.author || article.source).toUpperCase()}. ${article.titlePt || article.title}. ${article.source}, ${article.pubDate}. Disponível em: <${originalUrl}>. Acesso em: ${new Date().toLocaleDateString('pt-BR')}.`;

  const handlePrint = () => { window.print(); };

  const handleCopyCitation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(citationAbnt);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2500);
    }
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      const url = `${window.location.origin}/?art=${article.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto print:static print:block print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div
        className="printable-article bg-white dark:bg-[#161616] border border-stone-300 dark:border-stone-800 rounded-lg max-w-4xl w-full my-auto shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-colors print:m-0 print:overflow-visible print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:dark:bg-white print:block"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="no-print border-b border-stone-200 dark:border-stone-800 px-5 sm:px-8 py-3.5 flex items-center justify-between bg-[#FBFBFA] dark:bg-[#121212] transition-colors print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono-subtle text-stone-500 dark:text-stone-400 truncate">
            <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">{article.source}</span>
            <span>•</span><span>{article.pubDate}</span>
            {article.isPeerReviewed && (<><span>•</span><span className="text-emerald-700 dark:text-emerald-400 font-medium">Revisado por Pares</span></>)}
          </div>

          <div className="flex items-center gap-2">
            {originalUrl && (
              <a href={originalUrl?.startsWith('http') && originalUrl.length > 30 ? originalUrl : `https://scholar.google.com/scholar?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Artigo Original</span>
                <span className="sm:hidden">Original</span>
              </a>
            )}

            <button onClick={handleShareLink} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#202020] text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer">
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copiado' : 'Compartilhar'}</span>
            </button>

            <button onClick={handlePrint} id="btn-print-article" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#202020] text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer">
              <Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span className="hidden sm:inline">Imprimir Artigo</span>
              <span className="sm:hidden">Imprimir</span>
            </button>

            <button onClick={() => onToggleSaveOffline({ ...article, fullArticle: fullContent || undefined, cachedDeepDive: deepDive || undefined })} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${isSavedOffline ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100' : 'bg-white dark:bg-[#202020] text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'}`}>
              {isSavedOffline ? (<><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="hidden sm:inline">Salvo Offline</span></>) : (<><Bookmark className="w-3.5 h-3.5" /><span className="hidden sm:inline">Salvar Offline</span></>)}
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
                <span>Original ({article.source.includes('USP') || article.source.includes('UNICAMP') ? 'PT' : 'EN'})</span>
              </button>
            </div>
            {originalUrl && (
              <a href={originalUrl?.startsWith('http') && originalUrl.length > 30 ? originalUrl : `https://scholar.google.com/scholar?q=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                <span>Periódico Oficial ({article.source})</span><ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <header className="space-y-4 print:pt-4">
            <div className="flex items-center gap-2 text-xs font-mono-subtle text-stone-500 dark:text-stone-400 uppercase tracking-wider print:text-black">
              <span>{article.source}</span><span>•</span><span>{article.pubDate}</span>
              {article.doi && (<><span>•</span><span>DOI: {article.doi}</span></>)}
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-extrabold text-stone-950 dark:text-stone-50 leading-tight print:text-black">
              {title}
            </h1>
            <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 border-l-2 border-stone-400 dark:border-stone-600 pl-3 py-0.5 print:text-black">
              <span>Autoria / Grupo Científico: </span>
              <strong className="text-stone-900 dark:text-stone-200 print:text-black">
                {article.author || `${article.source} Editorial Board & Research Fellows`}
              </strong>
            </div>
          </header>

          <section className="bg-stone-50 dark:bg-[#1A1A1A] border border-stone-200 dark:border-stone-800 p-5 sm:p-6 rounded-lg space-y-2 print:bg-white print:border-stone-300 print:text-black">
            <div className="flex items-center gap-2 text-xs font-mono-subtle font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 print:text-black">
              <FileText className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 print:text-black" />
              <span>{usePortuguese ? 'Resumo da Pesquisa (Abstract)' : 'Abstract'}</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed italic print:text-black">
              {abstract}
            </p>
          </section>

          {loadingContent ? (
            <div className="space-y-5 animate-pulse py-4 print:hidden">
              <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-1/4"></div>
              <div className="h-4 bg-stone-100 dark:bg-stone-850 rounded w-full"></div>
              <div className="h-4 bg-stone-100 dark:bg-stone-850 rounded w-5/6"></div>
              <div className="h-4 bg-stone-100 dark:bg-stone-850 rounded w-4/5"></div>
            </div>
          ) : (
            <div className="space-y-8 text-stone-800 dark:text-stone-200 text-sm sm:text-base leading-relaxed print:text-black">
              {introduction && (
                <section className="space-y-2.5">
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5 print:text-black print:border-black">
                    1. {usePortuguese ? 'Introdução e Fundamentação Científica' : 'Introduction & Theoretical Framework'}
                  </h2>
                  <p className="whitespace-pre-line text-stone-700 dark:text-stone-300 print:text-black">{introduction}</p>
                </section>
              )}
              {methodology && (
                <section className="space-y-2.5">
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5 print:text-black print:border-black">
                    2. {usePortuguese ? 'Metodologia e Desenho Experimental' : 'Methodology & Experimental Design'}
                  </h2>
                  <p className="whitespace-pre-line text-stone-700 dark:text-stone-300 print:text-black">{methodology}</p>
                </section>
              )}
              {results && (
                <section className="space-y-2.5">
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5 print:text-black print:border-black">
                    3. {usePortuguese ? 'Resultados e Evidências Observadas' : 'Results & Key Findings'}
                  </h2>
                  <p className="whitespace-pre-line text-stone-700 dark:text-stone-300 print:text-black">{results}</p>
                </section>
              )}
              {discussion && (
                <section className="space-y-2.5">
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5 print:text-black print:border-black">
                    4. {usePortuguese ? 'Discussão e Análise Crítica' : 'Discussion & Critical Analysis'}
                  </h2>
                  <p className="whitespace-pre-line text-stone-700 dark:text-stone-300 print:text-black">{discussion}</p>
                </section>
              )}
              {conclusion && (
                <section className="space-y-2.5">
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-1.5 print:text-black print:border-black">
                    5. {usePortuguese ? 'Conclusões e Perspectivas Futuras' : 'Conclusions & Future Work'}
                  </h2>
                  <p className="whitespace-pre-line text-stone-700 dark:text-stone-300 print:text-black">{conclusion}</p>
                </section>
              )}
              {deepDive && (
                <section className="p-5 bg-stone-50 dark:bg-[#181818] border border-stone-200 dark:border-stone-800 rounded-lg space-y-3 print:bg-white print:border-stone-300 print:text-black">
                  <h3 className="font-mono-subtle text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 print:text-black">
                    Significado Conceitual & Aplicações
                  </h3>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100 text-xs block mb-1 print:text-black">Por que este estudo é fundamental:</span>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed print:text-black">{deepDive.whyItMatters}</p>
                  </div>
                  {deepDive.potentialImpact && (
                    <div>
                      <span className="font-semibold text-stone-900 dark:text-stone-100 text-xs block mb-1 print:text-black">Impacto projetado:</span>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed print:text-black">{deepDive.potentialImpact}</p>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          <section className="print-page-break border-t border-stone-200 dark:border-stone-800 pt-6 space-y-3 print:border-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono-subtle font-semibold uppercase text-stone-700 dark:text-stone-300 print:text-black">
                <Quote className="w-3.5 h-3.5 text-stone-500 print:text-black" />
                <span>Como Citar este Trabalho (ABNT / Pesquisa Acadêmica)</span>
              </div>
              <button onClick={handleCopyCitation} className="no-print inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-stone-700 dark:text-stone-300 cursor-pointer print:hidden">
                {copiedCitation ? (<><Check className="w-3 h-3 text-emerald-600" /><span>Citação Copiada!</span></>) : (<><Copy className="w-3 h-3" /><span>Copiar Citação ABNT</span></>)}
              </button>
            </div>
            <div className="p-3 bg-stone-100/70 dark:bg-[#1C1C1C] border border-stone-200 dark:border-stone-800 rounded text-xs font-mono-subtle text-stone-800 dark:text-stone-300 leading-relaxed break-words print:bg-white print:border-stone-300 print:text-black">
              {citationAbnt}
            </div>
          </section>

          <div className="hidden print:block pt-6 border-t border-stone-300 text-[10pt] text-stone-600 font-mono-subtle print:border-black print:text-black">
            Documento emitido pelo Radar Autônomo de Ciências e Tecnologia (RACT) • {new Date().toLocaleDateString('pt-BR')} • {originalUrl}
          </div>
        </div>
      </div>
    </div>
  );
};
