import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import Divider from '@/components/Divider'

describe('Divider Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<Divider />)).not.toThrow()
    })

    it('should render default text 또는 when no text prop is provided', () => {
      // Act
      render(<Divider />)

      // Assert
      expect(screen.getByText('또는')).toBeInTheDocument()
    })

    it('should render horizontal line elements', () => {
      // Act
      const { container } = render(<Divider />)

      // Assert — should contain hr or div-based separator lines
      const lines = container.querySelectorAll('hr, [class*="border"]')
      expect(lines.length).toBeGreaterThan(0)
    })

    it('should render a container element', () => {
      // Act
      const { container } = render(<Divider />)

      // Assert
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Default value', () => {
    it('should display 또는 as default when text prop is omitted', () => {
      // Act
      render(<Divider />)

      // Assert
      expect(screen.getByText('또는')).toBeInTheDocument()
    })

    it('should display 또는 as default when text prop is undefined', () => {
      // Act
      render(<Divider text={undefined} />)

      // Assert
      expect(screen.getByText('또는')).toBeInTheDocument()
    })
  })

  describe('text prop', () => {
    it('should render custom text when text prop is provided', () => {
      // Arrange
      const customText = 'or'

      // Act
      render(<Divider text={customText} />)

      // Assert
      expect(screen.getByText(customText)).toBeInTheDocument()
    })

    it('should render Korean text when provided', () => {
      // Arrange
      const koreanText = '혹은'

      // Act
      render(<Divider text={koreanText} />)

      // Assert
      expect(screen.getByText(koreanText)).toBeInTheDocument()
    })

    it('should not render 또는 when custom text is provided', () => {
      // Act
      render(<Divider text="or" />)

      // Assert
      expect(screen.queryByText('또는')).not.toBeInTheDocument()
    })

    it('should render the text in the center of the divider', () => {
      // Act
      const { container } = render(<Divider text="또는" />)

      // Assert — text node should be inside the main container
      expect(screen.getByText('또는')).toBeInTheDocument()
      expect(container.firstChild).toContainElement(screen.getByText('또는'))
    })
  })

  describe('Layout structure', () => {
    it('should have a horizontal layout with text in the middle', () => {
      // Act
      const { container } = render(<Divider />)

      // Assert — outer wrapper should exist and contain the text
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveTextContent('또는')
    })

    it('should render separator lines alongside the text', () => {
      // Act
      const { container } = render(<Divider />)

      // Assert — should have at least one element that acts as a line
      const wrapper = container.firstChild as HTMLElement
      // The divider structure contains line elements on both sides of the text
      expect(wrapper.children.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Accessibility', () => {
    it('should not be an interactive element', () => {
      // Act
      render(<Divider />)

      // Assert
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('should have readable text for screen readers', () => {
      // Act
      render(<Divider />)

      // Assert — text should be accessible
      expect(screen.getByText('또는')).toBeInTheDocument()
    })

    it('should have readable custom text for screen readers', () => {
      // Arrange
      const text = 'or'

      // Act
      render(<Divider text={text} />)

      // Assert
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<Divider />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should re-render correctly when text prop changes', () => {
      // Arrange
      const { rerender } = render(<Divider />)
      expect(screen.getByText('또는')).toBeInTheDocument()

      // Act
      rerender(<Divider text="or" />)

      // Assert
      expect(screen.queryByText('또는')).not.toBeInTheDocument()
      expect(screen.getByText('or')).toBeInTheDocument()
    })

    it('should re-render from custom text back to default', () => {
      // Arrange
      const { rerender } = render(<Divider text="or" />)
      expect(screen.getByText('or')).toBeInTheDocument()

      // Act
      rerender(<Divider />)

      // Assert
      expect(screen.queryByText('or')).not.toBeInTheDocument()
      expect(screen.getByText('또는')).toBeInTheDocument()
    })

    it('should handle long text without breaking layout', () => {
      // Arrange
      const longText = '또는 다음 중 하나를 선택하세요'

      // Act
      render(<Divider text={longText} />)

      // Assert
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters in text', () => {
      // Arrange
      const specialText = '— or —'

      // Act
      render(<Divider text={specialText} />)

      // Assert
      expect(screen.getByText(specialText)).toBeInTheDocument()
    })
  })
})
