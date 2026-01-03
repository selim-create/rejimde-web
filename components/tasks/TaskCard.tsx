'use client';

import { UserTask, CircleTask as GamificationCircleTask } from '@/types/gamification';

interface TaskCardProps {
  task: UserTask | GamificationCircleTask;
  type?: 'user' | 'circle';
}

export default function TaskCard({ task, type = 'user' }: TaskCardProps) {
  const isCircleTask = type === 'circle' || 'circle_progress' in task;
  const circleTask = isCircleTask ? (task as GamificationCircleTask) : null;
  const userTask = !isCircleTask ? (task as UserTask) : null;
  
  // Calculate remaining time
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Süresi doldu';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };
  
  // Get progress and target
  const progress = isCircleTask ? (circleTask?.circle_progress || 0) : (userTask?.progress || 0);
  const target = task.target || 1;
  const percent = isCircleTask 
    ? Math.min(100, Math.round((progress / target) * 100))
    : (userTask?.percent || 0);
  
  const isCompleted = task.status === 'completed';
  const isExpired = task.status === 'expired';
  
  // Status badge colors
  const statusColors = {
    completed: 'bg-green-500',
    in_progress: 'bg-blue-500',
    expired: 'bg-gray-400'
  };
  
  // Task type icons
  const taskTypeIcons = {
    daily: 'fa-sun',
    weekly: 'fa-calendar-week',
    monthly: 'fa-calendar',
    circle: 'fa-users',
    mentor: 'fa-chalkboard-teacher'
  };
  
  const taskType = isCircleTask ? 'circle' : (userTask?.task_type || 'daily');
  const icon = taskTypeIcons[taskType];

  return (
    <div className={`bg-white dark:bg-gray-800 border-2 ${isCompleted ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'} rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all ${isExpired ? 'opacity-60' : ''}`}>
      {/* Status Badge */}
      {isCompleted && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-black px-4 py-2 rounded-bl-2xl uppercase shadow-sm">
          ✓ Tamamlandı
        </div>
      )}
      {isExpired && (
        <div className="absolute top-0 right-0 bg-gray-400 text-white text-xs font-black px-4 py-2 rounded-bl-2xl uppercase shadow-sm">
          Süresi Doldu
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform ${isCompleted ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'} ${!isExpired && 'hover:scale-110'}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">{task.description}</p>
          )}
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
            <i className="fa-regular fa-clock"></i>
            {getTimeRemaining(task.expires_at)}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        >
          <div className="w-full h-full opacity-20 absolute top-0 left-0 animate-pulse" 
            style={{backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMjBMMjAgMEgwTDIwIDIwIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwKSIvPjwvc3ZnPg==')"}}
          ></div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-black text-gray-800 dark:text-gray-100">{progress.toLocaleString('tr-TR')}</span>
          <span className="text-gray-400 dark:text-gray-500 font-bold"> / {target.toLocaleString('tr-TR')}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({percent}%)</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Badge Contribution */}
          {userTask?.badge_contribution && (
            <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
              <i className="fa-solid fa-medal"></i>
              <span>+{userTask.badge_contribution.contribution_percent}%</span>
            </div>
          )}
          
          {/* Circle Stats */}
          {isCircleTask && circleTask && (
            <div className="text-xs font-bold text-gray-600 dark:text-gray-400">
              <span className="text-blue-600 dark:text-blue-400">{circleTask.members_contributing}</span> üye katkıda
            </div>
          )}
          
          {/* Reward */}
          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-black text-sm">
            <i className="fa-solid fa-gem"></i>
            <span>{task.reward_score}</span>
          </div>
        </div>
      </div>
      
      {/* Circle User Contribution */}
      {isCircleTask && circleTask && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-600 dark:text-gray-400">Senin Katkın:</span>
            <span className="font-black text-blue-600 dark:text-blue-400">
              {circleTask.my_contribution.toLocaleString('tr-TR')} ({circleTask.my_contribution_percent}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
