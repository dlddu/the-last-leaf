import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/auth/login'),
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock GoogleLoginButton to isolate login page tests
jest.mock('@/components/GoogleLoginButton', () => {
  return function MockGoogleLoginButton() {
    return <button data-testid="google-login-btn">Google로 계속하기</button>
  }
})

// Mock fetch for API calls
global.fetch = jest.fn()

import LoginPage from '@/app/(auth)/auth/login/page'

describe('LoginPage (DLD-400 리디자인)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  // ──────────────────────────────────────────────────────
  // 1. 배경 스타일
  // ──────────────────────────────────────────────────────
  describe('배경 스타일', () => {
    it('should apply bg-gray-50 class to the page background', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert
      const main = container.querySelector('main')
      expect(main).toHaveClass('bg-gray-50')
    })
  })

  // ──────────────────────────────────────────────────────
  // 2. AppLogo 컴포넌트
  // ──────────────────────────────────────────────────────
  describe('AppLogo 컴포넌트', () => {
    it('should render app name 나의 자서전', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByText('나의 자서전')).toBeInTheDocument()
    })

    it('should render tagline 일기를 쓰면, 자서전이 됩니다', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByText('일기를 쓰면, 자서전이 됩니다')).toBeInTheDocument()
    })

    it('should render the indigo logo icon', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert
      const icon = container.querySelector('.bg-indigo-600')
      expect(icon).toBeInTheDocument()
    })

    it('should render AppLogo above the form card', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert — logo should appear before the card in the DOM
      const logo = screen.getByText('나의 자서전')
      const emailInput = screen.getByTestId('email-input')
      const logoPos = logo.compareDocumentPosition(emailInput)
      // DOCUMENT_POSITION_FOLLOWING means emailInput appears after logo
      expect(logoPos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })

  // ──────────────────────────────────────────────────────
  // 3. AuthCard 컨테이너
  // ──────────────────────────────────────────────────────
  describe('AuthCard 컨테이너', () => {
    it('should wrap the form inside a bg-white rounded-2xl card', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert — AuthCard renders bg-white rounded-2xl
      const card = container.querySelector('.bg-white.rounded-2xl')
      expect(card).toBeInTheDocument()
    })

    it('should include the email input inside the card', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const emailInput = screen.getByTestId('email-input')
      expect(card).toContainElement(emailInput)
    })

    it('should include the password input inside the card', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const passwordInput = screen.getByTestId('password-input')
      expect(card).toContainElement(passwordInput)
    })

    it('should include the submit button inside the card', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const submitButton = screen.getByTestId('submit-button')
      expect(card).toContainElement(submitButton)
    })

    it('should apply shadow-sm class to the card', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      expect(card).toHaveClass('shadow-sm')
    })

    it('should apply border border-gray-200 classes to the card', () => {
      // Act
      const { container } = render(<LoginPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('border-gray-200')
    })
  })

  // ──────────────────────────────────────────────────────
  // 4. 이메일 인풋
  // ──────────────────────────────────────────────────────
  describe('이메일 인풋', () => {
    it('should render email input with data-testid email-input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
    })

    it('should render Korean label 이메일 for the email input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    })

    it('should apply rounded-xl class to email input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('email-input')
      expect(input).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to email input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('email-input')
      expect(input).toHaveClass('py-3')
    })

    it('should have a placeholder on the email input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('email-input')
      expect(input).toHaveAttribute('placeholder')
      expect(input.getAttribute('placeholder')).not.toBe('')
    })

    it('should be of type email', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('email-input')
      expect(input).toHaveAttribute('type', 'email')
    })
  })

  // ──────────────────────────────────────────────────────
  // 5. 비밀번호 인풋
  // ──────────────────────────────────────────────────────
  describe('비밀번호 인풋', () => {
    it('should render password input with data-testid password-input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })

    it('should render Korean label 비밀번호 for the password input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    })

    it('should apply rounded-xl class to password input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to password input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveClass('py-3')
    })

    it('should have a placeholder on the password input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveAttribute('placeholder')
      expect(input.getAttribute('placeholder')).not.toBe('')
    })

    it('should be of type password', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  // ──────────────────────────────────────────────────────
  // 6. 로그인 버튼 스타일
  // ──────────────────────────────────────────────────────
  describe('로그인 버튼 스타일', () => {
    it('should render submit button with data-testid submit-button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should apply bg-indigo-600 class to the submit button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('bg-indigo-600')
    })

    it('should apply rounded-xl class to the submit button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to the submit button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('py-3')
    })

    it('should apply font-medium class to the submit button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('font-medium')
    })
  })

  // ──────────────────────────────────────────────────────
  // 7. Divider 컴포넌트
  // ──────────────────────────────────────────────────────
  describe('Divider 컴포넌트', () => {
    it('should render divider with 또는 text', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByText('또는')).toBeInTheDocument()
    })

    it('should place the divider between the submit button and Google login button', () => {
      // Act
      render(<LoginPage />)

      // Assert — '또는' text should be between the two buttons in the DOM
      const dividerText = screen.getByText('또는')
      const submitButton = screen.getByTestId('submit-button')
      const googleButton = screen.getByTestId('google-login-btn')

      const submitBeforeDivider =
        submitButton.compareDocumentPosition(dividerText) & Node.DOCUMENT_POSITION_FOLLOWING
      const dividerBeforeGoogle =
        dividerText.compareDocumentPosition(googleButton) & Node.DOCUMENT_POSITION_FOLLOWING

      expect(submitBeforeDivider).toBeTruthy()
      expect(dividerBeforeGoogle).toBeTruthy()
    })
  })

  // ──────────────────────────────────────────────────────
  // 8. GoogleLoginButton 스타일 (리스타일링)
  // ──────────────────────────────────────────────────────
  describe('GoogleLoginButton 스타일', () => {
    // GoogleLoginButton은 별도 컴포넌트 테스트에서 상세 검증
    // 여기서는 로그인 페이지에 버튼이 렌더링되는지만 확인
    it('should render Google login button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('google-login-btn')).toBeInTheDocument()
    })
  })

  // ──────────────────────────────────────────────────────
  // 9. AuthLink — 회원가입 링크
  // ──────────────────────────────────────────────────────
  describe('AuthLink — 회원가입 링크', () => {
    it('should render 계정이 없으신가요? text', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument()
    })

    it('should render 회원가입 link text', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByText('회원가입')).toBeInTheDocument()
    })

    it('should render a link pointing to /auth/signup', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const signupLink = screen.getByRole('link', { name: '회원가입' })
      expect(signupLink).toHaveAttribute('href', '/auth/signup')
    })

    it('should render signup link below the Google login button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      const googleButton = screen.getByTestId('google-login-btn')
      const signupLink = screen.getByRole('link', { name: '회원가입' })
      const googleBeforeLink =
        googleButton.compareDocumentPosition(signupLink) & Node.DOCUMENT_POSITION_FOLLOWING
      expect(googleBeforeLink).toBeTruthy()
    })
  })

  // ──────────────────────────────────────────────────────
  // 10. 기존 data-testid 유지 (회귀 테스트)
  // ──────────────────────────────────────────────────────
  describe('기존 data-testid 유지', () => {
    it('should keep data-testid email-input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
    })

    it('should keep data-testid password-input', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })

    it('should keep data-testid submit-button', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should render data-testid error-message when login fails', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid email or password' }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'bad@example.com')
      await user.type(screen.getByTestId('password-input'), 'wrongpassword')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should not render error-message element on initial render', () => {
      // Act
      render(<LoginPage />)

      // Assert
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })
  })

  // ──────────────────────────────────────────────────────
  // 11. 리다이렉트 경로 /diary 확인
  // ──────────────────────────────────────────────────────
  describe('리다이렉트 경로 /diary', () => {
    it('should redirect to /diary after successful login', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, user: { email: 'test@example.com' } }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/diary')
      })
    })

    it('should NOT redirect to /dashboard after successful login', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard')
    })
  })

  // ──────────────────────────────────────────────────────
  // 12. 기존 로그인 로직 유지 (회귀 테스트)
  // ──────────────────────────────────────────────────────
  describe('기존 로그인 로직 유지', () => {
    it('should call /api/auth/login with POST method and credentials', async () => {
      // Arrange
      const user = userEvent.setup()
      const email = 'user@example.com'
      const password = 'securePass123'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), email)
      await user.type(screen.getByTestId('password-input'), password)
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ email, password }),
          })
        )
      })
    })

    it('should display error message when login fails with 401', async () => {
      // Arrange
      const user = userEvent.setup()
      const errorMsg = 'Invalid email or password'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: errorMsg }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'bad@example.com')
      await user.type(screen.getByTestId('password-input'), 'badpassword')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        const errorEl = screen.getByTestId('error-message')
        expect(errorEl).toHaveTextContent(errorMsg)
      })
    })

    it('should not redirect when login fails', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      })
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'wrong@example.com')
      await user.type(screen.getByTestId('password-input'), 'wrongpass')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should display error message when a network error occurs', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should disable submit button while loading', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      )
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('should show loading text on the submit button while submitting', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            )
          )
      )
      render(<LoginPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'test@example.com')
      await user.type(screen.getByTestId('password-input'), 'password')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      expect(screen.getByTestId('submit-button')).toHaveTextContent(/logging in/i)
    })
  })
})
