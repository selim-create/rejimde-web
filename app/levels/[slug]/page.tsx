'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLevelLeaderboard, type LevelLeaderboardData, type LeaderboardUser, type LeaderboardCircle, getGamificationStats } from '@/lib/api';
import { LEVELS, getLevelBySlug, getLevelByScore } from '@/lib/constants';

// Helper function for safe avatar URL
function getSafeAvatarUrl(url: string | null, seed: string): string {
  if (url && url.startsWith('http')) return url;
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

// Helper function to get level gradient colors
function getLevelGradientColors(bgColor: string): { from: string; to: string } {
  const colorMap: Record<string, { from: string; to: string }> = {
    'bg-gray-100': { from: '#9ca3af', to: '#6b7280' },
    'bg-orange-100': { from: '#f97316', to: '#ea580c' },
    'bg-green-100': { from: '#22c55e', to: '#16a34a' },
    'bg-blue-100': { from: '#3b82f6', to: '#2563eb' },
    'bg-red-100': { from: '#ef4444', to: '#dc2626' },
    'bg-teal-100': { from: '#14b8a6', to: '#0d9488' },
    'bg-yellow-100': { from: '#eab308', to: '#ca8a04' },
    'bg-purple-100': { from: '#a855f7', to: '#9333ea' },
  };
  
  return colorMap[bgColor] || { from: '#a855f7', to: '#9333ea' };
}

// Type guard for LeaderboardUser
function isLeaderboardUser(item: LeaderboardUser | LeaderboardCircle): item is LeaderboardUser {
  return 'avatar' in item && 'is_current_user' in item;
}

// Type guard for LeaderboardCircle
function isLeaderboardCircle(item: LeaderboardUser | LeaderboardCircle): item is LeaderboardCircle {
  return 'logo' in item && 'member_count' in item;
}

// Countdown Timer Component
function CountdownTimer({ timestamp }: { timestamp: number }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = timestamp - now;
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      
      setTimeLeft({ days, hours, minutes });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
      <i className="fa-solid fa-clock text-white/80"></i>
      <span className="font-mono font-bold text-white">
        {timeLeft.days}G : {String(timeLeft.hours).padStart(2, '0')}S : {String(timeLeft.minutes).padStart(2, '0')}D
      </span>
    </div>
  );
}

