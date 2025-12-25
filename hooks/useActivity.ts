'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserActivity, ActivityItem } from '@/lib/api';

export function useActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadActivities = useCallback(async (reset = false) => {
    setIsLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      const result = await getUserActivity({
        limit: 20,
        offset: newOffset,
        filter: filter === 'all' ? undefined : filter,
      });

      if (reset) {
        setActivities(result);
        setOffset(result.length);
      } else {
        setActivities(prev => [...prev, ...result]);
        setOffset(prev => prev + result.length);
      }

      setHasMore(result.length === 20);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, offset]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadActivities(false);
    }
  }, [isLoading, hasMore, loadActivities]);

  useEffect(() => {
    setOffset(0);
    loadActivities(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return {
    activities,
    isLoading,
    loadMore,
    filter,
    setFilter,
    hasMore,
  };
}
