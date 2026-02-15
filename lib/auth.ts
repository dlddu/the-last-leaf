import { SignJWT, jwtVerify } from 'jose';
import { createSecretKey, KeyObject } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-purposes-only';

// Create secret key using Node.js crypto module (recommended for jose in Node.js)
const getSecretKey = (): KeyObject => createSecretKey(Buffer.from(JWT_SECRET, 'utf-8'));

/**
 * Sign a JWT token with the given payload
 * @param payload - The payload to encode in the token
 * @param expiresIn - Optional expiration time (default: '1d')
 * @returns A signed JWT token string
 * @throws Error if payload is empty
 */
export async function signToken(payload: Record<string, unknown>, expiresIn: string = '1d'): Promise<string> {
  // Validate payload is not empty
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error('Payload cannot be empty');
  }

  const secret = getSecretKey();

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload
 * @throws Error if token is invalid, expired, or malformed
 */
export async function verifyToken(token: string): Promise<Record<string, unknown>> {
  try {
    const secret = getSecretKey();

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    // Re-throw with more specific error message
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error('Token verification failed');
  }
}
