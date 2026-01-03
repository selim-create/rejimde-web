'use client';

import { UserBadge, BadgeTier } from '@/types/gamification';

interface BadgeCardProps {
  badge: UserBadge;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function BadgeCard({ badge, size = 'md', showProgress = true }: BadgeCardProps) {
  const isEarned = badge.is_earned;
  
  // Tier gradient colors
  const tierGradients: Record<BadgeTier, string> = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600'
  };
  
  const tierBorderColors: Record<BadgeTier, string> = {
    bronze: 'border-orange-300',
    silver: 'border-gray-300',
    gold: 'border-yellow-300',
    platinum: 'border-purple-300'
  };
  
  const gradient = tierGradients[badge.tier] || tierGradients.bronze;
  const borderColor = tierBorderColors[badge.tier] || tierBorderColors.bronze;
  
  // Size classes
  const sizeClasses = {
    sm: { container: 'w-20 h-20', icon: 'text-3xl', title: 'text-[10px]' },
    md: { container: 'w-24 h-24', icon: 'text-4xl', title: 'text-xs' },
    lg: { container: 'w-32 h-32', icon: 'text-5xl', title: 'text-sm' }
  };
  
  const sizeClass = sizeClasses[size];
  
  // Progress ring
  const strokeDasharray = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * badge.percent) / 100;
  
  return (
    <div className="group relative flex flex-col items-center">
      {/* Badge Container */}
      <div className={`relative ${sizeClass.container} mb-3 transition-all duration-300 ${isEarned ? 'scale-100 hover:scale-110 cursor-pointer' : 'scale-90 opacity-50 cursor-not-allowed'}`}>
        {/* Progress Ring (for unearned badges) */}
        {!isEarned && showProgress && badge.progress > 0 && (
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`text-${badge.tier === 'gold' ? 'yellow' : badge.tier === 'silver' ? 'gray' : badge.tier === 'platinum' ? 'purple' : 'orange'}-500 transition-all duration-500`}
            />
          </svg>
        )}
        
        {/* Badge Icon/Image */}
        <div className={`absolute inset-0 rounded-full flex items-center justify-center ${isEarned ? `bg-gradient-to-br ${gradient}` : 'bg-gray-200 dark:bg-gray-700'} border-4 ${isEarned ? borderColor : 'border-gray-300 dark:border-gray-600'} shadow-lg`}>
          {badge.icon ? (
            <div className={`${sizeClass.icon} ${isEarned ? 'text-white' : 'text-gray-400 dark:text-gray-500'} drop-shadow-md`}>
              <i className={`fa-solid ${badge.icon}`}></i>
            </div>
          ) : (
            <i className={`fa-solid fa-medal ${sizeClass.icon} ${isEarned ? 'text-white' : 'text-gray-400'}`}></i>
          )}
        </div>
        
        {/* Lock Icon for unearned */}
        {!isEarned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gray-800/80 w-10 h-10 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-lock text-white text-sm"></i>
            </div>
          </div>
        )}
        
        {/* Earned Date Badge */}
        {isEarned && badge.earned_at && size === 'lg' && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white dark:border-gray-800 w-8 h-8 rounded-full flex items-center justify-center shadow-md">
            <i className="fa-solid fa-check text-white text-xs"></i>
          </div>
        )}
      </div>
      
      {/* Badge Title */}
      <span className={`${sizeClass.title} font-black uppercase text-center leading-tight px-1 ${isEarned ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'} max-w-full`}>
        {badge.title}
      </span>
      
      {/* Progress Percentage (for unearned) */}
      {!isEarned && showProgress && badge.progress > 0 && (
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
          {badge.percent}%
        </span>
      )}
      
      {/* Tooltip on Hover */}
      <div className="absolute bottom-full mb-3 hidden group-hover:block w-56 bg-gray-900 dark:bg-gray-950 text-white text-xs p-4 rounded-xl z-50 text-center pointer-events-none shadow-2xl transform -translate-x-1/2 left-1/2">
        <div className="mb-2">
          <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase bg-gradient-to-r ${gradient}`}>
            {badge.tier}
          </span>
        </div>
        <p className="font-bold text-yellow-400 mb-2 text-sm">{badge.title}</p>
        <p className="text-[11px] font-medium opacity-90 leading-snug mb-3">{badge.description}</p>
        
        {!isEarned && (
          <div className="bg-white/10 rounded-lg p-2">
            <div className="flex justify-between items-center text-[10px] mb-1">
              <span className="opacity-70">İlerleme:</span>
              <span className="font-bold">{badge.progress} / {badge.max_progress}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-green-400 h-full rounded-full transition-all"
                style={{ width: `${badge.percent}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {isEarned && badge.earned_at && (
          <div className="bg-green-500/20 rounded-lg px-3 py-1 text-[10px] font-bold text-green-300">
            ✓ {new Date(badge.earned_at).toLocaleDateString('tr-TR')}
          </div>
        )}
        
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -ml-2 w-4 h-4 bg-gray-900 dark:bg-gray-950 transform rotate-45"></div>
      </div>
    </div>
  );
}
