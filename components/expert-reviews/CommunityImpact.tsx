"use client";

import { CommunityImpactData } from "@/types/expert-reviews";

interface CommunityImpactProps {
  data: CommunityImpactData | null;
}

export default function CommunityImpact({ data }: CommunityImpactProps) {
  if (!data) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-[2.5rem] p-8 border-2 border-teal-100 shadow-sm relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-teal-100 rounded-full -mr-20 -mt-20 opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-100 rounded-full -ml-16 -mb-16 opacity-30 pointer-events-none"></div>

      <div className="relative z-10">
        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
          <span className="bg-teal-100 text-teal-600 w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-teal-200">
            <i className="fa-solid fa-heart-pulse"></i>
          </span>
          Topluluk Etkisi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Total Clients */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 shrink-0 shadow-sm">
                <i className="fa-solid fa-users text-2xl"></i>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-800">
                  {data.totalClientsSupported}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase">
                  Danışana Destek Verdi
                </div>
              </div>
            </div>
          </div>

          {/* Completed Programs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-cyan-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600 shrink-0 shadow-sm">
                <i className="fa-solid fa-clipboard-check text-2xl"></i>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-800">
                  {data.programsCompleted}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase">
                  Program Tamamlandı
                </div>
              </div>
            </div>
          </div>

          {/* Average Journey */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                <i className="fa-solid fa-calendar-days text-2xl"></i>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-800">
                  {data.averageJourneyWeeks}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase">
                  Ortalama Yolculuk (Hafta)
                </div>
              </div>
            </div>
          </div>

          {/* Goals Achieved */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0 shadow-sm">
                <i className="fa-solid fa-bullseye text-2xl"></i>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-800">
                  {data.goalsAchieved}
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase">
                  Hedefe Ulaştı
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Message */}
        {data.context && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-teal-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                <i className="fa-solid fa-chart-line text-lg"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700 leading-relaxed">
                  {data.context.message}
                </p>
                {data.context.highlight && (
                  <p className="text-xs font-black text-teal-600 mt-2 uppercase">
                    {data.context.highlight}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
