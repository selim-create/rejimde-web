'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { LEVELS, getLevelBySlug, getLevelByScore } from '@/lib/constants';

export default function LevelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [userScore, setUserScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const level = getLevelBySlug(slug);
  
  useEffect(() => {
    if (!level) {
      router.push('/levels');
      return;
    }
    
    const fetchData = async () => {
      try {
        const user = await auth.me();
        if (user) {
          setUserScore(user.total_score || 0);
        }
      } catch (error) {
        console.error('Veri hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level, router]);

  if (!level) {
    return null;
  }

  const currentLevel = getLevelByScore(userScore);
  const isCurrentLevel = currentLevel.id === level.id;
  const isUnlocked = userScore >= level.min;
  const progress = isUnlocked ? 100 : Math.min(100, (userScore / level.min) * 100);

  const prevLevel = LEVELS.find(l => l.level === level.level - 1);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Header */}
      <div className={`${level.bgColor} py-16 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(currentColor 2px, transparent 2px)', backgroundSize: '20px 20px'}}></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <Link href="/levels" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition">
            <i className="fa-solid fa-arrow-left"></i>
            <span className="font-bold">Tüm Levels</span>
          </Link>
          
          <div className={`w-24 h-24 mx-auto rounded-2xl ${level.bgColor} border-4 border-white shadow-xl flex items-center justify-center mb-6`}>
            <i className={`fa-solid ${level.icon} text-4xl ${level.color}`}></i>
          </div>
          
          <p className={`text-sm font-black uppercase tracking-wider ${level.color} mb-2`}>Level {level.level}</p>
          <h1 className={`text-4xl md:text-5xl font-black ${level.color} mb-4`}>{level.name}</h1>
          <p className="text-gray-600 font-bold text-lg max-w-xl mx-auto">
            {level.description}
          </p>
          
          {isCurrentLevel && (
            <div className="mt-6 inline-block bg-green-500 text-white px-6 py-2 rounded-full font-black shadow-lg">
              <i className="fa-solid fa-star mr-2"></i>
              Şu anki Level&apos;ın
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-600">İlerleme</span>
            <span className={`font-black ${level.color}`}>{Math.round(progress)}%</span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${level.bgColor} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{level.min} puan</span>
            <span className="font-bold">Şu an: {userScore} puan</span>
            <span>{level.max} puan</span>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-black text-gray-800 mb-4">Bu Level&apos;a Ulaşmak İçin</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <i className={`fa-solid fa-circle-check ${isUnlocked ? 'text-green-500' : 'text-gray-300'}`}></i>
              <span className={isUnlocked ? 'text-gray-800' : 'text-gray-500'}>
                Minimum {level.min} puan topla
              </span>
            </li>
            <li className="flex items-center gap-3">
              <i className="fa-solid fa-lightbulb text-yellow-500"></i>
              <span className="text-gray-600">
                Günlük görevleri tamamla, egzersiz yap, diyet takip et
              </span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {prevLevel ? (
            <Link 
              href={`/levels/${prevLevel.slug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span className="font-bold">{prevLevel.name}</span>
            </Link>
          ) : <div></div>}
          
          {nextLevel && (
            <Link 
              href={`/levels/${nextLevel.slug}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${nextLevel.bgColor} hover:opacity-80 transition`}
            >
              <span className={`font-bold ${nextLevel.color}`}>{nextLevel.name}</span>
              <i className={`fa-solid fa-arrow-right ${nextLevel.color}`}></i>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
