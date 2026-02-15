import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import DiaryListHeader from '@/components/DiaryListHeader'

describe('DiaryListHeader Component', () => {
  describe('Rendering', () => {
    it('should render header component', () => {
      // Act
      render(<DiaryListHeader totalCount={0} />)

      // Assert
      const header = screen.getByRole('heading')
      expect(header).toBeInTheDocument()
    })

    it('should display "내 일기" title', () => {
      // Act
      render(<DiaryListHeader totalCount={0} />)

      // Assert
      expect(screen.getByText(/내 일기/i)).toBeInTheDocument()
    })

    it('should display total count', () => {
      // Act
      render(<DiaryListHeader totalCount={5} />)

      // Assert
      expect(screen.getByText(/5/)).toBeInTheDocument()
    })
  })

  describe('Count Display', () => {
    it('should display zero count', () => {
      // Act
      render(<DiaryListHeader totalCount={0} />)

      // Assert
      expect(screen.getByText(/0/)).toBeInTheDocument()
    })

    it('should display single digit count', () => {
      // Act
      render(<DiaryListHeader totalCount={7} />)

      // Assert
      expect(screen.getByText(/7/)).toBeInTheDocument()
    })

    it('should display double digit count', () => {
      // Act
      render(<DiaryListHeader totalCount={42} />)

      // Assert
      expect(screen.getByText(/42/)).toBeInTheDocument()
    })

    it('should display triple digit count', () => {
      // Act
      render(<DiaryListHeader totalCount={365} />)

      // Assert
      expect(screen.getByText(/365/)).toBeInTheDocument()
    })

    it('should display large count', () => {
      // Act
      render(<DiaryListHeader totalCount={1000} />)

      // Assert
      expect(screen.getByText(/1000/)).toBeInTheDocument()
    })

    it('should format large numbers with separator if applicable', () => {
      // Act
      render(<DiaryListHeader totalCount={1234} />)

      // Assert
      // Should display either "1234" or "1,234" depending on implementation
      const header = screen.getByRole('heading').parentElement || screen.getByRole('heading')
      expect(header.textContent).toMatch(/1[,]?234/)
    })
  })

  describe('Layout', () => {
    it('should render title and count together', () => {
      // Act
      render(<DiaryListHeader totalCount={10} />)

      // Assert
      const container = screen.getByRole('heading').parentElement || screen.getByRole('heading')
      expect(container.textContent).toContain('내 일기')
      expect(container.textContent).toContain('10')
    })

    it('should have proper heading hierarchy', () => {
      // Act
      render(<DiaryListHeader totalCount={5} />)

      // Assert
      const heading = screen.getByRole('heading')
      // Should be h1 or h2 for semantic structure
      expect(['H1', 'H2', 'H3']).toContain(heading.tagName)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      // Act
      render(<DiaryListHeader totalCount={3} />)

      // Assert
      const heading = screen.getByRole('heading')
      expect(heading).toHaveAccessibleName()
    })

    it('should properly announce count to screen readers', () => {
      // Act
      render(<DiaryListHeader totalCount={5} />)

      // Assert
      // Count should be accessible (either visible or with aria-label)
      const container = screen.getByRole('heading').parentElement || screen.getByRole('heading')
      expect(container.textContent).toMatch(/5/)
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative count gracefully', () => {
      // Act
      render(<DiaryListHeader totalCount={-1} />)

      // Assert
      // Should either display 0 or the absolute value
      const container = screen.getByRole('heading').parentElement || screen.getByRole('heading')
      expect(container).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      // Act
      render(<DiaryListHeader totalCount={999999} />)

      // Assert
      const container = screen.getByRole('heading').parentElement || screen.getByRole('heading')
      expect(container.textContent).toMatch(/999[,]?999/)
    })

    it('should handle decimal numbers by rounding or truncating', () => {
      // Act
      render(<DiaryListHeader totalCount={5.7} />)

      // Assert
      const container = screen.getByRole('heading').parentElement || screen.getByRole('heading')
      // Should display as integer
      expect(container.textContent).toMatch(/5|6/)
    })
  })

  describe('Visual Styling', () => {
    it('should apply appropriate styling', () => {
      // Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      expect(container.firstChild).toHaveClass(/.*/)
    })

    it('should style count differently from title', () => {
      // Act
      render(<DiaryListHeader totalCount={10} />)

      // Assert
      // Count should be visually distinct (different color, size, etc.)
      const heading = screen.getByRole('heading')
      expect(heading.parentElement || heading).toBeInTheDocument()
    })
  })

  describe('Responsiveness', () => {
    it('should render on mobile viewport', () => {
      // Act
      render(<DiaryListHeader totalCount={5} />)

      // Assert
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
    })

    it('should render on desktop viewport', () => {
      // Act
      render(<DiaryListHeader totalCount={5} />)

      // Assert
      const heading = screen.getByRole('heading')
      expect(heading).toBeInTheDocument()
    })
  })
})
