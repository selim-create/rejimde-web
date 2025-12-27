'use client';

import { InboxThread } from '@/lib/api';
import ThreadCard from './ThreadCard';

interface ThreadListProps {
  threads: InboxThread[];
  selectedId?: number;
  onSelect: (thread: InboxThread) => void;
  loading?: boolean;
}

export default function ThreadList({ threads, selectedId, onSelect, loading }: ThreadListProps) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 border-b border-slate-700 animate-pulse">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                <div className="w-24 h-4 bg-slate-700 rounded"></div>
              </div>
              <div className="w-16 h-3 bg-slate-700 rounded"></div>
            </div>
            <div className="w-32 h-4 bg-slate-700 rounded mb-1"></div>
            <div className="w-48 h-3 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <i className="fa-regular fa-folder-open text-3xl mb-3"></i>
          <p className="text-sm font-bold">Mesaj bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          isSelected={selectedId === thread.id}
          onClick={() => onSelect(thread)}
        />
      ))}
    </div>
  );
}
