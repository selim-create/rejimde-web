'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { useExpertNotifications } from '@/hooks/useExpertNotifications';
import NotificationItem from './NotificationItem';
import Link from 'next/link';

interface NotificationDropdownProps {
  isPro?: boolean;
}

export default function NotificationDropdown({ isPro = false }: NotificationDropdownProps) {
  const userNotifications = useNotifications();
  const expertNotifications = useExpertNotifications();

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = isPro
    ? expertNotifications
    : userNotifications;

  const notificationsLink = isPro ? '/dashboard/pro/notifications' : '/dashboard/notifications';
  const displayNotifications = notifications.slice(0, 5);

  return (
    <div className="relative group h-12 flex items-center">
      <button className="relative w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-rejimde-blue transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-rejimde-blue focus:ring-offset-2">
        <i className="fa-solid fa-bell text-gray-600"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-10 w-80 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">Bildirimler</h3>
            {unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                Hepsini Oku
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fa-solid fa-bell-slash text-4xl text-gray-300 mb-2"></i>
                <p className="text-sm text-gray-500">Bildirim yok</p>
              </div>
            ) : (
              displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  compact
                />
              ))
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <Link
                href={notificationsLink}
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Tümünü Görüntüle
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
