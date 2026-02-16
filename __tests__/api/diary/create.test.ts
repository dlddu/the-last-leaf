/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../lib/__mocks__/prisma'
)
const { mockCreate, mockUpdate, prisma: mockPrisma } = mockModule

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
const { POST } = require('@/app/api/diary/route') as typeof import('@/app/api/diary/route')

describe('POST /api/diary', () => {
  beforeEach(() => {
    // Clear mock calls and reset mock state
    mockCreate.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockCreate.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('Authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test diary' }),
      })

      // Act
      const response = await POST(request)
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
        method: 'POST',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
        body: JSON.stringify({ content: 'Test diary' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('invalid-token')
    })

    it('should return 401 when auth token is expired', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed: token is expired'))

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=expired-token',
        },
        body: JSON.stringify({ content: 'Test diary' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('should extract user_id from JWT token', async () => {
      // Arrange
      const userId = 'test-user-123'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: 'Test diary',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test diary' }),
      })

      // Act
      await POST(request)

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token')
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: userId,
          }),
        })
      )
    })
  })

  describe('Request Validation', () => {
    it('should return 400 when content is missing', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'test-user', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({}),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error.toLowerCase()).toContain('content')
    })

    it('should return 400 when content is empty string', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'test-user', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: '' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should return 400 when content is only whitespace', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'test-user', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: '   \n  \t  ' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should return 400 when request body is invalid JSON', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'test-user', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: 'invalid json',
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should accept valid content', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: 'Valid diary content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Valid diary content' }),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
    })
  })

  describe('Diary Creation', () => {
    it('should create diary with content and user_id', async () => {
      // Arrange
      const userId = 'test-user-123'
      const content = 'Today was a great day!'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content,
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content }),
      })

      // Act
      await POST(request)

      // Assert
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            user_id: userId,
            content,
          },
        })
      )
    })

    it('should set created_at automatically', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      const createdAt = new Date()
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: 'Test',
        created_at: createdAt,
        updated_at: createdAt,
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(mockCreate).toHaveBeenCalled()
    })

    it('should handle long content', async () => {
      // Arrange
      const userId = 'test-user'
      const longContent = 'A'.repeat(10000)
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: longContent,
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: longContent }),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: longContent,
          }),
        })
      )
    })

    it('should handle special characters in content', async () => {
      // Arrange
      const userId = 'test-user'
      const specialContent = '안녕하세요! 😀 <script>alert("test")</script> \n\t'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: specialContent,
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: specialContent }),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: specialContent,
          }),
        })
      )
    })
  })

  describe('User Last Active Update', () => {
    it('should update User.last_active_at after creating diary', async () => {
      // Arrange
      const userId = 'test-user-123'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      await POST(request)

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
          data: expect.objectContaining({
            last_active_at: expect.any(Date),
          }),
        })
      )
    })

    it('should update last_active_at to current time', async () => {
      // Arrange
      const userId = 'test-user'
      const beforeTime = new Date()
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      await POST(request)
      const afterTime = new Date()

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            last_active_at: expect.any(Date),
          }),
        })
      )
      const updateCall = mockUpdate.mock.calls[0][0]
      const lastActiveAt = updateCall.data.last_active_at
      expect(lastActiveAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(lastActiveAt.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })
  })

  describe('Successful Response', () => {
    it('should return 201 status on success', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-123',
        user_id: userId,
        content: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
    })

    it('should return diary_id in response', async () => {
      // Arrange
      const userId = 'test-user'
      const diaryId = 'diary-123'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(data).toHaveProperty('diary_id', diaryId)
    })

    it('should return only diary_id in response', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-123',
        user_id: userId,
        content: 'Sensitive content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Sensitive content' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(Object.keys(data)).toEqual(['diary_id'])
    })
  })

  describe('Error Handling', () => {
    it('should return 500 when database creation fails', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should handle last_active_at update failure gracefully', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-123',
        user_id: userId,
        content: 'Test',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockRejectedValue(new Error('Update failed'))

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      const response = await POST(request)

      // Assert
      // Should still return success if diary was created
      // Or return 500 if update is critical
      expect([201, 500]).toContain(response.status)
    })

    it('should return error message in response', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockRejectedValue(new Error('Constraint violation'))

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Test' }),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(data).toHaveProperty('error')
      expect(typeof data.error).toBe('string')
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent diary creation requests', async () => {
      // Arrange
      const userId = 'test-user'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      let callCount = 0
      mockCreate.mockImplementation(() => {
        callCount++
        return Promise.resolve({
          diary_id: `diary-${callCount}`,
          user_id: userId,
          content: 'Test',
          created_at: new Date(),
          updated_at: new Date(),
        })
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request1 = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'First diary' }),
      })

      const request2 = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content: 'Second diary' }),
      })

      // Act
      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ])

      // Assert
      expect(response1.status).toBe(201)
      expect(response2.status).toBe(201)
      expect(mockCreate).toHaveBeenCalledTimes(2)
    })

    it('should trim content before validation', async () => {
      // Arrange
      const userId = 'test-user'
      const content = '  Valid content with spaces  '
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockCreate.mockResolvedValue({
        diary_id: 'diary-1',
        user_id: userId,
        content: content.trim(),
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
        body: JSON.stringify({ content }),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
    })

    it('should handle missing request body', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'test-user', email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/diary', {
        method: 'POST',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })
})
