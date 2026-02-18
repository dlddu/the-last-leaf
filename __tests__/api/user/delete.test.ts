/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../lib/__mocks__/prisma'
)
const { mockDelete, prisma: mockPrisma } = mockModule

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
const { DELETE } = require('@/app/api/user/route') as typeof import('@/app/api/user/route')

describe('DELETE /api/user', () => {
  beforeEach(() => {
    mockDelete.mockClear()
    mockVerifyToken.mockClear()
  })

  afterEach(() => {
    mockDelete.mockClear()
    mockVerifyToken.mockClear()
  })

  describe('authentication', () => {
    it('should return 401 when auth token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
      })

      // Act
      const response = await DELETE(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
    })

    it('should return 401 when auth token is invalid', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'))

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=invalid-token',
        },
      })

      // Act
      const response = await DELETE(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('invalid-token')
    })

    it('should return 401 when auth token is expired', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed: token is expired'))

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=expired-token',
        },
      })

      // Act
      const response = await DELETE(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(mockVerifyToken).toHaveBeenCalledWith('expired-token')
    })

    it('should not call prisma.user.delete when token is missing', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
      })

      // Act
      await DELETE(request)

      // Assert
      expect(mockDelete).not.toHaveBeenCalled()
    })
  })

  describe('successful account deletion', () => {
    it('should return 200 when user is deleted successfully', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDelete.mockResolvedValue({
        user_id: userId,
        email: 'test@example.com',
      })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request)

      // Assert
      expect(response.status).toBe(200)
    })

    it('should call prisma.user.delete with correct userId', async () => {
      // Arrange
      const userId = 'specific-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'specific@example.com' })
      mockDelete.mockResolvedValue({ user_id: userId })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await DELETE(request)

      // Assert
      expect(mockDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        })
      )
    })

    it('should clear auth-token cookie in the response', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDelete.mockResolvedValue({ user_id: userId })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request)

      // Assert
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toBeTruthy()
      expect(setCookieHeader).toContain('auth-token')
      // cookie는 만료되거나 빈값으로 설정되어야 함
      const isExpired =
        setCookieHeader!.includes('Max-Age=0') ||
        setCookieHeader!.includes('max-age=0') ||
        setCookieHeader!.includes('auth-token=;') ||
        setCookieHeader!.includes('auth-token=,') ||
        (setCookieHeader!.includes('auth-token=') &&
          (setCookieHeader!.includes('Expires=Thu, 01 Jan 1970') ||
            setCookieHeader!.includes('expires=Thu, 01 Jan 1970')))
      expect(isExpired).toBe(true)
    })

    it('should extract userId from JWT token via verifyToken', async () => {
      // Arrange
      const userId = 'jwt-extracted-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'user@example.com' })
      mockDelete.mockResolvedValue({ user_id: userId })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-jwt-token',
        },
      })

      // Act
      await DELETE(request)

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-jwt-token')
      expect(mockDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: userId },
        })
      )
    })

    it('should call prisma.user.delete only once per request', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDelete.mockResolvedValue({ user_id: userId })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      await DELETE(request)

      // Assert
      expect(mockDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('cookie deletion', () => {
    it('should set auth-token cookie to httpOnly', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDelete.mockResolvedValue({ user_id: userId })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request)

      // Assert
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toBeTruthy()
      expect(setCookieHeader!.toLowerCase()).toContain('httponly')
    })

    it('should respond successfully after cookie deletion', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDelete.mockResolvedValue({ user_id: userId })

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request)

      // Assert - 200 응답과 함께 쿠키가 삭제되어야 함
      expect(response.status).toBe(200)
      expect(response.headers.get('set-cookie')).toContain('auth-token')
    })
  })

  describe('error handling', () => {
    it('should return 500 when database delete fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDelete.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should return error response body when delete fails', async () => {
      // Arrange
      const userId = 'test-user-id'
      mockVerifyToken.mockResolvedValue({ userId, email: 'test@example.com' })
      mockDelete.mockRejectedValue(new Error('Record not found'))

      const request = new NextRequest('http://localhost:3000/api/user', {
        method: 'DELETE',
        headers: {
          Cookie: 'auth-token=valid-token',
        },
      })

      // Act
      const response = await DELETE(request)
      const data = await response.json()

      // Assert
      expect(data).toHaveProperty('error')
      expect(typeof data.error).toBe('string')
    })
  })
})
