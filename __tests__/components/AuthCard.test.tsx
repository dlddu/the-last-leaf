import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import AuthCard from '@/components/AuthCard'

describe('AuthCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<AuthCard>content</AuthCard>)).not.toThrow()
    })

    it('should render children content', () => {
      // Act
      render(<AuthCard><p>카드 내용</p></AuthCard>)

      // Assert
      expect(screen.getByText('카드 내용')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      // Act
      render(
        <AuthCard>
          <p>첫 번째 내용</p>
          <p>두 번째 내용</p>
        </AuthCard>
      )

      // Assert
      expect(screen.getByText('첫 번째 내용')).toBeInTheDocument()
      expect(screen.getByText('두 번째 내용')).toBeInTheDocument()
    })

    it('should render a container element', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply white background class', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('bg-white')
    })

    it('should apply rounded-2xl class', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('rounded-2xl')
    })

    it('should apply shadow-sm class', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('shadow-sm')
    })

    it('should apply border class', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('border')
    })

    it('should apply border-gray-200 class', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('border-gray-200')
    })

    it('should apply p-6 padding class', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert
      const card = container.firstChild as HTMLElement
      expect(card).toHaveClass('p-6')
    })
  })

  describe('Children prop', () => {
    it('should render string children', () => {
      // Act
      render(<AuthCard>텍스트 내용</AuthCard>)

      // Assert
      expect(screen.getByText('텍스트 내용')).toBeInTheDocument()
    })

    it('should render React element children', () => {
      // Act
      render(
        <AuthCard>
          <button>로그인</button>
        </AuthCard>
      )

      // Assert
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    })

    it('should render nested children structure', () => {
      // Act
      render(
        <AuthCard>
          <div data-testid="nested-wrapper">
            <span>중첩 내용</span>
          </div>
        </AuthCard>
      )

      // Assert
      expect(screen.getByTestId('nested-wrapper')).toBeInTheDocument()
      expect(screen.getByText('중첩 내용')).toBeInTheDocument()
    })

    it('should render form elements as children', () => {
      // Act
      render(
        <AuthCard>
          <form>
            <input type="email" placeholder="이메일" />
            <input type="password" placeholder="비밀번호" />
          </form>
        </AuthCard>
      )

      // Assert
      expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should not be an interactive element itself', () => {
      // Act
      const { container } = render(<AuthCard>content</AuthCard>)

      // Assert — wrapper should not be button or link
      const card = container.firstChild as HTMLElement
      expect(card.tagName).not.toBe('BUTTON')
      expect(card.tagName).not.toBe('A')
    })

    it('should preserve accessibility attributes of children', () => {
      // Act
      render(
        <AuthCard>
          <button aria-label="구글로 로그인">구글 로그인</button>
        </AuthCard>
      )

      // Assert
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', '구글로 로그인')
    })

    it('should not interfere with focus management of children', () => {
      // Act
      render(
        <AuthCard>
          <button>포커스 버튼</button>
        </AuthCard>
      )

      const button = screen.getByRole('button')
      button.focus()

      // Assert
      expect(button).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<AuthCard>content</AuthCard>)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should handle null-like falsy children gracefully', () => {
      // Act & Assert — React allows false as children
      expect(() =>
        render(<AuthCard>{false}</AuthCard>)
      ).not.toThrow()
    })

    it('should re-render correctly when children change', () => {
      // Arrange
      const { rerender } = render(<AuthCard><p>초기 내용</p></AuthCard>)
      expect(screen.getByText('초기 내용')).toBeInTheDocument()

      // Act
      rerender(<AuthCard><p>변경된 내용</p></AuthCard>)

      // Assert
      expect(screen.queryByText('초기 내용')).not.toBeInTheDocument()
      expect(screen.getByText('변경된 내용')).toBeInTheDocument()
    })
  })
})
