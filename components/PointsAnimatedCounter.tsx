'use client';

import { useState, useEffect } from 'react';

interface PointsAnimatedCounterProps {
  value: number;
  className?: string;
}

export default function PointsAnimatedCounter({ value, className = '' }: PointsAnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (displayValue === value) return;

    const diff = value - displayValue;
    const step = diff > 0 ? Math.ceil(diff / 20) : Math.floor(diff / 20);
    
    const interval = setInterval(() => {
      setDisplayValue((prev) => {
        const next = prev + step;
        if ((step > 0 && next >= value) || (step < 0 && next <= value)) {
          clearInterval(interval);
          return value;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [value, displayValue]);

  return (
    <span className={className}>
      {displayValue.toLocaleString('tr-TR')}
    </span>
  );
}
