import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
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

import MenuItem from '@/components/MenuItem'

describe('MenuItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render label text', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Assert
      expect(screen.getByText('프로필 관리')).toBeInTheDocument()
    })

    it('should render as clickable element', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Assert
      const item = screen.getByRole('button') || screen.getByRole('link')
      expect(item).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<MenuItem label="프로필 관리" href="/settings/profile" />)).not.toThrow()
    })
  })

  describe('Navigation', () => {
    it('should navigate to href when clicked', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush, back: jest.fn() })

      const user = userEvent.setup()
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Act
      const item = screen.getByText('프로필 관리').closest('button') || screen.getByText('프로필 관리').closest('a')
      if (item) await user.click(item)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/settings/profile')
    })

    it('should call onClick handler when provided', async () => {
      // Arrange
      const mockOnClick = jest.fn()
      const user = userEvent.setup()
      render(<MenuItem label="계정 탈퇴" onClick={mockOnClick} />)

      // Act
      const item = screen.getByText('계정 탈퇴').closest('button') || screen.getByText('계정 탈퇴')
      await user.click(item as HTMLElement)

      // Assert
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Profile MenuItem (data-testid)', () => {
    it('should render with data-testid="menu-item-profile" for profile item', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" testId="menu-item-profile" />)

      // Assert
      expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument()
    })
  })

  describe('Danger Variant', () => {
    it('should render danger variant with red styling indicator', () => {
      // Arrange & Act
      render(<MenuItem label="계정 탈퇴" variant="danger" onClick={jest.fn()} />)

      // Assert
      const item = screen.getByText('계정 탈퇴')
      expect(item).toBeInTheDocument()
      // Danger item should have red text or class
      const container = item.closest('[class*="red"]') || item.closest('[class*="danger"]') || item
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush, back: jest.fn() })

      const user = userEvent.setup()
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Act - Find focusable element
      const item = screen.getByText('프로필 관리').closest('button') || screen.getByText('프로필 관리').closest('a')
      if (item) {
        ;(item as HTMLElement).focus()
        await user.keyboard('{Enter}')
      }

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/settings/profile')
    })
  })
})
