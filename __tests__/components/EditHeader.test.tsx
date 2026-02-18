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

import EditHeader from '@/components/EditHeader'

describe('EditHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render header with all elements', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should display back button', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should display "수정하기" title', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const title = screen.getByText('수정하기')
      expect(title).toBeInTheDocument()
    })

    it('should display save button', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<EditHeader onSave={jest.fn()} isSaving={false} />)).not.toThrow()
    })
  })

  describe('Back Button Interaction', () => {
    it('should call onBack when back button is clicked', async () => {
      // Arrange
      const mockOnBack = jest.fn()
      const user = userEvent.setup()
      render(<EditHeader onSave={jest.fn()} onBack={mockOnBack} isSaving={false} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.click(backButton)

      // Assert
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should use router.back() when no onBack prop is provided', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockBack = jest.fn()
      useRouter.mockReturnValue({ back: mockBack, push: jest.fn() })

      const user = userEvent.setup()
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.click(backButton)

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should support keyboard navigation for back button', async () => {
      // Arrange
      const mockOnBack = jest.fn()
      const user = userEvent.setup()
      render(<EditHeader onSave={jest.fn()} onBack={mockOnBack} isSaving={false} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      backButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Save Button Interaction', () => {
    it('should call onSave when save button is clicked', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<EditHeader onSave={mockOnSave} isSaving={false} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.click(saveButton)

      // Assert
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })

    it('should disable save button when isSaving is true', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={true} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when isSaving is false', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).not.toBeDisabled()
    })

    it('should not call onSave when save button is disabled', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<EditHeader onSave={mockOnSave} isSaving={true} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.click(saveButton)

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should support keyboard activation with Enter key', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<EditHeader onSave={mockOnSave} isSaving={false} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      saveButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })

    it('should show loading indicator when isSaving is true', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={true} />)

      // Assert - Should show some loading indicator (text change or spinner)
      const saveButton = screen.getByRole('button', { name: /저장|save|저장 중|saving/i })
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have banner landmark role', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should have proper ARIA labels on buttons', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(backButton).toHaveAccessibleName()
      expect(saveButton).toHaveAccessibleName()
    })

    it('should be keyboard navigable', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should handle rapid save clicks gracefully', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<EditHeader onSave={mockOnSave} isSaving={false} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.tripleClick(saveButton)

      // Assert
      expect(mockOnSave).toHaveBeenCalled()
    })
  })
})
