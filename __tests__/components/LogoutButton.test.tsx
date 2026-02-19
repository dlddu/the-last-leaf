import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock fetch
global.fetch = jest.fn()

import LogoutButton from '@/components/LogoutButton'

describe('LogoutButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<LogoutButton />)).not.toThrow()
    })

    it('should render as a button element', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should display logout text in idle state', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert
      expect(screen.getByRole('button')).toHaveTextContent(/logout|로그아웃/i)
    })

    it('should be enabled by default (not disabled)', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })

  describe('Card Style (리디자인)', () => {
    it('should apply w-full class to button', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - 전체 너비 버튼이어야 함
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/w-full/)
    })

    it('should apply bg-white class to button (not bg-red-500)', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - 배경이 흰색이어야 함 (빨간색이 아님)
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/bg-white/)
      expect(button.className).not.toMatch(/bg-red-500/)
    })

    it('should apply rounded-2xl class to button', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - rounded-2xl 스타일이어야 함
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/rounded-2xl/)
    })

    it('should apply border border-gray-100 class to button', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - border 스타일 적용
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/border/)
    })

    it('should not have bg-red-500 class (old style removed)', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - 기존 빨간 배경 스타일 제거됨
      const button = screen.getByRole('button')
      expect(button.className).not.toMatch(/bg-red-500/)
    })

    it('should not have text-white class (old style removed)', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - 기존 흰색 텍스트 스타일 제거됨
      const button = screen.getByRole('button')
      expect(button.className).not.toMatch(/text-white/)
    })

    it('should apply text-sm font-medium text-gray-500 classes to button text', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - 텍스트 스타일 확인
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/text-sm/)
      expect(button.className).toMatch(/font-medium/)
      expect(button.className).toMatch(/text-gray-500/)
    })

    it('should apply text-center class to button', () => {
      // Arrange & Act
      render(<LogoutButton />)

      // Assert - 텍스트 가운데 정렬
      const button = screen.getByRole('button')
      expect(button.className).toMatch(/text-center/)
    })
  })

  describe('Logout Behavior', () => {
    it('should call POST /api/auth/logout when clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      const user = userEvent.setup()
      render(<LogoutButton />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/logout',
          expect.objectContaining({ method: 'POST' })
        )
      })
    })

    it('should navigate to /login after successful logout', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush, back: jest.fn() })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      const user = userEvent.setup()
      render(<LogoutButton />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('should disable button while logging out', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({}),
                }),
              200
            )
          )
      )
      const user = userEvent.setup()
      render(<LogoutButton />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert - 로그아웃 진행 중 버튼 비활성화
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should show loading text while logging out', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({}),
                }),
              200
            )
          )
      )
      const user = userEvent.setup()
      render(<LogoutButton />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert - 로딩 텍스트 표시
      expect(screen.getByRole('button')).toHaveTextContent(/logging out|로그아웃 중/i)
    })

    it('should re-enable button after logout error', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()
      render(<LogoutButton />)

      // Act
      await user.click(screen.getByRole('button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle network error without crashing', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()

      // Act & Assert - 에러가 발생해도 컴포넌트가 크래시되지 않아야 함
      render(<LogoutButton />)
      await expect(user.click(screen.getByRole('button'))).resolves.not.toThrow()
    })

    it('should not trigger logout when button is disabled', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({}),
                }),
              200
            )
          )
      )
      const user = userEvent.setup()
      render(<LogoutButton />)

      // Act - 첫 번째 클릭으로 로딩 상태 진입
      await user.click(screen.getByRole('button'))
      const callCountAfterFirstClick = (global.fetch as jest.Mock).mock.calls.length

      // Act - 비활성화된 버튼 재클릭 시도
      await user.click(screen.getByRole('button'))

      // Assert - fetch가 추가로 호출되지 않아야 함
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(callCountAfterFirstClick)
    })
  })
})
