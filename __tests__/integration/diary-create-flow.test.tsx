import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

import DiaryCreatePage from '@/app/diary/new/page'

describe('Diary Create Flow - Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Initial State (idle)', () => {
    it('should start in idle state', () => {
      // Arrange & Act
      render(<DiaryCreatePage />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea).toHaveValue('')
      expect(screen.getByTestId('save-status')).toBeInTheDocument()
    })

    it('should display empty character count', () => {
      // Arrange & Act
      render(<DiaryCreatePage />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent('0')
    })

    it('should not show ConfirmLeaveModal in idle state', () => {
      // Arrange & Act
      render(<DiaryCreatePage />)

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should allow navigation back without confirmation when idle', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.click(backButton)

      // Assert
      expect(mockBack).toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Dirty State (content entered)', () => {
    it('should transition to dirty state when user types', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')

      // Act
      await user.type(textarea, 'Hello world')

      // Assert
      expect(textarea).toHaveValue('Hello world')
      expect(screen.getByTestId('save-status')).toHaveTextContent(/저장되지 않음|unsaved/i)
    })

    it('should update character count as user types', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')

      // Act
      await user.type(textarea, 'Test')

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent('4')
    })

    it('should show ConfirmLeaveModal when back button clicked in dirty state', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.type(textarea, 'Some content')
      await user.click(backButton)

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/저장하지 않고 나갈까요/i)).toBeInTheDocument()
    })

    it('should stay on page when cancel clicked in modal', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.type(textarea, 'Some content')
      await user.click(backButton)
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })
      await user.click(cancelButton)

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(textarea).toHaveValue('Some content')
      expect(mockBack).not.toHaveBeenCalled()
    })

    it('should leave page when confirm clicked in modal', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.type(textarea, 'Some content')
      await user.click(backButton)
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })
      await user.click(confirmButton)

      // Assert
      expect(mockBack).toHaveBeenCalled()
    })

    it('should close modal when Escape key pressed', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.type(textarea, 'Some content')
      await user.click(backButton)
      await user.keyboard('{Escape}')

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Saving State', () => {
    it('should transition to saving state when save button clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ diary_id: 'diary-123' }),
        }), 100))
      )
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      expect(screen.getByTestId('save-status')).toHaveTextContent(/저장 중|saving/i)
      expect(saveButton).toBeDisabled()
    })

    it('should disable save button while saving', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ diary_id: 'diary-123' }),
        }), 100))
      )
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      expect(saveButton).toBeDisabled()
    })

    it('should send POST request with content', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ diary_id: 'diary-123' }),
      })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'My diary entry')
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/diary',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify({ content: 'My diary entry' }),
          })
        )
      })
    })

    it('should not allow multiple simultaneous save requests', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ diary_id: 'diary-123' }),
        }), 100))
      )
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)
      await user.click(saveButton) // Try to click again

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Success State', () => {
    it('should navigate to diary detail page on success', async () => {
      // Arrange
      const user = userEvent.setup()
      const diaryId = 'diary-123'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ diary_id: diaryId }),
      })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/diary/${diaryId}`)
      })
    })

    it('should not show ConfirmLeaveModal after successful save', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ diary_id: 'diary-123' }),
      })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error status when save fails', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('save-status')).toHaveTextContent(/오류|error|실패|failed/i)
      })
    })

    it('should enable save button after error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should allow retry after error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ diary_id: 'diary-123' }),
        })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act - First attempt (fails)
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByTestId('save-status')).toHaveTextContent(/오류|error|실패|failed/i)
      })

      // Act - Second attempt (succeeds)
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/diary/diary-123')
      })
    })

    it('should show toast notification on error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        // Should show some error notification (toast, message, etc.)
        expect(screen.getByTestId('save-status')).toHaveTextContent(/오류|error|실패|failed/i)
      })
    })

    it('should handle network error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('save-status')).toHaveTextContent(/오류|error|실패|failed/i)
      })
    })

    it('should handle 401 unauthorized error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.type(textarea, 'Test content')
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        // Should show error or redirect to login
        expect(screen.getByTestId('save-status')).toHaveTextContent(/오류|error|실패|failed/i)
      })
    })
  })

  describe('Mobile Zoom Prevention', () => {
    it('should have textarea font-size of 16px to prevent zoom', () => {
      // Arrange & Act
      render(<DiaryCreatePage />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      const hasCorrectFontSize =
        textarea.className.includes('text-base') ||
        textarea.className.includes('text-lg') ||
        textarea.style.fontSize === '16px' ||
        textarea.style.fontSize === '1rem'
      expect(hasCorrectFontSize).toBe(true)
    })
  })

  describe('Character Count', () => {
    it('should count characters correctly', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')

      // Act
      await user.type(textarea, 'Hello')

      // Assert
      expect(screen.getByTestId('char-count')).toHaveTextContent('5')
    })

    it('should count newlines as characters', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')

      // Act
      await user.type(textarea, 'Line 1{Enter}Line 2')

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(parseInt(charCount.textContent || '0')).toBeGreaterThan(12) // Includes newline
    })

    it('should count emojis correctly', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')

      // Act
      await user.click(textarea)
      await user.paste('😀😃😄')

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(parseInt(charCount.textContent || '0')).toBeGreaterThan(0)
    })
  })

  describe('Date Display', () => {
    it('should display today date automatically', () => {
      // Arrange & Act
      render(<DiaryCreatePage />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      const today = new Date()
      const year = today.getFullYear()
      expect(dateElement.textContent).toContain(year.toString())
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty content submission gracefully', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.click(saveButton)

      // Assert - Should not send request or show validation error
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle very long content', async () => {
      // Arrange
      const user = userEvent.setup()
      const longContent = 'A'.repeat(10000)
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')

      // Act
      await user.click(textarea)
      await user.paste(longContent)

      // Assert
      expect(screen.getByTestId('char-count')).toHaveTextContent('10,000')
    })

    it('should preserve content when modal is cancelled', async () => {
      // Arrange
      const user = userEvent.setup()
      const content = 'Important content'
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.type(textarea, content)
      await user.click(backButton)
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })
      await user.click(cancelButton)

      // Assert
      expect(textarea).toHaveValue(content)
    })

    it('should handle rapid typing without lag', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryCreatePage />)
      const textarea = screen.getByTestId('diary-content-input')

      // Act
      await user.type(textarea, 'Quick brown fox jumps over the lazy dog', { delay: 1 })

      // Assert
      expect(textarea.value.length).toBeGreaterThan(0)
      expect(screen.getByTestId('char-count')).toBeInTheDocument()
    })
  })
})
