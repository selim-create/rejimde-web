'use client';

import { useTasks } from '@/hooks/useTasks';
import LayoutWrapper from '@/components/LayoutWrapper';
import TaskList from '@/components/tasks/TaskList';

export default function TasksPage() {
  const { dailyTasks, weeklyTasks, monthlyTasks, circleTasks, summary, isLoading, error } = useTasks();
  
  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (error) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-12 text-center">
              <i className="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <p className="text-red-700 dark:text-red-400 font-bold">{error}</p>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 mb-2">
              Görevlerim 📋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-bold">
              Hedeflerine ulaşmak için görevleri tamamla ve ödüller kazan!
            </p>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-check-circle text-3xl text-green-600 dark:text-green-400"></i>
              </div>
              <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-1">
                {summary.completed_today}
              </div>
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                Bugün Tamamlandı
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-calendar-week text-3xl text-blue-600 dark:text-blue-400"></i>
              </div>
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">
                {summary.completed_this_week}
              </div>
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                Bu Hafta Tamamlandı
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-calendar text-3xl text-purple-600 dark:text-purple-400"></i>
              </div>
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-1">
                {summary.completed_this_month}
              </div>
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                Bu Ay Tamamlandı
              </div>
            </div>
          </div>
          
          {/* Task Lists */}
          <div className="space-y-12">
            {/* Daily Tasks */}
            <TaskList
              title="Günlük Görevler"
              icon="fa-sun"
              tasks={dailyTasks}
              type="user"
              emptyMessage="Bugün için aktif görev yok"
            />
            
            {/* Weekly Tasks */}
            <TaskList
              title="Haftalık Görevler"
              icon="fa-calendar-week"
              tasks={weeklyTasks}
              type="user"
              emptyMessage="Bu hafta için aktif görev yok"
            />
            
            {/* Monthly Tasks */}
            <TaskList
              title="Aylık Görevler"
              icon="fa-calendar"
              tasks={monthlyTasks}
              type="user"
              emptyMessage="Bu ay için aktif görev yok"
            />
            
            {/* Circle Tasks */}
            {circleTasks.length > 0 && (
              <TaskList
                title="Circle Görevleri"
                icon="fa-users"
                tasks={circleTasks}
                type="circle"
                emptyMessage="Circle göreviniz yok"
              />
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
