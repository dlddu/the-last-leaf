/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { GET } from '@/app/api/auth/google/route'
import { NextRequest } from 'next/server'

describe('GET /api/auth/google', () => {
  beforeEach(() => {
    // Setup environment variables for Google OAuth
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'
  })

  afterEach(() => {
    // Cleanup
  })

  describe('authorization URL generation', () => {
    it('should redirect to Google OAuth authorization URL', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)

      // Assert
      expect(response.status).toBe(307)
      const location = response.headers.get('location')
      expect(location).toBeDefined()
      expect(location).toContain('https://accounts.google.com/o/oauth2/v2/auth')
    })

    it('should include required OAuth parameters in redirect URL', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)

      // Assert
      const location = response.headers.get('location')
      expect(location).toBeDefined()
      if (location) {
        const url = new URL(location)
        expect(url.searchParams.get('client_id')).toBe('test-google-client-id')
        expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/google/callback')
        expect(url.searchParams.get('response_type')).toBe('code')
        expect(url.searchParams.get('scope')).toContain('email')
        expect(url.searchParams.get('scope')).toContain('profile')
      }
    })

    it('should include state parameter for CSRF protection', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)

      // Assert
      const location = response.headers.get('location')
      expect(location).toBeDefined()
      if (location) {
        const url = new URL(location)
        const state = url.searchParams.get('state')
        expect(state).toBeDefined()
        expect(state).not.toBe('')
      }
    })

    it('should include access_type=offline for refresh token', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)

      // Assert
      const location = response.headers.get('location')
      expect(location).toBeDefined()
      if (location) {
        const url = new URL(location)
        expect(url.searchParams.get('access_type')).toBe('offline')
      }
    })

    it('should include prompt=consent to get consent every time', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)

      // Assert
      const location = response.headers.get('location')
      expect(location).toBeDefined()
      if (location) {
        const url = new URL(location)
        expect(url.searchParams.get('prompt')).toBe('consent')
      }
    })
  })

  describe('error handling', () => {
    it('should return 500 when GOOGLE_CLIENT_ID is not configured', async () => {
      // Arrange
      delete process.env.GOOGLE_CLIENT_ID
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/google.*not.*configured|configuration.*missing/i)

      // Restore
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
    })

    it('should return 500 when GOOGLE_REDIRECT_URI is not configured', async () => {
      // Arrange
      delete process.env.GOOGLE_REDIRECT_URI
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
      expect(data.error).toMatch(/google.*not.*configured|configuration.*missing/i)

      // Restore
      process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'
    })
  })

  describe('security', () => {
    it('should generate different state values for each request', async () => {
      // Arrange
      const request1 = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })
      const request2 = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response1 = await GET(request1)
      const response2 = await GET(request2)

      // Assert
      const location1 = response1.headers.get('location')
      const location2 = response2.headers.get('location')

      if (location1 && location2) {
        const url1 = new URL(location1)
        const url2 = new URL(location2)
        const state1 = url1.searchParams.get('state')
        const state2 = url2.searchParams.get('state')

        expect(state1).not.toBe(state2)
      }
    })

    it('should use HTTPS for Google OAuth URL', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/auth/google', {
        method: 'GET',
      })

      // Act
      const response = await GET(request)

      // Assert
      const location = response.headers.get('location')
      expect(location).toBeDefined()
      if (location) {
        expect(location).toMatch(/^https:/)
      }
    })
  })
})
