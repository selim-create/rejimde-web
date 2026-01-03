'use client';

import { UserBadge } from '@/types/gamification';
import BadgeCard from '../badges/BadgeCard';

interface ProfileBadgesProps {
  badges: UserBadge[];
  maxDisplay?: number;
}

export default function ProfileBadges({ badges, maxDisplay = 6 }: ProfileBadgesProps) {
  // Get earned badges only
  const earnedBadges = badges.filter(b => b.is_earned);
  
  // Sort by earned date (most recent first)
  const sortedBadges = [...earnedBadges].sort((a, b) => {
    if (!a.earned_at || !b.earned_at) return 0;
    return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime();
  });
  
  const displayBadges = sortedBadges.slice(0, maxDisplay);
  const remainingCount = earnedBadges.length - maxDisplay;
  
  if (earnedBadges.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8 text-center">
        <i className="fa-solid fa-medal text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
        <p className="text-gray-500 dark:text-gray-400 font-bold">Henüz rozet kazanılmamış</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
          <i className="fa-solid fa-medal"></i>
        </div>
        Rozet Vitrini
        <span className="ml-auto text-sm font-bold text-purple-600 dark:text-purple-400">
          {earnedBadges.length} Rozet
        </span>
      </h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {displayBadges.map((badge) => (
          <BadgeCard key={badge.slug} badge={badge} size="sm" showProgress={false} />
        ))}
        
        {remainingCount > 0 && (
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-4 border-purple-200 dark:border-purple-700 flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400">+{remainingCount}</div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 mt-2">
              Daha Fazla
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
