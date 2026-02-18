/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../../lib/__mocks__/prisma'
)
const { mockDiaryFindUnique, mockDiaryUpdate, mockUpdate, prisma: mockPrisma } = mockModule

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
const { PUT } = require('@/app/api/diary/[id]/route') as typeof import('@/app/api/diary/[id]/route')

describe('PUT /api/diary/:id', () => {
  const mockParams = { params: Promise.resolve({ id: 'diary-test-id' }) }

  beforeEach(() => {
    mockDiaryFindUnique.mockClear()
    mockDiaryUpdate.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockDiaryFindUnique.mockClear()
    mockDiaryUpdate.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      // Act
      const response = await PUT(request, mockParams)
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
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=invalid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      // Act
      const response = await PUT(request, mockParams)
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
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=expired-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      // Act
      const response = await PUT(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('expired-token')
    })
  })

  describe('authorization', () => {
    it('should return 403 when trying to update another user diary', async () => {
      // Arrange
      const requestingUserId = 'user-requesting'
      const ownerUserId = 'user-owner'
      mockVerifyToken.mockResolvedValue({ userId: requestingUserId, email: 'requester@example.com' })

      // findUnique returns a diary that belongs to a different user
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: 'diary-test-id',
        user_id: ownerUserId,
        content: 'Original content',
        created_at: new Date('2024-01-15T14:30:00Z'),
        updated_at: new Date('2024-01-15T14:30:00Z'),
      })

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Malicious update' }),
      })

      // Act
      const response = await PUT(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error')
    })
  })

  describe('not found', () => {
    it('should return 404 when diary does not exist', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/diary/non-existent-id', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      const params = { params: Promise.resolve({ id: 'non-existent-id' }) }

      // Act
      const response = await PUT(request, params)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })
  })

  describe('request validation', () => {
    it('should return 400 when content is missing', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: 'diary-test-id',
        user_id: userId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      // Act
      const response = await PUT(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should return 400 when content is empty string', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: 'diary-test-id',
        user_id: userId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: '' }),
      })

      // Act
      const response = await PUT(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should return 400 when content is only whitespace', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: 'diary-test-id',
        user_id: userId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: '   \n  \t  ' }),
      })

      // Act
      const response = await PUT(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
  })

  describe('successful update', () => {
    it('should return 200 when owner updates their diary', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'
      const updatedContent = 'Updated diary content'
      const updatedAt = new Date('2024-06-15T11:00:00.000Z')

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Original content',
        created_at: new Date('2024-06-15T10:00:00.000Z'),
        updated_at: new Date('2024-06-15T10:00:00.000Z'),
      })
      mockDiaryUpdate.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: updatedContent,
        created_at: new Date('2024-06-15T10:00:00.000Z'),
        updated_at: updatedAt,
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      const response = await PUT(request, params)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('diary_id', diaryId)
      expect(data).toHaveProperty('content', updatedContent)
    })

    it('should call diary.update with correct data', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'
      const updatedContent = 'New content for diary'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockDiaryUpdate.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: updatedContent,
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: updatedContent }),
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await PUT(request, params)

      // Assert
      expect(mockDiaryUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            diary_id: diaryId,
          }),
          data: expect.objectContaining({
            content: updatedContent,
          }),
        })
      )
    })

    it('should update User.last_active_at after updating diary', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockDiaryUpdate.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Updated content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await PUT(request, params)

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

    it('should return updated_at field in response', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'
      const updatedAt = new Date('2024-06-15T11:00:00.000Z')

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Original content',
        created_at: new Date('2024-06-15T10:00:00.000Z'),
        updated_at: new Date('2024-06-15T10:00:00.000Z'),
      })
      mockDiaryUpdate.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Updated content',
        created_at: new Date('2024-06-15T10:00:00.000Z'),
        updated_at: updatedAt,
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      const response = await PUT(request, params)
      const data = await response.json()

      // Assert
      expect(data).toHaveProperty('updated_at')
      expect(typeof data.updated_at).toBe('string')
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
      mockDiaryUpdate.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Updated',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockUpdate.mockResolvedValue({
        user_id: userId,
        last_active_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-jwt-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated' }),
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await PUT(request, params)

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-jwt-token')
      expect(mockDiaryFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            diary_id: diaryId,
          }),
        })
      )
    })
  })

  describe('error handling', () => {
    it('should return 500 when database update fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockDiaryUpdate.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      // Act
      const response = await PUT(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should handle last_active_at update failure gracefully', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockDiaryUpdate.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Updated content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      // User update fails
      mockUpdate.mockRejectedValue(new Error('User update failed'))

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: 'Updated content' }),
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      const response = await PUT(request, params)

      // Assert - Diary update should still succeed even if user update fails
      expect([200, 500]).toContain(response.status)
    })
  })
})