export default function LevelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [leaderboardData, setLeaderboardData] = useState<LevelLeaderboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'circles'>('users');
  const [loading, setLoading] = useState(true);
  const [userScore, setUserScore] = useState(0);

  const level = getLevelBySlug(slug);
  
  useEffect(() => {
    if (!level) {
      router.push('/levels');
      return;
    }
    
    const fetchData = async () => {
      try {
        // Fetch leaderboard data
        const data = await getLevelLeaderboard(slug, activeTab);
        setLeaderboardData(data);
        
        // Fetch user stats
        const stats = await getGamificationStats();
        if (stats && stats.total_score !== undefined) {
          setUserScore(stats.total_score);
        }
      } catch (error) {
        console.error('Veri hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [level, router, slug, activeTab]);

  if (!level) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  const currentLevel = getLevelByScore(userScore);
  const isCurrentLevel = currentLevel.id === level.id;

  const prevLevel = LEVELS.find(l => l.level === level.level - 1);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);

  const leaderboardItems = activeTab === 'users' ? (leaderboardData?.users || []) : (leaderboardData?.circles || []);
  const topThree = leaderboardItems.slice(0, 3);
  const restOfList = leaderboardItems.slice(3);

  const gradientColors = getLevelGradientColors(level.bgColor);

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header with Gradient */}
      <div className="py-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%)`
        }}>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(white 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <Link href="/levels" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition">
            <i className="fa-solid fa-arrow-left"></i>
            <span className="font-bold">Tüm Levels</span>
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl ${level.bgColor} border-4 border-white shadow-xl flex items-center justify-center animate-bounce`}>
              <i className={`fa-solid ${level.icon} text-3xl ${level.color}`}></i>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-black uppercase tracking-wider text-white/80 mb-1">Level {level.level}</p>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{level.name}</h1>
              <p className="text-white/90 font-medium text-lg max-w-2xl">
                {level.description}
              </p>
            </div>

            {leaderboardData && (
              <CountdownTimer timestamp={leaderboardData.period_ends_timestamp} />
            )}
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Level Navigation (Hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-4">
              <h3 className="font-black text-gray-800 mb-4 text-sm uppercase tracking-wider">Tüm Levels</h3>
              <div className="space-y-2">
                {LEVELS.map((lvl) => {
                  const isActive = lvl.id === level.id;
                  const isUserLevel = currentLevel.id === lvl.id;
                  const isUnlocked = userScore >= lvl.min;
                  
                  return (
                    <Link
                      key={lvl.id}
                      href={`/levels/${lvl.slug}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition ${
                        isActive 
                          ? `${lvl.bgColor} ${lvl.color} scale-105 shadow-md` 
                          : isUnlocked
                            ? 'hover:bg-gray-50'
                            : 'opacity-40'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${lvl.bgColor} flex items-center justify-center shrink-0`}>
                        <i className={`fa-solid ${lvl.icon} ${lvl.color}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm truncate ${isActive ? lvl.color : 'text-gray-800'}`}>
                          {lvl.name}
                        </p>
                        <p className="text-xs text-gray-500">{lvl.min}-{lvl.max}P</p>
                      </div>
                      {isUserLevel && (
                        <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center - Leaderboard */}
          <div className="lg:col-span-6">
            {/* Tab System */}
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6 flex gap-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition ${
                  activeTab === 'users'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-user mr-2"></i>
                Bireysel
              </button>
              <button
                onClick={() => setActiveTab('circles')}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition ${
                  activeTab === 'circles'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-users mr-2"></i>
                Circle&apos;lar
              </button>
            </div>

            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h2 className="font-black text-gray-800 mb-6 text-center text-xl">🏆 Top 3 Podium</h2>
                <div className="flex items-end justify-center gap-4">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative mb-3">
                      <img
                        src={
                          isLeaderboardUser(topThree[1])
                            ? getSafeAvatarUrl(topThree[1].avatar, topThree[1].name)
                            : topThree[1].logo || getSafeAvatarUrl(null, topThree[1].name)
                        }
                        alt={topThree[1].name}
                        className="w-16 h-16 rounded-full border-4 border-gray-300 shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white shadow">
                        <span className="text-sm font-black">2</span>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-center mb-1 truncate w-full">{topThree[1].name}</p>
                    <p className="text-xs text-gray-500 font-bold">{topThree[1].score}P</p>
                    <div className="w-full h-24 bg-gray-100 rounded-t-xl mt-3 flex items-center justify-center">
                      <i className="fa-solid fa-medal text-3xl text-gray-400"></i>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative mb-3">
                      <img
                        src={
                          isLeaderboardUser(topThree[0])
                            ? getSafeAvatarUrl(topThree[0].avatar, topThree[0].name)
                            : topThree[0].logo || getSafeAvatarUrl(null, topThree[0].name)
                        }
                        alt={topThree[0].name}
                        className="w-20 h-20 rounded-full border-4 border-yellow-500 shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                        <i className="fa-solid fa-crown text-white text-xs"></i>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-center mb-1 truncate w-full">{topThree[0].name}</p>
                    <p className="text-xs text-yellow-600 font-bold">{topThree[0].score}P</p>
                    <div className="w-full h-32 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-xl mt-3 flex items-center justify-center">
                      <i className="fa-solid fa-trophy text-4xl text-yellow-600"></i>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative mb-3">
                      <img
                        src={
                          isLeaderboardUser(topThree[2])
                            ? getSafeAvatarUrl(topThree[2].avatar, topThree[2].name)
                            : topThree[2].logo || getSafeAvatarUrl(null, topThree[2].name)
                        }
                        alt={topThree[2].name}
                        className="w-16 h-16 rounded-full border-4 border-orange-300 shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-300 rounded-full flex items-center justify-center border-2 border-white shadow">
                        <span className="text-sm font-black">3</span>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-center mb-1 truncate w-full">{topThree[2].name}</p>
                    <p className="text-xs text-gray-500 font-bold">{topThree[2].score}P</p>
                    <div className="w-full h-20 bg-orange-100 rounded-t-xl mt-3 flex items-center justify-center">
                      <i className="fa-solid fa-award text-3xl text-orange-400"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {restOfList.map((item) => {
                  const isPromotion = item.zone === 'promotion';
                  const isRelegation = item.zone === 'relegation';
                  const isCurrentUser = isLeaderboardUser(item) && item.is_current_user;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 transition ${
                        isCurrentUser
                          ? 'bg-blue-50/50 border-l-4 border-blue-500'
                          : isPromotion
                            ? 'bg-green-50 border-l-4 border-green-100'
                            : isRelegation
                              ? 'bg-red-50 border-l-4 border-red-100'
                              : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 text-center font-black ${
                        isCurrentUser ? 'text-blue-900' : isPromotion ? 'text-green-600' : isRelegation ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {item.rank}
                      </div>
                      
                      <img
                        src={
                          isLeaderboardUser(item)
                            ? getSafeAvatarUrl(item.avatar, item.name)
                            : item.logo || getSafeAvatarUrl(null, item.name)
                        }
                        alt={item.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold truncate ${isCurrentUser ? 'text-blue-900' : 'text-gray-800'}`}>
                          {item.name}
                        </p>
                        {isLeaderboardCircle(item) && (
                          <p className="text-xs text-gray-500">
                            <i className="fa-solid fa-users text-gray-400 mr-1"></i>
                            {item.member_count} üye
                          </p>
                        )}
                      </div>
                      
                      <div className={`font-black ${
                        isCurrentUser ? 'text-blue-900' : isPromotion ? 'text-green-600' : isRelegation ? 'text-red-500' : 'text-gray-600'
                      }`}>
                        {item.score}P
                      </div>

                      {isPromotion && (
                        <i className="fa-solid fa-arrow-up text-green-600"></i>
                      )}
                      {isRelegation && (
                        <i className="fa-solid fa-arrow-down text-red-500"></i>
                      )}
                    </div>
                  );
                })}
              </div>

              {leaderboardItems.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <i className="fa-solid fa-inbox text-4xl mb-4"></i>
                  <p className="font-bold">Henüz sıralama yok</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Rules & Info */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Champion Reward */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <i className="fa-solid fa-trophy text-3xl text-yellow-300"></i>
                  <h3 className="font-black text-lg">Şampiyon Ödülü</h3>
                </div>
                <p className="text-purple-100 text-sm mb-3">
                  Bu level&apos;da 1. olan kullanıcı özel rozet ve bonus puan kazanır!
                </p>
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <p className="font-black text-2xl text-yellow-300">+500P</p>
                  <p className="text-xs text-purple-100">Bonus Puan</p>
                </div>
              </div>

              {/* Level Rules */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-purple-600"></i>
                  Level Kuralları
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-bold text-green-600 mb-1">
                      <i className="fa-solid fa-arrow-up mr-2"></i>
                      Yükselme ({leaderboardData?.promotion_count || 5} kişi)
                    </p>
                    <p className="text-gray-600 text-xs">İlk {leaderboardData?.promotion_count || 5} kullanıcı bir üst level&apos;a yükselir.</p>
                  </div>
                  <div>
                    <p className="font-bold text-red-500 mb-1">
                      <i className="fa-solid fa-arrow-down mr-2"></i>
                      Düşme ({leaderboardData?.relegation_count || 5} kişi)
                    </p>
                    <p className="text-gray-600 text-xs">Son {leaderboardData?.relegation_count || 5} kullanıcı bir alt level&apos;a düşer.</p>
                  </div>
                </div>
              </div>

              {/* Score Range */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-simple text-purple-600"></i>
                  Puan Aralığı
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum:</span>
                    <span className="font-bold text-gray-800">{level.min}P</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maximum:</span>
                    <span className="font-bold text-gray-800">{level.max}P</span>
                  </div>
                  {leaderboardData?.current_user && (
                    <>
                      <div className="h-px bg-gray-200 my-2"></div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Senin Puanın:</span>
                        <span className="font-black text-purple-600">{leaderboardData.current_user.score}P</span>
                      </div>
                      {leaderboardData.current_user.rank && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sıralaman:</span>
                          <span className="font-bold text-gray-800">#{leaderboardData.current_user.rank}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-3">
                {prevLevel && (
                  <Link
                    href={`/levels/${prevLevel.slug}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition group"
                  >
                    <i className="fa-solid fa-arrow-left text-gray-400 group-hover:text-gray-600"></i>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-bold">Önceki Level</p>
                      <p className="font-black text-gray-800">{prevLevel.name}</p>
                    </div>
                  </Link>
                )}
                {nextLevel && (
                  <Link
                    href={`/levels/${nextLevel.slug}`}
                    className={`flex items-center gap-3 p-4 rounded-xl ${nextLevel.bgColor} hover:opacity-90 transition group`}
                  >
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-bold">Sonraki Level</p>
                      <p className={`font-black ${nextLevel.color}`}>{nextLevel.name}</p>
                    </div>
                    <i className={`fa-solid fa-arrow-right ${nextLevel.color} group-hover:translate-x-1 transition`}></i>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
