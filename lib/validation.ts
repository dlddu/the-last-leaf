import { EMAIL_REGEX } from './constants';

export function isValidEmail(email: unknown): boolean {
  if (email === null || email === undefined || email === '') {
    return true; // email is optional
  }
  if (typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email);
}
