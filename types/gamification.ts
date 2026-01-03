// ==========================================
// TASK TYPES
// ==========================================

export type TaskType = 'daily' | 'weekly' | 'monthly' | 'circle' | 'mentor';
export type TaskStatus = 'in_progress' | 'completed' | 'expired';

export interface TaskDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  task_type: TaskType;
  target_value: number;
  scoring_event_types: string[];
  reward_score: number;
  badge_progress_contribution?: number;
  reward_badge_id?: number;
  is_active: boolean;
  source: 'config' | 'database';
}

export interface UserTask {
  id: string;
  slug: string;
  title: string;
  description?: string;
  task_type: TaskType;
  progress: number;
  target: number;
  percent: number;
  reward_score: number;
  badge_contribution?: {
    badge_slug: string;
    contribution_percent: number;
  } | null;
  status: TaskStatus;
  expires_at: string;
  period?: string;
}

export interface CircleTask {
  id: string;
  slug: string;
  title: string;
  description?: string;
  circle_progress: number;
  target: number;
  my_contribution: number;
  my_contribution_percent: number;
  members_contributing: number;
  status: TaskStatus;
  expires_at: string;
  reward_score: number;
}

export interface UserTasksResponse {
  daily: UserTask[];
  weekly: UserTask[];
  monthly: UserTask[];
  circle: CircleTask[];
  summary: {
    completed_today: number;
    completed_this_week: number;
    completed_this_month: number;
  };
}

// ==========================================
// BADGE TYPES
// ==========================================

export type BadgeCategory = 'behavior' | 'discipline' | 'social' | 'milestone';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeDefinition {
  id: string | number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  max_progress: number;
  conditions: Record<string, any>;
  source: 'config' | 'post_type';
}

export interface UserBadge {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  tier: BadgeTier;
  progress: number;
  max_progress: number;
  percent: number;
  is_earned: boolean;
  earned_at?: string;
}

export interface UserBadgesResponse {
  badges: UserBadge[];
  by_category: {
    behavior: UserBadge[];
    discipline: UserBadge[];
    social: UserBadge[];
    milestone: UserBadge[];
  };
  recently_earned: UserBadge[];
  stats: {
    total_earned: number;
    total_available: number;
    percent_complete: number;
  };
}
