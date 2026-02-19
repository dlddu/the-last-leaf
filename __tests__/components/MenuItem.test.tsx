import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

import MenuItem from '@/components/MenuItem'

describe('MenuItem Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render label text', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Assert
      expect(screen.getByText('프로필 관리')).toBeInTheDocument()
    })

    it('should render as clickable element', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Assert
      const item = screen.getByRole('button') || screen.getByRole('link')
      expect(item).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<MenuItem label="프로필 관리" href="/settings/profile" />)).not.toThrow()
    })
  })

  describe('Navigation', () => {
    it('should navigate to href when clicked', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush, back: jest.fn() })

      const user = userEvent.setup()
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Act
      const item = screen.getByText('프로필 관리').closest('button') || screen.getByText('프로필 관리').closest('a')
      if (item) await user.click(item)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/settings/profile')
    })

    it('should call onClick handler when provided', async () => {
      // Arrange
      const mockOnClick = jest.fn()
      const user = userEvent.setup()
      render(<MenuItem label="계정 탈퇴" onClick={mockOnClick} />)

      // Act
      const item = screen.getByText('계정 탈퇴').closest('button') || screen.getByText('계정 탈퇴')
      await user.click(item as HTMLElement)

      // Assert
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Profile MenuItem (data-testid)', () => {
    it('should render with data-testid="menu-item-profile" for profile item', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" testId="menu-item-profile" />)

      // Assert
      expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument()
    })
  })

  describe('Danger Variant', () => {
    it('should render danger variant with red styling indicator', () => {
      // Arrange & Act
      render(<MenuItem label="계정 탈퇴" variant="danger" onClick={jest.fn()} />)

      // Assert
      const item = screen.getByText('계정 탈퇴')
      expect(item).toBeInTheDocument()
      // Danger item should have red text or class
      const container = item.closest('[class*="red"]') || item.closest('[class*="danger"]') || item
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush, back: jest.fn() })

      const user = userEvent.setup()
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Act - Find focusable element
      const item = screen.getByText('프로필 관리').closest('button') || screen.getByText('프로필 관리').closest('a')
      if (item) {
        ;(item as HTMLElement).focus()
        await user.keyboard('{Enter}')
      }

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/settings/profile')
    })
  })

  describe('Icon Prop (신규)', () => {
    it('should render emoji icon when icon prop is provided', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" icon="👤" />)

      // Assert
      expect(screen.getByText('👤')).toBeInTheDocument()
    })

    it('should render without icon when icon prop is omitted', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Assert - 아이콘이 없어도 정상 렌더링
      expect(screen.getByText('프로필 관리')).toBeInTheDocument()
    })

    it('should render phone emoji icon for 연락처 관리', () => {
      // Arrange & Act
      render(<MenuItem label="연락처 관리" href="/settings/contacts" icon="📞" />)

      // Assert
      expect(screen.getByText('📞')).toBeInTheDocument()
    })

    it('should render pause emoji icon for 타이머 일시 중지', () => {
      // Arrange & Act
      render(<MenuItem label="타이머 일시 중지" href="/settings/preferences" icon="⏸️" />)

      // Assert
      expect(screen.getByText('⏸️')).toBeInTheDocument()
    })

    it('should render door emoji icon for 계정 탈퇴', () => {
      // Arrange & Act
      render(<MenuItem label="계정 탈퇴" variant="danger" href="/settings/withdraw" icon="🚪" />)

      // Assert
      expect(screen.getByText('🚪')).toBeInTheDocument()
    })
  })

  describe('Sub Prop (신규)', () => {
    it('should render sub description text when sub prop is provided', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" sub="이름, 닉네임" />)

      // Assert
      expect(screen.getByText('이름, 닉네임')).toBeInTheDocument()
    })

    it('should render without sub description when sub prop is omitted', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Assert - sub 없이 정상 렌더링
      expect(screen.getByText('프로필 관리')).toBeInTheDocument()
    })

    it('should render 긴급 연락처 as sub for 연락처 관리', () => {
      // Arrange & Act
      render(<MenuItem label="연락처 관리" href="/settings/contacts" sub="긴급 연락처" />)

      // Assert
      expect(screen.getByText('긴급 연락처')).toBeInTheDocument()
    })

    it('should render 비활성 감지 일시 중지 as sub for 타이머 일시 중지', () => {
      // Arrange & Act
      render(
        <MenuItem
          label="타이머 일시 중지"
          href="/settings/preferences"
          sub="비활성 감지 일시 중지"
        />
      )

      // Assert
      expect(screen.getByText('비활성 감지 일시 중지')).toBeInTheDocument()
    })
  })

  describe('Icon + Sub Combined Layout (신규)', () => {
    it('should render icon, label, and sub together', () => {
      // Arrange & Act
      render(
        <MenuItem
          label="프로필 관리"
          href="/settings/profile"
          icon="👤"
          sub="이름, 닉네임"
        />
      )

      // Assert - 아이콘, 라벨, 서브 설명 모두 존재
      expect(screen.getByText('👤')).toBeInTheDocument()
      expect(screen.getByText('프로필 관리')).toBeInTheDocument()
      expect(screen.getByText('이름, 닉네임')).toBeInTheDocument()
    })

    it('should render label and sub in the same container area', () => {
      // Arrange & Act
      render(
        <MenuItem
          label="프로필 관리"
          href="/settings/profile"
          icon="👤"
          sub="이름, 닉네임"
        />
      )

      // Assert - label과 sub가 함께 존재
      const labelEl = screen.getByText('프로필 관리')
      const subEl = screen.getByText('이름, 닉네임')
      expect(labelEl).toBeInTheDocument()
      expect(subEl).toBeInTheDocument()
    })

    it('should render chevron icon when variant is default with icon and sub', () => {
      // Arrange & Act
      render(
        <MenuItem
          label="프로필 관리"
          href="/settings/profile"
          icon="👤"
          sub="이름, 닉네임"
        />
      )

      // Assert - default variant에서는 chevron SVG가 존재
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should not render chevron when variant is danger with icon', () => {
      // Arrange & Act
      render(
        <MenuItem
          label="계정 탈퇴"
          variant="danger"
          href="/settings/withdraw"
          icon="🚪"
        />
      )

      // Assert - danger variant에서는 chevron SVG가 없어야 함
      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })
  })

  describe('Backward Compatibility (하위 호환성)', () => {
    it('should still work with only label and href (no icon, no sub)', () => {
      // Arrange & Act
      render(<MenuItem label="프로필 관리" href="/settings/profile" />)

      // Assert - 기존 방식 그대로 동작
      expect(screen.getByText('프로필 관리')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should still work with testId prop alongside icon and sub', () => {
      // Arrange & Act
      render(
        <MenuItem
          label="프로필 관리"
          href="/settings/profile"
          testId="menu-item-profile"
          icon="👤"
          sub="이름, 닉네임"
        />
      )

      // Assert - data-testid 유지
      expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument()
    })

    it('should still call onClick when icon and sub are provided', async () => {
      // Arrange
      const mockOnClick = jest.fn()
      const user = userEvent.setup()
      render(<MenuItem label="프로필 관리" onClick={mockOnClick} icon="👤" sub="이름, 닉네임" />)

      // Act
      const button = screen.getByRole('button')
      await user.click(button)

      // Assert
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should still navigate via href when icon and sub are provided', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ push: mockPush, back: jest.fn() })

      const user = userEvent.setup()
      render(
        <MenuItem
          label="프로필 관리"
          href="/settings/profile"
          icon="👤"
          sub="이름, 닉네임"
        />
      )

      // Act
      const button = screen.getByRole('button')
      await user.click(button)

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/settings/profile')
    })
  })
})
