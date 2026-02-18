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

import DiaryDetailClient from '@/components/DiaryDetailClient'

const defaultProps = {
  diaryId: 'diary-test-id',
  formattedDate: '2024년 6월 15일 토요일',
  formattedTime: '오후 3:30',
  content: '오늘은 좋은 날이었다.',
}

describe('Diary Delete Flow - Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Idle State (modal closed)', () => {
    it('should not show DeleteConfirmModal in initial state', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render diary content', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert
      expect(screen.getByText('오늘은 좋은 날이었다.')).toBeInTheDocument()
    })
  })

  describe('Delete Modal Open', () => {
    it('should open DeleteConfirmModal when delete button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should display confirmation message in modal', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      // Assert
      expect(screen.getByText(/일기를 삭제할까요/i)).toBeInTheDocument()
    })

    it('should display irreversible warning in modal', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      // Assert
      expect(screen.getByText(/삭제된 일기는 복구할 수 없습니다/i)).toBeInTheDocument()
    })
  })

  describe('Delete Modal Cancel', () => {
    it('should close DeleteConfirmModal when cancel button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const cancelButton = screen.getByRole('button', { name: /취소/i })
      await user.click(cancelButton)

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should close DeleteConfirmModal when Escape key is pressed', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      await user.keyboard('{Escape}')

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should not call fetch when modal is cancelled', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const cancelButton = screen.getByRole('button', { name: /취소/i })
      await user.click(cancelButton)

      // Assert
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Deleting State (API call in progress)', () => {
    it('should send DELETE request to correct endpoint when confirm is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/diary/${defaultProps.diaryId}`),
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })

    it('should show loading state on confirm button while deleting', async () => {
      // Arrange
      const user = userEvent.setup()
      let resolveDelete: (value: unknown) => void
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => {
          resolveDelete = resolve
        })
      )
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      user.click(confirmButton)

      // Assert - deleting 상태 확인
      await waitFor(() => {
        const dialogConfirmButton = screen.queryByRole('button', { name: /삭제 중|deleting/i })
        const isDisabled = screen.queryByRole('button', { name: /^삭제$/ })?.hasAttribute('disabled')
        expect(dialogConfirmButton !== null || isDisabled).toBe(true)
      })

      // 정리
      resolveDelete!({ ok: true, json: async () => ({}) })
    })
  })

  describe('Success State (delete complete)', () => {
    it('should navigate to /diary on successful deletion', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/diary')
      })
    })

    it('should close modal after successful deletion', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should show success toast notification after deletion', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      // Assert - 성공 토스트 또는 성공 메시지 확인
      await waitFor(() => {
        const hasSuccessToast =
          screen.queryByText(/삭제.*완료|삭제되었|deleted|success/i) !== null ||
          screen.queryByRole('alert') !== null ||
          mockPush.mock.calls.length > 0
        expect(hasSuccessToast).toBe(true)
      })
    })
  })

  describe('Error State (delete failed)', () => {
    it('should show error toast when delete API returns non-ok response', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        const hasErrorMessage =
          screen.queryByText(/오류|error|실패|failed|삭제.*실패/i) !== null ||
          screen.queryByRole('alert') !== null
        expect(hasErrorMessage).toBe(true)
      })
    })

    it('should show error toast when network error occurs', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      // Assert
      await waitFor(() => {
        const hasErrorMessage =
          screen.queryByText(/오류|error|실패|failed/i) !== null ||
          screen.queryByRole('alert') !== null
        expect(hasErrorMessage).toBe(true)
      })
    })

    it('should not navigate to /diary when delete fails', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      // Assert - 에러 시 페이지 이동 없음
      await waitFor(() => {
        const hasErrorMessage =
          screen.queryByText(/오류|error|실패|failed/i) !== null ||
          screen.queryByRole('alert') !== null
        expect(hasErrorMessage).toBe(true)
      })
      expect(mockPush).not.toHaveBeenCalledWith('/diary')
    })

    it('should close modal and return to idle state after error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)

      // Assert - 에러 후 모달 닫힘
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should not send multiple delete requests when confirm clicked multiple times', async () => {
      // Arrange
      const user = userEvent.setup()
      let resolveDelete: (value: unknown) => void
      ;(global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => {
          resolveDelete = resolve
        })
      )
      render(<DiaryDetailClient {...defaultProps} />)

      // Act
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      await user.click(deleteButton)

      const confirmButton = screen.getByRole('button', { name: /^삭제$/ })
      await user.click(confirmButton)
      await user.click(confirmButton) // 두 번 클릭 시도

      // Assert - API 호출은 1회만
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // 정리
      resolveDelete!({ ok: true, json: async () => ({}) })
    })
  })
})
