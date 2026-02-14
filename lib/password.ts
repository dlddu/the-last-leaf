import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Hash a plain text password using bcrypt
 * @param password - The plain text password to hash
 * @returns A bcrypt hash string
 * @throws Error if password is empty or too short
 */
export async function hashPassword(password: string): Promise<string> {
  // Validate password
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  // Generate salt and hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return hashedPassword;
}

/**
 * Compare a plain text password with a bcrypt hash
 * @param password - The plain text password to compare
 * @param hash - The bcrypt hash to compare against
 * @returns True if password matches hash, false otherwise
 * @throws Error if hash is invalid
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // Handle empty password
  if (!password || password.length === 0) {
    return false;
  }

  try {
    // Compare password with hash
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    // Invalid hash format
    throw new Error('Invalid hash format');
  }
}
