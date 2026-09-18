import React from 'react';
import { DailyBriefing } from '../types';

interface DailyBriefingCardProps {
  briefing: DailyBriefing | null;
  isLoading: boolean;
  autoTranslate: boolean;
}

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
  briefing,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-6 mb-8 animate-pulse transition-colors">
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-28 mb-3"></div>
        <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-stone-100 dark:bg-stone-850 rounded w-full mb-2"></div>
        <div className="h-4 bg-stone-100 dark:bg-stone-850 rounded w-5/6 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100 dark:border-stone-800">
          <div className="h-16 bg-stone-100 dark:bg-stone-800 rounded"></div>
          <div className="h-16 bg-stone-100 dark:bg-stone-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <section className="border border-stone-300 dark:border-stone-800 bg-white dark:bg-[#181818] rounded-lg p-6 sm:p-7 mb-8 shadow-xs transition-colors">
      {/* Editorial Marker */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-stone-200 dark:border-stone-800 text-xs font-mono-subtle text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider font-semibold text-stone-900 dark:text-stone-200">
            Síntese do Radar
          </span>
          <span>•</span>
          <span>{briefing.edition}</span>
        </div>
        <span className="text-stone-400 dark:text-stone-500">Atualizado {briefing.lastSync}</span>
      </div>

      {/* Main Headline & Summary */}
      <div className="mt-4 mb-5">
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 leading-snug">
          {briefing.headline}
        </h2>
        <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed mt-2.5 max-w-4xl">
          {briefing.executiveSummary}
        </p>
      </div>

      {/* Bullet Points */}
      {briefing.keyBulletPoints && briefing.keyBulletPoints.length > 0 && (
        <ul className="mb-6 space-y-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          {briefing.keyBulletPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span className="text-stone-400 dark:text-stone-600 font-mono-subtle shrink-0">—</span>
              <span className="leading-normal">{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Two Column Highlights: Science & Tech */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
        <div className="p-3.5 bg-stone-50 dark:bg-[#202020] rounded border border-stone-200 dark:border-stone-700/80 transition-colors">
          <span className="text-[11px] font-mono-subtle uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold block mb-1">
            Ciência • {briefing.scienceHighlight.source}
          </span>
          <h3 className="font-editorial font-bold text-stone-900 dark:text-stone-100 text-sm mb-1 leading-snug">
            {briefing.scienceHighlight.title}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {briefing.scienceHighlight.impact}
          </p>
        </div>

        <div className="p-3.5 bg-stone-50 dark:bg-[#202020] rounded border border-stone-200 dark:border-stone-700/80 transition-colors">
          <span className="text-[11px] font-mono-subtle uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold block mb-1">
            Tecnologia • {briefing.techHighlight.source}
          </span>
          <h3 className="font-editorial font-bold text-stone-900 dark:text-stone-100 text-sm mb-1 leading-snug">
            {briefing.techHighlight.title}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            {briefing.techHighlight.impact}
          </p>
        </div>
      </div>
    </section>
  );
};
