import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import AuthLink from '@/components/AuthLink'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('AuthLink Component', () => {
  const defaultProps = {
    text: '계정이 없으신가요?',
    linkText: '회원가입',
    href: '/signup',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<AuthLink {...defaultProps} />)).not.toThrow()
    })

    it('should render description text', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument()
    })

    it('should render link text', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      expect(screen.getByText('회원가입')).toBeInTheDocument()
    })

    it('should render an anchor element for the link', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      const link = screen.getByRole('link', { name: '회원가입' })
      expect(link).toBeInTheDocument()
    })

    it('should render a container element', () => {
      // Act
      const { container } = render(<AuthLink {...defaultProps} />)

      // Assert
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('href prop', () => {
    it('should set correct href on the link', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      const link = screen.getByRole('link', { name: '회원가입' })
      expect(link).toHaveAttribute('href', '/signup')
    })

    it('should navigate to the correct URL for login page', () => {
      // Arrange
      const props = {
        text: '이미 계정이 있으신가요?',
        linkText: '로그인',
        href: '/login',
      }

      // Act
      render(<AuthLink {...props} />)

      // Assert
      const link = screen.getByRole('link', { name: '로그인' })
      expect(link).toHaveAttribute('href', '/login')
    })

    it('should handle nested path hrefs', () => {
      // Arrange
      const props = {
        text: '비밀번호를 잊으셨나요?',
        linkText: '비밀번호 재설정',
        href: '/auth/reset-password',
      }

      // Act
      render(<AuthLink {...props} />)

      // Assert
      const link = screen.getByRole('link', { name: '비밀번호 재설정' })
      expect(link).toHaveAttribute('href', '/auth/reset-password')
    })
  })

  describe('text prop', () => {
    it('should display the provided description text', () => {
      // Arrange
      const text = '이미 계정이 있으신가요?'

      // Act
      render(<AuthLink text={text} linkText="로그인" href="/login" />)

      // Assert
      expect(screen.getByText(text)).toBeInTheDocument()
    })

    it('should render text separately from the link text', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert — description text and link text are both present
      expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument()
      expect(screen.getByText('회원가입')).toBeInTheDocument()
    })
  })

  describe('linkText prop', () => {
    it('should display the provided link text', () => {
      // Arrange
      const linkText = '지금 가입하기'

      // Act
      render(<AuthLink text="계정이 없으신가요?" linkText={linkText} href="/signup" />)

      // Assert
      expect(screen.getByText(linkText)).toBeInTheDocument()
    })

    it('should use linkText as the accessible name of the link', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument()
    })
  })

  describe('Next.js Link usage', () => {
    it('should use Next.js Link component for client-side navigation', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert — Next.js Link renders as an anchor with the href
      const link = screen.getByRole('link', { name: '회원가입' })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('should not render a plain button for navigation', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have an accessible link element', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      const link = screen.getByRole('link', { name: '회원가입' })
      expect(link).toHaveAccessibleName()
    })

    it('should be keyboard focusable', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      const link = screen.getByRole('link', { name: '회원가입' })
      link.focus()

      // Assert
      expect(link).toHaveFocus()
    })

    it('should not have tabIndex -1 on the link', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      const link = screen.getByRole('link', { name: '회원가입' })
      expect(link).not.toHaveAttribute('tabIndex', '-1')
    })

    it('should have readable description text in the document', () => {
      // Act
      render(<AuthLink {...defaultProps} />)

      // Assert
      const text = screen.getByText('계정이 없으신가요?')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<AuthLink {...defaultProps} />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })

    it('should re-render correctly when props change', () => {
      // Arrange
      const { rerender } = render(<AuthLink {...defaultProps} />)
      expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument()

      // Act
      rerender(
        <AuthLink
          text="이미 계정이 있으신가요?"
          linkText="로그인"
          href="/login"
        />
      )

      // Assert
      expect(screen.queryByText('계정이 없으신가요?')).not.toBeInTheDocument()
      expect(screen.getByText('이미 계정이 있으신가요?')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '로그인' })).toHaveAttribute('href', '/login')
    })

    it('should handle long description text without breaking', () => {
      // Arrange
      const longText = '이 계정은 이미 존재합니다. 다른 방법으로 로그인하시겠습니까?'

      // Act
      render(<AuthLink text={longText} linkText="로그인" href="/login" />)

      // Assert
      expect(screen.getByText(longText)).toBeInTheDocument()
    })

    it('should handle long link text without breaking', () => {
      // Arrange
      const longLinkText = '새 계정 만들기 및 가입하기'

      // Act
      render(<AuthLink text="계정이 없으신가요?" linkText={longLinkText} href="/signup" />)

      // Assert
      expect(screen.getByRole('link', { name: longLinkText })).toBeInTheDocument()
    })
  })

  describe('Props combination', () => {
    it('should render all three props correctly together', () => {
      // Arrange
      const props = {
        text: '계정이 없으신가요?',
        linkText: '지금 가입',
        href: '/register',
      }

      // Act
      render(<AuthLink {...props} />)

      // Assert
      expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument()
      expect(screen.getByText('지금 가입')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '지금 가입' })).toHaveAttribute('href', '/register')
    })

    it('should render login variant correctly', () => {
      // Arrange
      const props = {
        text: '이미 계정이 있으신가요?',
        linkText: '로그인',
        href: '/login',
      }

      // Act
      render(<AuthLink {...props} />)

      // Assert
      expect(screen.getByText('이미 계정이 있으신가요?')).toBeInTheDocument()
      const link = screen.getByRole('link', { name: '로그인' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/login')
    })
  })
})
