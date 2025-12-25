'use client';

import { useState, useEffect } from 'react';

interface PointsToastProps {
  points: number;
  message?: string;
  onClose: () => void;
}

export default function PointsToast({ points, message, onClose }: PointsToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Animation duration
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (points === 0) return null;

  return (
    <div
      className={`fixed bottom-20 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
        <div className="text-3xl animate-bounce">🎉</div>
        <div>
          <div className="text-2xl font-black">+{points} Puan!</div>
          {message && <div className="text-sm opacity-90">{message}</div>}
        </div>
      </div>
    </div>
  );
}
