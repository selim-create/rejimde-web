"use client";

import { ReviewStatsData } from "@/types/expert-reviews";

interface ReviewStatsProps {
  stats: ReviewStatsData | null;
}

const renderStars = (score: number, size = "text-lg") => {
  return (
    <div className={`flex ${size} text-yellow-400 gap-0.5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i 
          key={star} 
          className={`fa-star ${star <= Math.round(score) ? 'fa-solid' : 'fa-regular text-gray-200'}`}
        ></i>
      ))}
    </div>
  );
};

export default function ReviewStats({ stats }: ReviewStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-black text-gray-800 mb-6">Değerlendirme İstatistikleri</h2>
        <p className="text-gray-400 text-center py-8">Henüz değerlendirme yok.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
      
      <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3 relative z-10">
        <span className="bg-yellow-100 text-yellow-600 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-yellow-200">
          <i className="fa-solid fa-star"></i>
        </span>
        Danışan Değerlendirmeleri
      </h2>

      <div className="flex flex-col md:flex-row gap-10 items-center mb-8">
        {/* Average Rating */}
        <div className="text-center md:text-left shrink-0 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 min-w-[180px] flex flex-col items-center">
          <div className="text-6xl font-black text-gray-800 leading-none tracking-tighter">
            {stats.average.toFixed(1)}
          </div>
          <div className="my-2">{renderStars(stats.average)}</div>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-wide bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
            {stats.total} Yorum
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 w-full space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const dist = stats.distribution?.[star] || { count: 0, percent: 0 };
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                <span className="w-4 font-black">{star}</span> 
                <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${dist.percent}%`, 
                      opacity: dist.percent > 0 ? 1 : 0.3 
                    }}
                  ></div>
                </div>
                <span className="w-8 text-right font-black text-gray-700">{dist.percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extended Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
              <i className="fa-solid fa-user-check text-lg"></i>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">{stats.verifiedClientCount}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Onaylı Danışan</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
              <i className="fa-solid fa-calendar-days text-lg"></i>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">{stats.averageProcessDuration}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Ort. Süreç (Hafta)</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
              <i className="fa-solid fa-bullseye text-lg"></i>
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">%{stats.successRate}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase">Hedef Başarısı</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
