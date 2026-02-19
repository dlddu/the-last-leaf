import { NextResponse } from 'next/server';
import { EMAIL_REGEX, PASSWORD_MIN_LENGTH, VALID_TIMER_STATUSES, VALID_IDLE_THRESHOLDS } from './constants';

export function isValidEmail(email: unknown): boolean {
  if (email === null || email === undefined || email === '') {
    return true; // email is optional
  }
  if (typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email);
}

interface SignupInput {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
}

/**
 * Validate signup form input.
 * Returns a 400 NextResponse on failure, or null on success.
 */
export function validateSignupInput(data: SignupInput): NextResponse | null {
  const { email, password, passwordConfirm, nickname } = data;

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 });
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` },
      { status: 400 },
    );
  }

  if (password !== passwordConfirm) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
  }

  if (!nickname || nickname.trim().length === 0) {
    return NextResponse.json({ error: 'Nickname is required' }, { status: 400 });
  }

  return null;
}

interface ProfileInput {
  nickname?: string;
  name?: string;
}

/**
 * Validate profile update input.
 * Returns a 400 NextResponse on failure, or null on success.
 */
export function validateProfileInput(data: ProfileInput): NextResponse | null {
  const { nickname, name } = data;

  if (nickname === undefined && name === undefined) {
    return NextResponse.json(
      { error: 'At least one field (nickname or name) must be provided' },
      { status: 400 },
    );
  }

  if (nickname !== undefined && (typeof nickname !== 'string' || nickname.trim() === '')) {
    return NextResponse.json({ error: 'Nickname cannot be empty' }, { status: 400 });
  }

  return null;
}

interface PreferencesInput {
  timer_status?: string;
  timer_idle_threshold_sec?: number;
}

/**
 * Validate preferences update input.
 * Returns a 400 NextResponse on failure, or null on success.
 */
export function validatePreferencesInput(data: PreferencesInput): NextResponse | null {
  const { timer_status, timer_idle_threshold_sec } = data;

  if (timer_status === undefined && timer_idle_threshold_sec === undefined) {
    return NextResponse.json(
      { error: 'At least one field (timer_status or timer_idle_threshold_sec) must be provided' },
      { status: 400 },
    );
  }

  if (timer_status !== undefined) {
    if (!(VALID_TIMER_STATUSES as readonly string[]).includes(timer_status)) {
      return NextResponse.json(
        { error: `Invalid timer_status. Must be ${VALID_TIMER_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }
  }

  if (timer_idle_threshold_sec !== undefined) {
    if (typeof timer_idle_threshold_sec !== 'number') {
      return NextResponse.json(
        { error: 'timer_idle_threshold_sec must be a number' },
        { status: 400 },
      );
    }
    if (!(VALID_IDLE_THRESHOLDS as readonly number[]).includes(timer_idle_threshold_sec)) {
      return NextResponse.json(
        { error: `Invalid timer_idle_threshold_sec. Must be one of: ${VALID_IDLE_THRESHOLDS.join(', ')}` },
        { status: 400 },
      );
    }
  }

  return null;
}
