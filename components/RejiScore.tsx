"use client";

import { useState } from "react";

interface RejiScoreProps {
  score: number; // 0-100 arası
  trustScore: number;
  contributionScore: number;
  freshnessScore: number;
  isVerified: boolean;
  userRating: number; // 1-5 klasik puan
  reviewCount: number;
  contentCount: number;
  trendPercentage: number; // Son 30 gün değişim
  className?: string;
}

// Seviye hesaplama
const getScoreLevel = (score: number): { label: string; color: string; bgColor: string } => {
  if (score >= 90) return { label: "Efsane", color: "text-purple-600", bgColor: "bg-purple-100" };
  if (score >= 80) return { label: "Yüksek Güven", color: "text-green-600", bgColor: "bg-green-100" };
  if (score >= 70) return { label: "İyi", color: "text-blue-600", bgColor: "bg-blue-100" };
  if (score >= 50) return { label: "Gelişiyor", color: "text-yellow-600", bgColor: "bg-yellow-100" };
  return { label: "Yeni", color: "text-gray-500", bgColor: "bg-gray-100" };
};

// Trend ikonu
const getTrendIcon = (percentage: number) => {
  if (percentage > 5) return { icon: "fa-arrow-trend-up", color: "text-green-500" };
  if (percentage < -5) return { icon: "fa-arrow-trend-down", color: "text-red-500" };
  return { icon: "fa-minus", color: "text-gray-400" };
};

export default function RejiScore({
  score,
  trustScore,
  contributionScore,
  freshnessScore,
  isVerified,
  userRating,
  reviewCount,
  contentCount,
  trendPercentage,
  className = "",
}: RejiScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const level = getScoreLevel(score);
  const trend = getTrendIcon(trendPercentage);

  return (
    <div className={`relative ${className}`}>
      {/* Ana Skor Kartı */}
      <div
        className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-100 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-white text-sm"></i>
            </div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">RejiScore</span>
          </div>
          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${level.bgColor} ${level.color}`}>
            {level.label}
          </span>
        </div>

        {/* Büyük Skor */}
        <div className="flex items-end justify-between mb-3">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-gray-800 leading-none">{score}</span>
            <span className="text-lg font-bold text-gray-400 mb-1">/ 100</span>
          </div>
          {trendPercentage !== 0 && (
            <div className={`flex items-center gap-1 text-xs font-bold ${trend.color} mb-1`}>
              <i className={`fa-solid ${trend.icon}`}></i>
              <span>{Math.abs(trendPercentage)}%</span>
            </div>
          )}
        </div>

        {/* Mini İstatistikler */}
        <div className="grid grid-cols-4 gap-2 text-center border-t border-indigo-100 pt-3">
          <div className="group">
            <div className="flex items-center justify-center gap-1 text-red-400 text-xs">
              <i className="fa-solid fa-heart"></i>
              <span className="font-bold text-gray-700">{userRating.toFixed(1)}</span>
            </div>
            <div className="text-[8px] font-bold text-gray-400 uppercase">Memnuniyet</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-yellow-500 text-xs">
              <i className="fa-solid fa-star"></i>
              <span className="font-bold text-gray-700">{reviewCount}</span>
            </div>
            <div className="text-[8px] font-bold text-gray-400 uppercase">Değerlendirme</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-purple-500 text-xs">
              <i className="fa-solid fa-brain"></i>
              <span className="font-bold text-gray-700">{contentCount}</span>
            </div>
            <div className="text-[8px] font-bold text-gray-400 uppercase">Katkı</div>
          </div>
          <div>
            {isVerified ? (
              <>
                <div className="flex items-center justify-center text-green-500 text-xs">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div className="text-[8px] font-bold text-green-600 uppercase">Onaylı</div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center text-gray-300 text-xs">
                  <i className="fa-solid fa-circle-xmark"></i>
                </div>
                <div className="text-[8px] font-bold text-gray-400 uppercase">Bekliyor</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detaylı Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-chart-pie text-indigo-500"></i>
            <span className="font-black text-gray-700 text-sm uppercase">Skor Detayı</span>
          </div>

          <div className="space-y-3">
            {/* Güven Skoru */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <i className="fa-solid fa-heart text-red-400"></i> Kullanıcı Memnuniyeti
                </span>
                <span className="text-xs font-black text-gray-700">{trustScore}/100</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${trustScore}%` }}
                ></div>
              </div>
            </div>

            {/* Katkı Skoru */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <i className="fa-solid fa-brain text-purple-500"></i> Uzman Katkısı
                </span>
                <span className="text-xs font-black text-gray-700">{contributionScore}/100</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${contributionScore}%` }}
                ></div>
              </div>
            </div>

            {/* Güncellik Skoru */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <i className="fa-solid fa-fire text-orange-500"></i> Son Dönem Aktivite
                </span>
                <span className="text-xs font-black text-gray-700">{freshnessScore}/100</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${freshnessScore}%` }}
                ></div>
              </div>
            </div>

            {/* Onay Bonusu */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <i className="fa-solid fa-certificate text-green-500"></i> Onay Bonusu
              </span>
              <span className={`text-xs font-black ${isVerified ? "text-green-600" : "text-gray-400"}`}>
                {isVerified ? "+20 Puan" : "Yok"}
              </span>
            </div>
          </div>

          {/* Footer Bilgi */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-400 text-center font-bold">
            RejiScore, uzmanın güvenilirliğini çok yönlü ölçer
          </div>
        </div>
      )}
    </div>
  );
}
