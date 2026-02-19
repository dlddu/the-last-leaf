/**
 * @jest-environment node
 */

// Mock Prisma using factory function that requires __mocks__ file
const mockModule = jest.requireActual<typeof import('@/lib/__mocks__/prisma')>(
  '../../../lib/__mocks__/prisma'
)
const { mockFindUnique, mockUpsert, prisma: mockPrisma } = mockModule

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock fetch for Google OAuth API calls
global.fetch = jest.fn()

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Use require to load route module after jest.mock calls are registered
// (importing jest from @jest/globals prevents SWC from hoisting jest.mock)
const { GET } = require('@/app/api/auth/google/callback/route') as typeof import('@/app/api/auth/google/callback/route')


describe('GET /api/auth/google/callback', () => {
  beforeEach(() => {
    // Clear mock calls and reset mock state
    mockFindUnique.mockClear()
    mockUpsert.mockClear()
    ;(global.fetch as jest.Mock).mockClear()

    // Setup environment variables
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'
  })

  afterEach(() => {
    mockFindUnique.mockClear()
    mockUpsert.mockClear()
    ;(global.fetch as jest.Mock).mockClear()
  })
  describe('successful OAuth flow - new user', () => {
    it('should create new user when email does not exist', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'newuser@gmail.com',
        name: 'New User',
        picture: 'https://example.com/picture.jpg',
        sub: 'google-user-id-123',
      }

      // Mock Google token exchange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGoogleTokenResponse,
      })

      // Mock Google userinfo API
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGoogleUserInfo,
      })

      const mockCreatedUser = {
        user_id: 'new-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      // Mock user upsert (create)
      mockUpsert.mockResolvedValue(mockCreatedUser)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-auth-code',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toMatch(/\/diary$/)
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { email: mockGoogleUserInfo.email },
        create: expect.objectContaining({
          email: mockGoogleUserInfo.email,
          nickname: mockGoogleUserInfo.name,
          password_hash: null,
        }),
        update: expect.objectContaining({
          last_active_at: expect.any(Date),
        }),
      })
    })

    it('should set password_hash to null for social-only account', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'socialonly@gmail.com',
        name: 'Social User',
        picture: 'https://example.com/picture.jpg',
        sub: 'google-user-id-456',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      const mockCreatedUser = {
        user_id: 'social-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpsert.mockImplementation(async (data) => {
        // Verify password_hash is null
        expect(data.create.password_hash).toBeNull()
        return mockCreatedUser
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-social-code',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(mockUpsert).toHaveBeenCalled()
    })

    it('should set httpOnly cookie with JWT token', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'cookietest@gmail.com',
        name: 'Cookie User',
        sub: 'google-user-id-789',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      const mockUser = {
        user_id: 'cookie-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      }

      mockUpsert.mockResolvedValue(mockUser)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-cookie-code',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
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

    it('should redirect to /diary after successful authentication', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'redirect@gmail.com',
        name: 'Redirect User',
        sub: 'google-user-id-redirect',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      mockUpsert.mockResolvedValue({
        user_id: 'redirect-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-redirect-code',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toMatch(/\/diary$/)
    })
  })

  describe('successful OAuth flow - existing user', () => {
    it('should login existing user without creating duplicate', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'existing@gmail.com',
        name: 'Existing User',
        sub: 'google-user-id-existing',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      const existingUser = {
        user_id: 'existing-user-id',
        email: mockGoogleUserInfo.email,
        nickname: 'Original Nickname',
        password_hash: null,
        created_at: new Date('2024-01-01'),
        last_active_at: new Date(),
      }

      // Mock upsert to return existing user (update case)
      mockUpsert.mockResolvedValue(existingUser)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-existing-code',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { email: mockGoogleUserInfo.email },
        create: expect.any(Object),
        update: expect.objectContaining({
          last_active_at: expect.any(Date),
        }),
      })
    })

    it('should update last_active_at for existing user', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'updatetime@gmail.com',
        name: 'Update User',
        sub: 'google-user-id-update',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      const oldTimestamp = new Date('2024-01-01')
      const existingUser = {
        user_id: 'update-user-id',
        email: mockGoogleUserInfo.email,
        nickname: 'Update User',
        password_hash: null,
        created_at: oldTimestamp,
        last_active_at: new Date(),
      }

      mockUpsert.mockResolvedValue(existingUser)

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-update-time',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { email: mockGoogleUserInfo.email },
        create: expect.any(Object),
        update: {
          last_active_at: expect.any(Date),
        },
      })
    })
  })

  describe('error handling', () => {
    it('should redirect to login with error when authorization code is missing', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toMatch(/\/login\?error=/)
    })

    it('should redirect to login with error when OAuth callback contains error parameter', async () => {
      // Arrange
      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?error=access_denied',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toMatch(/\/login\?error=google_login_failed/)
    })

    it('should redirect to login with error when Google token exchange fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' }),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=invalid-code',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toMatch(/\/login\?error=authentication_failed/)
    })

    it('should redirect to login with error when Google userinfo API fails', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'invalid_token' }),
        })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-userinfo-fail',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toMatch(/\/login\?error=authentication_failed/)
    })

    it('should redirect to login with error when GOOGLE_CLIENT_SECRET is not configured', async () => {
      // Arrange
      delete process.env.GOOGLE_CLIENT_SECRET

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-no-secret',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toMatch(/\/login\?error=authentication_failed/)

      // Restore
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
    })
  })

  describe('database error handling', () => {
    it('should return 500 when database upsert fails', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'dbfail@gmail.com',
        name: 'DB Fail User',
        sub: 'google-user-id-dbfail',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      // Mock database error
      mockUpsert.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-db-fail',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/internal.*server.*error|database.*error/i)
    })
  })

  describe('security', () => {
    it('should not expose Google access token in response', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'secret-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'security@gmail.com',
        name: 'Security User',
        sub: 'google-user-id-security',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      mockUpsert.mockResolvedValue({
        user_id: 'security-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-security',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert - Response should not contain access token
      const responseText = await response.text()
      expect(responseText).not.toContain('secret-access-token')
    })
  })

  describe('cookie security settings', () => {
    it('should set SameSite=Lax on auth cookie', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'samesite@gmail.com',
        name: 'SameSite User',
        sub: 'google-user-id-samesite',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      mockUpsert.mockResolvedValue({
        user_id: 'samesite-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-samesite',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      const cookie = response.cookies.get('auth-token')
      expect(cookie).toBeDefined()
      expect(cookie?.sameSite).toBe('lax')
    })

    it('should set appropriate cookie expiration', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'expiry@gmail.com',
        name: 'Expiry User',
        sub: 'google-user-id-expiry',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      mockUpsert.mockResolvedValue({
        user_id: 'expiry-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-expiry',
        { method: 'GET' }
      )

      // Act
      const response = await GET(request)

      // Assert
      const cookie = response.cookies.get('auth-token')
      expect(cookie).toBeDefined()
      // Cookie should have maxAge set (7 days = 604800 seconds)
      expect(cookie?.maxAge).toBe(7 * 24 * 60 * 60)
    })
  })

  describe('Google API integration', () => {
    it('should send correct parameters to Google token endpoint', async () => {
      // Arrange
      const mockGoogleTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'tokenparams@gmail.com',
        name: 'Token Params User',
        sub: 'google-user-id-params',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      mockUpsert.mockResolvedValue({
        user_id: 'params-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      })

      const authCode = 'test-auth-code-params'
      const request = new NextRequest(
        `http://localhost:3000/api/auth/google/callback?code=${authCode}`,
        { method: 'GET' }
      )

      // Act
      await GET(request)

      // Assert - Check fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      )

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = fetchCall[1].body
      expect(requestBody).toContain(`code=${authCode}`)
      expect(requestBody).toContain('client_id=test-google-client-id')
      expect(requestBody).toContain('client_secret=test-google-client-secret')
      expect(requestBody).toContain('redirect_uri=')
      expect(requestBody).toContain('grant_type=authorization_code')
    })

    it('should request user info with correct access token', async () => {
      // Arrange
      const accessToken = 'test-access-token-123'
      const mockGoogleTokenResponse = {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockGoogleUserInfo = {
        email: 'userinfo@gmail.com',
        name: 'User Info User',
        sub: 'google-user-id-userinfo',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockGoogleUserInfo,
        })

      mockUpsert.mockResolvedValue({
        user_id: 'userinfo-user-id',
        email: mockGoogleUserInfo.email,
        nickname: mockGoogleUserInfo.name,
        password_hash: null,
        created_at: new Date(),
        last_active_at: new Date(),
      })

      const request = new NextRequest(
        'http://localhost:3000/api/auth/google/callback?code=test-userinfo',
        { method: 'GET' }
      )

      // Act
      await GET(request)

      // Assert - Check userinfo API was called with Bearer token
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
        })
      )
    })
  })
})
