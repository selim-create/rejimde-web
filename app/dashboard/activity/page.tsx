'use client';

import { useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { useActivity } from '@/hooks/useActivity';
import ActivityItem from '@/components/ActivityItem';
import ActivityFilter from '@/components/ActivityFilter';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ActivityPage() {
  const { activities, isLoading, loadMore, filter, setFilter, hasMore } = useActivity();
  const [showPointsOnly, setShowPointsOnly] = useState(false);

  const filteredActivities = showPointsOnly
    ? activities.filter((activity) => activity.points !== 0)
    : activities;

  // Group activities by date
  const groupedActivities: Record<string, typeof activities> = {};
  filteredActivities.forEach((activity) => {
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
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <i className="fa-solid fa-clock-rotate-left text-2xl"></i>
            </div>
            <h1 className="text-3xl font-black text-gray-800">Aktivitelerim</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 mb-6">
          <ActivityFilter filter={filter} onFilterChange={setFilter} />

          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPointsOnly}
                onChange={(e) => setShowPointsOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-bold text-gray-600">Sadece puan hareketleri</span>
            </label>
          </div>
        </div>

        {/* Activities Timeline */}
        <div className="space-y-6">
          {isLoading && filteredActivities.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
            </div>
          ) : Object.keys(groupedActivities).length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
              <i className="fa-solid fa-clock-rotate-left text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                {showPointsOnly ? 'Puan hareketi yok' : 'Aktivite yok'}
              </h3>
              <p className="text-gray-500">
                {showPointsOnly
                  ? 'Henüz puan kazanmadınız veya harcamadınız.'
                  : 'Henüz hiç aktiviteniz yok.'}
              </p>
            </div>
          ) : (
            Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
              <div key={dateLabel}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <span className="text-sm font-black text-gray-500 uppercase tracking-wider">
                    {dateLabel}
                  </span>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="space-y-3">
                  {dateActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && filteredActivities.length > 0 && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-md"
              >
                Daha Fazla Yükle
              </button>
            </div>
          )}

          {isLoading && filteredActivities.length > 0 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
