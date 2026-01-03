'use client';

import { UserTask, CircleTask as GamificationCircleTask } from '@/types/gamification';
import TaskCard from './TaskCard';

interface TaskListProps {
  title: string;
  icon: string;
  tasks: (UserTask | GamificationCircleTask)[];
  type?: 'user' | 'circle';
  emptyMessage?: string;
}

export default function TaskList({ title, icon, tasks, type = 'user', emptyMessage = 'Henüz görev yok' }: TaskListProps) {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className={`fa-solid ${icon}`}></i>
          </div>
          {title}
        </h2>
        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-4 py-2 rounded-xl text-sm border border-blue-100 dark:border-blue-800">
          {completedCount} / {totalCount} Tamamlandı
        </span>
      </div>
      
      {/* Task Cards */}
      {tasks.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-12 text-center">
          <i className="fa-solid fa-clipboard-list text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400 font-bold">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}
