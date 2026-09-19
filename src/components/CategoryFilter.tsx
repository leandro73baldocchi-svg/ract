import React from 'react';
import { CategoryType } from '../types';
import { Search, X } from 'lucide-react';

interface CategoryFilterProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES: { id: CategoryType; label: string }[] = [
  { id: 'all', label: 'Todas as Áreas' },
  { id: 'biography', label: 'Biografias' },
  { id: 'education', label: 'Educação' },
  { id: 'biotech', label: 'Biotecnologia' },
  { id: 'health', label: 'Saúde' },
  { id: 'physics', label: 'Física' },
  { id: 'math', label: 'Matemática' },
  { id: 'astronomy', label: 'Astronomia' },
  { id: 'geology', label: 'Geologia' },
  { id: 'tech', label: 'Tecnologia' },
  { id: 'ai', label: 'Inteligência Artificial' },
  { id: 'universities', label: 'Universidades' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="mb-6 space-y-3">
      {/* Category Tabs and Search in One Unified Clean Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-200 pb-2">
        {/* Category Scrollable Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white font-medium'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Minimal Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filtrar por tema ou autor..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-800 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
