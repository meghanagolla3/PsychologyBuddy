// Shared types for Self Help Tools

export interface ListeningInstructions {
  title: string;
  points: string[];
  proTip?: string;
}

export interface JournalPrompt {
  id: string;
  prompt: string;
  moods: string[];
  journalTypes: ("writing" | "art")[];
  isEnabled: boolean;
}

export interface MusicResource {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string | null;
  categories?: { category: { name: string } }[];
  goals?: { goal: { name: string } }[];
  duration?: string;
  status: "DRAFT" | "PUBLISHED";
  isPublic?: boolean;
  learnerCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MeditationResource {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  format: "AUDIO" | "VIDEO" | "TEXT";
  audioUrl?: string | null;
  videoUrl?: string | null;
  durationSec?: number | null;
  instructor?: string | null;
  type: "GUIDED" | "MUSIC" | "BREATHING" | "BODY_SCAN";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  categories?: {
    id: string;
    category: {
      id: string;
      name: string;
    }
  }[];
  moods?: {
    id: string;
    mood: {
      id: string;
      name: string;
    }
  }[];
  goals?: {
    id: string;
    goal: {
      id: string;
      name: string;
    }
  }[];
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface JournalingConfig {
  writingEnabled: boolean;
  audioEnabled: boolean;
  artEnabled: boolean;
}

export interface AudioJournalingConfig {
  maxRecordingDuration: number;
  autoDeleteBehavior: "manual" | "7days" | "14days" | "30days" | "90days";
}

export interface ArtJournalingConfig {
  undoRedoEnabled: boolean;
  colorPaletteEnabled: boolean;
  clearCanvasEnabled: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: {
    resources?: T[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  error?: string;
}

// Default data
export const defaultMusicInstructions: ListeningInstructions = {
  title: "Listening Instructions",
  points: [
    "Find a comfortable, quiet space where you won't be disturbed",
    "Use headphones for the best experience",
    "Allow yourself to fully immerse in the sounds",
    "Breathe naturally and let the music guide your relaxation",
    "Continue listening for the full duration without interruption"
  ],
  proTip: "For best results, listen at a comfortable volume and avoid multitasking."
};

export const defaultMeditationInstructions: ListeningInstructions = {
  title: "Listening Instructions",
  points: [
    "Find a quiet, comfortable place to sit or lie down",
    "Close your eyes gently and take a deep breath",
    "Focus on your breath as it flows in and out",
    "If your mind wanders, gently bring it back",
    "Continue for the full duration without judgment"
  ],
  proTip: "It's normal for your mind to wander. Be gentle with yourself and return your focus to your breath."
};

export const journalPrompts: JournalPrompt[] = [
  { id: "1", prompt: "What are you grateful for today?", moods: [], journalTypes: ["writing", "art"], isEnabled: true },
  { id: "2", prompt: "Describe a challenge you overcame recently", moods: [], journalTypes: ["writing"], isEnabled: true },
  { id: "3", prompt: "What made you smile today?", moods: [], journalTypes: ["writing", "art"], isEnabled: true },
  { id: "4", prompt: "Write about something you're looking forward to", moods: [], journalTypes: ["writing"], isEnabled: false },
  { id: "5", prompt: "Draw how you're feeling right now", moods: [], journalTypes: ["art"], isEnabled: true },
  { id: "6", prompt: "Create an image of your happy place", moods: [], journalTypes: ["art"], isEnabled: true },
];

export const defaultJournalMoods: string[] = [];
export const defaultMusicMoods: string[] = [];
export const defaultMeditationMoods: string[] = [
  "Calm",
  "Relaxed", 
  "Peaceful",
  "Focused",
  "Sleepy",
  "Energized",
  "Balanced",
  "Grounded",
  "Mindful",
  "Serene",
  "Tranquil",
  "Centered",
  "Rejuvenated",
  "Clear-headed"
];
export const defaultMusicGoals: string[] = [];
export const defaultMeditationGoals: string[] = [];
