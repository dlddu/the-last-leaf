import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/auth/login'),
}))

// Mock GoogleLoginButton to avoid OAuth complexity
jest.mock('@/components/GoogleLoginButton', () => {
  return function MockGoogleLoginButton() {
    return <button data-testid="google-login-btn">Google로 계속하기</button>
  }
})

// Mock fetch for API calls
global.fetch = jest.fn()

import LoginPage from '@/app/(auth)/auth/login/page'

describe('Login Page - Redirect Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Successful login redirect', () => {
    it('should redirect to /diary (not /dashboard) after successful login', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, user: { email: 'test@example.com' } }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/diary')
      })
    })

    it('should NOT redirect to /dashboard after successful login', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, user: { email: 'test@example.com' } }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByTestId('submit-button'))

      // Assert - wait for push to be called, then verify it was NOT called with /dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard')
    })

    it('should call /api/auth/login endpoint with correct credentials', async () => {
      // Arrange
      const user = userEvent.setup()
      const email = 'user@example.com'
      const password = 'securePass123'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), email)
      await user.type(screen.getByTestId('password-input'), password)
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ email, password }),
          })
        )
      })
    })
  })

  describe('Failed login', () => {
    it('should not redirect when login fails with 401', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid email or password' }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'wrong@example.com')
      await user.type(screen.getByTestId('password-input'), 'wrongpass')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should display error message when login fails', async () => {
      // Arrange
      const user = userEvent.setup()
      const errorMsg = 'Invalid email or password'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: errorMsg }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'bad@example.com')
      await user.type(screen.getByTestId('password-input'), 'badpassword')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        const errorEl = screen.getByTestId('error-message')
        expect(errorEl).toHaveTextContent(errorMsg)
      })
    })

    it('should not redirect when network error occurs', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Loading state', () => {
    it('should disable submit button while loading', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100))
      )
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('should show loading text while submitting', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true }),
        }), 100))
      )
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      expect(screen.getByTestId('submit-button')).toHaveTextContent(/logging in/i)
    })
  })

  describe('Page renders at /auth/login path', () => {
    it('should render login form elements', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should render Google login button as an alternative', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('google-login-btn')).toBeInTheDocument()
    })
  })
})
