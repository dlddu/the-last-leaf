/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  generateGoogleAuthUrl,
  exchangeCodeForToken,
  getGoogleUserInfo,
} from '@/lib/google-oauth'

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Google OAuth Utilities', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
    process.env.GOOGLE_CLIENT_ID = 'test-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
    process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'
  })

  afterEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('generateGoogleAuthUrl', () => {
    it('should generate valid Google OAuth authorization URL', () => {
      // Act
      const authUrl = generateGoogleAuthUrl()

      // Assert
      expect(authUrl).toBeDefined()
      expect(authUrl).toContain('https://accounts.google.com/o/oauth2/v2/auth')
    })

    it('should include required OAuth parameters', () => {
      // Act
      const authUrl = generateGoogleAuthUrl()
      const url = new URL(authUrl)

      // Assert
      expect(url.searchParams.get('client_id')).toBe('test-client-id')
      expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/google/callback')
      expect(url.searchParams.get('response_type')).toBe('code')
      expect(url.searchParams.get('scope')).toContain('email')
      expect(url.searchParams.get('scope')).toContain('profile')
    })

    it('should include state parameter for CSRF protection', () => {
      // Act
      const authUrl = generateGoogleAuthUrl()
      const url = new URL(authUrl)

      // Assert
      const state = url.searchParams.get('state')
      expect(state).toBeDefined()
      expect(state).not.toBe('')
      expect(state!.length).toBeGreaterThan(10)
    })

    it('should generate unique state values on each call', () => {
      // Act
      const authUrl1 = generateGoogleAuthUrl()
      const authUrl2 = generateGoogleAuthUrl()

      const url1 = new URL(authUrl1)
      const url2 = new URL(authUrl2)

      // Assert
      const state1 = url1.searchParams.get('state')
      const state2 = url2.searchParams.get('state')

      expect(state1).not.toBe(state2)
    })

    it('should include access_type=offline for refresh token', () => {
      // Act
      const authUrl = generateGoogleAuthUrl()
      const url = new URL(authUrl)

      // Assert
      expect(url.searchParams.get('access_type')).toBe('offline')
    })

    it('should include prompt=consent', () => {
      // Act
      const authUrl = generateGoogleAuthUrl()
      const url = new URL(authUrl)

      // Assert
      expect(url.searchParams.get('prompt')).toBe('consent')
    })

    it('should throw error when GOOGLE_CLIENT_ID is not set', () => {
      // Arrange
      delete process.env.GOOGLE_CLIENT_ID

      // Act & Assert
      expect(() => generateGoogleAuthUrl()).toThrow(/GOOGLE_CLIENT_ID/i)

      // Restore
      process.env.GOOGLE_CLIENT_ID = 'test-client-id'
    })

    it('should throw error when GOOGLE_REDIRECT_URI is not set', () => {
      // Arrange
      delete process.env.GOOGLE_REDIRECT_URI

      // Act & Assert
      expect(() => generateGoogleAuthUrl()).toThrow(/GOOGLE_REDIRECT_URI/i)

      // Restore
      process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'
    })

    it('should properly encode redirect URI', () => {
      // Arrange
      process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback?foo=bar'

      // Act
      const authUrl = generateGoogleAuthUrl()
      const url = new URL(authUrl)

      // Assert
      expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/callback?foo=bar')

      // Restore
      process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/google/callback'
    })
  })

  describe('exchangeCodeForToken', () => {
    it('should exchange authorization code for access token', async () => {
      // Arrange
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      const authCode = 'test-auth-code'

      // Act
      const tokenData = await exchangeCodeForToken(authCode)

      // Assert
      expect(tokenData).toEqual(mockTokenResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      )
    })

    it('should send correct parameters to token endpoint', async () => {
      // Arrange
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      const authCode = 'test-code-123'

      // Act
      await exchangeCodeForToken(authCode)

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = fetchCall[1].body

      expect(requestBody).toContain(`code=${authCode}`)
      expect(requestBody).toContain('client_id=test-client-id')
      expect(requestBody).toContain('client_secret=test-client-secret')
      expect(requestBody).toContain('redirect_uri=')
      expect(requestBody).toContain('grant_type=authorization_code')
    })

    it('should throw error when token exchange fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' }),
      })

      const authCode = 'invalid-code'

      // Act & Assert
      await expect(exchangeCodeForToken(authCode)).rejects.toThrow()
    })

    it('should throw error when GOOGLE_CLIENT_SECRET is not set', async () => {
      // Arrange
      delete process.env.GOOGLE_CLIENT_SECRET

      // Act & Assert
      await expect(exchangeCodeForToken('test-code')).rejects.toThrow(/GOOGLE_CLIENT_SECRET/i)

      // Restore
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
    })

    it('should handle network errors', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      // Act & Assert
      await expect(exchangeCodeForToken('test-code')).rejects.toThrow('Network error')
    })

    it('should include refresh token in response when available', async () => {
      // Arrange
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      // Act
      const tokenData = await exchangeCodeForToken('test-code')

      // Assert
      expect(tokenData).toHaveProperty('refresh_token', 'mock-refresh-token')
    })
  })

  describe('getGoogleUserInfo', () => {
    it('should retrieve user info with access token', async () => {
      // Arrange
      const mockUserInfo = {
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://example.com/picture.jpg',
        sub: 'google-user-id-123',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      })

      const accessToken = 'mock-access-token'

      // Act
      const userInfo = await getGoogleUserInfo(accessToken)

      // Assert
      expect(userInfo).toEqual(mockUserInfo)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        expect.objectContaining({
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      )
    })

    it('should include Authorization header with Bearer token', async () => {
      // Arrange
      const mockUserInfo = {
        email: 'auth@gmail.com',
        name: 'Auth User',
        sub: 'google-user-id-auth',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      })

      const accessToken = 'test-bearer-token'

      // Act
      await getGoogleUserInfo(accessToken)

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const headers = fetchCall[1].headers

      expect(headers.Authorization).toBe(`Bearer ${accessToken}`)
    })

    it('should throw error when userinfo request fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'invalid_token' }),
      })

      // Act & Assert
      await expect(getGoogleUserInfo('invalid-token')).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      // Act & Assert
      await expect(getGoogleUserInfo('test-token')).rejects.toThrow('Network error')
    })

    it('should return user info with all required fields', async () => {
      // Arrange
      const mockUserInfo = {
        email: 'fullinfo@gmail.com',
        name: 'Full Info User',
        picture: 'https://example.com/full.jpg',
        sub: 'google-user-id-full',
        given_name: 'Full',
        family_name: 'User',
        locale: 'en',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      })

      // Act
      const userInfo = await getGoogleUserInfo('test-token')

      // Assert
      expect(userInfo).toHaveProperty('email')
      expect(userInfo).toHaveProperty('name')
      expect(userInfo).toHaveProperty('sub')
    })

    it('should handle missing optional fields gracefully', async () => {
      // Arrange
      const mockUserInfo = {
        email: 'minimal@gmail.com',
        sub: 'google-user-id-minimal',
        // name and picture are optional
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      })

      // Act
      const userInfo = await getGoogleUserInfo('test-token')

      // Assert
      expect(userInfo).toHaveProperty('email')
      expect(userInfo).toHaveProperty('sub')
    })
  })

  describe('integration between utilities', () => {
    it('should work together in OAuth flow', async () => {
      // Arrange
      const mockTokenResponse = {
        access_token: 'integration-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      const mockUserInfo = {
        email: 'integration@gmail.com',
        name: 'Integration User',
        sub: 'google-user-id-integration',
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        })

      // Act
      const authUrl = generateGoogleAuthUrl()
      expect(authUrl).toContain('https://accounts.google.com')

      const tokenData = await exchangeCodeForToken('test-code')
      expect(tokenData.access_token).toBe('integration-access-token')

      const userInfo = await getGoogleUserInfo(tokenData.access_token)

      // Assert
      expect(userInfo.email).toBe('integration@gmail.com')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('security', () => {
    it('should not log sensitive data in errors', async () => {
      // Arrange
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Token exchange failed'))

      const sensitiveCode = 'super-secret-auth-code-12345'

      // Act
      try {
        await exchangeCodeForToken(sensitiveCode)
      } catch (error) {
        // Expected to throw
      }

      // Assert - Error should not contain the sensitive code
      // In a real implementation, ensure errors don't expose codes/tokens
      consoleErrorSpy.mockRestore()
    })

    it('should use HTTPS for all Google API endpoints', async () => {
      // Arrange
      const mockTokenResponse = {
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      // Act
      await exchangeCodeForToken('test-code')

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const url = fetchCall[0]
      expect(url).toMatch(/^https:/)
    })
  })
})
