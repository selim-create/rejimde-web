'use client';

import { useEffect, useState } from 'react';

interface PointsToastProps {
  points: number;
  message: string;
  streak?: { current: number; is_milestone: boolean; bonus: number } | null;
  milestone?: { type: string; value: number; points: number } | null;
  onClose: () => void;
}

export default function PointsToast({ points, message, streak, milestone, onClose }: PointsToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-100 p-4 min-w-[280px] max-w-[350px]">
        {/* Points */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl font-black">
            +{points}
          </div>
          <div>
            <p className="font-bold text-gray-800">{message}</p>
            <p className="text-xs text-gray-400 font-bold">Puan kazandın!</p>
          </div>
        </div>

        {/* Streak Milestone */}
        {streak?.is_milestone && streak.bonus > 0 && (
          <div className="mt-3 bg-orange-50 rounded-xl p-3 flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <p className="font-bold text-orange-600">{streak.current} Gün Serisi!</p>
              <p className="text-xs text-orange-500">+{streak.bonus} bonus puan</p>
            </div>
          </div>
        )}

        {/* Comment Like Milestone */}
        {milestone && (
          <div className="mt-3 bg-purple-50 rounded-xl p-3 flex items-center gap-3">
            <div className="text-2xl">⭐</div>
            <div>
              <p className="font-bold text-purple-600">{milestone.value} Beğeni!</p>
              <p className="text-xs text-purple-500">+{milestone.points} puan kazandın</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
