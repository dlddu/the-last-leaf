import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BottomNav from '@/components/BottomNav'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

describe('BottomNav Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render bottom navigation component', () => {
      // Act
      render(<BottomNav />)

      // Assert
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should render diary tab button', () => {
      // Act
      render(<BottomNav />)

      // Assert
      const diaryButton = screen.getByRole('button', { name: /일기/i })
      expect(diaryButton).toBeInTheDocument()
    })

    it('should render settings tab button', () => {
      // Act
      render(<BottomNav />)

      // Assert
      const settingsButton = screen.getByRole('button', { name: /설정/i })
      expect(settingsButton).toBeInTheDocument()
    })

    it('should render both tabs with correct order', () => {
      // Act
      render(<BottomNav />)

      // Assert
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
      expect(buttons[0]).toHaveTextContent(/일기/i)
      expect(buttons[1]).toHaveTextContent(/설정/i)
    })
  })

  describe('Navigation Behavior', () => {
    it('should navigate to diary page when diary tab is clicked', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<BottomNav />)
      const diaryButton = screen.getByRole('button', { name: /일기/i })

      // Act
      await userEvent.click(diaryButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/diary')
    })

    it('should navigate to settings page when settings tab is clicked', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<BottomNav />)
      const settingsButton = screen.getByRole('button', { name: /설정/i })

      // Act
      await userEvent.click(settingsButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/settings')
    })
  })

  describe('Active State', () => {
    it('should highlight diary tab when on diary page', () => {
      // Arrange
      const { usePathname } = require('next/navigation')
      usePathname.mockReturnValue('/diary')

      // Act
      render(<BottomNav />)

      // Assert
      const diaryButton = screen.getByRole('button', { name: /일기/i })
      expect(diaryButton).toHaveAttribute('aria-current', 'page')
    })

    it('should highlight settings tab when on settings page', () => {
      // Arrange
      const { usePathname } = require('next/navigation')
      usePathname.mockReturnValue('/settings')

      // Act
      render(<BottomNav />)

      // Assert
      const settingsButton = screen.getByRole('button', { name: /설정/i })
      expect(settingsButton).toHaveAttribute('aria-current', 'page')
    })

    it('should not highlight any tab when on other page', () => {
      // Arrange
      const { usePathname } = require('next/navigation')
      usePathname.mockReturnValue('/other-page')

      // Act
      render(<BottomNav />)

      // Assert
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA role for navigation', () => {
      // Act
      render(<BottomNav />)

      // Assert
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      // Act
      render(<BottomNav />)

      // Assert
      const diaryButton = screen.getByRole('button', { name: /일기/i })
      const settingsButton = screen.getByRole('button', { name: /설정/i })

      expect(diaryButton).toHaveAccessibleName()
      expect(settingsButton).toHaveAccessibleName()
    })

    it('should be keyboard navigable', () => {
      // Act
      render(<BottomNav />)
      const buttons = screen.getAllByRole('button')

      // Assert
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('should support keyboard navigation with Tab key', async () => {
      // Act
      render(<BottomNav />)
      const diaryButton = screen.getByRole('button', { name: /일기/i })
      const settingsButton = screen.getByRole('button', { name: /설정/i })

      // Focus first button
      diaryButton.focus()
      expect(diaryButton).toHaveFocus()

      // Tab to next button
      await userEvent.tab()
      expect(settingsButton).toHaveFocus()
    })

    it('should support keyboard activation with Enter key', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<BottomNav />)
      const diaryButton = screen.getByRole('button', { name: /일기/i })

      // Act
      diaryButton.focus()
      await userEvent.keyboard('{Enter}')

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/diary')
    })
  })

  describe('Visual Styling', () => {
    it('should have fixed position at bottom', () => {
      // Act
      render(<BottomNav />)

      // Assert
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass(/fixed|sticky/)
      expect(nav).toHaveClass(/bottom/)
    })

    it('should apply active state styling to current page tab', () => {
      // Arrange
      const { usePathname } = require('next/navigation')
      usePathname.mockReturnValue('/diary')

      // Act
      render(<BottomNav />)

      // Assert
      const diaryButton = screen.getByRole('button', { name: /일기/i })
      const settingsButton = screen.getByRole('button', { name: /설정/i })

      // Active button should have different styling
      expect(diaryButton.className).not.toBe(settingsButton.className)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicking without errors', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<BottomNav />)
      const diaryButton = screen.getByRole('button', { name: /일기/i })

      // Act
      await userEvent.tripleClick(diaryButton)

      // Assert - should handle multiple clicks gracefully
      expect(mockPush).toHaveBeenCalled()
    })

    it('should handle unmounting gracefully', () => {
      // Act
      const { unmount } = render(<BottomNav />)

      // Assert - should not throw error
      expect(() => unmount()).not.toThrow()
    })
  })
})
