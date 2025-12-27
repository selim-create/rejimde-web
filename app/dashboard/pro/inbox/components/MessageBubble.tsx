'use client';

import { InboxMessage } from '@/lib/api';

interface MessageBubbleProps {
  message: InboxMessage;
  isOwn: boolean; // Uzmanın kendi mesajı mı
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        isOwn 
          ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
          : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
      }`}>
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className={`text-[10px] font-bold mt-2 opacity-70 flex items-center gap-2 ${
          isOwn ? 'text-blue-200 justify-end' : 'text-slate-400'
        }`}>
          <span>{formatTime(message.created_at)}</span>
          {isOwn && message.is_read && (
            <i className="fa-solid fa-check-double"></i>
          )}
          {message.is_ai_generated && (
            <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[9px]">
              <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>AI
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
