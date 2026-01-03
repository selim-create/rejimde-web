'use client';

import Link from 'next/link';
import { useBadges } from '@/hooks/useBadges';
import BadgeCard from '../badges/BadgeCard';

export default function BadgesWidget() {
  const { recentlyEarned, allBadges, stats, isLoading } = useBadges();
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Get badges close to earning (progress > 50 and not earned)
  const upcomingBadges = allBadges
    .filter(b => !b.is_earned && b.progress > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);
  
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
            <i className="fa-solid fa-medal"></i>
          </div>
          Rozetlerim
        </h3>
        <Link 
          href="/dashboard/badges"
          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
        >
          Tümünü Gör →
        </Link>
      </div>
      
      {/* Stats */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats.total_earned}</div>
            <div className="text-xs font-bold text-purple-700 dark:text-purple-500">Kazanılan Rozet</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-600 dark:text-gray-400">{stats.total_available}</div>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-500">Toplam</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-purple-700 dark:text-purple-400">Koleksiyon İlerlemesi</span>
            <span className="text-purple-600 dark:text-purple-300">{stats.percent_complete}%</span>
          </div>
          <div className="h-2 bg-purple-200 dark:bg-purple-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${stats.percent_complete}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Recently Earned */}
      {recentlyEarned.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-sparkles text-yellow-500"></i>
            Son Kazanılanlar
          </h4>
          <div className="flex gap-3 justify-center">
            {recentlyEarned.slice(0, 3).map((badge) => (
              <BadgeCard key={badge.slug} badge={badge} size="sm" showProgress={false} />
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming Badges */}
      {upcomingBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <i className="fa-solid fa-bullseye text-blue-500"></i>
            Yaklaşan Rozetler
          </h4>
          <div className="space-y-2">
            {upcomingBadges.map((badge) => (
              <div key={badge.slug} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm shrink-0">
                  <i className={`fa-solid ${badge.icon || 'fa-medal'}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{badge.title}</div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${badge.percent}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">{badge.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {recentlyEarned.length === 0 && upcomingBadges.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-8 text-center">
          <i className="fa-solid fa-trophy text-3xl text-gray-300 dark:text-gray-600 mb-2"></i>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Rozet kazanmaya başla!</p>
        </div>
      )}
    </div>
  );
}
