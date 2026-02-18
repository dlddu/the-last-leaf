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

import WithdrawPage from '@/app/(main)/settings/withdraw/page'

describe('Withdraw Flow - Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    mockPush.mockClear()
    mockBack.mockClear()
  })

  describe('Initial Render (idle state)', () => {
    it('should render the page without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<WithdrawPage />)).not.toThrow()
    })

    it('should display page title "계정 탈퇴"', () => {
      // Arrange & Act
      render(<WithdrawPage />)

      // Assert
      expect(screen.getAllByText(/계정 탈퇴/i).length).toBeGreaterThan(0)
    })

    it('should render BackHeader with "계정 탈퇴" title', () => {
      // Arrange & Act
      render(<WithdrawPage />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should render back navigation button', () => {
      // Arrange & Act
      render(<WithdrawPage />)

      // Assert
      expect(
        screen.getByRole('button', { name: /뒤로|back/i })
      ).toBeInTheDocument()
    })

    it('should render the deletion list', () => {
      // Arrange & Act
      render(<WithdrawPage />)

      // Assert
      expect(screen.getByTestId('withdraw-deletion-list')).toBeInTheDocument()
    })

    it('should render the consent checkbox', () => {
      // Arrange & Act
      render(<WithdrawPage />)

      // Assert
      expect(screen.getByTestId('withdraw-consent-checkbox')).toBeInTheDocument()
    })

    it('should render withdraw button in disabled state initially', () => {
      // Arrange & Act
      render(<WithdrawPage />)

      // Assert - 체크박스 미선택이므로 버튼은 비활성화
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toBeDisabled()
    })

    it('should render consent checkbox as unchecked initially', () => {
      // Arrange & Act
      render(<WithdrawPage />)

      // Assert
      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      if (input) {
        expect(input).not.toBeChecked()
      } else {
        const isChecked =
          checkbox.getAttribute('aria-checked') === 'true' ||
          checkbox.getAttribute('data-checked') === 'true'
        expect(isChecked).toBe(false)
      }
    })
  })

  describe('idle → confirmed state transition', () => {
    it('should enable withdraw button when checkbox is checked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      // Act
      await user.click(input || checkbox)

      // Assert
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).not.toBeDisabled()
    })

    it('should disable withdraw button when checkbox is unchecked again', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      // Act - 체크 후 다시 해제
      await user.click(input || checkbox)
      await user.click(input || checkbox)

      // Assert
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toBeDisabled()
    })
  })

  describe('confirmed → processing state transition', () => {
    it('should show processing state when withdraw button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              200
            )
          )
      )

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert - 처리 중에는 버튼이 비활성화되어야 함 (processing 상태)
      expect(button).toBeDisabled()
    })

    it('should send DELETE request to /api/user when withdraw button clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('processing → success state transition', () => {
    it('should redirect to /login after successful account deletion', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('should call DELETE API exactly once on success', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('processing → error state transition', () => {
    it('should show error toast when deletion fails with non-ok response', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert - 에러 메시지가 표시되어야 함
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed|문제/i)
        ).toBeInTheDocument()
      })
    })

    it('should show error toast when network error occurs', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed|문제/i)
        ).toBeInTheDocument()
      })
    })

    it('should NOT redirect to /login when deletion fails', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert - 에러 시 /login으로 이동하면 안 됨
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed|문제/i)
        ).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalledWith('/login')
    })

    it('should re-enable withdraw button after error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      render(<WithdrawPage />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert - 에러 후 버튼이 다시 활성화되어야 함
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Back navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawPage />)

      // Act
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      await user.click(backButton)

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Full withdrawal flow', () => {
    it('should complete full withdrawal: render → check → click → redirect to /login', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      // Act - Step 1: Render
      render(<WithdrawPage />)
      expect(screen.getAllByText(/계정 탈퇴/i).length).toBeGreaterThan(0)

      // Act - Step 2: Verify button is disabled
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toBeDisabled()

      // Act - Step 3: Check consent checkbox
      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Assert - button becomes enabled
      expect(button).not.toBeDisabled()

      // Act - Step 4: Click withdraw button
      await user.click(button)

      // Assert - Step 5: Redirected to /login
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })

      // Assert - DELETE request was made
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })
})
