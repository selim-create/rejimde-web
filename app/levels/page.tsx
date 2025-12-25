'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { LEVELS, getLevelByScore } from '@/lib/constants';

export default function LevelsPage() {
  const [userScore, setUserScore] = useState(0);
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await auth.me();
        if (user) {
          // Try to get score from gamification stats first
          if (auth.getGamificationStats) {
            const stats = await auth.getGamificationStats();
            if (stats && stats.total_score !== undefined) {
              setUserScore(stats.total_score);
            }
          }
          setUserAvatar(user.avatar_url || '');
        }
      } catch (error) {
        console.error('Level verisi hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentLevel = getLevelByScore(userScore);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans text-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 relative overflow-hidden shadow-md mb-8">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-wide">Rejimde Levels</h1>
          <p className="text-purple-100 font-bold text-lg max-w-xl mx-auto">
            Begin&apos;den başla, Transform&apos;a yüksel. Her adım seni daha güçlü yapar.
          </p>
          <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30">
            <span className="font-bold">Şu anki Level: </span>
            <span className={`font-black ${currentLevel.color}`}>{currentLevel.name}</span>
            <span className="ml-2 text-sm opacity-75">({userScore} puan)</span>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LEVELS.map((level) => {
            const isCurrentLevel = currentLevel.id === level.id;
            const isUnlocked = userScore >= level.min;
            
            return (
              <Link 
                href={`/levels/${level.slug}`} 
                key={level.id}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isCurrentLevel 
                    ? `${level.bgColor} border-current ${level.color} shadow-lg scale-105` 
                    : isUnlocked 
                      ? 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md' 
                      : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                {isCurrentLevel && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                    SEN BURADASIN
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl ${level.bgColor} flex items-center justify-center`}>
                    <i className={`fa-solid ${level.icon} text-2xl ${level.color}`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Level {level.level}</span>
                    </div>
                    <h3 className={`text-xl font-black ${isCurrentLevel ? level.color : 'text-gray-800'}`}>
                      {level.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {level.min} - {level.max} puan
                    </p>
                  </div>
                  {isUnlocked && (
                    <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                  {level.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
