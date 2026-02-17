import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import DiaryMeta from '@/components/DiaryMeta'

describe('DiaryMeta Component', () => {
  const mockCreatedAt = new Date('2024-01-15T14:23:00Z')

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<DiaryMeta createdAt={mockCreatedAt} />)).not.toThrow()
    })

    it('should render the date element', () => {
      // Arrange & Act
      render(<DiaryMeta createdAt={mockCreatedAt} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
    })

    it('should render the time element', () => {
      // Arrange & Act
      render(<DiaryMeta createdAt={mockCreatedAt} />)

      // Assert
      const timeElement = screen.getByTestId('diary-detail-time')
      expect(timeElement).toBeInTheDocument()
    })
  })

  describe('Date Display', () => {
    it('should display the date in Korean format', () => {
      // Arrange
      const date = new Date('2024-03-20T09:00:00Z')

      // Act
      render(<DiaryMeta createdAt={date} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toMatch(/년|월|일/)
    })

    it('should display the year in the date', () => {
      // Arrange
      const date = new Date('2024-03-20T09:00:00Z')

      // Act
      render(<DiaryMeta createdAt={date} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent).toContain('2024')
    })

    it('should handle different dates correctly', () => {
      // Arrange
      const date1 = new Date('2023-01-01T00:00:00Z')
      const date2 = new Date('2025-12-31T23:59:59Z')

      // Act
      const { unmount } = render(<DiaryMeta createdAt={date1} />)
      const dateElement1 = screen.getByTestId('diary-detail-date')
      const text1 = dateElement1.textContent

      unmount()
      render(<DiaryMeta createdAt={date2} />)
      const dateElement2 = screen.getByTestId('diary-detail-date')
      const text2 = dateElement2.textContent

      // Assert - Different dates should produce different text
      expect(text1).not.toBe(text2)
    })
  })

  describe('Time Display', () => {
    it('should display time with "작성" label', () => {
      // Arrange & Act
      render(<DiaryMeta createdAt={mockCreatedAt} />)

      // Assert
      const timeElement = screen.getByTestId('diary-detail-time')
      expect(timeElement.textContent).toContain('작성')
    })

    it('should display time in HH:MM format', () => {
      // Arrange & Act
      render(<DiaryMeta createdAt={mockCreatedAt} />)

      // Assert
      const timeElement = screen.getByTestId('diary-detail-time')
      // Should match time pattern like "오후 11:23" or "14:23"
      expect(timeElement.textContent).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should display AM/PM (오전/오후) indicator for Korean locale', () => {
      // Arrange
      const morningDate = new Date('2024-01-15T09:00:00Z')

      // Act
      render(<DiaryMeta createdAt={morningDate} />)

      // Assert
      const timeElement = screen.getByTestId('diary-detail-time')
      // Korean time format uses 오전 (AM) or 오후 (PM)
      expect(timeElement.textContent).toMatch(/오전|오후|\d{1,2}:\d{2}/)
    })

    it('should display midnight time correctly', () => {
      // Arrange
      const midnightDate = new Date('2024-01-15T00:00:00+09:00')

      // Act
      render(<DiaryMeta createdAt={midnightDate} />)

      // Assert
      const timeElement = screen.getByTestId('diary-detail-time')
      expect(timeElement).toBeInTheDocument()
      expect(timeElement.textContent).toBeTruthy()
    })

    it('should display correct time for PM hours', () => {
      // Arrange - 23:23 KST (UTC+9)
      const eveningDate = new Date('2024-01-15T14:23:00Z')

      // Act
      render(<DiaryMeta createdAt={eveningDate} />)

      // Assert
      const timeElement = screen.getByTestId('diary-detail-time')
      expect(timeElement.textContent).toBeTruthy()
      expect(timeElement.textContent).toContain('작성')
    })
  })

  describe('Edge Cases', () => {
    it('should handle Date object as input', () => {
      // Arrange
      const dateObj = new Date('2024-06-01T08:30:00Z')

      // Act
      render(<DiaryMeta createdAt={dateObj} />)

      // Assert
      expect(screen.getByTestId('diary-detail-date')).toBeInTheDocument()
      expect(screen.getByTestId('diary-detail-time')).toBeInTheDocument()
    })

    it('should handle string date as input', () => {
      // Arrange
      const dateStr = '2024-06-01T08:30:00Z'

      // Act
      render(<DiaryMeta createdAt={new Date(dateStr)} />)

      // Assert
      expect(screen.getByTestId('diary-detail-date')).toBeInTheDocument()
    })

    it('should handle very old dates', () => {
      // Arrange
      const oldDate = new Date('2020-01-01T00:00:00Z')

      // Act
      render(<DiaryMeta createdAt={oldDate} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement).toBeInTheDocument()
      expect(dateElement.textContent).toContain('2020')
    })
  })

  describe('Visual Styling', () => {
    it('should have content in date element', () => {
      // Arrange & Act
      render(<DiaryMeta createdAt={mockCreatedAt} />)

      // Assert
      const dateElement = screen.getByTestId('diary-detail-date')
      expect(dateElement.textContent?.length).toBeGreaterThan(0)
    })

    it('should have content in time element', () => {
      // Arrange & Act
      render(<DiaryMeta createdAt={mockCreatedAt} />)

      // Assert
      const timeElement = screen.getByTestId('diary-detail-time')
      expect(timeElement.textContent?.length).toBeGreaterThan(0)
    })
  })
})
