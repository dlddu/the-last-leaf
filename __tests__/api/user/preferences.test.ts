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
const { GET, PUT } = require('@/app/api/user/preferences/route') as typeof import('@/app/api/user/preferences/route')

describe('GET /api/user/preferences', () => {
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
      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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
    it('should return timer_status and timer_idle_threshold_sec when authenticated', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 300,
        created_at: new Date('2024-01-01T00:00:00Z'),
        last_active_at: new Date('2024-01-01T00:00:00Z'),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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
      expect(data).toHaveProperty('timer_status')
      expect(data).toHaveProperty('timer_idle_threshold_sec')
    })

    it('should return correct timer_status value', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'paused',
        timer_idle_threshold_sec: 2592000,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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
      expect(data.timer_status).toBe('paused')
      expect(data.timer_idle_threshold_sec).toBe(2592000)
    })

    it('should call findUnique with correct userId', async () => {
      // Arrange
      const userId = 'specific-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'specific@example.com' })

      const mockUser = {
        user_id: userId,
        email: 'specific@example.com',
        nickname: 'SpecificUser',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 300,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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

    it('should not expose password_hash in response', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const mockUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        password_hash: '$2b$10$secrethash',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 300,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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
      expect(responseString).not.toContain('password_hash')
      expect(responseString).not.toContain('$2b$10$secrethash')
    })
  })

  describe('error handling', () => {
    it('should return 404 when user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'ghost@example.com' })
      mockFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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

describe('PUT /api/user/preferences', () => {
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
      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify({ timer_status: 'PAUSED' }),
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

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=bad-token',
        },
        body: JSON.stringify({ timer_status: 'PAUSED' }),
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
    it('should update timer_status and return updated preferences', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'paused',
        timer_idle_threshold_sec: 300,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: 'PAUSED' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('timer_status')
      expect(data).toHaveProperty('timer_idle_threshold_sec')
    })

    it('should map PAUSED to paused in DB', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'paused',
        timer_idle_threshold_sec: 300,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: 'PAUSED' }),
      })

      // Act
      await PUT(request)

      // Assert: DB에는 lowercase 'paused'로 저장되어야 함
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            timer_status: 'paused',
          }),
        })
      )
    })

    it('should map ACTIVE to active in DB', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'active',
        timer_idle_threshold_sec: 300,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: 'ACTIVE' }),
      })

      // Act
      await PUT(request)

      // Assert: DB에는 lowercase 'active'로 저장되어야 함
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            timer_status: 'active',
          }),
        })
      )
    })

    it('should update timer_idle_threshold_sec to 30 days (2592000)', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 2592000,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_idle_threshold_sec: 2592000 }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.timer_idle_threshold_sec).toBe(2592000)
    })

    it('should update timer_idle_threshold_sec to 60 days (5184000)', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 5184000,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_idle_threshold_sec: 5184000 }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.timer_idle_threshold_sec).toBe(5184000)
    })

    it('should update timer_idle_threshold_sec to 90 days (7776000)', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 7776000,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_idle_threshold_sec: 7776000 }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.timer_idle_threshold_sec).toBe(7776000)
    })

    it('should update timer_idle_threshold_sec to 180 days (15552000)', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 15552000,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_idle_threshold_sec: 15552000 }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.timer_idle_threshold_sec).toBe(15552000)
    })

    it('should update both timer_status and timer_idle_threshold_sec simultaneously', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'TestUser',
        timer_status: 'paused',
        timer_idle_threshold_sec: 5184000,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: 'PAUSED', timer_idle_threshold_sec: 5184000 }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.timer_status).toBe('paused')
      expect(data.timer_idle_threshold_sec).toBe(5184000)
    })

    it('should call prisma update with correct userId', async () => {
      // Arrange
      const userId = 'specific-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'specific@example.com' })

      const updatedUser = {
        user_id: userId,
        email: 'specific@example.com',
        nickname: 'SpecificUser',
        timer_status: 'active',
        timer_idle_threshold_sec: 2592000,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpdate.mockResolvedValue(updatedUser)

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: 'ACTIVE' }),
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
  })

  describe('validation', () => {
    it('should return 400 when body is empty', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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

    it('should return 400 when timer_status is invalid value', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: 'INVALID_STATUS' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should return 400 when timer_idle_threshold_sec is invalid value', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_idle_threshold_sec: 999 }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should return 400 when timer_idle_threshold_sec is not a number', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_idle_threshold_sec: 'thirty-days' }),
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

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          Cookie: 'auth-token=valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: 'PAUSED' }),
      })

      // Act
      const response = await PUT(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should return 400 or 500 when request body is invalid JSON', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })

      const request = new NextRequest('http://localhost:3000/api/user/preferences', {
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
