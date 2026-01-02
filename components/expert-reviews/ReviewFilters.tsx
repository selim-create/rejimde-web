"use client";

import { useState } from "react";
import { FilterState } from "@/types/expert-reviews";
import { GOAL_TAGS, PROGRAM_TYPES } from "@/lib/constants";

interface ReviewFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function ReviewFilters({ filters, onFilterChange }: ReviewFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      goalTag: null,
      programType: null,
      ratingMin: 0,
      verifiedOnly: false,
      withStory: false,
    });
  };

  const hasActiveFilters = filters.goalTag || filters.programType || filters.ratingMin > 0 || filters.verifiedOnly || filters.withStory;

  return (
    <div className="bg-white rounded-[2rem] p-6 border-2 border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-filter text-indigo-600"></i>
          Filtreleme
        </h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition flex items-center gap-2"
        >
          {isExpanded ? 'Gizle' : 'Göster'}
          <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Aktif Filtreler:</span>
          <button 
            onClick={clearFilters}
            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <i className="fa-solid fa-xmark"></i>
            Temizle
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Goal Tag Filter */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
              Hedef
            </label>
            <select 
              value={filters.goalTag || ''} 
              onChange={(e) => updateFilter('goalTag', e.target.value || null)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-400 transition"
            >
              <option value="">Tüm Hedefler</option>
              {GOAL_TAGS.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.label}</option>
              ))}
            </select>
          </div>

          {/* Program Type Filter */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
              Program Tipi
            </label>
            <select 
              value={filters.programType || ''} 
              onChange={(e) => updateFilter('programType', e.target.value || null)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-400 transition"
            >
              <option value="">Tüm Programlar</option>
              {PROGRAM_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Minimum Rating Filter */}
          <div>
            <label className="text-xs font-black text-gray-400 uppercase mb-2 block">
              Minimum Puan
            </label>
            <div className="flex gap-2">
              {[0, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => updateFilter('ratingMin', rating)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                    filters.ratingMin === rating
                      ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {rating === 0 ? 'Tümü' : `${rating}+`}
                  {rating > 0 && <i className="fa-solid fa-star text-yellow-400 ml-1"></i>}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition">
                Sadece Onaylı Danışanlar
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.withStory}
                onChange={(e) => updateFilter('withStory', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600 transition">
                Sadece Hikaye İçerenler
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
