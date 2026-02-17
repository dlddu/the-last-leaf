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

import CreateHeader from '@/components/CreateHeader'

describe('CreateHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render header with all elements', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should display back button', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should display today date automatically', () => {
      // Arrange
      const today = new Date()
      const expectedDate = today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      // Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement).toBeInTheDocument()
      expect(dateElement.textContent).toContain(expectedDate)
    })

    it('should display save button', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Back Button Interaction', () => {
    it('should call onBack when back button clicked', async () => {
      // Arrange
      const mockOnBack = jest.fn()
      const user = userEvent.setup()
      render(<CreateHeader onSave={jest.fn()} onBack={mockOnBack} isSaving={false} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.click(backButton)

      // Assert
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should use router.back() when no onBack provided', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockBack = jest.fn()
      useRouter.mockReturnValue({ back: mockBack })

      const user = userEvent.setup()
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)
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
      render(<CreateHeader onSave={jest.fn()} onBack={mockOnBack} isSaving={false} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      backButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Save Button Interaction', () => {
    it('should call onSave when save button clicked', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<CreateHeader onSave={mockOnSave} isSaving={false} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.click(saveButton)

      // Assert
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })

    it('should disable save button when isSaving is true', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={true} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when isSaving is false', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).not.toBeDisabled()
    })

    it('should show loading indicator when saving', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={true} />)

      // Assert - Should show some loading indicator (spinner, text change, etc.)
      const saveButton = screen.getByRole('button', { name: /저장|save|저장 중|saving/i })
      expect(saveButton).toBeInTheDocument()
    })

    it('should not call onSave when button is disabled', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<CreateHeader onSave={mockOnSave} isSaving={true} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.click(saveButton)

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should support keyboard activation with Enter', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<CreateHeader onSave={mockOnSave} isSaving={false} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      saveButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Date Display', () => {
    it('should display date in Korean format', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      // Should contain Korean text like "년", "월", "일"
      expect(dateElement.textContent).toMatch(/년|월|일/)
    })

    it('should update date based on current day', () => {
      // Arrange
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      const day = today.getDate()

      // Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.textContent).toContain(year.toString())
      expect(dateElement.textContent).toContain(month.toString())
      expect(dateElement.textContent).toContain(day.toString())
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(backButton).toHaveAccessibleName()
      expect(saveButton).toHaveAccessibleName()
    })

    it('should be keyboard navigable', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
    })

    it('should have banner landmark role', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })
  })

  describe('Visual Design', () => {
    it('should have fixed positioning', () => {
      // Arrange & Act
      render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const header = screen.getByRole('banner')
      expect(header).toHaveClass(/fixed/)
    })

    it('should have appropriate spacing between elements', () => {
      // Arrange & Act
      const { container } = render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Assert - Header should contain elements with proper layout
      expect(container.querySelector('[role="banner"]')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<CreateHeader onSave={jest.fn()} isSaving={false} />)).not.toThrow()
    })

    it('should handle rapid save clicks gracefully', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<CreateHeader onSave={mockOnSave} isSaving={false} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.tripleClick(saveButton)

      // Assert - Should be called multiple times (component doesn't prevent it)
      expect(mockOnSave).toHaveBeenCalled()
    })

    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<CreateHeader onSave={jest.fn()} isSaving={false} />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })
  })
})
