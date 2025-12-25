/**
 * ==========================================
 * GAMIFICATION TYPES
 * ==========================================
 */

// Streak Information
export interface StreakInfo {
  current_count: number;
  longest_count: number;
  last_activity_date: string | null;
  grace_remaining: number;
  next_milestone?: number;
  next_milestone_bonus?: number;
}

// Gamification Stats
export interface GamificationStats {
  daily_score: number;
  total_score: number;
  rank: number;
  level: LevelInfo;
  streak: StreakInfo;
  earned_badges: number[];
}

// Level Information
export interface LevelInfo {
  id: string;
  name: string;
  level: number;
  slug: string;
  icon: string;
  color: string;
  description: string;
  min: number;
  max: number;
}

// Event Notification
export interface EventNotification {
  type: 'points' | 'streak' | 'milestone' | 'badge';
  title: string;
  message: string;
  points?: number;
  icon?: string;
}
