import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import AppLogo from '@/components/AppLogo'

describe('AppLogo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<AppLogo />)).not.toThrow()
    })

    it('should render app name text', () => {
      // Act
      render(<AppLogo />)

      // Assert
      expect(screen.getByText('나의 자서전')).toBeInTheDocument()
    })

    it('should render indigo icon element', () => {
      // Act
      const { container } = render(<AppLogo />)

      // Assert
      const icon = container.querySelector('.bg-indigo-600')
      expect(icon).toBeInTheDocument()
    })

    it('should apply correct size classes to icon', () => {
      // Act
      const { container } = render(<AppLogo />)

      // Assert
      const icon = container.querySelector('.w-16.h-16')
      expect(icon).toBeInTheDocument()
    })

    it('should apply rounded-2xl class to icon', () => {
      // Act
      const { container } = render(<AppLogo />)

      // Assert
      const icon = container.querySelector('.rounded-2xl')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Tagline prop', () => {
    it('should not render tagline when tagline prop is not provided', () => {
      // Act
      render(<AppLogo />)

      // Assert — no tagline element should be present
      expect(screen.queryByTestId('app-logo-tagline')).not.toBeInTheDocument()
    })

    it('should not render tagline when tagline prop is undefined', () => {
      // Act
      render(<AppLogo tagline={undefined} />)

      // Assert
      expect(screen.queryByTestId('app-logo-tagline')).not.toBeInTheDocument()
    })

    it('should render tagline text when tagline prop is provided', () => {
      // Arrange
      const tagline = '나만의 이야기를 기록하세요'

      // Act
      render(<AppLogo tagline={tagline} />)

      // Assert
      expect(screen.getByText(tagline)).toBeInTheDocument()
    })

    it('should render tagline with different text values', () => {
      // Arrange
      const tagline = 'Write your story'

      // Act
      render(<AppLogo tagline={tagline} />)

      // Assert
      expect(screen.getByText(tagline)).toBeInTheDocument()
    })

    it('should render only app name when tagline is empty string', () => {
      // Act
      render(<AppLogo tagline="" />)

      // Assert
      expect(screen.getByText('나의 자서전')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have a semantic structure', () => {
      // Act
      const { container } = render(<AppLogo />)

      // Assert — should not be empty
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should be readable by screen readers when tagline is present', () => {
      // Arrange
      const tagline = '나만의 이야기를 기록하세요'

      // Act
      render(<AppLogo tagline={tagline} />)

      // Assert — both texts should be in the document
      expect(screen.getByText('나의 자서전')).toBeInTheDocument()
      expect(screen.getByText(tagline)).toBeInTheDocument()
    })

    it('should not render interactive elements by default', () => {
      // Act
      render(<AppLogo />)

      // Assert — logo is a presentational component
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<AppLogo />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should handle long tagline text without breaking layout', () => {
      // Arrange
      const longTagline = '이것은 매우 길고 긴 태그라인입니다. 레이아웃이 깨지지 않아야 합니다.'

      // Act
      render(<AppLogo tagline={longTagline} />)

      // Assert
      expect(screen.getByText(longTagline)).toBeInTheDocument()
      expect(screen.getByText('나의 자서전')).toBeInTheDocument()
    })

    it('should render correctly on rerender with updated tagline', () => {
      // Arrange
      const { rerender } = render(<AppLogo />)
      expect(screen.queryByTestId('app-logo-tagline')).not.toBeInTheDocument()

      // Act
      rerender(<AppLogo tagline="새 태그라인" />)

      // Assert
      expect(screen.getByText('새 태그라인')).toBeInTheDocument()
    })

    it('should render correctly on rerender removing tagline', () => {
      // Arrange
      const { rerender } = render(<AppLogo tagline="기존 태그라인" />)
      expect(screen.getByText('기존 태그라인')).toBeInTheDocument()

      // Act
      rerender(<AppLogo />)

      // Assert
      expect(screen.queryByText('기존 태그라인')).not.toBeInTheDocument()
      expect(screen.getByText('나의 자서전')).toBeInTheDocument()
    })
  })
})
