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
  usePathname: jest.fn(() => '/auth/signup'),
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

// Mock GoogleLoginButton to isolate signup page tests
jest.mock('@/components/GoogleLoginButton', () => {
  return function MockGoogleLoginButton() {
    return <button data-testid="google-login-btn">Google로 가입</button>
  }
})

// Mock fetch for API calls
global.fetch = jest.fn()

import SignupPage from '@/app/(auth)/auth/signup/page'

describe('SignupPage (리디자인)', () => {
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
      const { container } = render(<SignupPage />)

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
      render(<SignupPage />)

      // Assert
      expect(screen.getByText('나의 자서전')).toBeInTheDocument()
    })

    it('should render tagline 일기를 기록하고 자서전을 만들어 보세요', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByText('일기를 기록하고 자서전을 만들어 보세요')).toBeInTheDocument()
    })

    it('should render the indigo logo icon', () => {
      // Act
      const { container } = render(<SignupPage />)

      // Assert
      const icon = container.querySelector('.bg-indigo-600')
      expect(icon).toBeInTheDocument()
    })

    it('should render AppLogo above the form card', () => {
      // Act
      const { container } = render(<SignupPage />)

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
      const { container } = render(<SignupPage />)

      // Assert — AuthCard renders bg-white rounded-2xl
      const card = container.querySelector('.bg-white.rounded-2xl')
      expect(card).toBeInTheDocument()
    })

    it('should include the email input inside the card', () => {
      // Act
      const { container } = render(<SignupPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const emailInput = screen.getByTestId('email-input')
      expect(card).toContainElement(emailInput)
    })

    it('should include the password input inside the card', () => {
      // Act
      const { container } = render(<SignupPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const passwordInput = screen.getByTestId('password-input')
      expect(card).toContainElement(passwordInput)
    })

    it('should include the password confirm input inside the card', () => {
      // Act
      const { container } = render(<SignupPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const passwordConfirmInput = screen.getByTestId('password-confirm-input')
      expect(card).toContainElement(passwordConfirmInput)
    })

    it('should include the nickname input inside the card', () => {
      // Act
      const { container } = render(<SignupPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const nicknameInput = screen.getByTestId('nickname-input')
      expect(card).toContainElement(nicknameInput)
    })

    it('should include the submit button inside the card', () => {
      // Act
      const { container } = render(<SignupPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      const submitButton = screen.getByTestId('submit-button')
      expect(card).toContainElement(submitButton)
    })

    it('should apply shadow-sm class to the card', () => {
      // Act
      const { container } = render(<SignupPage />)

      // Assert
      const card = container.querySelector('.bg-white.rounded-2xl')
      expect(card).toHaveClass('shadow-sm')
    })

    it('should apply border border-gray-200 classes to the card', () => {
      // Act
      const { container } = render(<SignupPage />)

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
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
    })

    it('should render Korean label 이메일 for the email input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    })

    it('should apply rounded-xl class to email input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('email-input')
      expect(input).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to email input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('email-input')
      expect(input).toHaveClass('py-3')
    })

    it('should have a Korean placeholder on the email input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('email-input')
      expect(input).toHaveAttribute('placeholder')
      expect(input.getAttribute('placeholder')).not.toBe('')
    })

    it('should be of type email', () => {
      // Act
      render(<SignupPage />)

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
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })

    it('should render Korean label 비밀번호 for the password input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    })

    it('should apply rounded-xl class to password input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to password input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveClass('py-3')
    })

    it('should have a Korean placeholder on the password input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveAttribute('placeholder')
      expect(input.getAttribute('placeholder')).not.toBe('')
    })

    it('should be of type password', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-input')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  // ──────────────────────────────────────────────────────
  // 6. 비밀번호 확인 인풋
  // ──────────────────────────────────────────────────────
  describe('비밀번호 확인 인풋', () => {
    it('should render password confirm input with data-testid password-confirm-input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('password-confirm-input')).toBeInTheDocument()
    })

    it('should render Korean label 비밀번호 확인 for the password confirm input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    })

    it('should apply rounded-xl class to password confirm input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-confirm-input')
      expect(input).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to password confirm input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-confirm-input')
      expect(input).toHaveClass('py-3')
    })

    it('should have a Korean placeholder on the password confirm input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-confirm-input')
      expect(input).toHaveAttribute('placeholder')
      expect(input.getAttribute('placeholder')).not.toBe('')
    })

    it('should be of type password', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('password-confirm-input')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  // ──────────────────────────────────────────────────────
  // 7. 닉네임 인풋
  // ──────────────────────────────────────────────────────
  describe('닉네임 인풋', () => {
    it('should render nickname input with data-testid nickname-input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('nickname-input')).toBeInTheDocument()
    })

    it('should render Korean label 닉네임 for the nickname input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByLabelText('닉네임')).toBeInTheDocument()
    })

    it('should apply rounded-xl class to nickname input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('nickname-input')
      expect(input).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to nickname input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('nickname-input')
      expect(input).toHaveClass('py-3')
    })

    it('should have a Korean placeholder on the nickname input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const input = screen.getByTestId('nickname-input')
      expect(input).toHaveAttribute('placeholder')
      expect(input.getAttribute('placeholder')).not.toBe('')
    })
  })

  // ──────────────────────────────────────────────────────
  // 8. 가입하기 버튼 스타일
  // ──────────────────────────────────────────────────────
  describe('가입하기 버튼 스타일', () => {
    it('should render submit button with data-testid submit-button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should render 가입하기 as the submit button text', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveTextContent('가입하기')
    })

    it('should apply bg-indigo-600 class to the submit button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('bg-indigo-600')
    })

    it('should apply rounded-xl class to the submit button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('rounded-xl')
    })

    it('should apply py-3 class to the submit button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('py-3')
    })

    it('should apply font-medium class to the submit button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const button = screen.getByTestId('submit-button')
      expect(button).toHaveClass('font-medium')
    })
  })

  // ──────────────────────────────────────────────────────
  // 9. Divider 컴포넌트
  // ──────────────────────────────────────────────────────
  describe('Divider 컴포넌트', () => {
    it('should render divider with 또는 text', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByText('또는')).toBeInTheDocument()
    })

    it('should place the divider between the submit button and Google signup button', () => {
      // Act
      render(<SignupPage />)

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
  // 10. GoogleLoginButton — Google로 가입
  // ──────────────────────────────────────────────────────
  describe('GoogleLoginButton — Google로 가입', () => {
    it('should render Google signup button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('google-login-btn')).toBeInTheDocument()
    })

    it('should render Google signup button with 가입 label text', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const googleButton = screen.getByTestId('google-login-btn')
      expect(googleButton).toHaveTextContent('가입')
    })
  })

  // ──────────────────────────────────────────────────────
  // 11. AuthLink — 로그인 링크
  // ──────────────────────────────────────────────────────
  describe('AuthLink — 로그인 링크', () => {
    it('should render 이미 계정이 있으신가요? text', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByText('이미 계정이 있으신가요?')).toBeInTheDocument()
    })

    it('should render 로그인 link text', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByText('로그인')).toBeInTheDocument()
    })

    it('should render a link pointing to /auth/login', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const loginLink = screen.getByRole('link', { name: '로그인' })
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })

    it('should render login link below the Google signup button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      const googleButton = screen.getByTestId('google-login-btn')
      const loginLink = screen.getByRole('link', { name: '로그인' })
      const googleBeforeLink =
        googleButton.compareDocumentPosition(loginLink) & Node.DOCUMENT_POSITION_FOLLOWING
      expect(googleBeforeLink).toBeTruthy()
    })
  })

  // ──────────────────────────────────────────────────────
  // 12. 기존 data-testid 유지 (회귀 테스트)
  // ──────────────────────────────────────────────────────
  describe('기존 data-testid 유지', () => {
    it('should keep data-testid email-input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('email-input')).toBeInTheDocument()
    })

    it('should keep data-testid password-input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('password-input')).toBeInTheDocument()
    })

    it('should keep data-testid password-confirm-input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('password-confirm-input')).toBeInTheDocument()
    })

    it('should keep data-testid nickname-input', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('nickname-input')).toBeInTheDocument()
    })

    it('should keep data-testid submit-button', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    })

    it('should not render error-message element on initial render', () => {
      // Act
      render(<SignupPage />)

      // Assert
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })
  })

  // ──────────────────────────────────────────────────────
  // 13. validateForm 유효성 검증 로직
  // ──────────────────────────────────────────────────────
  describe('validateForm 유효성 검증', () => {
    it('should show error-message when email is empty and form is submitted', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<SignupPage />)

      // Act — submit without filling any field
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should show error when email format is invalid', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'invalid-email')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should show error when password is shorter than 8 characters', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'user@example.com')
      await user.type(screen.getByTestId('password-input'), 'short')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should show error when passwords do not match', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'user@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'different456')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should show error when nickname is empty', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'user@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      // nickname is left empty
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })

    it('should not call fetch API when client-side validation fails', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<SignupPage />)

      // Act — submit with invalid email
      await user.type(screen.getByTestId('email-input'), 'bad-email')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should render data-testid error-message when signup API returns error', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email already exists' }),
      })
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'existing@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      await user.type(screen.getByTestId('nickname-input'), '홍길동')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })
  })

  // ──────────────────────────────────────────────────────
  // 14. 회원가입 성공 흐름
  // ──────────────────────────────────────────────────────
  describe('회원가입 성공 흐름', () => {
    it('should call /api/auth/signup with POST method and all fields', async () => {
      // Arrange
      const user = userEvent.setup()
      const email = 'newuser@example.com'
      const password = 'securePass123'
      const nickname = '홍길동'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), email)
      await user.type(screen.getByTestId('password-input'), password)
      await user.type(screen.getByTestId('password-confirm-input'), password)
      await user.type(screen.getByTestId('nickname-input'), nickname)
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/signup',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ email, password, passwordConfirm: password, nickname }),
          })
        )
      })
    })

    it('should redirect to /diary after successful signup', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'newuser@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      await user.type(screen.getByTestId('nickname-input'), '홍길동')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/diary')
      })
    })

    it('should NOT redirect to /dashboard after successful signup', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'newuser@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      await user.type(screen.getByTestId('nickname-input'), '홍길동')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard')
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
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'newuser@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      await user.type(screen.getByTestId('nickname-input'), '홍길동')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })
  })

  // ──────────────────────────────────────────────────────
  // 15. 회원가입 실패 흐름
  // ──────────────────────────────────────────────────────
  describe('회원가입 실패 흐름', () => {
    it('should display error message when signup fails with API error', async () => {
      // Arrange
      const user = userEvent.setup()
      const errorMsg = 'Email already exists'
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: errorMsg }),
      })
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'existing@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      await user.type(screen.getByTestId('nickname-input'), '홍길동')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        const errorEl = screen.getByTestId('error-message')
        expect(errorEl).toHaveTextContent(errorMsg)
      })
    })

    it('should not redirect when signup fails', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Email already exists' }),
      })
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'existing@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      await user.type(screen.getByTestId('nickname-input'), '홍길동')
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
      render(<SignupPage />)

      // Act
      await user.type(screen.getByTestId('email-input'), 'user@example.com')
      await user.type(screen.getByTestId('password-input'), 'password123')
      await user.type(screen.getByTestId('password-confirm-input'), 'password123')
      await user.type(screen.getByTestId('nickname-input'), '홍길동')
      await user.click(screen.getByTestId('submit-button'))

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
