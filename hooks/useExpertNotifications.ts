'use client';

import { useState, useEffect, useCallback } from 'react';
import { getExpertNotifications, markNotificationsAsRead, Notification } from '@/lib/api';

const POLLING_INTERVAL = 30000; // 30 seconds

export function useExpertNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Token and role validation
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    
    // Don't make API call if user is not pro
    if (!token || role !== 'rejimde_pro') {
      setIsLoading(false);
      return;
    }

    try {
      const result = await getExpertNotifications({ limit: 50 });
      setNotifications(result.notifications || []);
      setUnreadCount(result.unread_count || 0);
    } catch (error) {
      console.warn('Expert notifications API not available:', error);
      // Keep existing state, don't clear
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (ids?: number[]) => {
    const success = await markNotificationsAsRead(ids);
    if (success) {
      await refresh();
    }
  }, [refresh]);

  const markAllAsRead = useCallback(async () => {
    const success = await markNotificationsAsRead();
    if (success) {
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    refresh();

    // Set up polling
    const interval = setInterval(refresh, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [refresh]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
