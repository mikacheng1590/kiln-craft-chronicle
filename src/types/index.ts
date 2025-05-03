
// Pottery type definitions
export type StageType = 'greenware' | 'bisque' | 'final';

export interface StageData {
  weight?: number;
  media?: string; // URL to photo or video
  dimension?: string;
  description?: string;
  decoration?: string;
}

export interface PotteryRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  stages: {
    greenware: StageData;
    bisque: StageData;
    final: StageData;
  };
}

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Authentication types
export interface AuthFormData {
  email: string;
  password: string;
  name?: string; // Only for registration
}
