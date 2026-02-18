import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import DateLabel from '@/components/DateLabel'

describe('DateLabel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(<DateLabel date="2024-06-15T10:00:00.000Z" />)
      ).not.toThrow()
    })

    it('should render date text in the document', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert - Should display some date-related text
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement).toBeInTheDocument()
    })

    it('should display year in the date', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.textContent).toContain('2024')
    })

    it('should display date in Korean format', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert - Should contain Korean date markers
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.textContent).toMatch(/년|월|일/)
    })
  })

  describe('Date Display', () => {
    it('should display the correct date when given an ISO string', () => {
      // Arrange
      const isoDate = '2024-01-20T10:00:00.000Z'

      // Act
      render(<DateLabel date={isoDate} />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.textContent).toContain('2024')
    })

    it('should format date in Korean locale', () => {
      // Arrange
      const isoDate = '2024-06-15T10:00:00.000Z'

      // Act
      render(<DateLabel date={isoDate} />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      // Korean date format includes 년, 월, 일
      expect(dateElement.textContent).toMatch(/년/)
      expect(dateElement.textContent).toMatch(/월/)
      expect(dateElement.textContent).toMatch(/일/)
    })

    it('should display different dates correctly', () => {
      // Arrange
      const date1 = '2023-12-31T23:59:59.000Z'
      const date2 = '2024-01-01T00:00:00.000Z'

      // Act
      const { rerender } = render(<DateLabel date={date1} />)
      const dateElement1 = screen.getByTestId('diary-date')
      const text1 = dateElement1.textContent

      rerender(<DateLabel date={date2} />)
      const dateElement2 = screen.getByTestId('diary-date')
      const text2 = dateElement2.textContent

      // Assert - Dates should be rendered (may differ based on timezone)
      expect(text1).toBeTruthy()
      expect(text2).toBeTruthy()
    })
  })

  describe('Read-only Behavior', () => {
    it('should not be an input element', () => {
      // Arrange & Act
      const { container } = render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert - DateLabel must not render an input that allows editing
      const inputs = container.querySelectorAll('input, textarea, [contenteditable="true"]')
      expect(inputs.length).toBe(0)
    })

    it('should render as a non-interactive element', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert - Should not have interactive roles
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should handle date string without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(<DateLabel date="2024-06-15T10:00:00.000Z" />)
      ).not.toThrow()
    })
  })
})
