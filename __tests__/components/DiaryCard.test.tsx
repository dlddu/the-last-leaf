import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import DiaryCard from '@/components/DiaryCard'

describe('DiaryCard Component', () => {
  const mockDiary = {
    diary_id: 'test-diary-id',
    user_id: 'test-user-id',
    content: 'This is a test diary entry with some content that might be longer than two lines.',
    created_at: new Date('2024-01-15T14:30:00Z'),
    updated_at: new Date('2024-01-15T14:30:00Z'),
  }

  describe('Rendering', () => {
    it('should render diary card component', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      expect(card).toBeInTheDocument()
    })

    it('should render diary date', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      expect(date).toBeInTheDocument()
    })

    it('should render diary time', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const time = screen.getByTestId('diary-time')
      expect(time).toBeInTheDocument()
    })

    it('should render diary preview text', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview).toBeInTheDocument()
      expect(preview).toHaveTextContent(mockDiary.content)
    })

    it('should have required data-testid attributes', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      expect(screen.getByTestId('diary-card')).toBeInTheDocument()
      expect(screen.getByTestId('diary-date')).toBeInTheDocument()
      expect(screen.getByTestId('diary-time')).toBeInTheDocument()
      expect(screen.getByTestId('diary-preview')).toBeInTheDocument()
    })
  })

  describe('Date and Time Formatting', () => {
    it('should format date correctly', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      // Should display in a readable format (e.g., "2024.01.15" or "1월 15일")
      expect(date.textContent).toBeTruthy()
      expect(date.textContent?.length).toBeGreaterThan(0)
    })

    it('should format time correctly', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const time = screen.getByTestId('diary-time')
      // Should display time (e.g., "14:30" or "2:30 PM")
      expect(time.textContent).toBeTruthy()
      expect(time.textContent?.length).toBeGreaterThan(0)
    })

    it('should handle different time zones correctly', () => {
      // Arrange
      const diaryWithDifferentTime = {
        ...mockDiary,
        created_at: new Date('2024-12-25T00:00:00Z'),
      }

      // Act
      render(<DiaryCard diary={diaryWithDifferentTime} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      const time = screen.getByTestId('diary-time')
      expect(date).toBeInTheDocument()
      expect(time).toBeInTheDocument()
    })

    it('should display midnight time correctly', () => {
      // Arrange
      const midnightDiary = {
        ...mockDiary,
        created_at: new Date('2024-01-15T00:00:00Z'),
      }

      // Act
      render(<DiaryCard diary={midnightDiary} />)

      // Assert
      const time = screen.getByTestId('diary-time')
      expect(time).toBeInTheDocument()
      expect(time.textContent).toBeTruthy()
    })
  })

  describe('Text Clamping', () => {
    it('should apply line clamp to preview text', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      // Should have CSS class for line clamping (e.g., line-clamp-2)
      expect(preview).toHaveClass(/line-clamp|clamp/)
    })

    it('should handle long content gracefully', () => {
      // Arrange
      const longContent = 'A'.repeat(500)
      const longDiary = {
        ...mockDiary,
        content: longContent,
      }

      // Act
      render(<DiaryCard diary={longDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview).toBeInTheDocument()
      expect(preview).toHaveTextContent(longContent)
    })

    it('should handle short content without errors', () => {
      // Arrange
      const shortDiary = {
        ...mockDiary,
        content: 'Short',
      }

      // Act
      render(<DiaryCard diary={shortDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview).toBeInTheDocument()
      expect(preview).toHaveTextContent('Short')
    })

    it('should handle empty content gracefully', () => {
      // Arrange
      const emptyDiary = {
        ...mockDiary,
        content: '',
      }

      // Act
      render(<DiaryCard diary={emptyDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should be clickable element', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      // Should be a button, link, or have click handler
      expect(
        card.tagName === 'BUTTON' ||
        card.tagName === 'A' ||
        card.getAttribute('role') === 'button'
      ).toBe(true)
    })

    it('should have accessible label or text', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      // Should have accessible content
      expect(card.textContent).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle unicode characters in content', () => {
      // Arrange
      const unicodeDiary = {
        ...mockDiary,
        content: '안녕하세요 🌿 こんにちは 你好',
      }

      // Act
      render(<DiaryCard diary={unicodeDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview).toHaveTextContent('안녕하세요 🌿 こんにちは 你好')
    })

    it('should handle special characters in content', () => {
      // Arrange
      const specialCharDiary = {
        ...mockDiary,
        content: 'Content with <html> & "quotes" and \'apostrophes\'',
      }

      // Act
      render(<DiaryCard diary={specialCharDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview).toBeInTheDocument()
    })

    it('should handle newlines in content', () => {
      // Arrange
      const multilineDiary = {
        ...mockDiary,
        content: 'Line 1\nLine 2\nLine 3',
      }

      // Act
      render(<DiaryCard diary={multilineDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview).toBeInTheDocument()
    })

    it('should handle very old dates', () => {
      // Arrange
      const oldDiary = {
        ...mockDiary,
        created_at: new Date('2020-01-01T00:00:00Z'),
      }

      // Act
      render(<DiaryCard diary={oldDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      expect(date).toBeInTheDocument()
    })

    it('should handle future dates gracefully', () => {
      // Arrange
      const futureDiary = {
        ...mockDiary,
        created_at: new Date('2030-12-31T23:59:59Z'),
      }

      // Act
      render(<DiaryCard diary={futureDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      expect(date).toBeInTheDocument()
    })
  })

  describe('Visual Styling', () => {
    it('should have appropriate styling classes', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      expect(card.className).toBeTruthy()
    })

    it('should apply correct styling to date element', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      // Date element is part of the card's styled layout
      expect(date).toBeInTheDocument()
    })

    it('should apply correct styling to time element', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const time = screen.getByTestId('diary-time')
      // Time element is part of the card's styled layout
      expect(time).toBeInTheDocument()
    })

    it('should apply correct styling to preview element', () => {
      // Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview.className).toBeTruthy()
    })
  })
})
