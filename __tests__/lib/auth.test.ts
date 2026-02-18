/**
 * @jest-environment node
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { signToken, verifyToken } from '@/lib/auth'

describe('JWT Authentication Utilities', () => {
  let testSecret: string

  beforeAll(() => {
    // Use test secret from environment
    testSecret = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-purposes-only'
  })

  afterAll(() => {
    // Cleanup if needed
  })

  describe('signToken', () => {
    it('should generate a valid JWT token when given valid payload', async () => {
      // Arrange
      const payload = {
        userId: 'test-user-123',
        email: 'test@example.com'
      }

      // Act
      const token = await signToken(payload)

      // Assert
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts separated by dots
    })

    it('should generate different tokens for different payloads', async () => {
      // Arrange
      const payload1 = { userId: 'user-1', email: 'user1@example.com' }
      const payload2 = { userId: 'user-2', email: 'user2@example.com' }

      // Act
      const token1 = await signToken(payload1)
      const token2 = await signToken(payload2)

      // Assert
      expect(token1).not.toBe(token2)
    })

    it('should generate token with expiration time', async () => {
      // Arrange
      const payload = { userId: 'user-exp', email: 'exp@example.com' }
      const expiresIn = '1h'

      // Act
      const token = await signToken(payload, expiresIn)

      // Assert
      expect(token).toBeDefined()
      // Token should be verifiable
      const decoded = await verifyToken(token)
      expect(decoded).toHaveProperty('exp')
    })

    it('should throw error when payload is empty', async () => {
      // Arrange
      const emptyPayload = {}

      // Act & Assert
      await expect(signToken(emptyPayload)).rejects.toThrow()
    })
  })

  describe('verifyToken', () => {
    it('should verify and decode a valid token', async () => {
      // Arrange
      const payload = {
        userId: 'verify-test-user',
        email: 'verify@example.com'
      }
      const token = await signToken(payload)

      // Act
      const decoded = await verifyToken(token)

      // Assert
      expect(decoded).toBeDefined()
      expect(decoded).toHaveProperty('userId', payload.userId)
      expect(decoded).toHaveProperty('email', payload.email)
      expect(decoded).toHaveProperty('iat') // issued at
      expect(decoded).toHaveProperty('exp') // expiration
    })

    it('should throw error when token is invalid', async () => {
      // Arrange
      const invalidToken = 'invalid.token.here'

      // Act & Assert
      await expect(verifyToken(invalidToken)).rejects.toThrow()
    })

    it('should throw error when token is expired', async () => {
      // Arrange
      const payload = { userId: 'expired-user', email: 'expired@example.com' }
      const token = await signToken(payload, '1s') // Expire in 1 second

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100)) // Wait 1.1 seconds

      // Act & Assert
      await expect(verifyToken(token)).rejects.toThrow()
    })

    it('should throw error when token is malformed', async () => {
      // Arrange
      const malformedToken = 'not-a-token'

      // Act & Assert
      await expect(verifyToken(malformedToken)).rejects.toThrow()
    })

    it('should throw error when token signature is invalid', async () => {
      // Arrange
      const payload = { userId: 'tamper-test', email: 'tamper@example.com' }
      const token = await signToken(payload)

      // Tamper with the signature by changing a character in the middle
      // (changing only the last character may not alter the decoded signature due to base64url padding)
      const parts = token.split('.')
      const sig = parts[2]
      const midIdx = Math.floor(sig.length / 2)
      const tamperedChar = sig[midIdx] === 'A' ? 'B' : 'A'
      const tamperedSig = sig.slice(0, midIdx) + tamperedChar + sig.slice(midIdx + 1)
      const tamperedToken = parts[0] + '.' + parts[1] + '.' + tamperedSig

      // Act & Assert
      await expect(verifyToken(tamperedToken)).rejects.toThrow()
    })
  })

  describe('signToken and verifyToken integration', () => {
    it('should successfully round-trip encode and decode payload', async () => {
      // Arrange
      const originalPayload = {
        userId: 'roundtrip-user-456',
        email: 'roundtrip@example.com',
        role: 'user'
      }

      // Act
      const token = await signToken(originalPayload)
      const decodedPayload = await verifyToken(token)

      // Assert
      expect(decodedPayload.userId).toBe(originalPayload.userId)
      expect(decodedPayload.email).toBe(originalPayload.email)
      expect(decodedPayload.role).toBe(originalPayload.role)
    })

    it('should handle unicode characters in payload', async () => {
      // Arrange
      const payload = {
        userId: 'unicode-user',
        nickname: '한글닉네임',
        emoji: '🍃'
      }

      // Act
      const token = await signToken(payload)
      const decoded = await verifyToken(token)

      // Assert
      expect(decoded.nickname).toBe(payload.nickname)
      expect(decoded.emoji).toBe(payload.emoji)
    })
  })
})
