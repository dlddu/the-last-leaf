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

import PreferencesPage from '@/app/(main)/settings/preferences/page'

describe('Settings Preferences Flow - Integration Test', () => {
  const mockPreferencesData = {
    timer_status: 'inactive',
    timer_idle_threshold_sec: 2592000,
  }

  const mockPausedPreferencesData = {
    timer_status: 'paused',
    timer_idle_threshold_sec: 2592000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Initial Load (loading -> idle)', () => {
    it('should fetch preferences on mount', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPreferencesData,
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/preferences',
          expect.objectContaining({ method: 'GET' })
        )
      })
    })

    it('should display timer pause toggle after loading', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPreferencesData,
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })
    })

    it('should display period selector buttons after loading', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPreferencesData,
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /30일/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /60일/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /90일/ })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /180일/ })).toBeInTheDocument()
      })
    })

    it('should show toggle as OFF when timer_status is inactive', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ timer_status: 'inactive', timer_idle_threshold_sec: 2592000 }),
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        const toggle = screen.getByTestId('timer-pause-toggle')
        expect(toggle).not.toBeChecked()
      })
    })

    it('should show toggle as ON when timer_status is paused', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPausedPreferencesData,
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        const toggle = screen.getByTestId('timer-pause-toggle')
        expect(toggle).toBeChecked()
      })
    })

    it('should show 30일 as selected when timer_idle_threshold_sec is 2592000', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ timer_status: 'inactive', timer_idle_threshold_sec: 2592000 }),
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        const button30 = screen.getByRole('button', { name: /30일/ })
        const isSelected =
          button30.getAttribute('aria-pressed') === 'true' ||
          button30.getAttribute('aria-selected') === 'true' ||
          button30.getAttribute('data-selected') === 'true' ||
          button30.className.includes('selected') ||
          button30.className.includes('active') ||
          button30.className.includes('ring') ||
          button30.className.includes('border-blue') ||
          button30.className.includes('bg-blue')
        expect(isSelected).toBe(true)
      })
    })
  })

  describe('WarningBanner - timer_status=PAUSED condition', () => {
    it('should show WarningBanner when timer_status is paused', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPausedPreferencesData,
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-warning-banner')).toBeInTheDocument()
      })
    })

    it('should NOT show WarningBanner when timer_status is inactive', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPreferencesData,
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('timer-pause-warning-banner')).not.toBeInTheDocument()
      })
    })

    it('should show WarningBanner after toggle is turned ON', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act: toggle ON
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-warning-banner')).toBeInTheDocument()
      })
    })

    it('should hide WarningBanner after toggle is turned OFF', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-warning-banner')).toBeInTheDocument()
      })

      // Act: toggle OFF
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('timer-pause-warning-banner')).not.toBeInTheDocument()
      })
    })
  })

  describe('Auto-save on toggle change', () => {
    it('should call PUT API immediately when toggle is clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/preferences',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        )
      })
    })

    it('should send PAUSED in PUT body when toggle is turned ON', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        const putCall = (global.fetch as jest.Mock).mock.calls.find(
          (call) => call[1]?.method === 'PUT'
        )
        expect(putCall).toBeDefined()
        expect(putCall[1].body).toContain('PAUSED')
      })
    })

    it('should send ACTIVE in PUT body when toggle is turned OFF from paused state', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        const putCall = (global.fetch as jest.Mock).mock.calls.find(
          (call) => call[1]?.method === 'PUT'
        )
        expect(putCall).toBeDefined()
        expect(putCall[1].body).toContain('ACTIVE')
      })
    })
  })

  describe('Auto-save on period change', () => {
    it('should call PUT API immediately when period button is clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ timer_status: 'inactive', timer_idle_threshold_sec: 5184000 }),
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /60일/ })).toBeInTheDocument()
      })

      // Act
      const button60 = screen.getByRole('button', { name: /60일/ })
      await user.click(button60)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/preferences',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        )
      })
    })

    it('should send 5184000 in PUT body when 60일 button is clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ timer_status: 'inactive', timer_idle_threshold_sec: 5184000 }),
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /60일/ })).toBeInTheDocument()
      })

      // Act
      const button60 = screen.getByRole('button', { name: /60일/ })
      await user.click(button60)

      // Assert
      await waitFor(() => {
        const putCall = (global.fetch as jest.Mock).mock.calls.find(
          (call) => call[1]?.method === 'PUT'
        )
        expect(putCall).toBeDefined()
        expect(putCall[1].body).toContain('5184000')
      })
    })

    it('should send 15552000 in PUT body when 180일 button is clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ timer_status: 'inactive', timer_idle_threshold_sec: 15552000 }),
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /180일/ })).toBeInTheDocument()
      })

      // Act
      const button180 = screen.getByRole('button', { name: /180일/ })
      await user.click(button180)

      // Assert
      await waitFor(() => {
        const putCall = (global.fetch as jest.Mock).mock.calls.find(
          (call) => call[1]?.method === 'PUT'
        )
        expect(putCall).toBeDefined()
        expect(putCall[1].body).toContain('15552000')
      })
    })

    it('should update selected period button after successful save', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ timer_status: 'inactive', timer_idle_threshold_sec: 7776000 }),
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /90일/ })).toBeInTheDocument()
      })

      // Act
      const button90 = screen.getByRole('button', { name: /90일/ })
      await user.click(button90)

      // Assert
      await waitFor(() => {
        const updatedButton90 = screen.getByRole('button', { name: /90일/ })
        const isSelected =
          updatedButton90.getAttribute('aria-pressed') === 'true' ||
          updatedButton90.getAttribute('aria-selected') === 'true' ||
          updatedButton90.getAttribute('data-selected') === 'true' ||
          updatedButton90.className.includes('selected') ||
          updatedButton90.className.includes('active') ||
          updatedButton90.className.includes('ring') ||
          updatedButton90.className.includes('border-blue') ||
          updatedButton90.className.includes('bg-blue')
        expect(isSelected).toBe(true)
      })
    })
  })

  describe('Saving state', () => {
    it('should disable toggle during saving', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => mockPausedPreferencesData,
                  }),
                200
              )
            )
        )

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert: 저장 중에는 토글이 비활성화되어야 함
      expect(toggle).toBeDisabled()
    })
  })

  describe('Success state', () => {
    it('should re-enable toggle after successful save', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        expect(toggle).not.toBeDisabled()
      })
    })

    it('should show success indicator after successful save', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert: 성공 메시지 또는 토스트가 나타나야 함
      await waitFor(() => {
        expect(
          screen.getByText(/저장되었습니다|변경되었습니다|saved|updated|성공/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Error state', () => {
    it('should show error when PUT API fails on toggle change', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })

    it('should show error when PUT API fails on period change', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /60일/ })).toBeInTheDocument()
      })

      // Act
      const button60 = screen.getByRole('button', { name: /60일/ })
      await user.click(button60)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })

    it('should revert toggle state on save error', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        })

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        const toggle = screen.getByTestId('timer-pause-toggle')
        expect(toggle).not.toBeChecked()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert: 에러 후 토글이 원래 상태(OFF)로 복구되어야 함
      await waitFor(() => {
        expect(toggle).not.toBeChecked()
      })
    })

    it('should show error when initial preferences load fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      // Act
      render(<PreferencesPage />)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })

    it('should handle network error gracefully on toggle', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Full preferences flow', () => {
    it('should complete full flow: load -> toggle ON -> show warning banner -> save success', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPausedPreferencesData,
        })

      const user = userEvent.setup()

      // Act - Step 1: Load
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
      })

      // Assert - Step 2: Toggle is OFF initially
      const toggle = screen.getByTestId('timer-pause-toggle')
      expect(toggle).not.toBeChecked()

      // Act - Step 3: Turn toggle ON
      await user.click(toggle)

      // Assert - Step 4: API called and warning banner shown
      await waitFor(() => {
        expect(screen.getByTestId('timer-pause-warning-banner')).toBeInTheDocument()
      })

      // Assert - Step 5: PUT API was called with PAUSED
      const putCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) => call[1]?.method === 'PUT'
      )
      expect(putCall).toBeDefined()
      expect(putCall[1].body).toContain('PAUSED')
    })

    it('should complete full flow: load -> change period -> save success', async () => {
      // Arrange
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPreferencesData,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ timer_status: 'inactive', timer_idle_threshold_sec: 7776000 }),
        })

      const user = userEvent.setup()

      // Act - Step 1: Load
      render(<PreferencesPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /90일/ })).toBeInTheDocument()
      })

      // Act - Step 2: Click 90일
      const button90 = screen.getByRole('button', { name: /90일/ })
      await user.click(button90)

      // Assert - Step 3: PUT API called with 7776000
      await waitFor(() => {
        const putCall = (global.fetch as jest.Mock).mock.calls.find(
          (call) => call[1]?.method === 'PUT'
        )
        expect(putCall).toBeDefined()
        expect(putCall[1].body).toContain('7776000')
      })
    })
  })
})
