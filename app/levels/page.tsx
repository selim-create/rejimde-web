'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { LEVELS } from '@/lib/constants';

export default function LevelsHubPage() {
  const [userScore, setUserScore] = useState(0);
  const [userAvatar, setUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await auth.me();
        if (user) {
            if (auth.getGamificationStats) {
                const stats = await auth.getGamificationStats(); 
                if (stats) {
                    setUserScore(stats.total_score);
                }
            }
            setUserAvatar(user.avatar_url);
        }
      } catch (error) {
        console.error('Level verisi hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentLevelIndex = LEVELS.slice().reverse().findIndex(l => userScore >= l.min);
  const realIndex = currentLevelIndex >= 0 ? (LEVELS.length - 1) - currentLevelIndex : 0;

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sans text-gray-800">
      
      {/* Header */}
      <div className="bg-blue-600 text-white py-12 relative overflow-hidden shadow-md mb-8">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-wide">Rejimde Levels</h1>
              <p className="text-blue-100 font-bold text-lg max-w-xl mx-auto">
                  Begin&apos;den başla, Transform&apos;a yüksel. Her level, yeni bir adım, yeni bir sen.
              </p>
              <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30">
                  <span className="font-bold text-sm uppercase tracking-wider">Toplam Puanın: <span className="text-yellow-300 text-lg">{userScore} XP</span></span>
              </div>
          </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 relative pb-20">
          
          {/* Vertical Line (The Path) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-200 -ml-1 rounded-full z-0"></div>

          <div className="space-y-16 relative z-10 py-8">

              {LEVELS.slice().reverse().map((level, index) => {
                  const levelRealIndex = (LEVELS.length - 1) - index;
                  
                  const isCurrent = levelRealIndex === realIndex;
                  const isPassed = levelRealIndex < realIndex;
                  const isLocked = levelRealIndex > realIndex;

                  return (
                    <div key={level.id} className={`flex flex-col items-center transition duration-300 ${isCurrent ? 'scale-110 relative' : isLocked ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 group' : 'opacity-80'}`}>
                        
                        {isCurrent && (
                            <div className="absolute top-8 left-1/2 -ml-16 w-32 h-32 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                        )}

                        <Link 
                            href={!isLocked ? `/levels/${level.id}` : '#'} 
                            className={`w-32 h-32 rounded-3xl border-4 flex items-center justify-center shadow-lg mb-4 z-10 transition relative
                                ${isCurrent 
                                    ? 'bg-blue-600 border-white shadow-blue-800 cursor-pointer hover:-translate-y-2' // Aktifse Mavi
                                    : isPassed 
                                        ? 'bg-white border-white cursor-pointer hover:-translate-y-1' // Geçildiyse Beyaz
                                        : 'bg-white border-gray-300 cursor-not-allowed group-hover:border-blue-400 group-hover:shadow-blue-200 group-hover:scale-110' // Kilitliyse Beyaz/Gri
                                }
                            `}
                        >
                            <i className={`fa-solid ${level.icon} text-6xl ${isCurrent ? 'text-white' : level.color}`}></i>
                            
                            {isCurrent && (
                                <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden">
                                    <img src={userAvatar || `https://api.dicebear.com/9.x/personas/svg?seed=User`} className="w-full h-full object-cover" alt="Me" />
                                </div>
                            )}

                            {isPassed && (
                                <div className="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white text-sm translate-x-2 translate-y-2 shadow-sm">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                            )}
                            
                            {isLocked && (
                                <div className="absolute bottom-0 right-0 bg-gray-400 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white text-sm translate-x-2 translate-y-2 shadow-sm">
                                    <i className="fa-solid fa-lock"></i>
                                </div>
                            )}
                        </Link>

                        {isCurrent ? (
                            <div className="bg-blue-600 text-white px-8 py-4 rounded-xl shadow-lg text-center relative z-10 w-64">
                                <span className="absolute -top-3 left-1/2 -ml-3 w-6 h-6 bg-blue-600 transform rotate-45"></span>
                                <h3 className="text-2xl font-black uppercase">{level.name}</h3>
                                <p className="text-sm font-bold text-blue-100 mb-2">Mevcut Level&apos;ın</p>
                                <p className="text-xs text-blue-200 mb-3 italic">{level.description}</p>
                                <div className="inline-block bg-black/20 px-3 py-1 rounded text-xs font-bold mb-3">
                                    <i className="fa-solid fa-trophy mr-1"></i> Level {level.level}
                                </div>
                                <div>
                                    <Link href={`/levels/${level.id}`} className="block w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-extrabold text-xs uppercase hover:bg-blue-50 transition shadow-sm">
                                        Detayları Gör
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white px-6 py-3 rounded-xl border-2 border-gray-200 text-center shadow-sm w-48">
                                <h3 className={`text-lg font-black uppercase ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>{level.name}</h3>
                                <p className="text-xs text-gray-400 mb-1">Level {level.level}</p>
                                {isLocked && <p className="text-xs font-bold text-gray-400 mt-1">{level.min} XP Gerekli</p>}
                                {isPassed && <p className="text-xs font-bold text-green-500 mt-1">Tamamlandı</p>}
                            </div>
                        )}
                    </div>
                  );
              })}

          </div>

      </div>
    </div>
  );
}
