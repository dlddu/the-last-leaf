import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import DeleteConfirmModal from '@/components/DeleteConfirmModal'

describe('DeleteConfirmModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should display the title text "일기를 삭제할까요?"', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByText('일기를 삭제할까요?')).toBeInTheDocument()
    })

    it('should display the description text "삭제된 일기는 복구할 수 없습니다."', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByText('삭제된 일기는 복구할 수 없습니다.')).toBeInTheDocument()
    })

    it('should render cancel button', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument()
    })

    it('should render delete button', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('button', { name: /^삭제$/ })).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Bottom-sheet Layout
  // ---------------------------------------------------------------------------
  describe('Bottom-sheet Layout', () => {
    it('should position overlay at screen bottom using items-end class', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const overlay = dialog.parentElement as HTMLElement
      expect(overlay.className).toMatch(/items-end/)
    })

    it('should use fixed positioning on the overlay', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const overlay = dialog.parentElement as HTMLElement
      expect(overlay.className).toMatch(/fixed/)
    })

    it('should cover the full viewport (inset-0) on the overlay', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const overlay = dialog.parentElement as HTMLElement
      expect(overlay.className).toMatch(/inset-0/)
    })

    it('should have dark semi-transparent backdrop (bg-black/40)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const overlay = dialog.parentElement as HTMLElement
      // bg-black/40 or equivalent opacity class
      expect(overlay.className).toMatch(/bg-black/)
    })

    it('should have top-rounded corners on the container (rounded-t-2xl)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toMatch(/rounded-t-2xl/)
    })

    it('should be full-width with max-width constraint (w-full max-w-md)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toMatch(/w-full/)
      expect(dialog.className).toMatch(/max-w-md/)
    })

    it('should have white background on the container', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      expect(dialog.className).toMatch(/bg-white/)
    })
  })

  // ---------------------------------------------------------------------------
  // Icon Area
  // ---------------------------------------------------------------------------
  describe('Trash Icon Area', () => {
    it('should render an icon wrapper with red circular background (bg-red-100 rounded-full)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const redCircle = dialog.querySelector('.bg-red-100.rounded-full')
      expect(redCircle).toBeInTheDocument()
    })

    it('should render the icon wrapper with w-12 h-12 dimensions', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const iconWrapper = dialog.querySelector('.bg-red-100.rounded-full')
      expect(iconWrapper?.className).toMatch(/w-12/)
      expect(iconWrapper?.className).toMatch(/h-12/)
    })

    it('should center the icon wrapper horizontally (mx-auto)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const dialog = screen.getByRole('dialog')
      const iconWrapper = dialog.querySelector('.bg-red-100.rounded-full')
      expect(iconWrapper?.className).toMatch(/mx-auto/)
    })

    it('should render a red trash icon (text-red-500) inside the circular background', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert — icon element is an svg inside the red circle wrapper
      const dialog = screen.getByRole('dialog')
      const redCircle = dialog.querySelector('.bg-red-100.rounded-full')
      const icon = redCircle?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Typography
  // ---------------------------------------------------------------------------
  describe('Typography', () => {
    it('should render the title in a heading element (h3)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('일기를 삭제할까요?')
    })

    it('should center-align the title (text-center)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading.className).toMatch(/text-center/)
    })

    it('should center-align the description text (text-center)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const description = screen.getByText('삭제된 일기는 복구할 수 없습니다.')
      expect(description.className).toMatch(/text-center/)
    })
  })

  // ---------------------------------------------------------------------------
  // Button Layout
  // ---------------------------------------------------------------------------
  describe('Button Layout', () => {
    it('should render both buttons inside a flex container', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const cancelButton = screen.getByRole('button', { name: /취소/i })
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })
      const buttonWrapper = cancelButton.parentElement as HTMLElement
      expect(buttonWrapper).toContainElement(cancelButton)
      expect(buttonWrapper).toContainElement(deleteButton)
      expect(buttonWrapper.className).toMatch(/flex/)
    })

    it('should give equal widths to both buttons (flex-1)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const cancelButton = screen.getByRole('button', { name: /취소/i })
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })
      expect(cancelButton.className).toMatch(/flex-1/)
      expect(deleteButton.className).toMatch(/flex-1/)
    })

    it('should style the cancel button with border and gray tones', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const cancelButton = screen.getByRole('button', { name: /취소/i })
      expect(cancelButton.className).toMatch(/border/)
      expect(cancelButton.className).toMatch(/rounded-xl/)
    })

    it('should style the delete button with red background (bg-red-500)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })
      expect(deleteButton.className).toMatch(/bg-red-500/)
    })

    it('should give delete button white text (text-white)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })
      expect(deleteButton.className).toMatch(/text-white/)
    })

    it('should give both buttons rounded-xl class', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const cancelButton = screen.getByRole('button', { name: /취소/i })
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })
      expect(cancelButton.className).toMatch(/rounded-xl/)
      expect(deleteButton.className).toMatch(/rounded-xl/)
    })
  })

  // ---------------------------------------------------------------------------
  // Confirm Action
  // ---------------------------------------------------------------------------
  describe('Confirm Action', () => {
    it('should call onConfirm when delete button is clicked', async () => {
      // Arrange
      const mockOnConfirm = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={jest.fn()} />
      )
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })

      // Act
      await user.click(deleteButton)

      // Assert
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })

    it('should not call onCancel when delete button is clicked', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />
      )
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })

      // Act
      await user.click(deleteButton)

      // Assert
      expect(mockOnCancel).not.toHaveBeenCalled()
    })

    it('should support keyboard Enter activation on delete button', async () => {
      // Arrange
      const mockOnConfirm = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={jest.fn()} />
      )
      const deleteButton = screen.getByRole('button', { name: /^삭제$/ })

      // Act
      deleteButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })
  })

  // ---------------------------------------------------------------------------
  // Cancel Action
  // ---------------------------------------------------------------------------
  describe('Cancel Action', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />
      )
      const cancelButton = screen.getByRole('button', { name: /취소/i })

      // Act
      await user.click(cancelButton)

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onConfirm when cancel button is clicked', async () => {
      // Arrange
      const mockOnConfirm = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={mockOnConfirm} onCancel={jest.fn()} />
      )
      const cancelButton = screen.getByRole('button', { name: /취소/i })

      // Act
      await user.click(cancelButton)

      // Assert
      expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should support keyboard Enter activation on cancel button', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />
      )
      const cancelButton = screen.getByRole('button', { name: /취소/i })

      // Act
      cancelButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  // ---------------------------------------------------------------------------
  // isDeleting Prop
  // ---------------------------------------------------------------------------
  describe('isDeleting Prop', () => {
    it('should show "삭제 중" text on delete button when isDeleting is true', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal
          isOpen={true}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          isDeleting={true}
        />
      )

      // Assert
      expect(screen.getByRole('button', { name: /삭제 중/i })).toBeInTheDocument()
    })

    it('should disable the delete button when isDeleting is true', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal
          isOpen={true}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          isDeleting={true}
        />
      )

      // Assert
      const deletingButton = screen.getByRole('button', { name: /삭제 중/i })
      expect(deletingButton).toBeDisabled()
    })

    it('should disable the cancel button when isDeleting is true', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal
          isOpen={true}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          isDeleting={true}
        />
      )

      // Assert
      const cancelButton = screen.getByRole('button', { name: /취소/i })
      expect(cancelButton).toBeDisabled()
    })

    it('should show "삭제" text on delete button when isDeleting is false', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal
          isOpen={true}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          isDeleting={false}
        />
      )

      // Assert
      expect(screen.getByRole('button', { name: /^삭제$/ })).toBeInTheDocument()
    })

    it('should not disable buttons when isDeleting is omitted (default false)', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('button', { name: /^삭제$/ })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /취소/i })).not.toBeDisabled()
    })
  })

  // ---------------------------------------------------------------------------
  // Backdrop Interaction
  // ---------------------------------------------------------------------------
  describe('Backdrop Interaction', () => {
    it('should call onCancel when backdrop is clicked', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />
      )
      const dialog = screen.getByRole('dialog')
      const backdrop = dialog.parentElement as HTMLElement

      // Act
      await user.click(backdrop)

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onCancel when clicking inside the modal container', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />
      )
      const dialog = screen.getByRole('dialog')

      // Act
      await user.click(dialog)

      // Assert
      expect(mockOnCancel).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // Keyboard Navigation
  // ---------------------------------------------------------------------------
  describe('Keyboard Navigation', () => {
    it('should call onCancel when Escape key is pressed', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={mockOnCancel} />
      )

      // Act
      await user.keyboard('{Escape}')

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should not call onCancel on Escape when modal is closed', async () => {
      // Arrange
      const mockOnCancel = jest.fn()
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={false} onConfirm={jest.fn()} onCancel={mockOnCancel} />
      )

      // Act
      await user.keyboard('{Escape}')

      // Assert
      expect(mockOnCancel).not.toHaveBeenCalled()
    })

    it('should contain at least two focusable buttons', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })

    it('should support Tab navigation between buttons', async () => {
      // Arrange
      const user = userEvent.setup()
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Act
      await user.keyboard('{Tab}')

      // Assert
      const focused = document.activeElement
      expect(focused?.tagName).toBe('BUTTON')
    })
  })

  // ---------------------------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------------------------
  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have aria-modal="true"', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('should have aria-label="일기 삭제 확인"', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', '일기 삭제 확인')
    })

    it('should have aria-describedby="delete-modal-description"', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-describedby',
        'delete-modal-description'
      )
    })

    it('should have an element with id="delete-modal-description" present in the DOM', () => {
      // Arrange & Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      const descriptionEl = document.getElementById('delete-modal-description')
      expect(descriptionEl).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Transition States
  // ---------------------------------------------------------------------------
  describe('Transition States', () => {
    it('should transition from closed to open', () => {
      // Arrange
      const { rerender } = render(
        <DeleteConfirmModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Act
      rerender(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should transition from open to closed', () => {
      // Arrange
      const { rerender } = render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Act
      rerender(
        <DeleteConfirmModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should handle rapid open/close cycles without crashing', () => {
      // Arrange
      const { rerender } = render(
        <DeleteConfirmModal isOpen={false} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Act
      for (let i = 0; i < 10; i++) {
        rerender(
          <DeleteConfirmModal
            isOpen={i % 2 === 0}
            onConfirm={jest.fn()}
            onCancel={jest.fn()}
          />
        )
      }

      // Assert — final state: i=9 → 9%2===1 → isOpen=false
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Edge Cases
  // ---------------------------------------------------------------------------
  describe('Edge Cases', () => {
    it('should render without throwing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(
          <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
        )
      ).not.toThrow()
    })

    it('should unmount gracefully while open', () => {
      // Arrange
      const { unmount } = render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should render within 100 ms (performance smoke test)', () => {
      // Arrange
      const start = performance.now()

      // Act
      render(
        <DeleteConfirmModal isOpen={true} onConfirm={jest.fn()} onCancel={jest.fn()} />
      )

      // Assert
      expect(performance.now() - start).toBeLessThan(100)
    })
  })
})
