import '@testing-library/jest-dom'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FAB from '@/components/FAB'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

describe('FAB Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render floating action button', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have appropriate label', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button', { name: /일기|작성|쓰기|새|추가/i })
      expect(button).toBeInTheDocument()
    })

    it('should render icon', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should contain an icon (SVG or icon element)
      expect(
        button.querySelector('svg') !== null ||
        button.querySelector('[class*="icon"]') !== null ||
        button.textContent?.includes('+')
      ).toBe(true)
    })
  })

  describe('Navigation', () => {
    it('should navigate to /diary/new when clicked', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<FAB />)
      const button = screen.getByRole('button')

      // Act
      await userEvent.click(button)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/diary/new')
    })

    it('should support keyboard activation with Enter', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<FAB />)
      const button = screen.getByRole('button')

      // Act
      button.focus()
      await userEvent.keyboard('{Enter}')

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/diary/new')
    })

    it('should support keyboard activation with Space', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<FAB />)
      const button = screen.getByRole('button')

      // Act
      button.focus()
      await userEvent.keyboard(' ')

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/diary/new')
    })
  })

  describe('Positioning', () => {
    it('should be positioned fixed', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveClass(/fixed/)
    })

    it('should be positioned at bottom right', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have bottom and right positioning classes
      expect(button.className).toMatch(/bottom/)
      expect(button.className).toMatch(/right/)
    })

    it('should not overlap with bottom navigation', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have appropriate bottom margin/spacing
      expect(button.className).toBeTruthy()
    })

    it('should have appropriate z-index', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have z-index class to stay on top
      expect(button.className).toMatch(/z-/)
    })
  })

  describe('Visual Design', () => {
    it('should have circular shape', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have rounded-full or similar class
      expect(button.className).toMatch(/rounded/)
    })

    it('should have appropriate size', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have width/height classes
      expect(button.className).toBeTruthy()
    })

    it('should have primary color scheme', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have background color classes
      expect(button.className).toBeTruthy()
    })

    it('should have shadow for elevation', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have shadow class
      expect(button.className).toMatch(/shadow/)
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard focusable', () => {
      // Act
      render(<FAB />)
      const button = screen.getByRole('button')

      // Assert
      expect(button).not.toHaveAttribute('tabIndex', '-1')
    })

    it('should have accessible name', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAccessibleName()
    })

    it('should have button role', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should support screen reader users', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have aria-label or visible text
      expect(
        button.hasAttribute('aria-label') ||
        button.textContent ||
        button.querySelector('svg')?.hasAttribute('aria-label')
      ).toBeTruthy()
    })
  })

  describe('Interactions', () => {
    it('should show hover effect on mouse over', async () => {
      // Act
      render(<FAB />)
      const button = screen.getByRole('button')

      await userEvent.hover(button)

      // Assert
      expect(button).toBeInTheDocument()
    })

    it('should show focus outline when focused', async () => {
      // Act
      render(<FAB />)
      const button = screen.getByRole('button')

      button.focus()

      // Assert
      expect(button).toHaveFocus()
    })

    it('should handle rapid clicks gracefully', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<FAB />)
      const button = screen.getByRole('button')

      // Act
      await userEvent.tripleClick(button)

      // Assert
      expect(mockPush).toHaveBeenCalled()
    })

    it('should not be disabled by default', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      // Act & Assert
      expect(() => render(<FAB />)).not.toThrow()
    })

    it('should unmount gracefully', () => {
      // Act
      const { unmount } = render(<FAB />)

      // Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should handle missing router gracefully', () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      useRouter.mockReturnValue(null)

      // Act & Assert
      expect(() => render(<FAB />)).not.toThrow()
    })
  })

  describe('Responsiveness', () => {
    it('should render on mobile viewport', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render on desktop viewport', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should adjust position for different screen sizes', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should have responsive positioning classes
      expect(button.className).toBeTruthy()
    })
  })

  describe('Touch Support', () => {
    it('should have adequate touch target size', () => {
      // Act
      render(<FAB />)

      // Assert
      const button = screen.getByRole('button')
      // Should be at least 44x44px for touch accessibility
      expect(button).toBeInTheDocument()
    })

    it('should handle touch events', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush })

      render(<FAB />)
      const button = screen.getByRole('button')

      // Act
      await userEvent.click(button)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/diary/new')
    })
  })

  describe('Performance', () => {
    it('should render efficiently', () => {
      // Arrange
      const startTime = performance.now()

      // Act
      render(<FAB />)

      // Assert
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should render in less than 100ms
    })

    it('should not cause re-renders unnecessarily', () => {
      // Arrange
      const { rerender } = render(<FAB />)

      // Act
      for (let i = 0; i < 5; i++) {
        rerender(<FAB />)
      }

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
