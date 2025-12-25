'use client';

import { useState, useCallback } from 'react';
import { EventResponse } from '@/lib/events';

interface PointsState {
  lastEarned: number;
  lastMessage: string;
  showToast: boolean;
}

export function usePoints() {
  const [state, setState] = useState<PointsState>({
    lastEarned: 0,
    lastMessage: '',
    showToast: false
  });

  const handleEventResponse = useCallback((response: EventResponse) => {
    if (response.status === 'success' && response.data) {
      const { awarded_points_total, messages } = response.data;
      
      if (awarded_points_total > 0) {
        setState({
          lastEarned: awarded_points_total,
          lastMessage: messages?.[0] || '',
          showToast: true
        });
      }
    }
  }, []);

  const hideToast = useCallback(() => {
    setState(prev => ({ ...prev, showToast: false }));
  }, []);

  return {
    ...state,
    handleEventResponse,
    hideToast
  };
}
