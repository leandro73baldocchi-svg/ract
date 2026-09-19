import React, { useState, useMemo } from 'react';
import { UNIVERSITIES_DIRECTORY, University } from '../data/universities';
import { ExternalLink, Search, Globe, BookOpen, GraduationCap, Building2 } from 'lucide-react';

export const UniversitiesView: React.FC = () => {
  const [regionFilter, setRegionFilter] = useState<'all' | 'Brasil' | 'Internacional'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFocusArea, setSelectedFocusArea] = useState<string>('all');

  // Extract unique focus areas
  const allFocusAreas = useMemo(() => {
    const set = new Set<string>();
    UNIVERSITIES_DIRECTORY.forEach((u) => u.focusAreas.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return UNIVERSITIES_DIRECTORY.filter((item) => {
      if (regionFilter !== 'all' && item.region !== regionFilter) {
        return false;
      }
      if (selectedFocusArea !== 'all' && !item.focusAreas.includes(selectedFocusArea)) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAcronym = item.acronym?.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        const matchesCountry = item.country.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesAreas = item.focusAreas.some((a) => a.toLowerCase().includes(q));
        if (!matchesName && !matchesAcronym && !matchesCity && !matchesCountry && !matchesDesc && !matchesAreas) {
          return false;
        }
      }
      return true;
    });
  }, [regionFilter, selectedFocusArea, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Masthead */}
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181818] p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-subtle text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <span>Diretório Acadêmico & Repositórios de Pesquisa</span>
            </div>
            <h2 className="font-editorial text-2xl font-bold text-stone-900 dark:text-stone-100">
              Principais Universidades do Brasil e do Mundo
            </h2>
            <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Acesso direto aos portais oficiais, pró-reitorias de pesquisa científica, bibliotecas digitais e repositórios abertos de teses e dissertações das instituições de maior relevância científica.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono-subtle text-stone-500 dark:text-stone-400">
              {filtered.length} {filtered.length === 1 ? 'instituição listada' : 'instituições listadas'}
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-5 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Region Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded text-xs font-medium w-full sm:w-auto">
            <button
              onClick={() => setRegionFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded transition-colors cursor-pointer ${
                regionFilter === 'all'
                  ? 'bg-white dark:bg-[#151515] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setRegionFilter('Brasil')}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded transition-colors cursor-pointer ${
                regionFilter === 'Brasil'
                  ? 'bg-white dark:bg-[#151515] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Brasil (USP, UNICAMP, IMPA...)
            </button>
            <button
              onClick={() => setRegionFilter('Internacional')}
              className={`flex-1 sm:flex-initial px-3 py-1 rounded transition-colors cursor-pointer ${
                regionFilter === 'Internacional'
                  ? 'bg-white dark:bg-[#151515] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Internacionais (Harvard, MIT, Cambridge...)
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar universidade ou área de estudo..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-[#202020] text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded focus:outline-none focus:border-stone-900 dark:focus:border-stone-300 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item: University) => (
          <article
            key={item.id}
            className="border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-5 flex flex-col justify-between hover:border-stone-400 dark:hover:border-stone-600 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-subtle font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                      {item.acronym || item.country}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-mono-subtle">
                      {item.city} • Fundada em {item.founded}
                    </span>
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900 dark:text-stone-100 mt-1.5">
                    {item.name}
                  </h3>
                </div>

                <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 shrink-0">
                  {item.region}
                </span>
              </div>

              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Focus Areas Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.focusAreas.map((area: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-stone-50 dark:bg-stone-850 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-750"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Academic Links */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <a
                href={item.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium transition-colors text-center"
              >
                <Globe className="w-3 h-3 text-stone-500" />
                <span>Portal Oficial</span>
                <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
              </a>

              <a
                href={item.researchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium transition-colors text-center"
              >
                <Building2 className="w-3 h-3 text-stone-500" />
                <span>Pesquisa & Pós</span>
                <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
              </a>

              <a
                href={item.digitalLibraryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium transition-colors text-center"
              >
                <BookOpen className="w-3 h-3 text-stone-500" />
                <span>Teses & Acesso Aberto</span>
                <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
