'use client';

import { useState, useEffect } from 'react';
import { getMyProfileViewStats, getProfileViewActivity, type ProfileViewStats, type ProfileViewActivity } from '@/lib/api-profile-views';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ProActivityPage() {
  const [stats, setStats] = useState<ProfileViewStats | null>(null);
  const [viewActivity, setViewActivity] = useState<ProfileViewActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          console.error('No token found');
          setIsLoading(false);
          return;
        }

        // Load stats and initial activity
        const [statsData, activityData] = await Promise.all([
          getMyProfileViewStats(token),
          getProfileViewActivity(token, 1, 20),
        ]);

        setStats(statsData);
        setViewActivity(activityData.data);
        setHasMore(activityData.meta.current_page < activityData.meta.total_pages);
      } catch (error) {
        console.error('Error loading profile view data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const loadMore = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      const nextPage = page + 1;
      const activityData = await getProfileViewActivity(token, nextPage, 20);
      
      setViewActivity(prev => [...prev, ...activityData.data]);
      setPage(nextPage);
      setHasMore(activityData.meta.current_page < activityData.meta.total_pages);
    } catch (error) {
      console.error('Error loading more activity:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-6 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-2xl"></i>
            </div>
            <h1 className="text-3xl font-black text-white">Profil Aktivitesi</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* Statistics Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* This Week Card */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <i className="fa-solid fa-calendar-week"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{stats.this_week}</p>
                    <p className="text-xs text-slate-400 font-bold">Bu Hafta</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">profil görüntüleme</p>
              </div>

              {/* This Month Card */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                    <i className="fa-solid fa-calendar-days"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{stats.this_month}</p>
                    <p className="text-xs text-slate-400 font-bold">Bu Ay</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">profil görüntüleme</p>
              </div>

              {/* Member Views Card */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <i className="fa-solid fa-user-check"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{stats.member_views}</p>
                    <p className="text-xs text-slate-400 font-bold">Üye</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">toplam görüntüleme</p>
              </div>

              {/* Guest Views Card */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                    <i className="fa-solid fa-user-secret"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{stats.guest_views}</p>
                    <p className="text-xs text-slate-400 font-bold">Misafir</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">toplam görüntüleme</p>
              </div>
            </div>

            {/* Recent Viewers Section */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-eye text-blue-400"></i>
                Son Görüntüleyenler
              </h2>

              {viewActivity.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fa-solid fa-eye-slash text-4xl text-slate-600 mb-2"></i>
                  <p className="text-slate-400">Henüz görüntülenme yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between bg-slate-700 rounded-xl px-4 py-3 border border-slate-600"
                    >
                      <div className="flex items-center gap-3">
                        {activity.is_member && activity.viewer ? (
                          <>
                            <img
                              src={activity.viewer.avatar}
                              alt={activity.viewer.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-sm font-bold text-white">{activity.viewer.name}</p>
                              <p className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(activity.viewed_at), { addSuffix: true, locale: tr })}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
                              <i className="fa-solid fa-user-secret text-slate-400"></i>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">Anonim Ziyaretçi</p>
                              <p className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(activity.viewed_at), { addSuffix: true, locale: tr })}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        {activity.is_member ? (
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded-full border border-purple-500/30">
                            Üye
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                            Misafir
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <button
                      onClick={loadMore}
                      className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl border border-slate-600 transition"
                    >
                      <i className="fa-solid fa-chevron-down mr-2"></i>
                      Daha Fazla Yükle
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <i className="fa-solid fa-chart-line text-6xl text-slate-600 mb-4"></i>
            <h3 className="text-xl font-bold text-slate-300 mb-2">Veri yüklenemedi</h3>
            <p className="text-slate-400">Profil görüntüleme istatistikleri yüklenirken bir hata oluştu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
