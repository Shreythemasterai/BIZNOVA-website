'use client';

import React from 'react';
import {
  Wheat,
  CircleDot,
  Droplet,
  Flame,
  Cookie,
  Gift,
  CupSoda,
  Coffee,
  Milk,
  Sparkles,
  SprayCan,
  Home,
  Package,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { Category } from '@/types';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Wheat,
  CircleDot,
  Droplet,
  Flame,
  Cookie,
  Gift,
  CupSoda,
  Coffee,
  Milk,
  Sparkles,
  SprayCan,
  Home,
  Package,
  Layers,
};

export function CategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  return (
    <div className="w-full bg-white border-b border-slate-100 py-3 sticky top-[105px] sm:top-[115px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {/* All Items Button */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Categories ({categories.length})</span>
          </button>

          {/* Individual Category Pills */}
          {categories.map((cat) => {
            const Icon = iconMap[cat.iconName] || LayoutGrid;
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
