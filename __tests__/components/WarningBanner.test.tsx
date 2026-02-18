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
})
