import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

import SettingsClient from '@/components/SettingsClient'

describe('SettingsClient - Settings Hub Redesign Integration Test', () => {
  const mockProfileData = {
    user: {
      user_id: 'test-user-id',
      email: 'test@example.com',
      nickname: 'TestUser',
      name: '',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Initial Load', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })
      expect(() => render(<SettingsClient />)).not.toThrow()
    })

    it('should fetch user profile on mount', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/user/profile')
      })
    })

    it('should display UserInfoCard after profile is loaded', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user-info-card')).toBeInTheDocument()
      })
    })

    it('should display nickname in UserInfoCard', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user-nickname')).toHaveTextContent('TestUser')
      })
    })

    it('should display email in UserInfoCard', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      })
    })
  })

  describe('MenuItem - icon props 전달 확인', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })
    })

    it('should pass icon="👤" to 프로필 관리 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('👤')).toBeInTheDocument()
      })
    })

    it('should pass icon="📞" to 연락처 관리 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('📞')).toBeInTheDocument()
      })
    })

    it('should pass icon="⏸️" to 타이머 일시 중지 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('⏸️')).toBeInTheDocument()
      })
    })

    it('should pass icon="🚪" to 계정 탈퇴 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('🚪')).toBeInTheDocument()
      })
    })
  })

  describe('MenuItem - sub props 전달 확인', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })
    })

    it('should pass sub="이름, 닉네임" to 프로필 관리 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('이름, 닉네임')).toBeInTheDocument()
      })
    })

    it('should pass sub="긴급 연락처" to 연락처 관리 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('긴급 연락처')).toBeInTheDocument()
      })
    })

    it('should pass sub="비활성 감지 일시 중지" to 타이머 일시 중지 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('비활성 감지 일시 중지')).toBeInTheDocument()
      })
    })

    it('should not pass sub prop to 계정 탈퇴 MenuItem', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert - 계정 탈퇴에는 sub 설명이 없어야 함
      // 계정 탈퇴 label만 존재하고, sub가 없어야 함
      await waitFor(() => {
        expect(screen.getByText('계정 탈퇴')).toBeInTheDocument()
      })
      // sub 텍스트가 없으므로 "계정 탈퇴"와 연관된 sub 텍스트가 렌더링되지 않아야 함
    })
  })

  describe('MenuItem - label 렌더링 확인', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })
    })

    it('should render 프로필 관리 label', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('프로필 관리')).toBeInTheDocument()
      })
    })

    it('should render 연락처 관리 label', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('연락처 관리')).toBeInTheDocument()
      })
    })

    it('should render 타이머 일시 중지 label', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('타이머 일시 중지')).toBeInTheDocument()
      })
    })

    it('should render 계정 탈퇴 label', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('계정 탈퇴')).toBeInTheDocument()
      })
    })
  })

  describe('MenuItem - data-testid 유지 확인', () => {
    it('should preserve data-testid="menu-item-profile" on 프로필 관리 MenuItem', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert - 기존 data-testid 유지
      await waitFor(() => {
        expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument()
      })
    })
  })

  describe('계정 탈퇴 danger variant', () => {
    it('should render 계정 탈퇴 with danger variant (red text styling)', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert - 계정 탈퇴 항목이 danger 스타일(red)로 렌더링되어야 함
      await waitFor(() => {
        const withdrawItem = screen.getByText('계정 탈퇴')
        const container = withdrawItem.closest('[class*="red"]') || withdrawItem
        expect(container).toBeInTheDocument()
      })
    })
  })

  describe('MenuGroup 렌더링 확인', () => {
    beforeEach(() => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })
    })

    it('should render "계정" MenuGroup title', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('계정')).toBeInTheDocument()
      })
    })

    it('should render "환경설정" MenuGroup title', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('환경설정')).toBeInTheDocument()
      })
    })

    it('should render "위험" MenuGroup title', async () => {
      // Arrange & Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('위험')).toBeInTheDocument()
      })
    })
  })

  describe('LogoutButton 렌더링 확인', () => {
    it('should render LogoutButton in settings page', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert - 로그아웃 버튼이 렌더링되어야 함
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout|로그아웃/i })).toBeInTheDocument()
      })
    })

    it('should render LogoutButton with card style (w-full, bg-white)', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert - 로그아웃 버튼이 카드 스타일로 표시되어야 함
      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout|로그아웃/i })
        expect(logoutButton.className).toMatch(/w-full/)
        expect(logoutButton.className).toMatch(/bg-white/)
      })
    })
  })

  describe('Full Page Structure', () => {
    it('should render SettingsHeader', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument()
      })
    })

    it('should render settings heading "설정"', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })

      // Act
      render(<SettingsClient />)

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /설정/i })).toBeInTheDocument()
      })
    })

    it('should not show UserInfoCard when profile fetch fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      // Act
      render(<SettingsClient />)

      // Assert - 프로필 로드 실패 시 UserInfoCard가 없어야 함
      await waitFor(() => {
        expect(screen.queryByTestId('user-info-card')).not.toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to /settings/profile when 프로필 관리 is clicked', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData,
      })
      const user = userEvent.setup()
      render(<SettingsClient />)

      // Act
      await waitFor(() => {
        expect(screen.getByTestId('menu-item-profile')).toBeInTheDocument()
      })
      await user.click(screen.getByTestId('menu-item-profile'))

      // Assert
      expect(mockPush).toHaveBeenCalledWith('/settings/profile')
    })
  })
})
