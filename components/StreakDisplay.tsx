'use client';

import { useState, useEffect } from 'react';
import { getUserStreak } from '@/lib/api';

interface StreakDisplayProps {
  compact?: boolean;
  className?: string;
}

export default function StreakDisplay({ compact = false, className = '' }: StreakDisplayProps) {
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStreak() {
      const data = await getUserStreak();
      setStreak(data);
      setLoading(false);
    }
    loadStreak();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-xl h-16 w-32"></div>;
  }

  if (!streak || streak.current_count === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1.5 rounded-xl font-bold text-sm ${className}`}>
        <i className="fa-solid fa-fire"></i>
        <span>{streak.current_count} gün</span>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-orange-100 text-xs font-bold uppercase mb-1">Serin</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black">{streak.current_count}</span>
            <span className="text-orange-100 font-bold">gün</span>
          </div>
        </div>
        <div className="text-5xl">🔥</div>
      </div>
      
      {streak.grace_remaining < 2 && (
        <div className="mt-3 bg-white/20 rounded-lg px-3 py-2 text-xs font-bold">
          <i className="fa-solid fa-shield mr-2"></i>
          {streak.grace_remaining} telafi hakkın kaldı
        </div>
      )}
      
      {streak.longest_count > streak.current_count && (
        <div className="mt-2 text-orange-100 text-xs font-bold">
          En uzun: {streak.longest_count} gün
        </div>
      )}
    </div>
  );
}
