import React from 'react';
import { OpinionArticle } from '../utils/customDataManager';
import { ArrowLeft, ExternalLink, BookOpen, Image as ImageIcon, Video } from 'lucide-react';

interface OpinionReaderProps {
  article: OpinionArticle;
  onBack: () => void; // Função para fechar o artigo e voltar para a página inicial
}

export const OpinionReader: React.FC<OpinionReaderProps> = ({ article, onBack }) => {
  return (
    <div className="min-h-screen bg-[#F4F4F4] text-stone-900 font-sans py-8 px-4 sm:px-6">
      
      {/* Botão de Voltar Minimalista */}
      <div className="max-w-3xl mx-auto mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o RACT
        </button>
      </div>

      {/* Container Principal do Artigo (Estilo "Folha de Papel") */}
      <article className="max-w-3xl mx-auto bg-white border border-stone-200 shadow-sm p-6 sm:p-12">
        
        {/* Cabeçalho do Artigo */}
        <header className="mb-8 border-b border-stone-200 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-widest border border-stone-200">
              Análise Autoral
            </span>
            <span className="text-xs text-stone-500 font-mono">{article.pubDate}</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-snug mb-4 text-justify">
            {article.title}
          </h1>
          
          <p className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
            Por {article.author || 'Leandro Sarno'}
          </p>
        </header>

        {/* Imagem de Capa (Se existir) */}
        {article.mainImageUrl && (
          <figure className="mb-10">
            <img 
              src={article.mainImageUrl} 
              alt="Capa do artigo" 
              className="w-full h-auto max-h-[400px] object-cover border border-stone-200"
            />
          </figure>
        )}

        {/* Resumo / Abstract */}
        {article.abstract && (
          <section className="mb-10 p-6 sm:p-8 bg-stone-50 border-l-4 border-stone-400">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Resumo / Abstract</h3>
            <p className="text-[14px] font-serif italic text-stone-700 leading-relaxed text-justify">
              {article.abstract}
            </p>
          </section>
        )}

        {/* Corpo do Texto Principal */}
        {/* A classe whitespace-pre-wrap é a mágica que respeita seus parágrafos! */}
        <section className="mb-12 text-[15px] sm:text-[16px] font-serif text-stone-800 leading-loose text-justify whitespace-pre-wrap">
          {article.content}
        </section>

        {/* Vídeo Complementar (Se existir) */}
        {article.videoEmbedUrl && (
          <section className="mb-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-800 mb-4 border-b border-stone-200 pb-2 flex items-center gap-2">
              <Video className="w-4 h-4" /> Material Audiovisual Complementar
            </h3>
            <div className="aspect-video w-full bg-stone-100 border border-stone-200">
              <iframe 
                src={article.videoEmbedUrl} 
                title="Vídeo Complementar"
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </section>
        )}

        {/* Rodapé Acadêmico: Referências e Links */}
        <footer className="mt-12 pt-8 border-t-2 border-stone-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* Referências Bibliográficas */}
            {article.references && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Referências Bibliográficas
                </h3>
                <div className="text-[11px] font-mono text-stone-600 leading-relaxed whitespace-pre-wrap">
                  {article.references}
                </div>
              </div>
            )}

            {/* Links Externos */}
            {article.externalLinks && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-800 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Links Externos (Saiba Mais)
                </h3>
                <a 
                  href={article.externalLinks} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-700 hover:underline break-all"
                >
                  {article.externalLinks}
                </a>
              </div>
            )}

          </div>
        </footer>

      </article>

      {/* Assinatura do Portal no Final da Página */}
      <div className="max-w-3xl mx-auto mt-12 text-center">
        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
          Radar Autônomo de Ciências e Tecnologia - RACT
        </p>
      </div>

    </div>
  );
};
