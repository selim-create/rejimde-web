'use client';

import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ActivityItem as ActivityItemType } from '@/lib/api';
import Link from 'next/link';

interface ActivityItemProps {
  activity: ActivityItemType;
}

const EVENT_ICONS: Record<string, string> = {
  daily_login: 'fa-calendar-check',
  blog_read: 'fa-newspaper',
  exercise_complete: 'fa-dumbbell',
  diet_complete: 'fa-utensils',
  water_intake: 'fa-droplet',
  follow: 'fa-user-plus',
  high_five: 'fa-hand',
  comment: 'fa-comment',
  streak_milestone: 'fa-fire',
  level_up: 'fa-arrow-up',
  level_down: 'fa-arrow-down',
  circle_join: 'fa-users',
  calculator_use: 'fa-calculator',
};

const EVENT_LABELS: Record<string, string> = {
  daily_login: 'Günlük giriş',
  blog_read: 'Blog okuma',
  exercise_complete: 'Egzersiz tamamlama',
  diet_complete: 'Diyet tamamlama',
  water_intake: 'Su içme',
  follow: 'Takip',
  high_five: 'Beşlik',
  comment: 'Yorum',
  streak_milestone: 'Seri milestone',
  level_up: 'Seviye atladı',
  level_down: 'Seviye düştü',
  circle_join: 'Circle katılımı',
  calculator_use: 'Hesaplama',
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const icon = EVENT_ICONS[activity.event_type] || 'fa-circle-dot';
  const label = activity.label || EVENT_LABELS[activity.event_type] || activity.event_type;
  const relativeTime = formatDistanceToNow(new Date(activity.created_at), {
    addSuffix: true,
    locale: tr,
  });

  const getEntityLink = () => {
    if (!activity.entity_type || !activity.entity_id) return null;
    
    switch (activity.entity_type) {
      case 'post':
        return `/blog/${activity.entity_id}`;
      case 'diet':
        return `/diets/${activity.entity_id}`;
      case 'exercise':
        return `/exercises/${activity.entity_id}`;
      default:
        return null;
    }
  };

  const entityLink = getEntityLink();

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 transition">
      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            {entityLink ? (
              <Link href={entityLink} className="text-sm font-bold text-gray-800 hover:text-blue-600">
                {label}
              </Link>
            ) : (
              <p className="text-sm font-bold text-gray-800">{label}</p>
            )}
            {activity.context?.details && (
              <p className="text-xs text-gray-500 mt-1">{activity.context.details}</p>
            )}
          </div>
          {activity.points !== 0 && (
            <div
              className={`px-2 py-1 rounded-lg text-xs font-black flex-shrink-0 ${
                activity.points > 0
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {activity.points > 0 ? '+' : ''}{activity.points} XP
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">{relativeTime}</p>
      </div>
    </div>
  );
}
