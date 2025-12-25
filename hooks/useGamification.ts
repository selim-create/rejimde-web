'use client';

import { useState, useCallback } from 'react';
import { dispatchEvent, EventResponse } from '@/lib/api';

interface UseGamificationReturn {
  dispatchAction: (eventType: string, entityType?: string | null, entityId?: number, context?: Record<string, any>) => Promise<EventResponse>;
  isLoading: boolean;
  lastResult: EventResponse | null;
  showToast: boolean;
  closeToast: () => void;
}

export function useGamification(): UseGamificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<EventResponse | null>(null);
  const [showToast, setShowToast] = useState(false);

  const dispatchAction = useCallback(async (
    eventType: string,
    entityType?: string | null,
    entityId?: number,
    context?: Record<string, any>
  ): Promise<EventResponse> => {
    setIsLoading(true);
    
    try {
      const result = await dispatchEvent(eventType, entityType, entityId, context);
      setLastResult(result);
      
      if (result.success && result.points_earned > 0) {
        setShowToast(true);
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    dispatchAction,
    isLoading,
    lastResult,
    showToast,
    closeToast
  };
}
