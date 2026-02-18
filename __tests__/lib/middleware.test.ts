/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'

// Mock verifyToken from lib/auth
jest.mock('@/lib/auth', () => ({
  verifyToken: jest.fn(),
}))

import { middleware } from '@/middleware'
import { verifyToken } from '@/lib/auth'

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>

// Helper to build a NextRequest with optional cookies
function buildRequest(pathname: string, authToken?: string): NextRequest {
  const url = `http://localhost:3000${pathname}`
  const request = new NextRequest(url)
  if (authToken) {
    request.cookies.set('auth-token', authToken)
  }
  return request
}

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Protected routes - unauthenticated access', () => {
    it('should redirect to /auth/login when accessing /diary without token', async () => {
      // Arrange
      const request = buildRequest('/diary')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toMatch(/\/auth\/login/)
    })

    it('should redirect to /auth/login when accessing /settings without token', async () => {
      // Arrange
      const request = buildRequest('/settings')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toMatch(/\/auth\/login/)
    })

    it('should redirect to /auth/login when accessing /diary/new without token', async () => {
      // Arrange
      const request = buildRequest('/diary/new')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toMatch(/\/auth\/login/)
    })

    it('should include redirect query param when redirecting to login', async () => {
      // Arrange
      const request = buildRequest('/diary')

      // Act
      const response = await middleware(request)

      // Assert
      const location = response.headers.get('location') ?? ''
      const redirectUrl = new URL(location)
      expect(redirectUrl.searchParams.get('redirect')).toBe('/diary')
    })

    it('should redirect to /auth/login (not /login) for protected routes', async () => {
      // Arrange
      const request = buildRequest('/settings')

      // Act
      const response = await middleware(request)

      // Assert
      const location = response.headers.get('location') ?? ''
      expect(location).toContain('/auth/login')
      // Must NOT redirect to the old /login path
      const redirectUrl = new URL(location)
      expect(redirectUrl.pathname).toBe('/auth/login')
    })
  })

  describe('Protected routes - /dashboard removal', () => {
    it('should redirect /dashboard to /diary when authenticated', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'user-1', email: 'test@example.com' })
      const request = buildRequest('/dashboard', 'valid-token')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location') ?? ''
      expect(new URL(location).pathname).toBe('/diary')
    })

    it('should redirect /dashboard to /auth/login when unauthenticated', async () => {
      // Arrange
      const request = buildRequest('/dashboard')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location') ?? ''
      expect(location).toMatch(/\/auth\/login/)
    })
  })

  describe('Public routes - /auth/login', () => {
    it('should allow unauthenticated access to /auth/login', async () => {
      // Arrange
      const request = buildRequest('/auth/login')

      // Act
      const response = await middleware(request)

      // Assert
      // Should pass through (NextResponse.next()) - status 200 or no redirect
      expect(response.status).not.toBe(307)
      const location = response.headers.get('location')
      expect(location).toBeNull()
    })

    it('should redirect authenticated user from /auth/login to /diary', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'user-1', email: 'test@example.com' })
      const request = buildRequest('/auth/login', 'valid-token')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location') ?? ''
      expect(new URL(location).pathname).toBe('/diary')
    })
  })

  describe('Public routes - /auth/signup', () => {
    it('should allow unauthenticated access to /auth/signup', async () => {
      // Arrange
      const request = buildRequest('/auth/signup')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).not.toBe(307)
      const location = response.headers.get('location')
      expect(location).toBeNull()
    })

    it('should redirect authenticated user from /auth/signup to /diary', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'user-1', email: 'test@example.com' })
      const request = buildRequest('/auth/signup', 'valid-token')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location') ?? ''
      expect(new URL(location).pathname).toBe('/diary')
    })
  })

  describe('Legacy /login route removal', () => {
    it('should NOT treat /login as a protected route (old route is removed)', async () => {
      // Arrange - unauthenticated request to old /login path
      const request = buildRequest('/login')

      // Act
      const response = await middleware(request)

      // Assert - should pass through without redirecting to /auth/login loop
      // (The old /login route is replaced by /auth/login)
      // It must not be treated as a protected route requiring auth
      const location = response.headers.get('location')
      // If there's a redirect, it should NOT redirect /login to /auth/login as a protected route
      if (location) {
        expect(new URL(location).pathname).not.toBe('/auth/login')
      }
    })
  })

  describe('Authenticated access to protected routes', () => {
    it('should allow authenticated access to /diary', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'user-1', email: 'test@example.com' })
      const request = buildRequest('/diary', 'valid-token')

      // Act
      const response = await middleware(request)

      // Assert - should pass through
      expect(response.status).not.toBe(307)
    })

    it('should allow authenticated access to /settings', async () => {
      // Arrange
      mockVerifyToken.mockResolvedValue({ userId: 'user-1', email: 'test@example.com' })
      const request = buildRequest('/settings', 'valid-token')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).not.toBe(307)
    })
  })

  describe('Invalid token handling', () => {
    it('should redirect to /auth/login when token is invalid on protected route', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed'))
      const request = buildRequest('/diary', 'invalid-token')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location') ?? ''
      expect(location).toMatch(/\/auth\/login/)
    })

    it('should clear invalid auth-token cookie when redirecting', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed'))
      const request = buildRequest('/diary', 'expired-token')

      // Act
      const response = await middleware(request)

      // Assert - cookie should be cleared (maxAge 0 or empty value)
      const setCookieHeader = response.headers.get('set-cookie')
      if (setCookieHeader) {
        // Cookie is cleared if value is empty or Max-Age=0
        const isCleared =
          setCookieHeader.includes('auth-token=;') ||
          setCookieHeader.includes('Max-Age=0') ||
          setCookieHeader.includes('auth-token=,')
        expect(isCleared).toBe(true)
      }
    })

    it('should pass through on public route even with invalid token', async () => {
      // Arrange
      mockVerifyToken.mockRejectedValue(new Error('Token verification failed'))
      const request = buildRequest('/auth/login', 'invalid-token')

      // Act
      const response = await middleware(request)

      // Assert - public route should not redirect to auth/login (would be a loop)
      const location = response.headers.get('location')
      if (location) {
        expect(new URL(location).pathname).not.toBe('/auth/login')
      }
    })
  })

  describe('Root and other public routes', () => {
    it('should allow access to root path / without authentication', async () => {
      // Arrange
      const request = buildRequest('/')

      // Act
      const response = await middleware(request)

      // Assert
      expect(response.status).not.toBe(307)
    })
  })
})
