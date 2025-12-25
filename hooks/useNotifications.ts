'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationsAsRead, Notification } from '@/lib/api';

const POLLING_INTERVAL = 30000; // 30 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const result = await getNotifications({ limit: 50 });
      setNotifications(result.notifications);
      setUnreadCount(result.unread_count);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
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
