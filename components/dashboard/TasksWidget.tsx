'use client';

import Link from 'next/link';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '../tasks/TaskCard';

export default function TasksWidget() {
  const { dailyTasks, weeklyTasks, summary, isLoading } = useTasks();
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Get incomplete tasks (max 3)
  const incompleteTasks = [...dailyTasks, ...weeklyTasks]
    .filter(t => t.status === 'in_progress')
    .slice(0, 3);
  
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <i className="fa-solid fa-list-check"></i>
          </div>
          Görevlerim
        </h3>
        <Link 
          href="/dashboard/tasks"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Tümünü Gör →
        </Link>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-green-600 dark:text-green-400">{summary.completed_today}</div>
          <div className="text-xs font-bold text-green-700 dark:text-green-500">Bugün Tamamlandı</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{summary.completed_this_week}</div>
          <div className="text-xs font-bold text-blue-700 dark:text-blue-500">Bu Hafta</div>
        </div>
      </div>
      
      {/* Active Tasks */}
      <div className="space-y-4">
        {incompleteTasks.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-8 text-center">
            <i className="fa-solid fa-check-circle text-3xl text-green-500 mb-2"></i>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">Aktif görev yok!</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Harika gidiyorsun! 🎉</p>
          </div>
        ) : (
          incompleteTasks.map((task) => (
            <div key={task.id} className="border-2 border-gray-100 dark:border-gray-700 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <i className={`fa-solid ${task.task_type === 'daily' ? 'fa-sun' : 'fa-calendar-week'}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 mb-1 truncate">{task.title}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${task.percent}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0">{task.percent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">{task.progress} / {task.target}</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-black flex items-center gap-1">
                      <i className="fa-solid fa-gem"></i> {task.reward_score}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
