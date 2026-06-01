export enum ModuleType {
  JOURNALING = 'JOURNALING',
  MEDITATION = 'MEDITATION',
  MUSIC = 'MUSIC',
  ARTICLE = 'ARTICLE'
}

export enum ChallengeType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  STREAK = 'STREAK',
  MILESTONE = 'MILESTONE'
}


export enum TargetUnit {
  ENTRIES = 'ENTRIES',
  SESSIONS = 'SESSIONS',
  MINUTES = 'MINUTES',
  DAYS = 'DAYS',
  ARTICLES = 'ARTICLES'
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum UserChallengeStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  moduleType: ModuleType;
  challengeType: ChallengeType;
  targetValue: number;
  targetUnit: TargetUnit;
  rewardPoints: number;
  badgeId?: string;
  difficulty: Difficulty;
  isActive: boolean;
  createdBy: string;
  schoolId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  currentProgress: number;
  targetValue: number;
  status: UserChallengeStatus;
  startedAt?: Date;
  completedAt?: Date;
  lastActivityAt: Date;
  challenge: Challenge;
}

export interface UserProfile {
  id: string;
  userId: string;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  challengesCompleted: number;
  badgesEarned: number;
  createdAt: Date;
  updatedAt: Date;
  earnedBadges: UserBadge[];
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  challengeId?: string;
  badge: Badge;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  moduleType: ModuleType;
  action: string;
  value?: number;
  metadata?: any;
  timestamp: Date;
}

export interface ChallengeDashboard {
  journaling: ModuleChallenges;
  meditation: ModuleChallenges;
  music: ModuleChallenges;
  article: ModuleChallenges;
  profile: UserProfile;
  stats: ChallengeStats;
}

export interface ModuleChallenges {
  active: UserChallenge[];
  completed: UserChallenge[];
  available: Challenge[];
}

export interface ChallengeStats {
  totalActiveChallenges: number;
  totalCompletedChallenges: number;
  totalXp: number;
  currentLevel: number;
  badgesEarned: number;
  currentStreak: number;
}

// Challenge Creation Types
export interface CreateChallengeRequest {
  title: string;
  description: string;
  moduleType: ModuleType;
  challengeType: ChallengeType;
  targetValue: number;
  targetUnit: TargetUnit;
  rewardPoints: number;
  badgeId?: string;
  difficulty: Difficulty;
  schoolId?: string;
}

// Activity Event Types for Integration
export interface JournalingEvent {
  userId: string;
  action: 'entry_created' | 'audio_created' | 'art_created';
  entryType: 'write' | 'audio' | 'art';
  metadata?: {
    mood?: string;
    tags?: string[];
    wordCount?: number;
  };
}

export interface MeditationEvent {
  userId: string;
  action: 'session_completed';
  duration: number; // in seconds
  metadata?: {
    meditationId?: string;
    notes?: string;
    completed: boolean;
  };
}

export interface MusicEvent {
  userId: string;
  action: 'session_completed';
  duration: number; // in seconds
  metadata?: {
    musicId?: string;
    mood?: string;
    completed: boolean;
  };
}

export interface ArticleEvent {
  userId: string;
  action: 'article_read' | 'article_completed';
  metadata?: {
    articleId?: string;
    progress?: number;
    timeSpent?: number; // in seconds
  };
}

// UI Types
export interface ChallengeCardProps {
  challenge: UserChallenge | Challenge;
  onStartChallenge?: () => void;
  onViewDetails?: () => void;
  showProgress?: boolean;
  compact?: boolean;
}

export interface ModuleTabProps {
  moduleType: ModuleType;
  challenges: ModuleChallenges;
  onStartChallenge: (challengeId: string) => void;
  onViewDetails: (challengeId: string) => void;
}

// API Response Types
export interface ChallengeResponse {
  success: boolean;
  data?: Challenge | UserChallenge | UserProfile;
  message?: string;
  error?: string;
}

export interface ChallengesListResponse {
  success: boolean;
  data: ModuleChallenges;
  message?: string;
}

export interface DashboardResponse {
  success: boolean;
  data: ChallengeDashboard;
  message?: string;
}

// Progress Calculation Types
export interface ProgressUpdate {
  userId: string;
  challengeId: string;
  increment: number;
  newStatus?: UserChallengeStatus;
}

export interface RewardAward {
  userId: string;
  xpAwarded: number;
  badgeAwarded?: string;
  challengeCompleted: string;
}
