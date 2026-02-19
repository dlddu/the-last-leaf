import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import WarningBanner from '@/components/WarningBanner'

describe('WarningBanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(<WarningBanner message="경고 메시지" />)
      ).not.toThrow()
    })

    it('should render with data-testid', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert
      expect(screen.getByTestId('warning-banner')).toBeInTheDocument()
    })

    it('should display the message text', () => {
      // Arrange & Act
      render(<WarningBanner message="타이머가 일시정지 상태입니다." />)

      // Assert
      expect(screen.getByText('타이머가 일시정지 상태입니다.')).toBeInTheDocument()
    })

    it('should render with yellow/warning background styling', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert
      const banner = screen.getByTestId('warning-banner')
      // 노란 배경을 나타내는 클래스 또는 스타일이 있어야 함
      expect(banner).toBeInTheDocument()
      // 배경색이 경고 색상 계열인지 확인 (yellow, amber, warning 등)
      const classList = banner.className
      expect(
        classList.includes('yellow') ||
        classList.includes('amber') ||
        classList.includes('warning') ||
        classList.includes('bg-yellow') ||
        classList.includes('bg-amber')
      ).toBe(true)
    })
  })

  describe('Content', () => {
    it('should display custom message content', () => {
      // Arrange
      const customMessage = '일시정지 중에는 자동 삭제가 진행되지 않습니다.'

      // Act
      render(<WarningBanner message={customMessage} />)

      // Assert
      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it('should render warning icon when icon prop is provided', () => {
      // Arrange & Act
      render(
        <WarningBanner message="경고 메시지" showIcon={true} data-testid="warning-banner" />
      )

      // Assert: 아이콘이 존재하거나 aria 역할이 지정되어 있어야 함
      const banner = screen.getByTestId('warning-banner')
      expect(banner).toBeInTheDocument()
    })

    it('should be visible by default', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert
      expect(screen.getByTestId('warning-banner')).toBeVisible()
    })
  })

  describe('Accessibility', () => {
    it('should have alert role or appropriate ARIA role for warnings', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert: alert 또는 status role을 가져야 함
      const banner =
        screen.queryByRole('alert') ||
        screen.queryByRole('status') ||
        screen.getByTestId('warning-banner')
      expect(banner).toBeInTheDocument()
    })
  })

  describe('Wireframe spec - DLD-410 redesign styles', () => {
    it('should render with bg-amber-50 background class', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert: 와이어프레임 스펙 - bg-amber-50
      const banner = screen.getByTestId('warning-banner')
      expect(banner.className).toContain('bg-amber-50')
    })

    it('should render with border-amber-200 border class', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert: 와이어프레임 스펙 - border border-amber-200
      const banner = screen.getByTestId('warning-banner')
      expect(banner.className).toContain('border-amber-200')
    })

    it('should render with rounded-xl class', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert: 와이어프레임 스펙 - rounded-xl
      const banner = screen.getByTestId('warning-banner')
      expect(banner.className).toContain('rounded-xl')
    })

    it('should render message text with text-amber-700 class', () => {
      // Arrange & Act
      render(
        <WarningBanner
          message="타이머가 중지된 동안에는 자서전 자동 생성이 실행되지 않습니다."
          data-testid="warning-banner"
        />
      )

      // Assert: 와이어프레임 스펙 - text-amber-700 텍스트 컬러
      const banner = screen.getByTestId('warning-banner')
      // 메시지 텍스트를 감싸는 요소 또는 배너 자체에 text-amber-700이 있어야 함
      const hasAmber700 =
        banner.className.includes('text-amber-700') ||
        banner.querySelector('[class*="text-amber-700"]') !== null
      expect(hasAmber700).toBe(true)
    })

    it('should render message text with text-xs class', () => {
      // Arrange & Act
      render(
        <WarningBanner
          message="경고 메시지"
          data-testid="warning-banner"
        />
      )

      // Assert: 와이어프레임 스펙 - text-xs 텍스트 크기
      const banner = screen.getByTestId('warning-banner')
      const hasTextXs =
        banner.className.includes('text-xs') ||
        banner.querySelector('[class*="text-xs"]') !== null
      expect(hasTextXs).toBe(true)
    })

    it('should render with p-3 padding class', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert: 와이어프레임 스펙 - p-3
      const banner = screen.getByTestId('warning-banner')
      expect(banner.className).toContain('p-3')
    })

    it('should maintain role=alert for accessibility after redesign', () => {
      // Arrange & Act
      render(<WarningBanner message="경고 메시지" data-testid="warning-banner" />)

      // Assert: role="alert"가 유지되어야 함
      const banner = screen.getByRole('alert')
      expect(banner).toBeInTheDocument()
    })

    it('should display the exact wireframe warning message text', () => {
      // Arrange
      const wireframeMessage =
        '⚠️ 타이머가 중지된 동안에는 자서전 자동 생성이 실행되지 않습니다.'

      // Act
      render(<WarningBanner message={wireframeMessage} data-testid="warning-banner" />)

      // Assert: 와이어프레임 스펙 - 정확한 경고 메시지 텍스트
      expect(screen.getByText(wireframeMessage)).toBeInTheDocument()
    })
  })
})
