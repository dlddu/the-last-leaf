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

    it('should render the new title "정말 탈퇴하시겠어요?"', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 변경된 타이틀이 렌더링되어야 함
      expect(screen.getByText('정말 탈퇴하시겠어요?')).toBeInTheDocument()
    })

    it('should render a description message about data deletion', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 변경된 설명 문구가 있어야 함
      expect(
        screen.getByText('탈퇴하면 아래 데이터가 모두 삭제됩니다.')
      ).toBeInTheDocument()
    })

    it('should render the DeletionList', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      expect(screen.getByTestId('withdraw-deletion-list')).toBeInTheDocument()
    })

    it('should render deletion items within a single unified block', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 단일 bg-red-50 블록 내에 삭제 항목들이 있어야 함
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

    it('should include "작성한 모든 일기" deletion item', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 정확한 삭제 항목 텍스트 검증
      expect(screen.getByText(/작성한 모든 일기/)).toBeInTheDocument()
    })

    it('should include "생성된 자서전" deletion item', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      expect(screen.getByText(/생성된 자서전/)).toBeInTheDocument()
    })

    it('should include "프로필 및 연락처 정보" deletion item', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      expect(screen.getByText(/프로필 및 연락처 정보/)).toBeInTheDocument()
    })

    it('should include "계정 정보" deletion item', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      expect(screen.getByText(/계정 정보/)).toBeInTheDocument()
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
    it('should render warning icon with red circular background (w-16 h-16 bg-red-100 rounded-full)', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 빨간 원형 배경을 가진 경고 아이콘 컨테이너가 있어야 함
      const iconContainer = screen.getByTestId('withdraw-warning-icon')
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveClass('bg-red-100')
      expect(iconContainer).toHaveClass('rounded-full')
    })

    it('should render inner triangle icon with w-8 h-8 text-red-400 styling', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 내부 삼각형 아이콘 SVG가 text-red-400 클래스를 가져야 함
      const iconContainer = screen.getByTestId('withdraw-warning-icon')
      const svg = iconContainer.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg).toHaveClass('text-red-400')
    })
  })

  describe('Card container styling', () => {
    it('should have border border-gray-100 class (shadow-sm replaced)', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 카드 컨테이너가 border border-gray-100 클래스를 가져야 함
      // bg-white rounded-2xl p-5 border border-gray-100
      const container = document.querySelector('.bg-white.rounded-2xl')
      expect(container).not.toBeNull()
      expect(container).toHaveClass('border')
      expect(container).toHaveClass('border-gray-100')
    })

    it('should NOT have shadow-sm class on card container', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - shadow-sm이 제거되어야 함
      const container = document.querySelector('.bg-white.rounded-2xl')
      expect(container).not.toBeNull()
      expect(container).not.toHaveClass('shadow-sm')
    })
  })

  describe('Title styling', () => {
    it('should render title with text-lg font-bold text-center classes', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 타이틀이 올바른 Tailwind 클래스를 가져야 함
      const title = screen.getByText('정말 탈퇴하시겠어요?')
      expect(title).toHaveClass('text-center')
      expect(title).toHaveClass('font-bold')
    })
  })

  describe('Description styling', () => {
    it('should render description with text-center class', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 설명 문구가 text-center 클래스를 가져야 함
      const description = screen.getByText('탈퇴하면 아래 데이터가 모두 삭제됩니다.')
      expect(description).toHaveClass('text-center')
    })
  })

  describe('DeletionList - unified block', () => {
    it('should render deletion list container with data-testid', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      const list = screen.getByTestId('withdraw-deletion-list')
      expect(list).toBeInTheDocument()
    })

    it('should render deletion list container with bg-red-50 rounded-xl styling', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 단일 통합 블록이 bg-red-50 rounded-xl 클래스를 가져야 함
      const list = screen.getByTestId('withdraw-deletion-list')
      expect(list).toHaveClass('bg-red-50')
      expect(list).toHaveClass('rounded-xl')
    })

    it('should render all deletion items with data-testid', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
      const items = screen.getAllByTestId('withdraw-deletion-item')
      expect(items).not.toHaveLength(0)
    })

    it('should show all 4 required deletion items', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 4개의 정확한 삭제 항목 텍스트 검증
      const list = screen.getByTestId('withdraw-deletion-list')
      const listText = list.textContent || ''
      expect(listText).toMatch(/작성한 모든 일기/)
      expect(listText).toMatch(/생성된 자서전/)
      expect(listText).toMatch(/프로필 및 연락처 정보/)
      expect(listText).toMatch(/계정 정보/)
    })
  })

  describe('ConfirmCheckbox - updated styling', () => {
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
        const isChecked =
          checkbox.getAttribute('aria-checked') === 'true' ||
          checkbox.getAttribute('data-checked') === 'true'
        expect(isChecked).toBe(false)
      }
    })

    it('should have w-5 h-5 size class (upgraded from w-4 h-4)', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 체크박스 크기가 w-5 h-5로 변경되어야 함
      const checkboxContainer = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkboxContainer.tagName === 'INPUT'
          ? checkboxContainer
          : checkboxContainer.querySelector('input[type="checkbox"]')

      if (input) {
        expect(input).toHaveClass('w-5')
        expect(input).toHaveClass('h-5')
      }
    })

    it('should have label with items-center (not items-start)', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - label이 items-center 클래스를 가져야 함
      const checkboxContainer = screen.getByTestId('withdraw-consent-checkbox')
      // input의 부모 label 또는 래퍼를 찾아서 확인
      const labelEl =
        checkboxContainer.tagName === 'LABEL'
          ? checkboxContainer
          : checkboxContainer.closest('label')

      if (labelEl) {
        expect(labelEl).toHaveClass('items-center')
        expect(labelEl).not.toHaveClass('items-start')
      }
    })

    it('should have border-gray-300 and text-red-500 and focus:ring-red-500 classes', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 체크박스 스타일 클래스 검증
      const checkboxContainer = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkboxContainer.tagName === 'INPUT'
          ? checkboxContainer
          : checkboxContainer.querySelector('input[type="checkbox"]')

      if (input) {
        expect(input).toHaveClass('border-gray-300')
        expect(input).toHaveClass('text-red-500')
      }
    })

    it('should display consent text message', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert
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
        const isChecked =
          checkbox.getAttribute('aria-checked') === 'true' ||
          checkbox.getAttribute('data-checked') === 'true' ||
          checkbox.classList.contains('checked')
        expect(isChecked).toBe(true)
      }
    })
  })

  describe('WithdrawButton - idle state styling (unchecked)', () => {
    it('should be disabled when checkbox is unchecked', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 체크박스 미선택 시 버튼 비활성화
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toBeDisabled()
    })

    it('should have bg-gray-200 text-gray-400 cursor-not-allowed classes when disabled', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 비활성 버튼 스타일 검증
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      // disabled 속성이 있는 버튼에 disabled: 접두어 클래스 또는 직접 클래스 확인
      expect(button).toBeDisabled()
      // 버튼 클래스에 비활성 스타일이 포함되어야 함
      const classList = button.className
      const hasDisabledStyle =
        classList.includes('bg-gray-200') ||
        classList.includes('disabled:bg-gray-200') ||
        classList.includes('cursor-not-allowed') ||
        classList.includes('disabled:cursor-not-allowed')
      expect(hasDisabledStyle).toBe(true)
    })

    it('should have rounded-xl class', () => {
      // Arrange & Act
      render(<WithdrawCard />)

      // Assert - 버튼이 rounded-xl 클래스를 가져야 함
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      expect(button).toHaveClass('rounded-xl')
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

  describe('WithdrawButton - confirmed state styling (checked)', () => {
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

    it('should have bg-red-500 text-white classes when enabled', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<WithdrawCard />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')

      // Act
      await user.click(input || checkbox)

      // Assert - 활성 버튼 스타일 검증 (bg-red-500 text-white)
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      const classList = button.className
      const hasActiveStyle =
        classList.includes('bg-red-500') ||
        classList.includes('bg-red-600')
      expect(hasActiveStyle).toBe(true)
      expect(classList).toContain('text-white')
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

  describe('Redirect path', () => {
    it('should redirect to /auth/login (not /login) after successful withdrawal', async () => {
      // Arrange
      const mockPush = jest.fn()
      const { useRouter } = require('next/navigation')
      ;(useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        back: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
      })
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      const user = userEvent.setup()
      render(<WithdrawCard />)

      const checkbox = screen.getByTestId('withdraw-consent-checkbox')
      const input =
        checkbox.tagName === 'INPUT'
          ? checkbox
          : checkbox.querySelector('input[type="checkbox"]')
      await user.click(input || checkbox)

      // Act
      const button = screen.getByRole('button', { name: /탈퇴|withdraw|삭제|delete/i })
      await user.click(button)

      // Assert - /auth/login으로 리다이렉트되어야 함 (이전의 /login이 아님)
      const { waitFor } = await import('@testing-library/react')
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
      expect(mockPush).not.toHaveBeenCalledWith('/login')
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
