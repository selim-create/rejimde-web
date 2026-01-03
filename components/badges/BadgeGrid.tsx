'use client';

import { useState } from 'react';
import { UserBadge, BadgeCategory } from '@/types/gamification';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
  badges: UserBadge[];
  showFilter?: boolean;
}

export default function BadgeGrid({ badges, showFilter = true }: BadgeGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'earned' | 'progress'>('earned');
  
  // Filter badges
  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(b => b.category === selectedCategory);
  
  // Sort badges
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (sortBy === 'earned') {
      // Earned first, then by progress
      if (a.is_earned && !b.is_earned) return -1;
      if (!a.is_earned && b.is_earned) return 1;
      if (!a.is_earned && !b.is_earned) {
        return b.percent - a.percent; // Higher progress first
      }
      return 0;
    } else {
      // Sort by progress
      return b.percent - a.percent;
    }
  });
  
  // Category names
  const categoryNames: Record<BadgeCategory | 'all', string> = {
    all: 'Tümü',
    behavior: 'Davranış',
    discipline: 'Disiplin',
    social: 'Sosyal',
    milestone: 'Kilometre Taşı'
  };
  
  // Category icons
  const categoryIcons: Record<BadgeCategory | 'all', string> = {
    all: 'fa-grid-2',
    behavior: 'fa-heart-pulse',
    discipline: 'fa-dumbbell',
    social: 'fa-users',
    milestone: 'fa-trophy'
  };
  
  const categories: (BadgeCategory | 'all')[] = ['all', 'behavior', 'discipline', 'social', 'milestone'];
  
  return (
    <div>
      {/* Filters */}
      {showFilter && (
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white shadow-md scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <i className={`fa-solid ${categoryIcons[cat]} mr-2`}></i>
                {categoryNames[cat]}
              </button>
            ))}
          </div>
          
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'earned' | 'progress')}
              aria-label="Rozet sıralama seçeneği"
              className="px-3 py-2 rounded-xl font-bold text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="earned">Kazanılanlar Önce</option>
              <option value="progress">İlerlemeye Göre</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Badge Grid */}
      {sortedBadges.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center">
          <i className="fa-solid fa-medal text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400 font-bold">Bu kategoride henüz rozet yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 md:gap-8">
          {sortedBadges.map((badge) => (
            <BadgeCard key={badge.slug} badge={badge} size="md" showProgress={true} />
          ))}
        </div>
      )}
    </div>
  );
}
