/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../lib/__mocks__/prisma'
)
const { mockFindUnique, mockUpdate, prisma: mockPrisma } = mockModule

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

// Use require after jest.mock calls are registered
const { GET, PUT } = require('@/app/api/user/profile/route') as typeof import('@/app/api/user/profile/route')

describe('GET /api/user/profile', () => {
  beforeEach(() => {
    mockFindUnique.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockFindUnique.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('should return 401 when auth token is invalid', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'))

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
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
  })

  describe('successful retrieval', () => {
    it('should return user profile when authenticated', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        password_hash: '$2b$10$hashedpassword',
        created_at: new Date('2024-01-01T00:00:00Z'),
        last_active_at: new Date('2024-01-01T00:00:00Z'),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
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
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('email', 'test@example.com')
      expect(data.user).toHaveProperty('nickname', 'TestUser')
    })

    it('should not expose password_hash in response', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        password_hash: '$2b$10$secrethash',
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()
      const responseString = JSON.stringify(data)

      // Assert
      expect(response.status).toBe(200)
      expect(responseString).not.toContain('password_hash')
      expect(responseString).not.toContain('$2b$10$secrethash')
      expect(data.user).not.toHaveProperty('password_hash')
    })

    it('should call findUnique with correct userId', async () => {
      // Arrange
      const userId = 'specific-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'specific@example.com' })

      const mockUser = {
        user_id: userId,
        email: 'specific@example.com',
        nickname: 'SpecificUser',
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await GET(request)

      // Assert
      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        })
      )
    })
  })

  describe('error handling', () => {
    it('should return 404 when user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'ghost@example.com' })
      mockFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'GET',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error')
    })

    it('should return 500 when database query fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockFindUnique.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
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
  })
})

describe('PUT /api/user/profile', () => {
  beforeEach(() => {
    mockFindUnique.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockFindUnique.mockClear()
    mockUpdate.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ nickname: 'NewNick' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('should return 401 when auth token is invalid', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed'))

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=bad-token',
        },
        body: JSON.stringify({ nickname: 'NewNick' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })
  })

  describe('successful update', () => {
    it('should update nickname and return updated user', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'UpdatedNick',
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: 'UpdatedNick' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('nickname', 'UpdatedNick')
    })

    it('should update name field when provided', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        name: '홍길동',
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '홍길동', nickname: 'TestUser' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('user')
    })

    it('should call prisma update with correct userId', async () => {
      // Arrange
      const userId = 'specific-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'specific@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'specific@example.com',
        nickname: 'NewNickname',
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: 'NewNickname' }),
      })

      // Act
      await PUT(request)

      // Assert
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        })
      )
    })

    it('should not expose password_hash in update response', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'UpdatedNick',
        password_hash: '$2b$10$secrethash',
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: 'UpdatedNick' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()
      const responseString = JSON.stringify(data)

      // Assert
      expect(responseString).not.toContain('password_hash')
      expect(data.user).not.toHaveProperty('password_hash')
    })
  })

  describe('validation', () => {
    it('should return 400 when nickname is empty string', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: '' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should return 400 when body is empty', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should return 500 when database update fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockUpdate.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: 'NewNick' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should return 500 when request body is invalid JSON', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: 'not-valid-json-{',
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect([400, 500]).toContain(response.status)
      expect(data).toHaveProperty('error')
    })
  })
})
