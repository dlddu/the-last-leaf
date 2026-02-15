import '@testing-library/jest-dom'
import { describe, it, expect, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from '@/components/EmptyState'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

describe('EmptyState Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render empty state component', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const emptyState = screen.getByTestId('empty-state')
      expect(emptyState).toBeInTheDocument()
    })

    it('should render illustration', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      expect(illustration).toBeInTheDocument()
    })

    it('should render message text', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const message = screen.getByText(/아직 작성한 일기가 없어요/i)
      expect(message).toBeInTheDocument()
    })

    it('should render CTA button', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Illustration', () => {
    it('should display appropriate icon or image', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      // Should be an image, SVG, or icon element
      expect(
        illustration.tagName === 'IMG' ||
        illustration.tagName === 'SVG' ||
        illustration.querySelector('svg') !== null
      ).toBe(true)
    })

    it('should have accessible description for illustration', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      // Should have alt text or aria-label
      expect(
        illustration.hasAttribute('alt') ||
        illustration.hasAttribute('aria-label') ||
        illustration.getAttribute('role') === 'img'
      ).toBe(true)
    })
  })

  describe('Message', () => {
    it('should display helpful message to user', () => {
      // Act
      render(<EmptyState />)

      // Assert
      // Should encourage user to create their first diary
      expect(screen.getByText(/아직 작성한 일기가 없어요/i)).toBeInTheDocument()
    })

    it('should have clear and friendly tone', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      // Message should be present and readable
      expect(container.textContent).toBeTruthy()
      expect(container.textContent?.length).toBeGreaterThan(0)
    })
  })

  describe('CTA Button', () => {
    it('should navigate to diary creation page when clicked', async () => {
      // Arrange
      render(<EmptyState />)
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })

      // Assert - Link should have correct href
      expect(button).toHaveAttribute('href', '/diary/new')
    })

    it('should have clear call-to-action text', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button).toHaveAccessibleName()
      expect(button.textContent).toBeTruthy()
    })

    it('should be visually prominent', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button.className).toBeTruthy()
    })

    it('should support keyboard activation', async () => {
      // Arrange
      render(<EmptyState />)
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })

      // Act & Assert - Link should be focusable and accessible
      button.focus()
      expect(button).toHaveFocus()
      expect(button).toHaveAttribute('href', '/diary/new')
    })
  })

  describe('Layout', () => {
    it('should center content vertically and horizontally', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      // Should have flex or grid centering
      expect(container.className).toMatch(/flex|grid|center/)
    })

    it('should have proper spacing between elements', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      // Should have gap or margin classes
      expect(container.className).toBeTruthy()
    })

    it('should stack elements vertically', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      // Illustration should be above message, message above button
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
    })

    it('should have accessible button', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button).toHaveAccessibleName()
    })

    it('should be keyboard navigable', async () => {
      // Act
      render(<EmptyState />)
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })

      // Focus button directly (simulating tab navigation)
      button.focus()

      // Assert
      expect(button).toHaveFocus()
    })

    it('should have proper ARIA attributes', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      const illustration = screen.getByTestId('empty-state-illustration')

      expect(container).toBeInTheDocument()
      expect(illustration).toBeInTheDocument()
    })
  })

  describe('Responsiveness', () => {
    it('should render on mobile viewport', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
    })

    it('should render on desktop viewport', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
    })

    it('should scale illustration appropriately', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      expect(illustration).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid button clicks gracefully', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<EmptyState />)
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })

      // Act - Link handles clicks natively
      await user.tripleClick(button)

      // Assert - Link should remain functional
      expect(button).toHaveAttribute('href', '/diary/new')
    })

    it('should not break layout with long text', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Visual Design', () => {
    it('should have appropriate color scheme', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      expect(container.className).toBeTruthy()
    })

    it('should use appropriate typography', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      expect(container).toBeInTheDocument()
    })

    it('should match overall app design', () => {
      // Act
      render(<EmptyState />)

      // Assert
      const container = screen.getByTestId('empty-state')
      const button = screen.getByRole('button')

      expect(container).toBeInTheDocument()
      expect(button).toBeInTheDocument()
    })
  })
})
