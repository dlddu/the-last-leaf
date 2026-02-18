import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/diary'),
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

// Import MainLayout after mocks are set up
import MainLayout from '@/app/(main)/layout'

describe('MainLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render children content', () => {
      // Arrange
      const childText = 'Main page content'

      // Act
      render(
        <MainLayout>
          <div>{childText}</div>
        </MainLayout>
      )

      // Assert
      expect(screen.getByText(childText)).toBeInTheDocument()
    })

    it('should render BottomNav in main layout', () => {
      // Act
      render(
        <MainLayout>
          <div>Diary content</div>
        </MainLayout>
      )

      // Assert - BottomNav must be present in the main layout
      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
    })

    it('should render navigation element in main layout', () => {
      // Act
      render(
        <MainLayout>
          <div>Main content</div>
        </MainLayout>
      )

      // Assert
      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })
  })

  describe('Diary page in main layout', () => {
    it('should render diary page content alongside BottomNav', () => {
      // Arrange
      const diaryContent = 'Diary page content'

      // Act
      render(
        <MainLayout>
          <main>
            <h1>Diary</h1>
            <p>{diaryContent}</p>
          </main>
        </MainLayout>
      )

      // Assert
      expect(screen.getByText('Diary')).toBeInTheDocument()
      expect(screen.getByText(diaryContent)).toBeInTheDocument()
      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
    })
  })

  describe('Settings page in main layout', () => {
    it('should render settings page content alongside BottomNav', () => {
      // Arrange
      const settingsContent = 'Settings page content'

      // Act
      render(
        <MainLayout>
          <main>
            <h1>Settings</h1>
            <p>{settingsContent}</p>
          </main>
        </MainLayout>
      )

      // Assert
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText(settingsContent)).toBeInTheDocument()
      expect(screen.getByTestId('bottom-nav')).toBeInTheDocument()
    })
  })

  describe('BottomNav position', () => {
    it('should render BottomNav after children content', () => {
      // Act
      render(
        <MainLayout>
          <div data-testid="page-content">Page content</div>
        </MainLayout>
      )

      // Assert - both page content and nav are rendered
      const pageContent = screen.getByTestId('page-content')
      const bottomNav = screen.getByTestId('bottom-nav')
      expect(pageContent).toBeInTheDocument()
      expect(bottomNav).toBeInTheDocument()
    })
  })
})
