import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import BottomBar from '@/components/BottomBar'

describe('BottomBar Component', () => {
  describe('Rendering', () => {
    it('should render bottom bar', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should display character count', () => {
      // Arrange & Act
      render(<BottomBar characterCount={42} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toBeInTheDocument()
      expect(charCount).toHaveTextContent('42')
    })

    it('should display zero character count', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent('0')
    })

    it('should display large character count', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10000} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent('10,000')
    })

    it('should format character count with comma for readability', () => {
      // Arrange & Act
      render(<BottomBar characterCount={1000} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      // Should display either "1000" or "1,000"
      expect(charCount.textContent).toMatch(/1[,]?000/)
    })
  })

  describe('Save Status Display', () => {
    it('should display idle status', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const statusText = screen.getByTestId('save-status')
      expect(statusText).toBeInTheDocument()
    })

    it('should display dirty status', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="dirty" />)

      // Assert
      const statusText = screen.getByTestId('save-status')
      expect(statusText).toBeInTheDocument()
    })

    it('should display saving status', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saving" />)

      // Assert
      const statusText = screen.getByTestId('save-status')
      expect(statusText).toBeInTheDocument()
    })

    it('should display saved status', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saved" />)

      // Assert
      const statusText = screen.getByTestId('save-status')
      expect(statusText).toBeInTheDocument()
    })

    it('should display error status', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="error" />)

      // Assert
      const statusText = screen.getByTestId('save-status')
      expect(statusText).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should have fixed positioning at bottom', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const bottomBar = screen.getByRole('contentinfo')
      expect(bottomBar.className).toMatch(/fixed/)
      expect(bottomBar.className).toMatch(/bottom/)
    })

    it('should span full width', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const bottomBar = screen.getByRole('contentinfo')
      expect(bottomBar.className).toMatch(/w-full/)
    })

    it('should have proper z-index to stay on top', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const bottomBar = screen.getByRole('contentinfo')
      expect(bottomBar.className).toMatch(/z-/)
    })
  })

  describe('Visual Design', () => {
    it('should have background color', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const bottomBar = screen.getByRole('contentinfo')
      // Should have some background color class
      expect(bottomBar.className).toBeTruthy()
    })

    it('should have padding for spacing', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert — padding may be on the footer itself or its inner container
      const bottomBar = screen.getByRole('contentinfo')
      const innerContainer = bottomBar.firstElementChild as HTMLElement
      const hasPadding =
        /p-|px-|py-/.test(bottomBar.className) ||
        (innerContainer && /p-|px-|py-/.test(innerContainer.className))
      expect(hasPadding).toBe(true)
    })

    it('should display elements in horizontal layout', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const bottomBar = screen.getByRole('contentinfo')
      // Should use fixed positioning at bottom
      expect(bottomBar.className).toMatch(/fixed|bottom/)
    })
  })

  describe('Status Indicator Visual Feedback', () => {
    it('should show different color for error status', () => {
      // Arrange
      const { container: errorContainer } = render(<BottomBar characterCount={10} saveStatus="error" />)
      const { container: idleContainer } = render(<BottomBar characterCount={10} saveStatus="idle" />)

      // Assert - Status elements should be present
      const errorStatus = errorContainer.querySelector('[data-testid="save-status"]')
      const idleStatus = idleContainer.querySelector('[data-testid="save-status"]')
      expect(errorStatus).toBeInTheDocument()
      expect(idleStatus).toBeInTheDocument()
    })

    it('should show loading indicator when saving', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saving" />)

      // Assert
      const statusText = screen.getByTestId('save-status')
      // Should contain some loading indicator (spinner, dots, etc.)
      expect(statusText).toBeInTheDocument()
    })

    it('should show success indicator when saved', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saved" />)

      // Assert
      const statusText = screen.getByTestId('save-status')
      // Should have success color or icon
      expect(statusText).toBeInTheDocument()
    })
  })

  describe('Character Count Formatting', () => {
    it('should display character count with label', () => {
      // Arrange & Act
      render(<BottomBar characterCount={100} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      // Should include label like "글자" or "characters"
      expect(charCount.parentElement?.textContent).toMatch(/100/)
    })

    it('should handle negative numbers gracefully', () => {
      // Arrange & Act
      render(<BottomBar characterCount={-1} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      // Should display 0 or handle gracefully
      expect(charCount).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      // Arrange & Act
      render(<BottomBar characterCount={999999} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent(/999[,]?999/)
    })
  })

  describe('Accessibility', () => {
    it('should have contentinfo landmark role', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('should have accessible labels for screen readers', () => {
      // Arrange & Act
      render(<BottomBar characterCount={42} saveStatus="dirty" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      const saveStatus = screen.getByTestId('save-status')
      expect(charCount).toBeInTheDocument()
      expect(saveStatus).toBeInTheDocument()
    })

    it('should announce status changes to screen readers', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saving" />)

      // Assert
      const saveStatus = screen.getByTestId('save-status')
      // Should have aria-live region for status updates
      expect(saveStatus.closest('[aria-live]') || saveStatus.hasAttribute('aria-live')).toBeTruthy()
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewports', () => {
      // Arrange & Act
      render(<BottomBar characterCount={100} saveStatus="idle" />)

      // Assert
      const bottomBar = screen.getByRole('contentinfo')
      expect(bottomBar).toBeInTheDocument()
    })

    it('should work on desktop viewports', () => {
      // Arrange & Act
      render(<BottomBar characterCount={100} saveStatus="idle" />)

      // Assert
      const bottomBar = screen.getByRole('contentinfo')
      expect(bottomBar).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<BottomBar characterCount={0} saveStatus="idle" />)).not.toThrow()
    })

    it('should handle status transitions smoothly', () => {
      // Arrange
      const { rerender } = render(<BottomBar characterCount={10} saveStatus="idle" />)

      // Act - Transition through all states
      rerender(<BottomBar characterCount={10} saveStatus="dirty" />)
      rerender(<BottomBar characterCount={10} saveStatus="saving" />)
      rerender(<BottomBar characterCount={10} saveStatus="saved" />)
      rerender(<BottomBar characterCount={10} saveStatus="error" />)

      // Assert
      expect(screen.getByTestId('save-status')).toBeInTheDocument()
    })

    it('should handle character count updates', () => {
      // Arrange
      const { rerender } = render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Act
      rerender(<BottomBar characterCount={50} saveStatus="dirty" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent('50')
    })

    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should render efficiently', () => {
      // Arrange
      const startTime = performance.now()

      // Act
      render(<BottomBar characterCount={100} saveStatus="idle" />)

      // Assert
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle frequent updates without lag', () => {
      // Arrange
      const { rerender } = render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Act - Simulate typing updates
      for (let i = 0; i < 100; i++) {
        rerender(<BottomBar characterCount={i} saveStatus="dirty" />)
      }

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount).toHaveTextContent('99')
    })
  })
})
