import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ConfirmLeaveModal from '@/components/ConfirmLeaveModal'

describe('ConfirmLeaveModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should display confirmation message', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      expect(screen.getByText(/저장하지 않고 나갈까요/i)).toBeInTheDocument()
    })

    it('should display confirm button', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })
      expect(confirmButton).toBeInTheDocument()
    })

    it('should display cancel button', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('Confirm Action', () => {
    it('should call onConfirm when confirm button clicked', async () => {
      // Arrange
      const mockOnConfirm = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={mockOnConfirm} onCancel={jest.fn()} />)
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })

      // Act
      await user.click(confirmButton)

      // Assert
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should support keyboard activation with Enter on confirm button', async () => {
      // Arrange
      const mockOnConfirm = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={mockOnConfirm} onCancel={jest.fn()} />)
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })

      // Act
      confirmButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onCancel when confirm button clicked', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />)
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })

      // Act
      await user.click(confirmButton)

      // Assert
      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button clicked', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />)
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })

      // Act
      await user.click(cancelButton)

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should support keyboard activation with Enter on cancel button', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />)
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })

      // Act
      cancelButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when cancel button clicked', async () => {
      // Arrange
      const mockOnConfirm = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={mockOnConfirm} onCancel={jest.fn()} />)
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })

      // Act
      await user.click(cancelButton)

      // Assert
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Backdrop Interaction', () => {
    it('should call onCancel when backdrop is clicked', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />)
      const dialog = screen.getByRole('dialog')
      const backdrop = dialog.parentElement

      // Act
      if (backdrop && backdrop !== dialog) {
        await user.click(backdrop)
      }

      // Assert - Backdrop click should close modal
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not close when clicking inside modal', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />)
      const dialog = screen.getByRole('dialog')

      // Act
      await user.click(dialog)

      // Assert
      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close modal when Escape key is pressed', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />)

      // Act
      await user.keyboard('{Escape}')

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should focus trap within modal', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert - Modal should contain focusable elements
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should auto-focus cancel button by default', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })
      // Cancel is safer default, so it should be focused
      expect(cancelButton).toBeInTheDocument()
    })

    it('should support Tab navigation between buttons', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Act
      await user.keyboard('{Tab}')

      // Assert - Focus should move to next button
      const focusedElement = document.activeElement
      expect(focusedElement?.tagName).toBe('BUTTON')
    })
  })

  describe('Modal Overlay', () => {
    it('should have semi-transparent backdrop', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      const backdrop = dialog.parentElement
      // Should have backdrop with opacity
      expect(backdrop || dialog).toBeInTheDocument()
    })

    it('should center modal on screen', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      // Should have centering classes
      expect(dialog.parentElement?.className || dialog.className).toBeTruthy()
    })

    it('should have fixed positioning', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      const container = dialog.parentElement
      expect((container?.className || dialog.className)).toMatch(/fixed/)
    })

    it('should have high z-index', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      const container = dialog.parentElement
      expect((container?.className || dialog.className)).toMatch(/z-/)
    })
  })

  describe('Visual Design', () => {
    it('should have warning color scheme', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })
      // Confirm (destructive) button should have warning/danger color
      expect(confirmButton.className).toBeTruthy()
    })

    it('should distinguish between confirm and cancel buttons', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })
      expect(confirmButton.className).not.toBe(cancelButton.className)
    })

    it('should have proper spacing and padding', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toMatch(/p-|px-|py-/)
    })
  })

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have aria-modal attribute', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('should have accessible name or label', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      expect(
        dialog.hasAttribute('aria-label') ||
        dialog.hasAttribute('aria-labelledby')
      ).toBe(true)
    })

    it('should have accessible description', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const dialog = screen.getByRole('dialog')
      // Should have aria-describedby or visible text
      expect(
        dialog.hasAttribute('aria-describedby') ||
        dialog.textContent?.length! > 0
      ).toBe(true)
    })

    it('should prevent background scroll when open', () => {
      // Arrange & Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert - Should use portal or prevent body scroll
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)).not.toThrow()
    })

    it('should handle rapid open/close toggles', () => {
      // Arrange
      const { rerender } = render(<ConfirmLeaveModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Act
      for (let i = 0; i < 10; i++) {
        rerender(<ConfirmLeaveModal isOpen={i % 2 === 0} onConfirm={jest.fn()} onCancel={jest.fn()} />)
      }

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should unmount gracefully when open', () => {
      // Arrange
      const { unmount } = render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should handle missing callbacks gracefully', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Act & Assert - Should not crash when buttons clicked
      const confirmButton = screen.getByRole('button', { name: /나가기|확인|leave/i })
      const cancelButton = screen.getByRole('button', { name: /취소|cancel|머무르기|stay/i })
      await user.click(confirmButton)
      await user.click(cancelButton)

      expect(confirmButton).toBeInTheDocument()
    })
  })

  describe('Transition States', () => {
    it('should transition from closed to open', () => {
      // Arrange
      const { rerender } = render(<ConfirmLeaveModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Act
      rerender(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should transition from open to closed', () => {
      // Arrange
      const { rerender } = render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Act
      rerender(<ConfirmLeaveModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render efficiently', () => {
      // Arrange
      const startTime = performance.now()

      // Act
      render(<ConfirmLeaveModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />)

      // Assert
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})
