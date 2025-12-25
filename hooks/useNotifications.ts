'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationsAsRead, Notification } from '@/lib/api';

const POLLING_INTERVAL = 30000; // 30 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Token yoksa API çağrısı yapma
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await getNotifications({ limit: 50 });
      setNotifications(result.notifications || []);
      setUnreadCount(result.unread_count || 0);
    } catch (error) {
      // API mevcut değilse veya hata varsa sessizce devam et
      console.warn('Notifications API not available:', error);
      setNotifications([]);
      setUnreadCount(0);
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
