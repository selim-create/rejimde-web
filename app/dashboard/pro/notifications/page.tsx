'use client';

import { useState } from 'react';
import { useExpertNotifications } from '@/hooks/useExpertNotifications';
import NotificationItem from '@/components/NotificationItem';

const CATEGORIES = [
  { value: 'all', label: 'Tümü', icon: 'fa-list' },
  { value: 'expert', label: 'Uzman', icon: 'fa-user-doctor' },
  { value: 'social', label: 'Sosyal', icon: 'fa-users' },
  { value: 'system', label: 'Sistem', icon: 'fa-gear' },
  { value: 'points', label: 'Puan', icon: 'fa-star' },
];

export default function ProNotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useExpertNotifications();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleMarkSingleAsRead = (id: number) => {
    markAsRead([id]);
  };

  const getEmptyMessage = (category: string) => {
    const messages: Record<string, string> = {
      all: 'Henüz hiç bildiriminiz yok.',
      social: 'Sosyal bildiriminiz yok.',
      system: 'Sistem bildirimi yok.',
      level: 'Seviye bildirimi yok.',
      circle: 'Circle bildirimi yok.',
      points: 'Puan bildirimi yok.',
      expert: 'Uzman bildirimi yok.',
    };
    return messages[category] || messages.all;
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) {
      return false;
    }
    if (showUnreadOnly && notification.is_read) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-6 mb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <i className="fa-solid fa-bell text-2xl"></i>
            </div>
            <h1 className="text-3xl font-black text-white">Bildirimler</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-black rounded-full">
                {unreadCount} Yeni
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Filters */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <i className={`fa-solid ${category.icon}`}></i>
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-slate-300">Sadece okunmamış</span>
            </label>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-bold text-blue-400 hover:text-blue-300 transition"
              >
                Hepsini Okundu İşaretle
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
              <i className="fa-solid fa-bell-slash text-6xl text-slate-600 mb-4"></i>
              <h3 className="text-xl font-bold text-slate-300 mb-2">
                {showUnreadOnly ? 'Okunmamış bildirim yok' : 'Bildirim yok'}
              </h3>
              <p className="text-slate-400">
                {showUnreadOnly
                  ? 'Tüm bildirimlerinizi okudunuz!'
                  : getEmptyMessage(selectedCategory)}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkSingleAsRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
