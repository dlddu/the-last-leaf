/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../../lib/__mocks__/prisma'
)
const { mockDiaryFindUnique, mockDiaryDelete, mockUpdate, prisma: mockPrisma } = mockModule

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
const { DELETE } = require('@/app/api/diary/[id]/route') as typeof import('@/app/api/diary/[id]/route')

describe('DELETE /api/diary/:id', () => {
  const mockParams = { params: Promise.resolve({ id: 'diary-test-id' }) }

  beforeEach(() => {
    mockDiaryFindUnique.mockClear()
    mockDiaryDelete.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockDiaryFindUnique.mockClear()
    mockDiaryDelete.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'DELETE',
      })

      // Act
      const response = await DELETE(request, mockParams)
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
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
      })

      // Act
      const response = await DELETE(request, mockParams)
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
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=expired-token',
        },
      })

      // Act
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('expired-token')
    })
  })

  describe('authorization', () => {
    it('should return 403 when trying to delete another user diary', async () => {
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
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error')
    })

    it('should not call diary.delete when requester is not the owner', async () => {
      // Arrange
      const requestingUserId = 'user-requesting'
      const ownerUserId = 'user-owner'
      mockVerifyToken.mockResolvedValue({ userId: requestingUserId, email: 'requester@example.com' })

      mockDiaryFindUnique.mockResolvedValue({
        diary_id: 'diary-test-id',
        user_id: ownerUserId,
        content: 'Original content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await DELETE(request, mockParams)

      // Assert
      expect(mockDiaryDelete).not.toHaveBeenCalled()
    })
  })

  describe('not found', () => {
    it('should return 404 when diary does not exist', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/diary/non-existent-id', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: 'non-existent-id' }) }

      // Act
      const response = await DELETE(request, params)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })

    it('should not call diary.delete when diary does not exist', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/diary/non-existent-id', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: 'non-existent-id' }) }

      // Act
      await DELETE(request, params)

      // Assert
      expect(mockDiaryDelete).not.toHaveBeenCalled()
    })
  })

  describe('successful deletion', () => {
    it('should return 200 when owner deletes their diary', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content to be deleted',
        created_at: new Date('2024-06-15T10:00:00.000Z'),
        updated_at: new Date('2024-06-15T10:00:00.000Z'),
      })
      mockDiaryDelete.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content to be deleted',
        created_at: new Date('2024-06-15T10:00:00.000Z'),
        updated_at: new Date('2024-06-15T10:00:00.000Z'),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      const response = await DELETE(request, params)

      // Assert
      expect(response.status).toBe(200)
    })

    it('should call diary.delete with correct diary_id', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockDiaryDelete.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await DELETE(request, params)

      // Assert
      expect(mockDiaryDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            diary_id: diaryId,
          }),
        })
      )
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
      mockDiaryDelete.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-jwt-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await DELETE(request, params)

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

    it('should query diary with diary_id before deleting to enable 403 vs 404 distinction', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockDiaryDelete.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      const params = { params: Promise.resolve({ id: diaryId }) }

      // Act
      await DELETE(request, params)

      // Assert - findUnique must be called with diary_id only (not user_id) to enable 403 distinction
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
    it('should return 500 when database delete fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      const diaryId = 'diary-test-id'

      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockResolvedValue({
        diary_id: diaryId,
        user_id: userId,
        content: 'Content',
        created_at: new Date(),
        updated_at: new Date(),
      })
      mockDiaryDelete.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest(`http://localhost:3000/api/diary/${diaryId}`, {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should return 500 when findUnique throws unexpected error', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDiaryFindUnique.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/diary/diary-test-id', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })
})
