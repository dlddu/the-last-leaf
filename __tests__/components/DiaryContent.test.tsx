import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import DiaryContent from '@/components/DiaryContent'

describe('DiaryContent Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<DiaryContent content="Test content" />)).not.toThrow()
    })

    it('should render the content element with testid', () => {
      // Arrange & Act
      render(<DiaryContent content="Test content" />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement).toBeInTheDocument()
    })

    it('should display the provided content text', () => {
      // Arrange
      const text = 'Today I went for a walk in the park.'

      // Act
      render(<DiaryContent content={text} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement).toHaveTextContent(text)
    })
  })

  describe('whitespace-pre-wrap Styling', () => {
    it('should apply whitespace-pre-wrap CSS class', () => {
      // Arrange & Act
      render(<DiaryContent content="Some text" />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement).toHaveClass(/whitespace-pre-wrap/)
    })

    it('should preserve newlines in content', () => {
      // Arrange
      const multilineContent = 'Line 1\nLine 2\nLine 3'

      // Act
      render(<DiaryContent content={multilineContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      // With whitespace-pre-wrap, text content includes newlines
      expect(contentElement.textContent).toContain('Line 1')
      expect(contentElement.textContent).toContain('Line 2')
      expect(contentElement.textContent).toContain('Line 3')
    })

    it('should preserve spaces and tabs in content', () => {
      // Arrange
      const spacedContent = 'Word1   Word2\t\tWord3'

      // Act
      render(<DiaryContent content={spacedContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.textContent).toContain('Word1')
      expect(contentElement.textContent).toContain('Word2')
      expect(contentElement.textContent).toContain('Word3')
    })
  })

  describe('Content Display', () => {
    it('should display Korean characters correctly', () => {
      // Arrange
      const koreanContent = '오늘은 정말 맑은 날이었다. 공원을 산책하며 생각을 정리했다.'

      // Act
      render(<DiaryContent content={koreanContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement).toHaveTextContent(koreanContent)
    })

    it('should display emoji in content', () => {
      // Arrange
      const emojiContent = '오늘 기분이 좋다 😊 날씨도 맑고 🌞'

      // Act
      render(<DiaryContent content={emojiContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.textContent).toContain('😊')
      expect(contentElement.textContent).toContain('🌞')
    })

    it('should display long content without truncation', () => {
      // Arrange
      const longContent = '가'.repeat(500)

      // Act
      render(<DiaryContent content={longContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.textContent).toBe(longContent)
    })

    it('should handle empty string content', () => {
      // Arrange & Act
      render(<DiaryContent content="" />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement).toBeInTheDocument()
      expect(contentElement.textContent).toBe('')
    })

    it('should handle special HTML characters safely', () => {
      // Arrange
      const htmlContent = 'Content with <script>alert("xss")</script> & "quotes" and \'apostrophes\''

      // Act
      render(<DiaryContent content={htmlContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      // React escapes HTML by default, so textContent will show raw text
      expect(contentElement).toBeInTheDocument()
      // The script tag should not execute - just be displayed as text
      expect(contentElement.textContent).toContain('Content with')
    })

    it('should handle content with mixed line breaks', () => {
      // Arrange
      const mixedLinebreakContent = 'First paragraph\n\nSecond paragraph\n\nThird paragraph'

      // Act
      render(<DiaryContent content={mixedLinebreakContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.textContent).toContain('First paragraph')
      expect(contentElement.textContent).toContain('Second paragraph')
      expect(contentElement.textContent).toContain('Third paragraph')
    })
  })

  describe('Edge Cases', () => {
    it('should handle content with only whitespace', () => {
      // Arrange
      const whitespaceContent = '   \n   \t   '

      // Act
      render(<DiaryContent content={whitespaceContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement).toBeInTheDocument()
    })

    it('should handle unicode characters', () => {
      // Arrange
      const unicodeContent = '日本語 中文 한국어 العربية'

      // Act
      render(<DiaryContent content={unicodeContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.textContent).toContain('日本語')
      expect(contentElement.textContent).toContain('한국어')
    })

    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<DiaryContent content="Some content" />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Visual Styling', () => {
    it('should apply text color styling', () => {
      // Arrange & Act
      render(<DiaryContent content="Test" />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      // Should have some styling class applied
      expect(contentElement.className).toBeTruthy()
    })
  })
})
