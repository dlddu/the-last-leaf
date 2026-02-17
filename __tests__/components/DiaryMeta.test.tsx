import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import DiaryMeta from '@/components/DiaryMeta'

describe('DiaryMeta Component', () => {
  const mockFormattedDate = '2024년 1월 15일'
  const mockFormattedTime = '오후 11:23 작성'

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)
      ).not.toThrow()
    })

    it('should render the date element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
    })
  })

  describe('Date Display', () => {
    it('should display the date in Korean format', () => {
      // Arrange
      const formattedDate = '2024년 3월 20일'
      const formattedTime = '오전 9:00 작성'

      // Act
      render(<DiaryMeta formattedDate={formattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toMatch(/년|월|일/)
    })

    it('should display the year in the date', () => {
      // Arrange
      const formattedDate = '2024년 3월 20일'
      const formattedTime = '오전 9:00 작성'

      // Act
      render(<DiaryMeta formattedDate={formattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toContain('2024')
    })

    it('should display the exact formattedDate string passed as prop', () => {
      // Arrange
      const formattedDate = '2024년 1월 15일'
      const formattedTime = '오후 11:23 작성'

      // Act
      render(<DiaryMeta formattedDate={formattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toContain(formattedDate)
    })

    it('should handle different dates correctly', () => {
      // Arrange
      const formattedDate1 = '2023년 1월 1일'
      const formattedDate2 = '2025년 12월 31일'
      const formattedTime = '오전 12:00 작성'

      // Act
      const { unmount } = render(<DiaryMeta formattedDate={formattedDate1} formattedTime={formattedTime} />)
      const dateElement1 = screen.getByTestId('diary-detail-date')
      const text1 = dateElement1.textContent

      unmount()
      render(<DiaryMeta formattedDate={formattedDate2} formattedTime={formattedTime} />)
      const dateElement2 = screen.getByTestId('diary-detail-date')
      const text2 = dateElement2.textContent

      // Assert - Different dates should produce different text
      expect(text1).not.toBe(text2)
    })
  })

  describe('Time Display', () => {
    it('should display time with "작성" label in the date element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toContain('작성')
    })

    it('should display time in HH:MM format in the date element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      // Should match time pattern like "오후 11:23" or "14:23"
      expect(dateElement.textContent).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should display AM/PM (오전/오후) indicator for Korean locale', () => {
      // Arrange
      const formattedTime = '오전 9:00 작성'

      // Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      // Korean time format uses 오전 (AM) or 오후 (PM)
      expect(dateElement.textContent).toMatch(/오전|오후|\d{1,2}:\d{2}/)
    })

    it('should display midnight time correctly', () => {
      // Arrange
      const formattedTime = '오전 12:00 작성'

      // Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
      expect(dateElement.textContent).toBeTruthy()
    })

    it('should display correct time for PM hours', () => {
      // Arrange - 23:23 KST
      const formattedTime = '오후 11:23 작성'

      // Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toBeTruthy()
      expect(dateElement.textContent).toContain('작성')
    })

    it('should display the exact formattedTime string passed as prop', () => {
      // Arrange
      const formattedTime = '오후 11:23 작성'

      // Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toContain(formattedTime)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty formattedDate string', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate="" formattedTime={mockFormattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
      expect(dateElement.textContent).toContain(mockFormattedTime)
    })

    it('should handle empty formattedTime string', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime="" />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
      expect(dateElement.textContent).toContain(mockFormattedDate)
    })

    it('should handle both empty strings', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate="" formattedTime="" />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
    })

    it('should handle very old date string', () => {
      // Arrange
      const formattedDate = '2020년 1월 1일'
      const formattedTime = '오전 12:00 작성'

      // Act
      render(<DiaryMeta formattedDate={formattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
      expect(dateElement.textContent).toContain('2020')
    })

    it('should render both formattedDate and formattedTime together in one element', () => {
      // Arrange
      const formattedDate = '2024년 6월 1일'
      const formattedTime = '오전 8:30 작성'

      // Act
      render(<DiaryMeta formattedDate={formattedDate} formattedTime={formattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toContain(formattedDate)
      expect(dateElement.textContent).toContain(formattedTime)
    })
  })

  describe('Visual Styling', () => {
    it('should have content in date element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent?.length).toBeGreaterThan(0)
    })
  })
})
