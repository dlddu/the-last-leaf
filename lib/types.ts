// Shared domain types used across components and API routes

export interface Diary {
  diary_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  contact_id?: string;
  user_id?: string;
  email: string;
  phone: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  nickname: string;
  name?: string;
}

export interface Preferences {
  timer_status: string;
  timer_idle_threshold_sec: number;
}

// Shared page status types
export type PageStatus = 'loading' | 'idle' | 'saving' | 'success' | 'error';

export type ProfilePageStatus = PageStatus | 'dirty';

export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
