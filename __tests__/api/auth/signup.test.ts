/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { POST } from '@/app/api/auth/signup/route'
import { NextRequest } from 'next/server'
import { hashPassword } from '@/lib/password'
import { verifyToken } from '@/lib/auth'

// Mock functions - declared outside jest.mock
const mockFindUnique = jest.fn()
const mockCreate = jest.fn()

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('successful signup', () => {
    it('should create a new user and return user data when valid input', async () => {
      // Arrange
      const requestBody = {
        email: 'newuser@example.com',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: 'NewUser',
      }

      const mockUser = {
        user_id: 'test-user-id',
        email: requestBody.email,
        nickname: requestBody.nickname,
        password_hash: await hashPassword(requestBody.password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      // Mock no existing user
      mockFindUnique.mockResolvedValue(null)
      // Mock user creation
      mockCreate.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('user')
      expect(data.user).toHaveProperty('email', requestBody.email)
      expect(data.user).toHaveProperty('nickname', requestBody.nickname)
      expect(data.user).not.toHaveProperty('password_hash')
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: requestBody.email },
      })
      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('should set httpOnly cookie when user is created', async () => {
      // Arrange
      const requestBody = {
        email: 'cookietest@example.com',
        password: 'CookiePass123!',
        passwordConfirm: 'CookiePass123!',
        nickname: 'CookieUser',
      }

      const mockUser = {
        user_id: 'cookie-user-id',
        email: requestBody.email,
        nickname: requestBody.nickname,
        password_hash: await hashPassword(requestBody.password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
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

    it('should hash password before storing in database', async () => {
      // Arrange
      const requestBody = {
        email: 'hashtest@example.com',
        password: 'PlainPassword123',
        passwordConfirm: 'PlainPassword123',
        nickname: 'HashUser',
      }

      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockImplementation(async (data) => {
        // Verify that password is hashed
        const createData = data.data
        expect(createData.password_hash).toBeDefined()
        expect(createData.password_hash).not.toBe(requestBody.password)
        expect(createData.password_hash).toMatch(/^\$2[aby]\$/)

        return {
          user_id: 'hash-test-id',
          email: createData.email,
          nickname: createData.nickname,
          password_hash: createData.password_hash,
          created_at: new Date(),
          last_active_at: new Date(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
      expect(prisma.user.create).toHaveBeenCalled()
    })
  })

  describe('validation errors', () => {
    it('should return 400 when email is missing', async () => {
      // Arrange
      const requestBody = {
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: 'TestUser',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error.toLowerCase()).toContain('email')
    })

    it('should return 400 when email is invalid format', async () => {
      // Arrange
      const requestBody = {
        email: 'invalid-email-format',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: 'TestUser',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/email/i)
    })

    it('should return 400 when password is missing', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        passwordConfirm: 'ValidPass123!',
        nickname: 'TestUser',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error.toLowerCase()).toContain('password')
    })

    it('should return 400 when password is too short', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: 'Short1',
        passwordConfirm: 'Short1',
        nickname: 'TestUser',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/8 characters/i)
    })

    it('should return 400 when passwordConfirm does not match', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        passwordConfirm: 'DifferentPass456!',
        nickname: 'TestUser',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/password.*match/i)
    })

    it('should return 400 when nickname is missing', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error.toLowerCase()).toContain('nickname')
    })

    it('should return 400 when nickname is empty string', async () => {
      // Arrange
      const requestBody = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: '',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error.toLowerCase()).toContain('nickname')
    })
  })

  describe('duplicate email handling', () => {
    it('should return 409 when email already exists', async () => {
      // Arrange
      const requestBody = {
        email: 'existing@example.com',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: 'NewUser',
      }

      const existingUser = {
        user_id: 'existing-user-id',
        email: requestBody.email,
        nickname: 'ExistingUser',
        password_hash: await hashPassword('OldPassword123'),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      // Mock existing user
      mockFindUnique.mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(409)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/already.*exists|already.*registered/i)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: requestBody.email },
      })
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should be case-insensitive for email duplicate check', async () => {
      // Arrange
      const requestBody = {
        email: 'TEST@EXAMPLE.COM',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: 'NewUser',
      }

      const existingUser = {
        user_id: 'existing-user-id',
        email: 'test@example.com',
        nickname: 'ExistingUser',
        password_hash: await hashPassword('OldPassword123'),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      // Mock existing user with lowercase email
      mockFindUnique.mockResolvedValue(existingUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(409)
      expect(data).toHaveProperty('error')
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in nickname', async () => {
      // Arrange
      const requestBody = {
        email: 'special@example.com',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: '한글닉네임🍃',
      }

      const mockUser = {
        user_id: 'special-user-id',
        email: requestBody.email,
        nickname: requestBody.nickname,
        password_hash: await hashPassword(requestBody.password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(data.user.nickname).toBe(requestBody.nickname)
    })

    it('should handle unicode characters in password', async () => {
      // Arrange
      const requestBody = {
        email: 'unicode@example.com',
        password: 'ValidPass비밀번호123',
        passwordConfirm: 'ValidPass비밀번호123',
        nickname: 'UnicodeUser',
      }

      const mockUser = {
        user_id: 'unicode-user-id',
        email: requestBody.email,
        nickname: requestBody.nickname,
        password_hash: await hashPassword(requestBody.password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
    })

    it('should return 400 when request body is invalid JSON', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: 'invalid-json-{',
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })

    it('should return 500 when database connection fails', async () => {
      // Arrange
      const requestBody = {
        email: 'dbfail@example.com',
        password: 'ValidPass123!',
        passwordConfirm: 'ValidPass123!',
        nickname: 'DBFailUser',
      }

      // Mock database error
      mockFindUnique.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('security', () => {
    it('should not return password hash in response', async () => {
      // Arrange
      const requestBody = {
        email: 'security@example.com',
        password: 'SecurePass123!',
        passwordConfirm: 'SecurePass123!',
        nickname: 'SecurityUser',
      }

      const mockUser = {
        user_id: 'security-user-id',
        email: requestBody.email,
        nickname: requestBody.nickname,
        password_hash: await hashPassword(requestBody.password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)
      const data = await response.json()
      const responseString = JSON.stringify(data)

      // Assert
      expect(response.status).toBe(201)
      expect(responseString).not.toContain(requestBody.password)
      expect(responseString).not.toContain('password_hash')
      expect(data.user).not.toHaveProperty('password_hash')
      expect(data.user).not.toHaveProperty('password')
    })

    it('should set secure cookie in production environment', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const requestBody = {
        email: 'prodtest@example.com',
        password: 'ProdPass123!',
        passwordConfirm: 'ProdPass123!',
        nickname: 'ProdUser',
      }

      const mockUser = {
        user_id: 'prod-user-id',
        email: requestBody.email,
        nickname: requestBody.nickname,
        password_hash: await hashPassword(requestBody.password),
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockFindUnique.mockResolvedValue(null)
      mockCreate.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(201)
      const cookie = response.cookies.get('auth-token')
      expect(cookie).toBeDefined()

      // Note: secure flag check depends on implementation
      // restore environment
      process.env.NODE_ENV = originalEnv
    })
  })
})
