/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import GoogleLoginButton from '@/components/GoogleLoginButton'

// Mock fetch
global.fetch = jest.fn()

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
    // Mock window.location
    delete (window as any).location
    ;(window as any).location = { href: '' }
  })

  describe('rendering', () => {
    it('should render button with Google text', () => {
      // Act
      render(<GoogleLoginButton />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(/google/i)
    })

    it('should render Google logo SVG', () => {
      // Act
      render(<GoogleLoginButton />)

      // Assert
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should have appropriate button styling', () => {
      // Act
      render(<GoogleLoginButton />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('flex')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-center')
    })

    it('should be accessible with proper aria attributes', () => {
      // Act
      render(<GoogleLoginButton />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('click behavior', () => {
    it('should call Google OAuth endpoint when clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        redirected: true,
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
      })

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/google', expect.any(Object))
      })
    })

    it('should disable button while request is in progress', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as jest.Mock).mockReturnValue(promise)

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert - Button should be disabled
      await waitFor(() => {
        expect(button).toBeDisabled()
      })

      // Cleanup
      resolvePromise!({
        ok: true,
        redirected: true,
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
      })
    })

    it('should show loading state while processing', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as jest.Mock).mockReturnValue(promise)

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert - Check for loading indicator
      await waitFor(() => {
        expect(button).toHaveTextContent(/loading|로딩|처리/i)
      })

      // Cleanup
      resolvePromise!({
        ok: true,
        redirected: true,
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
      })
    })

    it('should redirect to Google OAuth URL on successful response', async () => {
      // Arrange
      const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=test'

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        redirected: true,
        url: googleOAuthUrl,
      })

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert
      await waitFor(() => {
        expect(window.location.href).toBe(googleOAuthUrl)
      })
    })
  })

  describe('error handling', () => {
    it('should show error message when OAuth initiation fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert - Check for error message
      await waitFor(() => {
        const errorMessage = screen.queryByText(/error|오류|failed|실패/i)
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('should re-enable button after error', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert - Button should be re-enabled after error
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })

    it('should handle 500 server error gracefully', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert
      await waitFor(() => {
        const errorMessage = screen.queryByText(/error|오류/i)
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('should handle missing Google configuration error', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Google OAuth not configured' }),
      })

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert
      await waitFor(() => {
        const errorMessage = screen.queryByText(/configuration|설정|configured/i)
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should be keyboard accessible', () => {
      // Act
      render(<GoogleLoginButton />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should have proper focus styles', () => {
      // Act
      render(<GoogleLoginButton />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none')
      expect(button).toHaveClass('focus:ring-2')
    })

    it('should announce loading state to screen readers', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as jest.Mock).mockReturnValue(promise)

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-busy', 'true')
      })

      // Cleanup
      resolvePromise!({
        ok: true,
        redirected: true,
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
      })
    })
  })

  describe('multiple clicks prevention', () => {
    it('should prevent multiple simultaneous clicks', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as jest.Mock).mockReturnValue(promise)

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act - Click multiple times rapidly
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      // Assert - Fetch should only be called once
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // Cleanup
      resolvePromise!({
        ok: true,
        redirected: true,
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
      })
    })
  })

  describe('visual states', () => {
    it('should have hover styles', () => {
      // Act
      render(<GoogleLoginButton />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-gray-50')
    })

    it('should have disabled styles when disabled', async () => {
      // Arrange
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as jest.Mock).mockReturnValue(promise)

      render(<GoogleLoginButton />)
      const button = screen.getByRole('button')

      // Act
      fireEvent.click(button)

      // Assert
      await waitFor(() => {
        expect(button).toHaveClass('disabled:opacity-50')
        expect(button).toHaveClass('disabled:cursor-not-allowed')
      })

      // Cleanup
      resolvePromise!({
        ok: true,
        redirected: true,
        url: 'https://accounts.google.com/o/oauth2/v2/auth',
      })
    })
  })
})
