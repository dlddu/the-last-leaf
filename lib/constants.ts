// Authentication
export const AUTH_COOKIE_NAME = 'auth-token';
export const AUTH_TOKEN_EXPIRY = '7d';
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Pagination
export const PAGINATION_DEFAULT_LIMIT = 10;
export const PAGINATION_MAX_LIMIT = 50;

// Validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

// Preferences
export const VALID_TIMER_STATUSES = ['PAUSED', 'ACTIVE', 'INACTIVE'] as const;
export const VALID_IDLE_THRESHOLDS = [2592000, 5184000, 7776000, 15552000] as const;
export const TIMER_STATUS_MAP: Record<string, string> = {
  PAUSED: 'paused',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};
