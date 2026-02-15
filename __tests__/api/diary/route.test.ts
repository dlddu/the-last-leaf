/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../lib/__mocks__/prisma'
)
const { mockFindMany, prisma: mockPrisma } = mockModule

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock auth module
const mockVerifyToken = jest.fn()
jest.mock('@/lib/auth', () => ({
  verifyToken: mockVerifyToken,
}))

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { GET } from '@/app/api/diary/route'
import { NextRequest } from 'next/server'

describe('GET /api/diary', () => {
  beforeEach(() => {
    // Clear mock calls and reset mock state
    mockFindMany.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockFindMany.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(data.error.toLowerCase()).toContain('unauthorized')
    })

    it('should return 401 when auth token is invalid', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'))

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('should return 401 when auth token is expired', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed: token is expired'))

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=expired-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('expired-token')
    })
  })

  describe('successful retrieval', () => {
    it('should return user diaries when authenticated', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockDiaries = [
        {
          diary_id: 'diary-1',
          user_id: userId,
          content: 'First diary entry',
          created_at: new Date('2024-01-02T12:00:00Z'),
          updated_at: new Date('2024-01-02T12:00:00Z'),
        },
        {
          diary_id: 'diary-2',
          user_id: userId,
          content: 'Second diary entry',
          created_at: new Date('2024-01-01T12:00:00Z'),
          updated_at: new Date('2024-01-01T12:00:00Z'),
        },
      ]

      mockFindMany.mockResolvedValue(mockDiaries)

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('diaries')
      expect(data.diaries).toHaveLength(2)
      expect(data.diaries[0]).toHaveProperty('diary_id', 'diary-1')
      expect(data.diaries[1]).toHaveProperty('diary_id', 'diary-2')
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token')
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 11,
      })
    })

    it('should return empty array when user has no diaries', async () => {
      // Arrange
      const userId = 'new-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'new@example.com' })
      mockFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('diaries')
      expect(data.diaries).toHaveLength(0)
      expect(data).toHaveProperty('nextCursor', null)
    })

    it('should only return diaries belonging to authenticated user', async () => {
      // Arrange
      const userId = 'user-1'
      mockVerifyToken.mockResolvedValue({ userId, email: 'user1@example.com' })

      const mockDiaries = [
        {
          diary_id: 'diary-1',
          user_id: userId,
          content: 'User 1 diary',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]

      mockFindMany.mockResolvedValue(mockDiaries)

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        })
      )
      expect(data.diaries.every((d: any) => d.user_id === userId)).toBe(true)
    })
  })

  describe('sorting', () => {
    it('should return diaries sorted by created_at DESC', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockDiaries = [
        {
          diary_id: 'diary-3',
          user_id: userId,
          content: 'Latest entry',
          created_at: new Date('2024-01-03T12:00:00Z'),
          updated_at: new Date('2024-01-03T12:00:00Z'),
        },
        {
          diary_id: 'diary-2',
          user_id: userId,
          content: 'Middle entry',
          created_at: new Date('2024-01-02T12:00:00Z'),
          updated_at: new Date('2024-01-02T12:00:00Z'),
        },
        {
          diary_id: 'diary-1',
          user_id: userId,
          content: 'Oldest entry',
          created_at: new Date('2024-01-01T12:00:00Z'),
          updated_at: new Date('2024-01-01T12:00:00Z'),
        },
      ]

      mockFindMany.mockResolvedValue(mockDiaries)

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { created_at: 'desc' },
        })
      )
      expect(data.diaries[0].diary_id).toBe('diary-3')
      expect(data.diaries[1].diary_id).toBe('diary-2')
      expect(data.diaries[2].diary_id).toBe('diary-1')
    })
  })

  describe('pagination', () => {
    it('should use default limit of 10 when no limit specified', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await GET(request)

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 11, // limit + 1 to check if there are more
        })
      )
    })

    it('should respect custom limit parameter', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/diary?limit=5', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await GET(request)

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 6, // limit + 1
        })
      )
    })

    it('should use cursor for pagination when provided', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindMany.mockResolvedValue([])

      const cursor = 'diary-5'
      const request = new NextRequest(`http://localhost:3000/api/diary?cursor=${cursor}`, {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await GET(request)

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { diary_id: cursor },
          skip: 1,
        })
      )
    })

    it('should return nextCursor when there are more diaries', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      // Return 11 diaries (limit + 1)
      const mockDiaries = Array.from({ length: 11 }, (_, i) => ({
        diary_id: `diary-${i + 1}`,
        user_id: userId,
        content: `Diary entry ${i + 1}`,
        created_at: new Date(),
        updated_at: new Date(),
      }))

      mockFindMany.mockResolvedValue(mockDiaries)

      const request = new NextRequest('http://localhost:3000/api/diary?limit=10', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.diaries).toHaveLength(10) // Should return only limit items
      expect(data).toHaveProperty('nextCursor', 'diary-10')
    })

    it('should return null nextCursor when no more diaries', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      // Return exactly 10 diaries (no more)
      const mockDiaries = Array.from({ length: 10 }, (_, i) => ({
        diary_id: `diary-${i + 1}`,
        user_id: userId,
        content: `Diary entry ${i + 1}`,
        created_at: new Date(),
        updated_at: new Date(),
      }))

      mockFindMany.mockResolvedValue(mockDiaries)

      const request = new NextRequest('http://localhost:3000/api/diary?limit=10', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.diaries).toHaveLength(10)
      expect(data).toHaveProperty('nextCursor', null)
    })

    it('should handle invalid limit parameter gracefully', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/diary?limit=invalid', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await GET(request)

      // Assert - Should use default limit
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 11,
        })
      )
    })

    it('should enforce maximum limit of 50', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/diary?limit=100', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await GET(request)

      // Assert
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 51, // max 50 + 1
        })
      )
    })
  })

  describe('error handling', () => {
    it('should return 500 when database query fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindMany.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should handle malformed cursor gracefully', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/diary?cursor=', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)

      // Assert - Should handle gracefully (either ignore cursor or return error)
      expect([200, 400]).toContain(response.status)
    })
  })

  describe('response format', () => {
    it('should return response with correct structure', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockDiaries = [
        {
          diary_id: 'diary-1',
          user_id: userId,
          content: 'Test content',
          created_at: new Date('2024-01-01T12:00:00Z'),
          updated_at: new Date('2024-01-01T12:00:00Z'),
        },
      ]

      mockFindMany.mockResolvedValue(mockDiaries)

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(data).toHaveProperty('diaries')
      expect(data).toHaveProperty('nextCursor')
      expect(Array.isArray(data.diaries)).toBe(true)
      expect(typeof data.nextCursor === 'string' || data.nextCursor === null).toBe(true)
    })

    it('should include all required fields in diary objects', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockDiaries = [
        {
          diary_id: 'diary-1',
          user_id: userId,
          content: 'Test content with all fields',
          created_at: new Date('2024-01-01T12:00:00Z'),
          updated_at: new Date('2024-01-01T12:00:00Z'),
        },
      ]

      mockFindMany.mockResolvedValue(mockDiaries)

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      const diary = data.diaries[0]
      expect(diary).toHaveProperty('diary_id')
      expect(diary).toHaveProperty('user_id')
      expect(diary).toHaveProperty('content')
      expect(diary).toHaveProperty('created_at')
      expect(diary).toHaveProperty('updated_at')
    })
  })
})
