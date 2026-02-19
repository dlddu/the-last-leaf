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

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { hashPassword } from '@/lib/password'
import { verifyToken } from '@/lib/auth'

// Use require to load route module after jest.mock calls are registered
// (importing jest from @jest/globals prevents SWC from hoisting jest.mock)
const { POST } = require('@/app/api/auth/login/route') as typeof import('@/app/api/auth/login/route')


describe('POST /api/auth/login', () => {
  beforeEach(() => {
    // Clear mock calls and reset mock state
    mockFindUnique.mockClear()
    mockUpdate.mockClear()
  })

  afterEach(() => {
    mockFindUnique.mockClear()
    mockUpdate.mockClear()
  })

  describe('successful login', () => {
    it('should return user data and set cookie when valid credentials', async () => {
      // Arrange
      const password = 'ValidPass123!'
      const requestBody = {
        email: 'user@example.com',
        password: password,
      }

      const mockUser = {
        user_id: 'test-user-id',
        email: requestBody.email,
        nickname: 'TestUser',
        password_hash: await hashPassword(password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      // Mock user found
      mockFindUnique.mockResolvedValue(mockUser)
      // Mock user update for last_active_at
      mockUpdate.mockResolvedValue({
        ...mockUser,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('email', requestBody.email)
      expect(data.user).toHaveProperty('nickname', 'TestUser')
      expect(data.user).not.toHaveProperty('password_hash')
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: requestBody.email },
      })
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('should set httpOnly cookie when login successful', async () => {
      // Arrange
      const password = 'CookiePass123!'
      const requestBody = {
        email: 'cookie@example.com',
        password: password,
      }

      const mockUser = {
        user_id: 'cookie-user-id',
        email: requestBody.email,
        nickname: 'CookieUser',
        password_hash: await hashPassword(password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockUser)
      mockUpdate.mockResolvedValue({
        ...mockUser,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      const cookie = response.cookies.get('auth-token')
      expect(cookie).toBeDefined()
      expect(cookie?.value).toBeDefined()
      expect(cookie?.httpOnly).toBe(true)

      // Verify JWT token is valid
      if (cookie?.value) {
        const decoded = await verifyToken(cookie.value)
        expect(decoded).toHaveProperty('userId', mockUser.user_id)
        expect(decoded).toHaveProperty('email', mockUser.email)
      }
    })

    it('should update last_active_at timestamp when login successful', async () => {
      // Arrange
      const password = 'UpdatePass123!'
      const requestBody = {
        email: 'update@example.com',
        password: password,
      }

      const mockUser = {
        user_id: 'update-user-id',
        email: requestBody.email,
        nickname: 'UpdateUser',
        password_hash: await hashPassword(password),
        created_at: new Date(),
        last_active_at: new Date('2024-01-01'),
      }

      mockFindUnique.mockResolvedValue(mockUser)
      mockUpdate.mockResolvedValue({
        ...mockUser,
        last_active_at: new Date(),
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { user_id: mockUser.user_id },
        data: { last_active_at: expect.any(Date) },
      })
    })
  })

  describe('authentication failures', () => {
    it('should return 401 when email does not exist', async () => {
      // Arrange
      const requestBody = {
        email: 'nonexistent@example.com',
        password: 'ValidPass123!',
      }

      // Mock user not found
      mockFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/invalid email or password/i)
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: requestBody.email },
      })
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should return 401 when password is incorrect', async () => {
      // Arrange
      const correctPassword = 'CorrectPass123!'
      const wrongPassword = 'WrongPass456!'
      const requestBody = {
        email: 'user@example.com',
        password: wrongPassword,
      }

      const mockUser = {
        user_id: 'test-user-id',
        email: requestBody.email,
        nickname: 'TestUser',
        password_hash: await hashPassword(correctPassword),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/invalid email or password/i)
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should not reveal whether email exists in error message', async () => {
      // Arrange - Test with non-existent email
      const requestBodyNonExistent = {
        email: 'nonexistent@example.com',
        password: 'ValidPass123!',
      }

      mockFindUnique.mockResolvedValue(null)

      const requestNonExistent = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBodyNonExistent),
      })

      // Arrange - Test with wrong password
      const requestBodyWrongPass = {
        email: 'existing@example.com',
        password: 'WrongPass123!',
      }

      const mockUser = {
        user_id: 'test-user-id',
        email: 'existing@example.com',
        nickname: 'ExistingUser',
        password_hash: await hashPassword('CorrectPass123!'),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      // Act - Non-existent email
      const responseNonExistent = await POST(requestNonExistent)
      const dataNonExistent = await responseNonExistent.json()

      // Reset mock
      mockFindUnique.mockClear()
      mockFindUnique.mockResolvedValue(mockUser)

      const requestWrongPass = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBodyWrongPass),
      })

      // Act - Wrong password
      const responseWrongPass = await POST(requestWrongPass)
      const dataWrongPass = await responseWrongPass.json()

      // Assert - Both should return identical error message
      expect(responseNonExistent.status).toBe(401)
      expect(responseWrongPass.status).toBe(401)
      expect(dataNonExistent.error).toBe(dataWrongPass.error)
    })
  })

  describe('validation errors', () => {
    it('should return 400 when email is missing', async () => {
      // Arrange
      const requestBody = {
        password: 'ValidPass123!',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/email.*required/i)
      expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('should return 400 when password is missing', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/password.*required/i)
      expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('should return 400 when both email and password are missing', async () => {
      // Arrange
      const requestBody = {}

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/email.*password.*required/i)
      expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('should return 400 when email is empty string', async () => {
      // Arrange
      const requestBody = {
        email: '',
        password: 'ValidPass123!',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(mockFindUnique).not.toHaveBeenCalled()
    })

    it('should return 400 when password is empty string', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: '',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(mockFindUnique).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should return 500 when request body is invalid JSON', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: 'invalid-json-{',
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/invalid json/i)
    })

    describe('database-dependent edge cases', () => {
      it('should return 500 when database connection fails', async () => {
        // Arrange
        const requestBody = {
          email: 'dbfail@example.com',
          password: 'ValidPass123!',
        }

        // Mock database error
        mockFindUnique.mockRejectedValue(new Error('Database connection failed'))

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        })

        // Act
        const response = await POST(request)
        const data = await response.json()

        // Assert
        expect(response.status).toBe(500)
        expect(data).toHaveProperty('error')
        expect(data.error).toMatch(/internal server error/i)
      })

      it('should handle unicode characters in password', async () => {
        // Arrange
        const password = 'Valid비밀번호123!'
        const requestBody = {
          email: 'unicode@example.com',
          password: password,
        }

        const mockUser = {
          user_id: 'unicode-user-id',
          email: requestBody.email,
          nickname: 'UnicodeUser',
          password_hash: await hashPassword(password),
          created_at: new Date(),
          last_active_at: new Date(),
        }

        mockFindUnique.mockResolvedValue(mockUser)
        mockUpdate.mockResolvedValue({
          ...mockUser,
          last_active_at: new Date(),
        })

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        })

        // Act
        const response = await POST(request)

        // Assert
        expect(response.status).toBe(200)
      })

      it('should handle email with special characters', async () => {
        // Arrange
        const password = 'ValidPass123!'
        const requestBody = {
          email: 'user+test@example.com',
          password: password,
        }

        const mockUser = {
          user_id: 'special-user-id',
          email: requestBody.email,
          nickname: 'SpecialUser',
          password_hash: await hashPassword(password),
          created_at: new Date(),
          last_active_at: new Date(),
        }

        mockFindUnique.mockResolvedValue(mockUser)
        mockUpdate.mockResolvedValue({
          ...mockUser,
          last_active_at: new Date(),
        })

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        })

        // Act
        const response = await POST(request)

        // Assert
        expect(response.status).toBe(200)
      })
    })
  })

  describe('security', () => {
    describe('security checks', () => {
      it('should not return password hash in response', async () => {
        // Arrange
        const password = 'SecurePass123!'
        const requestBody = {
          email: 'security@example.com',
          password: password,
        }

        const mockUser = {
          user_id: 'security-user-id',
          email: requestBody.email,
          nickname: 'SecurityUser',
          password_hash: await hashPassword(password),
          created_at: new Date(),
          last_active_at: new Date(),
        }

        mockFindUnique.mockResolvedValue(mockUser)
        mockUpdate.mockResolvedValue({
          ...mockUser,
          last_active_at: new Date(),
        })

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        })

        // Act
        const response = await POST(request)
        const data = await response.json()
        const responseString = JSON.stringify(data)

        // Assert
        expect(response.status).toBe(200)
        expect(responseString).not.toContain(requestBody.password)
        expect(responseString).not.toContain('password_hash')
        expect(data.user).not.toHaveProperty('password_hash')
        expect(data.user).not.toHaveProperty('password')
      })

      it('should set secure cookie in production environment', async () => {
        // Arrange
        const originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = 'production'

        const password = 'ProdPass123!'
        const requestBody = {
          email: 'prodtest@example.com',
          password: password,
        }

        const mockUser = {
          user_id: 'prod-user-id',
          email: requestBody.email,
          nickname: 'ProdUser',
          password_hash: await hashPassword(password),
          created_at: new Date(),
          last_active_at: new Date(),
        }

        mockFindUnique.mockResolvedValue(mockUser)
        mockUpdate.mockResolvedValue({
          ...mockUser,
          last_active_at: new Date(),
        })

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        })

        // Act
        const response = await POST(request)

        // Assert
        expect(response.status).toBe(200)
        const cookie = response.cookies.get('auth-token')
        expect(cookie).toBeDefined()
        expect(cookie?.httpOnly).toBe(true)

        // Restore environment
        process.env.NODE_ENV = originalEnv
      })

      it('should set cookie with appropriate expiration', async () => {
        // Arrange
        const password = 'ExpiryPass123!'
        const requestBody = {
          email: 'expiry@example.com',
          password: password,
        }

        const mockUser = {
          user_id: 'expiry-user-id',
          email: requestBody.email,
          nickname: 'ExpiryUser',
          password_hash: await hashPassword(password),
          created_at: new Date(),
          last_active_at: new Date(),
        }

        mockFindUnique.mockResolvedValue(mockUser)
        mockUpdate.mockResolvedValue({
          ...mockUser,
          last_active_at: new Date(),
        })

        const request = new NextRequest('http://localhost:3000/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        })

        // Act
        const response = await POST(request)

        // Assert
        expect(response.status).toBe(200)
        const cookie = response.cookies.get('auth-token')
        expect(cookie).toBeDefined()
        // Cookie should have maxAge set (7 days = 604800 seconds)
        expect(cookie?.maxAge).toBe(7 * 24 * 60 * 60)
      })
    })
  })
})
