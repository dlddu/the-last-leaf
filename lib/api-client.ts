import type { Diary, Contact, UserProfile, Preferences } from './types';

// API endpoint constants
export const API_ENDPOINTS = {
  DIARY: '/api/diary',
  DIARY_BY_ID: (id: string) => `/api/diary/${id}`,
  USER: '/api/user',
  USER_PROFILE: '/api/user/profile',
  USER_CONTACTS: '/api/user/contacts',
  USER_PREFERENCES: '/api/user/preferences',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_GOOGLE: '/api/auth/google',
} as const;

// Typed API response interfaces
export interface DiaryListResponse {
  diaries: Array<Omit<Diary, 'created_at' | 'updated_at'> & {
    created_at: string;
    updated_at: string;
  }>;
  nextCursor: string | null;
}

export interface ContactsResponse {
  contacts: Array<{
    contact_id?: string;
    user_id?: string;
    email: string | null;
    phone: string | null;
  }>;
}

export interface UserProfileResponse {
  user: UserProfile;
}

export type PreferencesResponse = Preferences;

/**
 * Map raw contact API data to Contact type, normalizing null to empty string.
 */
export function mapContacts(
  contacts: ContactsResponse['contacts']
): Contact[] {
  return contacts.map((c) => ({
    contact_id: c.contact_id,
    user_id: c.user_id,
    email: c.email ?? '',
    phone: c.phone ?? '',
  }));
}

/**
 * Parse diary date strings into Date objects.
 */
export function mapDiaries(diaries: DiaryListResponse['diaries']): Diary[] {
  return diaries.map((diary) => ({
    ...diary,
    created_at: new Date(diary.created_at),
    updated_at: new Date(diary.updated_at),
  }));
}
