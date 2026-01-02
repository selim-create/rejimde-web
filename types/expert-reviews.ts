// types/expert-reviews.ts

export interface ReviewFormData {
  rating: number;
  content: string;
  isAnonymous: boolean;
  goalTag?: string;
  programType?: string;
  processWeeks?: number;
  wouldRecommend: boolean;
  hasSuccessStory: boolean;
  successStory?: string;
}

export interface ReviewStatsData {
  average: number;
  total: number;
  distribution: Record<number, { count: number; percent: number }>;
  verifiedClientCount: number;
  averageProcessDuration: number;
  successRate: number;
}

export interface SuccessStory {
  id: number;
  authorName: string;
  isAnonymous: boolean;
  goalTag: string;
  processWeeks: number;
  story: string;
  rating: number;
  verifiedClient: boolean;
  createdAt: string;
}

export interface CommunityImpactData {
  totalClientsSupported: number;
  programsCompleted: number;
  averageJourneyWeeks: number;
  goalsAchieved: number;
  context: {
    message: string;
    highlight: string;
  };
}

export interface FilterState {
  goalTag: string | null;
  programType: string | null;
  ratingMin: number;
  verifiedOnly: boolean;
  withStory: boolean;
}
