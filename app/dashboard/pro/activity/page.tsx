'use client';

import { useState, useEffect } from 'react';
import { getExpertActivity, getExpertMetrics, getExpertProfileViewers } from '@/lib/api';
import ActivityItem from '@/components/ActivityItem';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ProActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [viewers, setViewers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [activitiesData, metricsData, viewersData] = await Promise.all([
          getExpertActivity(50),
          getExpertMetrics(7),
          getExpertProfileViewers(5),
        ]);

        setActivities(activitiesData);
        setMetrics(metricsData);
        setViewers(viewersData);
      } catch (error) {
        console.error('Error loading expert activity:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Group activities by date
  const groupedActivities: Record<string, typeof activities> = {};
  activities.forEach((activity) => {
    const date = new Date(activity.created_at);
    let dateLabel: string;

    if (isToday(date)) {
      dateLabel = 'Bugün';
    } else if (isYesterday(date)) {
      dateLabel = 'Dün';
    } else {
      dateLabel = format(date, 'd MMMM yyyy', { locale: tr });
    }

    if (!groupedActivities[dateLabel]) {
      groupedActivities[dateLabel] = [];
    }
    groupedActivities[dateLabel].push(activity);
  });

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-2xl"></i>
            </div>
            <h1 className="text-3xl font-black text-white">Aktiviteler</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <i className="fa-solid fa-eye"></i>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{metrics.profile_views}</p>
                  <p className="text-xs text-slate-400 font-bold">Profil Görüntüleme</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">bu hafta</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">
                    {metrics.rating_average ? metrics.rating_average.toFixed(1) : '0.0'}/5
                  </p>
                  <p className="text-xs text-slate-400 font-bold">Ortalama Puan</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{metrics.rating_count} değerlendirme</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                  <i className="fa-solid fa-newspaper"></i>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{metrics.content_views}</p>
                  <p className="text-xs text-slate-400 font-bold">İçerik Görüntüleme</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">toplam</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{metrics.client_completions}</p>
                  <p className="text-xs text-slate-400 font-bold">Tamamlanan Danışan</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">toplam</p>
            </div>
          </div>
        )}

        {/* Recent Profile Viewers */}
        {viewers.length > 0 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-eye text-blue-400"></i>
              Son Görüntüleyenler
            </h2>
            <div className="flex flex-wrap gap-3">
              {viewers.map((viewer) => (
                <div
                  key={viewer.id}
                  className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2 border border-slate-600"
                >
                  <img
                    src={viewer.avatar}
                    alt={viewer.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{viewer.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(viewer.viewed_at), { addSuffix: true, locale: tr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Timeline */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
            </div>
          ) : Object.keys(groupedActivities).length === 0 ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
              <i className="fa-solid fa-chart-line text-6xl text-slate-600 mb-4"></i>
              <h3 className="text-xl font-bold text-slate-300 mb-2">Aktivite yok</h3>
              <p className="text-slate-400">Henüz hiç aktiviteniz yok.</p>
            </div>
          ) : (
            Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
              <div key={dateLabel}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-slate-700 flex-1"></div>
                  <span className="text-sm font-black text-slate-500 uppercase tracking-wider">
                    {dateLabel}
                  </span>
                  <div className="h-px bg-slate-700 flex-1"></div>
                </div>
                <div className="space-y-3">
                  {dateActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
