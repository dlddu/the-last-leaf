/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../../lib/__mocks__/prisma'
)
const { mockDiaryFindUnique, prisma: mockPrisma } = mockModule

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock auth module
const mockVerifyToken = jest.fn()
jest.mock('@/lib/auth', () => ({
  verifyToken: mockVerifyToken,
}))

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'

// Use require to load route module after jest.mock calls are registered
// (importing jest from @jest/globals prevents SWC from hoisting jest.mock)
const { GET } = require('@/app/api/diary/[id]/route') as typeof import('@/app/api/diary/[id]/route')

describe('GET /api/diary/:id', () => {
  const mockParams = { params: Promise.resolve({ id: 'diary-test-id' }) }

  beforeEach(() => {
    mockDiaryFindUnique.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockDiaryFindUnique.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'GET',
      })

      // Act
      const response = await GET(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(data.error.toLowerCase()).toContain('unauthorized')
    })

    it('should return 401 when auth token is invalid', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'))

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
      })

      // Act
      const response = await GET(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('invalid-token')
    })

    it('should return 401 when auth token is expired', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed: token is expired'))

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=expired-token',
        },
      })

      // Act
      const response = await GET(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('expired-token')
    })
  })

  describe('authorization', () => {
    it('should return 404 when diary belongs to another user', async () => {
      // Arrange
      const requestingUserId = 'user-requesting'
      const ownerUserId = 'user-owner'
      mockVerifyToken.mockResolvedValue({ userId: requestingUserId, email: 'requester@example.com' })

      // findUnique returns null when user_id filter does not match (Prisma behavior)
      mockDiaryFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
      // Should NOT reveal that the diary exists but belongs to another user
      expect(data.error.toLowerCase()).not.toContain('forbidden')
      expect(data.error.toLowerCase()).not.toContain('unauthorized')
    })

    it('should query diary with user_id filter to prevent unauthorized access', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Test content',
        created_at: new Date('2024-01-15T14:30:00Z'),
        updated_at: new Date('2024-01-15T14:30:00Z'),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await GET(request, params)

      // Assert - Must include user_id in the query to enforce ownership
      expect(mockDiaryFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            diary_id: diaryId,
            user_id: userId,
          }),
        })
      )
    })
  })

  describe('successful retrieval', () => {
    it('should return 200 with diary data when owner requests their diary', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'
      const createdAt = new Date('2024-01-15T14:30:00Z')
      const updatedAt = new Date('2024-01-15T14:30:00Z')

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'My personal diary entry',
        created_at: createdAt,
        updated_at: updatedAt,
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      const response = await GET(request, params)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('diary_id', diaryId)
      expect(data).toHaveProperty('content', 'My personal diary entry')
      expect(data).toHaveProperty('created_at')
      expect(data).toHaveProperty('updated_at')
    })

    it('should return all required fields in response', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Test content',
        created_at: new Date('2024-01-15T14:30:00Z'),
        updated_at: new Date('2024-01-15T14:30:00Z'),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      const response = await GET(request, params)
      const data = await response.json()

      // Assert - Response shape: { diary_id, content, created_at, updated_at }
      expect(data).toHaveProperty('diary_id')
      expect(data).toHaveProperty('content')
      expect(data).toHaveProperty('created_at')
      expect(data).toHaveProperty('updated_at')
    })

    it('should extract user_id from JWT and use it for ownership check', async () => {
      // Arrange
      const userId = 'jwt-extracted-user-id'
      const diaryId = 'diary-abc'
      mockVerifyToken.mockResolvedValue({ userId, email: 'user@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-jwt-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await GET(request, params)

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-jwt-token')
      expect(mockDiaryFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: userId,
          }),
        })
      )
    })
  })

  describe('not found', () => {
    it('should return 404 when diary does not exist', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/diary/non-existent-id', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: 'non-existent-id' }) }

      // Act
      const response = await GET(request, params)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })

  describe('error handling', () => {
    it('should return 500 when database query fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('response format', () => {
    it('should serialize dates as ISO strings in response', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'
      const createdAt = new Date('2024-06-15T10:30:00.000Z')
      const updatedAt = new Date('2024-06-15T11:00:00.000Z')

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Some content',
        created_at: createdAt,
        updated_at: updatedAt,
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      const response = await GET(request, params)
      const data = await response.json()

      // Assert - Dates must be serializable strings after JSON
      expect(typeof data.created_at).toBe('string')
      expect(typeof data.updated_at).toBe('string')
    })
  })
})
