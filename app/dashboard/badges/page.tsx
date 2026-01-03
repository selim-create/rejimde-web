'use client';

import { useBadges } from '@/hooks/useBadges';
import LayoutWrapper from '@/components/LayoutWrapper';
import BadgeGrid from '@/components/badges/BadgeGrid';

export default function BadgesPage() {
  const { allBadges, recentlyEarned, stats, isLoading, error } = useBadges();
  
  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (error) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-12 text-center">
              <i className="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p className="text-red-700 dark:text-red-400 font-bold">{error}</p>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 mb-2">
              Rozet Koleksiyonu 🏆
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-bold">
              Başarılarını rozetlerle sergile ve hedeflerine ulaş!
            </p>
          </div>
          
          {/* Collection Progress */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-3xl p-8 mb-12 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-black mb-4">Koleksiyon İlerlemen</h2>
                <div className="flex items-end gap-6 mb-4">
                  <div>
                    <div className="text-6xl font-black">{stats.total_earned}</div>
                    <div className="text-sm font-bold opacity-90">Kazanılan</div>
                  </div>
                  <div className="text-white/60 mb-2">
                    <div className="text-3xl font-black">/ {stats.total_available}</div>
                    <div className="text-xs font-bold">Toplam</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                  <div 
                    className="bg-white h-full transition-all duration-1000 rounded-full shadow-lg"
                    style={{ width: `${stats.percent_complete}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-bold opacity-90">İlerleme</span>
                  <span className="text-2xl font-black">{stats.percent_complete}%</span>
                </div>
              </div>
              
              <div className="shrink-0">
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/40">
                  <i className="fa-solid fa-trophy text-6xl text-yellow-300 drop-shadow-lg"></i>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recently Earned */}
          {recentlyEarned.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <i className="fa-solid fa-sparkles"></i>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                  Son Kazanılan Rozetler
                </h2>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 justify-items-center">
                  {recentlyEarned.map((badge) => (
                    <div key={badge.slug} className="flex flex-col items-center">
                      <div className="w-20 h-20 mb-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-lg animate-pulse">
                          <i className={`fa-solid ${badge.icon || 'fa-medal'} text-3xl text-white`}></i>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white dark:border-gray-800 w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                          <i className="fa-solid fa-check text-white text-xs"></i>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-center text-gray-700 dark:text-gray-300 max-w-full px-1">
                        {badge.title}
                      </span>
                      {badge.earned_at && (
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(badge.earned_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* All Badges */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fa-solid fa-medal"></i>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                Tüm Rozetler
              </h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
              <BadgeGrid badges={allBadges} showFilter={true} />
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
