import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock BottomNav to make assertions clear
jest.mock('@/components/BottomNav', () => {
  return function MockBottomNav() {
    return <nav data-testid="bottom-nav" role="navigation">BottomNav</nav>
  }
})

// Import AuthLayout after mocks are set up
import AuthLayout from '@/app/(auth)/layout'

describe('AuthLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render children content', () => {
      // Arrange
      const childText = 'Auth page content'

      // Act
      render(
        <AuthLayout>
          <div>{childText}</div>
        </AuthLayout>
      )

      // Assert
      expect(screen.getByText(childText)).toBeInTheDocument()
    })

    it('should not render BottomNav in auth layout', () => {
      // Act
      render(
        <AuthLayout>
          <div>Login page</div>
        </AuthLayout>
      )

      // Assert - BottomNav must not be present in the auth layout
      expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument()
    })

    it('should not render any navigation element in auth layout', () => {
      // Act
      render(
        <AuthLayout>
          <div>Auth content</div>
        </AuthLayout>
      )

      // Assert - no role="navigation" element expected in auth layout
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  describe('Login page in auth layout', () => {
    it('should render login page content without BottomNav', () => {
      // Arrange
      const loginContent = 'Login form content'

      // Act
      render(
        <AuthLayout>
          <main>
            <h1>Login</h1>
            <p>{loginContent}</p>
          </main>
        </AuthLayout>
      )

      // Assert
      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText(loginContent)).toBeInTheDocument()
      expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument()
    })
  })

  describe('Signup page in auth layout', () => {
    it('should render signup page content without BottomNav', () => {
      // Arrange
      const signupContent = 'Sign Up form content'

      // Act
      render(
        <AuthLayout>
          <main>
            <h1>Sign Up</h1>
            <p>{signupContent}</p>
          </main>
        </AuthLayout>
      )

      // Assert
      expect(screen.getByText('Sign Up')).toBeInTheDocument()
      expect(screen.getByText(signupContent)).toBeInTheDocument()
      expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument()
    })
  })
})
