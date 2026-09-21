import React from 'react';
import { CategoryType, CustomCategory } from '../types';
import { RefreshCw, Bookmark, Globe, WifiOff, Search, X, Moon, Sun, Sparkles, Coffee, ShoppingCart, Mail } from 'lucide-react';

interface HeaderProps {
  date: string;
  isOnline: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  savedCount: number;
  showOfflineOnly: boolean;
  onToggleOfflineOnly: () => void;
  autoTranslate: boolean;
  onToggleAutoTranslate: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  showRadarBriefing: boolean;
  onToggleRadarBriefing: () => void;
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoriesList: CustomCategory[];
  onOpenMobileVitrine: () => void;
  onOpenMobileNewsletter: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  date,
  isOnline,
  isRefreshing,
  onRefresh,
  savedCount,
  showOfflineOnly,
  onToggleOfflineOnly,
  autoTranslate,
  onToggleAutoTranslate,
  isDarkMode,
  onToggleDarkMode,
  showRadarBriefing,
  onToggleRadarBriefing,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categoriesList,
  onOpenMobileVitrine,
  onOpenMobileNewsletter
}) => {
  return (
    <header className="border-b border-stone-300 dark:border-stone-800 bg-[#FCFCFB] dark:bg-[#151515] sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors">
      
      {/* 1. Top Informative Bar */}
      <div className="border-b border-stone-200 dark:border-stone-800/80 bg-[#F7F7F5] dark:bg-[#111111] px-4 sm:px-8 py-1.5 text-[11px] font-mono-subtle text-stone-500 dark:text-stone-400 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <span className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
              {isOnline ? (
                <><span className="inline-block w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span><span>ONLINE</span></>
              ) : (
                <><WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" /><span className="text-amber-800 dark:text-amber-300">MODO OFFLINE</span></>
              )}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="text-stone-600 dark:text-stone-300">{date}</span>
            <span className="hidden lg:inline text-stone-300 dark:text-stone-700">•</span>
            <span className="hidden lg:inline text-stone-500 dark:text-stone-400">
              Fontes: Nature, Science, CERN, Harvard, Cambridge, Oxford, Bolonha, MIT, USP, UNICAMP, ONU, PISA, NASA
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-stone-400 dark:text-stone-500">Rastreamento Multidisciplinar</span>
            {savedCount > 0 && (
              <span className="bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                {savedCount} {savedCount === 1 ? 'artigo salvo' : 'artigos salvos'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Title Masthead */}
      <div className="border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center w-[80px] h-[80px] bg-white dark:bg-stone-900 rounded-xl shadow-sm overflow-hidden border border-stone-200 dark:border-stone-800">
              <img src="/logo.png" alt="Logo Radar Autônomo" className="w-full h-full object-contain p-1" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-950 dark:text-stone-100 font-serif leading-none">
                  RADAR AUTÔNOMO DE CIÊNCIAS E TECNOLOGIA
                </h1>
                <span className="text-xs font-semibold tracking-wider font-mono-subtle text-stone-500 dark:text-stone-400">(RACT)</span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400 mt-1 tracking-normal max-w-2xl leading-snug">
                Agregador e analisador autônomo dos principais periódicos científicos mundiais com tradução instantânea e leitura offline.
              </p>
            </div>
          </div>

          {/* Quick Utility Controls */}
          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
            
            {/* BOTÕES EXCLUSIVOS PARA MOBILE (Abrem os modais) */}
            <button 
              onClick={onOpenMobileVitrine}
              className="lg:hidden px-3 py-1.5 rounded text-[11px] sm:text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Ofertas</span>
            </button>

            <button 
              onClick={onOpenMobileNewsletter}
              className="lg:hidden px-3 py-1.5 rounded text-[11px] sm:text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Assinar</span>
            </button>
            {/* FIM BOTÕES MOBILE */}

            <a href="https://livepix.gg/leandrosarno" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded text-[11px] sm:text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-600 dark:hover:text-white">
              <Coffee className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Apoiar Projeto</span>
            </a>

            <button onClick={onToggleDarkMode} className={`px-3 py-1.5 rounded text-[11px] sm:text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${isDarkMode ? 'bg-stone-850 text-amber-300 border-stone-700 hover:bg-stone-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100 hover:text-stone-900'}`}>
              {isDarkMode ? (<><Sun className="w-3.5 h-3.5 text-amber-300" /> <span className="hidden sm:inline">Claro</span></>) : (<><Moon className="w-3.5 h-3.5 text-stone-700" /> <span className="hidden sm:inline">Escuro</span></>)}
            </button>

            <button onClick={onToggleAutoTranslate} className={`px-3 py-1.5 rounded text-[11px] sm:text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${autoTranslate ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-2xs' : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'}`}>
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tradução:</span>
              <span className="font-mono-subtle font-bold">{autoTranslate ? 'PT-BR' : 'EN'}</span>
            </button>

            <button onClick={onToggleRadarBriefing} className={`px-3 py-1.5 rounded text-[11px] sm:text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${showRadarBriefing ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-2xs' : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Síntese</span>
            </button>

            <button onClick={onToggleOfflineOnly} className={`px-3 py-1.5 rounded text-[11px] sm:text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${showOfflineOnly ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-2xs' : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'}`}>
              <Bookmark className={`w-3.5 h-3.5 ${showOfflineOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Offline</span>
              {savedCount > 0 && (<span className={`text-[10px] px-1.5 py-0.5 rounded font-mono-subtle font-semibold ${showOfflineOnly ? 'bg-stone-800 dark:bg-stone-300 text-stone-100 dark:text-stone-900' : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200'}`}>{savedCount}</span>)}
            </button>

            <button onClick={onRefresh} disabled={isRefreshing || !isOnline} className="p-1.5 rounded text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors disabled:opacity-40 cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Menu Bar */}
      <div className="bg-[#FAF9F7] dark:bg-[#1A1A1A] px-4 sm:px-8 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 py-2">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {categoriesList.map((cat) => {
              const isActive = activeCategory === cat.id && !showOfflineOnly;
              return (
                <button key={cat.id} onClick={() => onSelectCategory(cat.id)} className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap cursor-pointer ${isActive ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold shadow-2xs' : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-200/70 dark:hover:bg-stone-800 font-medium'}`}>
                  {cat.label}
                </button>
              );
            })}
          </nav>
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="text" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Buscar tema, autor ou periódico..." className="w-full pl-8 pr-7 py-1 text-xs bg-white dark:bg-[#222222] text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded focus:outline-none focus:border-stone-900 dark:focus:border-stone-400 transition-colors placeholder:text-stone-400 dark:placeholder:text-stone-500" />
            {searchQuery && (<button onClick={() => onSearchChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5 cursor-pointer"><X className="w-3 h-3" /></button>)}
          </div>
        </div>
      </div>
    </header>
  );
};
