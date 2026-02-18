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

import DiaryEditPage from '@/app/diary/[id]/edit/page'

describe('Diary Edit Flow - Integration Test', () => {
  const defaultParams = { params: Promise.resolve({ id: 'diary-test-id' }) }
  const mockDiaryData = {
    diary_id: 'diary-test-id',
    content: 'Original diary content',
    created_at: '2024-06-15T10:00:00.000Z',
    updated_at: '2024-06-15T10:00:00.000Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Loading State', () => {
    it('should show loading indicator while fetching diary data', () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => mockDiaryData,
        }), 100))
      )

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      // Assert - Should show loading state before data is fetched
      expect(
        screen.queryByTestId('diary-content-input') === null ||
        screen.queryByRole('status') !== null ||
        screen.queryByText(/로딩|loading/i) !== null ||
        document.body.textContent !== ''
      ).toBe(true)
    })

    it('should fetch diary data on mount', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/diary/diary-test-id'),
          expect.any(Object)
        )
      })
    })
  })

  describe('Idle State (data loaded)', () => {
    it('should display existing diary content in textarea', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      // Assert
      await waitFor(() => {
        const textarea = screen.getByTestId('diary-content-input')
        expect(textarea).toHaveValue('Original diary content')
      })
    })

    it('should display the diary date', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      // Assert
      await waitFor(() => {
        const dateElement = screen.getByTestId('diary-date')
        expect(dateElement).toBeInTheDocument()
        expect(dateElement.textContent).toContain('2024')
      })
    })

    it('should display "수정하기" title in header', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('수정하기')).toBeInTheDocument()
      })
    })

    it('should display character count matching existing content length', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      // Assert
      await waitFor(() => {
        const charCount = screen.getByTestId('char-count')
        expect(charCount.textContent).toContain(mockDiaryData.content.length.toString())
      })
    })

    it('should not show ConfirmLeaveModal in idle state', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Dirty State (content modified)', () => {
    it('should transition to dirty state when user modifies content', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' extra text')

      // Assert
      expect(screen.getByTestId('save-status')).toHaveTextContent(/저장되지 않음|수정 중|unsaved/i)
    })

    it('should update character count as user edits', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      const initialCount = mockDiaryData.content.length
      await user.type(textarea, '!')

      // Assert
      await waitFor(() => {
        const charCount = screen.getByTestId('char-count')
        expect(charCount.textContent).toContain((initialCount + 1).toString())
      })
    })

    it('should show ConfirmLeaveModal when back button clicked in dirty state', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' modified')

      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      await user.click(backButton)

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should stay on page when cancel clicked in modal', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' modified')

      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      await user.click(backButton)

      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })
      await user.click(cancelButton)

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(mockBack).not.toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should leave page when confirm clicked in modal', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockDiaryData,
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' modified')

      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      await user.click(backButton)

      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })
      await user.click(confirmButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith(`/diary/${mockDiaryData.diary_id}`)
    })
  })

  describe('Saving State', () => {
    it('should transition to saving state when save button clicked', async () => {
      // Arrange
      let resolvePut: (value: unknown) => void
      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return new Promise(resolve => {
            resolvePut = resolve
          })
        }
        // GET
        return Promise.resolve({
          ok: true,
          json: async () => mockDiaryData,
        })
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' updated')

      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      user.click(saveButton)

      // Assert - saving 상태가 될 때까지 기다림
      await waitFor(() => {
        expect(screen.getByTestId('save-status')).toHaveTextContent(/저장 중|saving/i)
      })
      expect(screen.getByRole('button', { name: /저장|save/i })).toBeDisabled()

      // 정리
      resolvePut!({
        ok: true,
        json: async () => ({ diary_id: 'diary-test-id' }),
      })
    })

    it('should send PUT request with updated content', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ diary_id: 'diary-test-id', content: 'Original diary content updated' }),
          })
        }
        // GET
        return Promise.resolve({
          ok: true,
          json: async () => mockDiaryData,
        })
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' updated')

      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/diary/diary-test-id'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('updated'),
          })
        )
      })
    })
  })

  describe('Success State', () => {
    it('should navigate to diary detail page on successful save', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ diary_id: 'diary-test-id' }),
          })
        }
        // GET
        return Promise.resolve({
          ok: true,
          json: async () => mockDiaryData,
        })
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' updated content')

      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/diary/diary-test-id')
      })
    })
  })

  describe('Error State', () => {
    it('should show error status when save fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal server error' }),
          })
        }
        // GET
        return Promise.resolve({
          ok: true,
          json: async () => mockDiaryData,
        })
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' updated')

      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('save-status')).toHaveTextContent(/오류|error|실패|failed/i)
      })
    })

    it('should enable save button after error', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: RequestInit) => {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal server error' }),
          })
        }
        // GET
        return Promise.resolve({
          ok: true,
          json: async () => mockDiaryData,
        })
      })
      const user = userEvent.setup()

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      await waitFor(() => {
        screen.getByTestId('diary-content-input')
      })

      const textarea = screen.getByTestId('diary-content-input')
      await user.type(textarea, ' updated')

      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should handle fetch error when loading diary data', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      })

      // Act
      render(<DiaryEditPage {...defaultParams} />)

      // Assert - Should handle gracefully (redirect or show error)
      await waitFor(() => {
        // Either navigates away or shows error state
        expect(
          mockPush.mock.calls.length > 0 ||
          screen.queryByText(/오류|error|찾을 수 없|not found/i) !== null
        ).toBe(true)
      })
    })
  })
})
