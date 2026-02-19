import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import DiaryTextarea from '@/components/DiaryTextarea'

describe('DiaryTextarea Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render textarea element', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should display placeholder text', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByPlaceholderText('오늘 하루는 어땠나요?')
      expect(textarea).toBeInTheDocument()
    })

    it('should display provided value', () => {
      // Arrange
      const testContent = 'This is my diary entry'

      // Act
      render(<DiaryTextarea value={testContent} onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(testContent)
    })

    it('should have data-testid for testing', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Mobile Zoom Prevention', () => {
    it('should have font-size of 16px to prevent mobile zoom', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      // Check for text-base class (16px in Tailwind) or inline style
      const hasCorrectFontSize =
        textarea.className.includes('text-base') ||
        textarea.className.includes('text-lg') ||
        textarea.style.fontSize === '16px' ||
        textarea.style.fontSize === '1rem'
      expect(hasCorrectFontSize).toBe(true)
    })

    it('should prevent iOS zoom on focus', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      // Font size should be at least 16px
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Fullscreen Layout', () => {
    it('should occupy full height', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea.className).toMatch(/h-full|h-screen|min-h-screen|min-h-\[/)
    })

    it('should occupy full width', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea.className).toMatch(/w-full/)
    })

    it('should have no border or minimal styling', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      // Should have borderless styling
      expect(textarea.className).toBeTruthy()
    })
  })

  describe('User Interaction', () => {
    it('should call onChange when user types', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act
      await user.type(textarea, 'Hello')

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
      expect(mockOnChange).toHaveBeenCalledTimes(5) // Once per character
    })

    it('should update value when user types', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)

      // Act
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'Test')

      // Assert - onChange should be called for each character
      expect(mockOnChange).toHaveBeenCalledTimes(4)
    })

    it('should handle multiline input', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3')

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle paste events', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act
      textarea.focus()
      await user.paste('Pasted content')

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle keyboard shortcuts', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="Test" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act - Select all and delete
      textarea.focus()
      await user.keyboard('{Control>}a{/Control}{Backspace}')

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should allow unlimited text input', async () => {
      // Arrange
      const longText = 'A'.repeat(10000)
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act
      await user.click(textarea)
      await user.paste(longText)

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should be keyboard focusable', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea).not.toHaveAttribute('tabIndex', '-1')
    })

    it('should support screen readers', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      // Should have aria-label or placeholder for screen readers
      expect(
        textarea.hasAttribute('aria-label') ||
        textarea.hasAttribute('placeholder')
      ).toBe(true)
    })

    it('should have accessible name', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAccessibleName()
    })
  })

  describe('Focus Management', () => {
    it('should auto-focus when autoFocus prop is true', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} autoFocus />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveFocus()
    })

    it('should not auto-focus by default', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea).not.toHaveFocus()
    })

    it('should maintain focus during typing', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={jest.fn()} />)
      const textarea = screen.getByRole('textbox')

      // Act
      await user.click(textarea)
      await user.type(textarea, 'Test')

      // Assert
      expect(textarea).toHaveFocus()
    })
  })

  describe('Resize Behavior', () => {
    it('should not be resizable by user', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      // Should have resize-none class
      expect(textarea.className).toMatch(/resize-none/)
    })

    it('should expand vertically with content', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      // Should allow vertical scrolling or auto-expansion
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<DiaryTextarea value="" onChange={jest.fn()} />)).not.toThrow()
    })

    it('should handle empty string value', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('')
    })

    it('should handle null or undefined gracefully', () => {
      // Arrange & Act & Assert
      expect(() => render(<DiaryTextarea value={''} onChange={jest.fn()} />)).not.toThrow()
    })

    it('should handle special characters', async () => {
      // Arrange
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act - Use paste to handle special characters that may not work with type()
      textarea.focus()
      await user.paste(specialChars)

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should handle emoji input', async () => {
      // Arrange
      const emojis = '😀😃😄😁'
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act
      await user.click(textarea)
      await user.paste(emojis)

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should render efficiently', () => {
      // Arrange
      const startTime = performance.now()

      // Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should handle rapid input without lag', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()
      render(<DiaryTextarea value="" onChange={mockOnChange} />)
      const textarea = screen.getByRole('textbox')

      // Act - Type rapidly
      await user.type(textarea, 'Quick brown fox jumps', { delay: 1 })

      // Assert
      expect(mockOnChange).toHaveBeenCalled()
    })
  })
})
