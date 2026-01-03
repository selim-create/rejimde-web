'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserTasks } from '@/lib/api';
import { UserTasksResponse } from '@/types/gamification';

export function useTasks() {
  const [tasks, setTasks] = useState<UserTasksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserTasks();
      setTasks(data);
    } catch (err) {
      setError('Görevler yüklenemedi');
      console.error('useTasks error:', err);
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
    tasks,
    isLoading,
    error,
    refresh,
    dailyTasks: tasks?.daily || [],
    weeklyTasks: tasks?.weekly || [],
    monthlyTasks: tasks?.monthly || [],
    circleTasks: tasks?.circle || [],
    summary: tasks?.summary || { completed_today: 0, completed_this_week: 0, completed_this_month: 0 }
  };
}
