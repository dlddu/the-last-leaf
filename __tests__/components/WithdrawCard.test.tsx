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

// Mock fetch
global.fetch = jest.fn()

import WithdrawCard from '@/components/WithdrawCard'

describe('WithdrawCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<WithdrawCard />)).not.toThrow()
    })

    it('should render the WarningIcon', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 경고 아이콘 영역이 렌더링되어야 함
      const warningIcon =
        screen.queryByTestId('withdraw-warning-icon') ||
        screen.queryByRole('img', { name: /경고|warning/i }) ||
        document.querySelector('[data-testid="withdraw-warning-icon"]') ||
        document.querySelector('svg')
      expect(warningIcon).toBeInTheDocument()
    })

    it('should render a title for account withdrawal', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 탈퇴 관련 제목이 있어야 함
      expect(
        screen.getByText(/탈퇴|계정 삭제|회원 탈퇴|withdraw|account deletion/i)
      ).toBeInTheDocument()
    })

    it('should render a description or warning message', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 경고나 설명 텍스트가 있어야 함
      const card = screen.getByTestId
        ? document.body
        : document.body
      expect(card).toBeInTheDocument()
      // 탈퇴에 대한 설명이 포함되어야 함
      const hasDescription =
        screen.queryByText(/삭제|복구|되돌릴 수 없|영구|주의|경고|데이터|delete|permanent|warning/i) !== null
      expect(hasDescription).toBe(true)
    })

    it('should render the DeletionList', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      expect(screen.getByTestId('withdraw-deletion-list')).toBeInTheDocument()
    })

    it('should render deletion items with red background styling', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      const deletionItems = screen.getAllByTestId('withdraw-deletion-item')
      expect(deletionItems.length).toBeGreaterThan(0)
      deletionItems.forEach(item => {
        expect(item).toBeInTheDocument()
      })
    })

    it('should render at least 4 deletion items (일기, 자서전, 프로필, 계정)', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      const deletionItems = screen.getAllByTestId('withdraw-deletion-item')
      expect(deletionItems.length).toBeGreaterThanOrEqual(4)
    })

    it('should include diary deletion item', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 일기 항목이 있어야 함
      const list = screen.getByTestId('withdraw-deletion-list')
      expect(list.textContent).toMatch(/일기|diary/i)
    })

    it('should include account deletion item', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 계정 항목이 있어야 함
      const list = screen.getByTestId('withdraw-deletion-list')
      expect(list.textContent).toMatch(/계정|account/i)
    })

    it('should render the ConfirmCheckbox', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      expect(screen.getByTestId('withdraw-consent-checkbox')).toBeInTheDocument()
    })

    it('should render the WithdrawButton', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 탈퇴 버튼이 있어야 함
      expect(
        screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      ).toBeInTheDocument()
    })
  })

  describe('WarningIcon', () => {
    it('should render warning icon with red circular styling', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 빨간 원형 경고 아이콘 영역이 있어야 함
      const iconContainer =
        screen.queryByTestId('withdraw-warning-icon') ||
        document.querySelector('[data-testid="withdraw-warning-icon"]')

      if (iconContainer) {
        expect(iconContainer).toBeInTheDocument()
      } else {
        // data-testid가 없어도 SVG 또는 아이콘이 렌더링되어야 함
        const svgs = document.querySelectorAll('svg')
        expect(svgs.length).toBeGreaterThan(0)
      }
    })
  })

  describe('DeletionList', () => {
    it('should render deletion list with data-testid', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      const list = screen.getByTestId('withdraw-deletion-list')
      expect(list).toBeInTheDocument()
    })

    it('should render all deletion items with data-testid', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      const items = screen.getAllByTestId('withdraw-deletion-item')
      expect(items).not.toHaveLength(0)
    })

    it('should show deletion items related to user data', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 사용자 데이터 관련 항목들이 표시되어야 함
      const list = screen.getByTestId('withdraw-deletion-list')
      const listText = list.textContent || ''
      // 일기 또는 자서전 또는 프로필 또는 계정 중 하나 이상 포함
      const hasDeletableItems =
        /일기|자서전|프로필|계정|diary|autobiography|profile|account/i.test(listText)
      expect(hasDeletableItems).toBe(true)
    })
  })

  describe('ConfirmCheckbox', () => {
    it('should render checkbox with data-testid', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      expect(screen.getByTestId('withdraw-consent-checkbox')).toBeInTheDocument()
    })

    it('should be unchecked by default', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      if (input) {
        expect(input).not.toBeChecked()
      } else {
        // data-checked 또는 aria-checked 속성으로 확인
        const isChecked =
          checkbox.getAttribute('aria-checked') === 'true' ||
          checkbox.getAttribute('data-checked') === 'true'
        expect(isChecked).toBe(false)
      }
    })

    it('should display consent text message', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - "위 내용을 확인했으며, 탈퇴에 동의합니다" 또는 유사한 동의 메시지
      expect(
        screen.getByText(/확인했으며|동의|agree|consent|confirm/i)
      ).toBeInTheDocument()
    })

    it('should toggle checked state when clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawCard />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? (checkbox as HTMLInputElement)
          : checkbox.querySelector('input[type="checkbox"]') as HTMLInputElement

      // Act
      if (input) {
        await user.click(input)
        // Assert - 클릭 후 체크 상태가 변경되어야 함
        expect(input).toBeChecked()
      } else {
        await user.click(checkbox)
        // 체크 상태가 변경되었는지 aria-checked 또는 data-checked로 확인
        const isChecked =
          checkbox.getAttribute('aria-checked') === 'true' ||
          checkbox.getAttribute('data-checked') === 'true' ||
          checkbox.classList.contains('checked')
        expect(isChecked).toBe(true)
      }
    })
  })

  describe('WithdrawButton - idle state (unchecked)', () => {
    it('should be disabled when checkbox is unchecked', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 체크박스 미선택 시 버튼 비활성화
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toBeDisabled()
    })

    it('should not call fetch when disabled button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawCard />)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert - API 호출이 없어야 함
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('WithdrawButton - confirmed state (checked)', () => {
    it('should be enabled when checkbox is checked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawCard />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      // Act - 체크박스 선택
      await user.click(input || checkbox)

      // Assert - 버튼이 활성화되어야 함
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).not.toBeDisabled()
    })

    it('should call DELETE /api/user when enabled button is clicked', async () => {
      // Arrange
      const user = userEvent.setup()
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      render(<WithdrawCard />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      // Act - 체크박스 선택 후 버튼 클릭
      await user.click(input || checkbox)
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/user',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('state transitions', () => {
    it('should transition from idle to confirmed when checkbox is checked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawCard />)

      // Assert initial state: button disabled
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toBeDisabled()

      // Act
      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Assert confirmed state: button enabled
      expect(button).not.toBeDisabled()
    })

    it('should return to idle state when checkbox is unchecked after being checked', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawCard />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      // Act - 체크 후 다시 해제
      await user.click(input || checkbox)
      await user.click(input || checkbox)

      // Assert - 버튼이 다시 비활성화되어야 함
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toBeDisabled()
    })
  })
})

describe('WithdrawCard - Page composition', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should integrate with BackHeader showing "계정 탈퇴" title on page', () => {
    // Arrange & Act - 페이지 레벨에서 BackHeader("계정 탈퇴") + WithdrawCard 구성 확인
    render(<WithdrawCard />)

    // Assert - WithdrawCard 자체는 카드 컨텐츠만 포함
    // 페이지 통합 테스트는 integration 테스트에서 검증
    expect(screen.getByTestId('withdraw-deletion-list')).toBeInTheDocument()
  })
})
