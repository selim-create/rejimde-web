'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserBadges } from '@/lib/api';
import { UserBadgesResponse } from '@/types/gamification';

export function useBadges() {
  const [badges, setBadges] = useState<UserBadgesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserBadges();
      setBadges(data);
    } catch (err) {
      setError('Rozetler yüklenemedi');
      console.error('useBadges error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (token) {
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [refresh]);

  return {
    badges,
    isLoading,
    error,
    refresh,
    allBadges: badges?.badges || [],
    byCategory: badges?.by_category || { behavior: [], discipline: [], social: [], milestone: [] },
    recentlyEarned: badges?.recently_earned || [],
    stats: badges?.stats || { total_earned: 0, total_available: 0, percent_complete: 0 }
  };
}
