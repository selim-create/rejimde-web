'use client';

import { InboxThread } from '@/lib/api';

interface ThreadCardProps {
  thread: InboxThread;
  isSelected?: boolean;
  onClick: () => void;
}

export default function ThreadCard({ thread, isSelected, onClick }: ThreadCardProps) {
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days === 1) return 'Dün';
    if (days < 7) return `${days} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const hasUnread = thread.unread_count > 0;

  return (
    <div 
      onClick={onClick}
      className={`p-4 border-b border-slate-700 cursor-pointer transition hover:bg-slate-700/50 ${
        isSelected ? 'bg-slate-700/50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={thread.client.avatar} 
              className="w-8 h-8 rounded-full" 
              alt={thread.client.name} 
            />
          </div>
          <span className={`font-bold text-sm ${hasUnread ? 'text-white' : 'text-slate-300'}`}>
            {thread.client.name}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500">
          {thread.last_message ? formatTimeAgo(thread.last_message.created_at) : ''}
        </span>
      </div>
      <h4 className={`text-sm mb-1 line-clamp-1 ${hasUnread ? 'font-black text-white' : 'font-bold text-slate-400'}`}>
        {hasUnread && <span className="w-2 h-2 inline-block bg-blue-500 rounded-full mr-2"></span>}
        {thread.subject || 'Konu yok'}
      </h4>
      <p className="text-xs text-slate-500 line-clamp-1">
        {thread.last_message?.content || 'Henüz mesaj yok'}
      </p>
    </div>
  );
}
