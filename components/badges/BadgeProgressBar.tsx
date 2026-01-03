'use client';

import { UserBadge } from '@/types/gamification';

interface BadgeProgressBarProps {
  badge: UserBadge;
  compact?: boolean;
}

export default function BadgeProgressBar({ badge, compact = false }: BadgeProgressBarProps) {
  const isEarned = badge.is_earned;
  
  // Tier colors
  const tierColors = {
    bronze: 'text-orange-600 dark:text-orange-400',
    silver: 'text-gray-600 dark:text-gray-400',
    gold: 'text-yellow-600 dark:text-yellow-400',
    platinum: 'text-purple-600 dark:text-purple-400'
  };
  
  const tierBgColors = {
    bronze: 'bg-orange-500',
    silver: 'bg-gray-500',
    gold: 'bg-yellow-500',
    platinum: 'bg-purple-500'
  };
  
  const tierColor = tierColors[badge.tier];
  const tierBg = tierBgColors[badge.tier];
  
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Mini Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEarned ? tierBg : 'bg-gray-300 dark:bg-gray-700'} text-white text-sm shadow-sm shrink-0`}>
          <i className={`fa-solid ${badge.icon || 'fa-medal'}`}></i>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold ${isEarned ? tierColor : 'text-gray-500 dark:text-gray-400'} truncate`}>
              {badge.title}
            </span>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 ml-2 shrink-0">
              {badge.percent}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isEarned ? tierBg : 'bg-blue-500'} transition-all duration-500`}
              style={{ width: `${Math.min(badge.percent, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
      <div className="flex items-start gap-4">
        {/* Badge Icon */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isEarned ? tierBg : 'bg-gray-300 dark:bg-gray-700'} text-white text-2xl shadow-md shrink-0 ${isEarned ? 'scale-100' : 'scale-90 opacity-60'}`}>
          <i className={`fa-solid ${badge.icon || 'fa-medal'}`}></i>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className={`font-extrabold text-sm ${isEarned ? tierColor : 'text-gray-700 dark:text-gray-300'}`}>
                {badge.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {badge.description}
              </p>
            </div>
            {isEarned && (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ml-2">
                ✓ Kazanıldı
              </div>
            )}
          </div>
          
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-600 dark:text-gray-400">
                {badge.progress} / {badge.max_progress}
              </span>
              <span className="font-black text-blue-600 dark:text-blue-400">
                {badge.percent}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isEarned ? tierBg : 'bg-blue-500'} transition-all duration-500`}
                style={{ width: `${Math.min(badge.percent, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
