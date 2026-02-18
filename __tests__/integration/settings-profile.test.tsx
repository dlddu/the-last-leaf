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

import ProfilePage from '@/app/settings/profile/page'

describe('Settings Profile Flow - Integration Test', () => {
  const mockProfileData = {
    user: {
      user_id: 'test-user-id',
      email: 'test@example.com',
      nickname: 'TestUser',
      name: '',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Initial Load (loading → idle)', () => {
    it('should fetch user profile on mount', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<ProfilePage />)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/profile',
          expect.objectContaining({ method: 'GET' })
        )
      })
    })

    it('should display email field after loading', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<ProfilePage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('profile-email')).toBeInTheDocument()
      })
    })

    it('should display email value from API', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<ProfilePage />)

      // Assert
      await waitFor(() => {
        const emailInput = screen.getByTestId('profile-email')
        expect(emailInput).toHaveValue('test@example.com')
      })
    })

    it('should display email input as disabled', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<ProfilePage />)

      // Assert
      await waitFor(() => {
        const emailInput = screen.getByTestId('profile-email')
        expect(emailInput).toBeDisabled()
      })
    })

    it('should display nickname field with current value', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<ProfilePage />)

      // Assert
      await waitFor(() => {
        const nicknameInput = screen.getByTestId('profile-nickname')
        expect(nicknameInput).toHaveValue('TestUser')
      })
    })

    it('should display page title "프로필 관리"', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<ProfilePage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/프로필 관리/i)).toBeInTheDocument()
      })
    })
  })

  describe('Dirty State (form changed)', () => {
    it('should transition to dirty state when nickname is changed', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })
      const user = userEvent.setup()

      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')

      // Act
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'NewNickname')

      // Assert - save button should be enabled (dirty state)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).not.toBeDisabled()
    })
  })

  describe('Saving State', () => {
    it('should send PUT request when save button clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { ...mockProfileData.user, nickname: 'UpdatedNick' },
          }),
        })

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'UpdatedNick')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/profile',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('UpdatedNick'),
          })
        )
      })
    })

    it('should disable save button while saving', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockImplementationOnce(
          () =>
            new Promise(resolve =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({ user: mockProfileData.user }),
                  }),
                200
              )
            )
        )

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'UpdatedNick')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert - button should be disabled while saving
      expect(saveButton).toBeDisabled()
    })
  })

  describe('Success State', () => {
    it('should show success toast after successful save', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { ...mockProfileData.user, nickname: 'UpdatedNick' },
          }),
        })

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'UpdatedNick')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert - success toast message should appear
      await waitFor(() => {
        expect(
          screen.getByText(/저장되었습니다|변경되었습니다|saved|updated/i)
        ).toBeInTheDocument()
      })
    })

    it('should reflect updated nickname after successful save', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { ...mockProfileData.user, nickname: 'UpdatedNick' },
          }),
        })

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'UpdatedNick')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        const updatedInput = screen.getByTestId('profile-nickname')
        expect(updatedInput).toHaveValue('UpdatedNick')
      })
    })
  })

  describe('Error State', () => {
    it('should show error toast when save fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        })

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'NewNick')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert - error message should appear
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })

    it('should re-enable save button after save error', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        })

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'NewNick')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert - button should be re-enabled after error
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should handle network error gracefully', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'NewNick')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert - error notification should appear
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })

    it('should show error when initial profile load fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      // Act
      render(<ProfilePage />)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Back Navigation', () => {
    it('should navigate back when back button clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      const user = userEvent.setup()
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /뒤로|back/i })).toBeInTheDocument()
      })

      // Act
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      await user.click(backButton)

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Full Profile Edit Flow', () => {
    it('should complete full profile edit: load → edit → save → success toast', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProfileData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: {
              ...mockProfileData.user,
              nickname: 'UpdatedNickname',
            },
          }),
        })

      const user = userEvent.setup()

      // Act - Step 1: Render and wait for load
      render(<ProfilePage />)

      await waitFor(() => {
        expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      })

      // Act - Step 2: Edit nickname
      const nicknameInput = screen.getByTestId('profile-nickname')
      await user.clear(nicknameInput)
      await user.type(nicknameInput, 'UpdatedNickname')

      // Act - Step 3: Save
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert - Step 4: Success toast appears
      await waitFor(() => {
        expect(
          screen.getByText(/저장되었습니다|변경되었습니다|saved|updated/i)
        ).toBeInTheDocument()
      })

      // Assert - PUT request was made with updated nickname
      const putCall = (global.fetch as jest.Mock).mock.calls.find(
        call => call[1]?.method === 'PUT'
      )
      expect(putCall).toBeDefined()
      expect(putCall[1].body).toContain('UpdatedNickname')
    })
  })
})
