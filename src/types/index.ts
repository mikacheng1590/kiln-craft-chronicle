
// Pottery type definitions
export type StageType = 'greenware' | 'bisque' | 'final';

export interface StageData {
  weight?: number;
  media?: (string | File)[]; // Supports multiple media files as array
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

// Media related types
export interface PotteryMedia {
  id: string;
  pottery_id: string;
  stage_type: StageType;
  media_url: string;
  media_type: string;
  uploaded_at: string;
  sort_order: number;
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
