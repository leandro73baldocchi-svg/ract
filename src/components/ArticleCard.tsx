import React from 'react';
import { NewsArticle } from '../types';
import { X, ExternalLink, Bookmark, Clock, CheckCircle, Share2, Globe, ArrowRight, ShoppingCart } from 'lucide-react';

interface ArticleModalProps {
  article: NewsArticle;
  autoTranslate: boolean;
  isSavedOffline: boolean;
  onToggleSaveOffline: (article: NewsArticle) => void;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  autoTranslate,
  isSavedOffline,
  onToggleSaveOffline,
  onClose,
}) => {
  const displayTitle = autoTranslate ? (article.titlePt || article.title) : article.title;
  const displaySummary = autoTranslate ? (article.summaryPt || article.summary) : article.summary;
  
  // Fake content generation for the demo reading experience
  const paragraphs = [
    displaySummary,
    "Esta descoberta marca um ponto de inflexão na compreensão atual da comunidade científica sobre o fenômeno. A metodologia rigorosa empregada pela equipe de pesquisa, combinada com instrumentos de medição de última geração, permitiu reduzir a margem de erro a níveis historicamente baixos.",
    "Para chegar a estas conclusões, os pesquisadores realizaram observações contínuas ao longo de um período de três anos, catalogando mais de 10.000 pontos de dados isolados. O modelo estatístico aplicado excluiu anomalias sazonais e focou em padrões de longo prazo.",
    "Especialistas independentes que revisaram o estudo apontam que o próximo desafio será replicar estes resultados em condições diferentes. Se confirmada por outros laboratórios, a teoria poderá alterar significativamente os currículos acadêmicos nos próximos cinco anos.",
    "Aplicações práticas da descoberta já estão sendo debatidas em comitês industriais e governamentais. A expectativa é que, num prazo de uma década, a tecnologia derivada deste estudo já esteja acessível comercialmente, impactando setores que vão desde a engenharia de materiais até a biotecnologia agrícola."
  ];

  // Helper to get an affiliate link suggestion based on the category
  const getAffiliateRecommendation = () => {
    switch (article.sourceCategory) {
      case 'astronomy': return { title: "Cosmos (Carl Sagan)", url: "https://amzn.to/SEU-LINK-AQUI" };
      case 'physics': return { title: "Uma Breve História do Tempo (Stephen Hawking)", url: "https://amzn.to/SEU-LINK-AQUI" };
      case 'ai': return { title: "Inteligência Artificial: Uma Abordagem Moderna", url: "https://amzn.to/SEU-LINK-AQUI" };
      case 'biotech': return { title: "O Gene Egoísta (Richard Dawkins)", url: "https://amzn.to/SEU-LINK-AQUI" };
      case 'health': return { title: "A Regra de Ouro (Medicina Moderna)", url: "https://amzn.to/SEU-LINK-AQUI" };
      case 'tech': return { title: "A Nova Era Digital", url: "https://amzn.to/SEU-LINK-AQUI" };
      case 'math': return { title: "O Homem que Calculava (Malba Tahan)", url: "https://amzn.to/SEU-LINK-AQUI" };
      default: return { title: "Kindle: Para ler artigos científicos sem cansar a vista", url: "https://amzn.to/SEU-LINK-AQUI" };
    }
  };

  const recommendedBook = getAffiliateRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151515] sm:rounded-xl shadow-2xl w-full max-w-3xl h-full sm:h-[95vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 border border-transparent dark:border-stone-800">
        
        {/* Top App Bar */}
        <div className="px-4 py-3 sm:py-4 border-b border-stone-200 dark:border-stone-800 bg-[#FCFCFB] dark:bg-[#111111] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSaveOffline(article)}
              title={isSavedOffline ? 'Salvo no dispositivo para ler offline' : 'Salvar no dispositivo para ler sem internet'}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isSavedOffline
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSavedOffline ? 'fill-current' : ''}`} />
            </button>
            
            <button
              className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              title="Compartilhar resumo"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            {autoTranslate && (
              <span className="ml-2 hidden sm:flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded text-[10px] font-semibold uppercase tracking-wider">
                <Globe className="w-3 h-3" />
                Traduzido para PT-BR
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-10 bg-white dark:bg-[#181818]">
          <div className="max-w-2xl mx-auto">
            
            {/* Context & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6 font-mono-subtle text-xs">
              <span className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                {article.source}
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-stone-500 dark:text-stone-400">
                {article.pubDate}
              </span>
              {article.readTime && (
                <>
                  <span className="text-stone-300 dark:text-stone-700">•</span>
                  <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-stone-950 dark:text-stone-50 leading-tight mb-4">
              {displayTitle}
            </h1>

            {/* Author details */}
            <div className="flex items-center gap-2 mb-8 pb-8 border-b border-stone-200 dark:border-stone-800/60">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 font-bold font-editorial text-lg">
                {article.author ? article.author.charAt(0) : 'R'}
              </div>
              <div className="text-xs">
                <p className="font-bold text-stone-800 dark:text-stone-200">
                  {article.author || 'Equipe Editorial RACT'}
                </p>
                <p className="text-stone-500 dark:text-stone-400">
                  {article.isPeerReviewed ? 'Pesquisador Verificado' : 'Análise Científica'}
                </p>
              </div>
            </div>

            {/* Key Takeaway Box */}
            {article.keyTakeaway && (
              <div className="mb-8 p-4 bg-stone-50 dark:bg-[#1F1F1F] border-l-4 border-stone-900 dark:border-stone-400 rounded-r-lg">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Insight Principal
                </p>
                <p className="text-stone-800 dark:text-stone-200 font-medium sm:text-lg italic leading-snug">
                  "{article.keyTakeaway}"
                </p>
              </div>
            )}

            {/* Full Content Simulation */}
            <div className="prose prose-stone dark:prose-invert prose-p:leading-relaxed prose-p:text-[15px] sm:prose-p:text-base max-w-none text-stone-700 dark:text-stone-300 font-serif">
              {paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "text-lg font-medium text-stone-800 dark:text-stone-200 mb-6" : "mb-5"}>
                  {p}
                </p>
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800/60 flex flex-wrap gap-2">
                {article.tags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 rounded text-[11px] font-mono-subtle font-semibold border border-stone-200 dark:border-stone-800">
                    #{tag.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                ))}
              </div>
            )}

            {/* NOVO: Bloco de Aprofundamento (Afiliado Amazon) */}
            <div className="mt-12 bg-[#F9F9F8] dark:bg-[#1C1C1C] border border-stone-200 dark:border-stone-800 rounded-xl p-5 sm:p-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
                Aprofunde-se no Tema
              </p>
              <h4 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                Recomendação RACT
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 max-w-md mx-auto">
                Deseja se aprofundar nas bases teóricas deste artigo? Recomendamos o livro fundamental: <br/>
                <strong className="text-stone-900 dark:text-stone-200 mt-1 inline-block">{recommendedBook.title}</strong>
              </p>
              <a 
                href={recommendedBook.url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                Ver Livro na Amazon
              </a>
              <p className="text-[9px] text-stone-400 dark:text-stone-600 mt-4 max-w-sm mx-auto leading-tight">
                *O RACT pode receber uma pequena comissão por compras feitas através deste link, sem nenhum custo extra para você. Isso ajuda a manter o portal no ar.
              </p>
            </div>

            {/* Read Source Action */}
            {article.link && (
              <div className="mt-8 pt-8 pb-10 flex flex-col items-center">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between w-full sm:w-auto sm:min-w-[300px] px-6 py-4 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-xl font-bold text-sm hover:bg-stone-800 dark:hover:bg-white transition-all shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Ler Artigo Original no Periódico
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
                <p className="text-[10px] text-stone-500 mt-3 text-center">
                  O artigo original será aberto em uma nova aba diretamente no site da fonte: {article.source}.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};
