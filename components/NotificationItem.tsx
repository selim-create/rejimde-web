'use client';

import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Notification } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: number) => void;
  compact?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  social: 'bg-blue-100 text-blue-600 border-blue-200',
  system: 'bg-gray-100 text-gray-600 border-gray-200',
  level: 'bg-purple-100 text-purple-600 border-purple-200',
  circle: 'bg-pink-100 text-pink-600 border-pink-200',
  points: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  expert: 'bg-green-100 text-green-600 border-green-200',
};

export default function NotificationItem({ notification, onRead, compact = false }: NotificationItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.is_read && onRead) {
      onRead(notification.id);
    }
    if (notification.action_url) {
      // Ensure URL has leading slash
      const url = notification.action_url.startsWith('/') 
        ? notification.action_url 
        : `/${notification.action_url}`;
      router.push(url);
    }
  };

  const categoryColor = CATEGORY_COLORS[notification.category] || CATEGORY_COLORS.system;
  const relativeTime = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: tr,
    includeSeconds: true, // Include seconds for "just now" type messages
  });

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${
          !notification.is_read ? 'bg-blue-50/30' : ''
        }`}
      >
        <div className={`w-8 h-8 rounded-lg ${categoryColor} flex items-center justify-center flex-shrink-0`}>
          <i className={`fa-solid ${notification.icon} text-sm`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-700 truncate">{notification.title}</p>
          {notification.body && (
            <p className="text-xs text-gray-500 truncate">{notification.body}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{relativeTime}</p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2"></div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl border-2 p-4 transition cursor-pointer hover:shadow-md ${
        !notification.is_read
          ? 'bg-blue-50/50 border-blue-200'
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${categoryColor} flex items-center justify-center flex-shrink-0`}>
          <i className={`fa-solid ${notification.icon}`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-gray-800">{notification.title}</h3>
            {!notification.is_read && (
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
            )}
          </div>
          {notification.body && (
            <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">{relativeTime}</p>
        </div>
      </div>
    </div>
  );
}
