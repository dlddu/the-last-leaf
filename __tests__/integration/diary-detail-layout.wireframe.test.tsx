import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock next/navigation (must be before component import)
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

import DiaryDetailClient from '@/components/DiaryDetailClient'

/**
 * 와이어프레임 스펙 검증 테스트 — 일기 상세 화면 본문 레이아웃 (Red Phase)
 *
 * 검증 대상:
 * - 본문 영역 아우터 컨테이너: max-w-2xl mx-auto p-6 pt-20 → px-5 py-6 전체 너비
 * - 카드 래퍼 제거: bg-white rounded-lg shadow-sm p-6 클래스를 가진 div 없음
 * - DiaryMeta, DiaryContent가 카드 래퍼 없이 직접 렌더링됨
 *
 * 기존 diary-delete-flow.test.tsx 가 검증하는 항목(삭제 플로우, 모달 동작,
 * API 호출, 내비게이션, 에러 처리)은 중복 작성하지 않는다.
 */
describe('DiaryDetailClient — 와이어프레임 본문 레이아웃 스펙', () => {
  const defaultProps = {
    diaryId: 'diary-test-id',
    formattedDate: '2026년 2월 13일 목요일',
    formattedTime: '오후 3:30 작성',
    content: '오늘 하루도 좋은 날이었다.',
  }

  describe('아우터 컨테이너 — 전체 너비 레이아웃', () => {
    it('should not use max-w-2xl on the body outer container', () => {
      // Arrange & Act
      const { container } = render(<DiaryDetailClient {...defaultProps} />)

      // Assert — max-w-2xl 는 전체 너비 레이아웃으로 교체되어야 한다
      const hasMaxW2xl = container.querySelector('.max-w-2xl') !== null
      expect(hasMaxW2xl).toBe(false)
    })

    it('should not use mx-auto on the body outer container', () => {
      // Arrange & Act
      const { container } = render(<DiaryDetailClient {...defaultProps} />)

      // Assert — mx-auto 는 max-w-2xl 제거와 함께 삭제되어야 한다
      // (role="banner" 헤더 내부의 mx-auto 까지 포함하지 않도록 본문 한정)
      const contentEl = screen.getByTestId('diary-content')
      // 본문 content 의 조상 체인에서 mx-auto 클래스 확인
      let ancestor = contentEl.parentElement
      let hasMxAuto = false
      while (ancestor && ancestor.tagName !== 'HEADER') {
        if (ancestor.className && ancestor.className.includes('mx-auto')) {
          hasMxAuto = true
          break
        }
        ancestor = ancestor.parentElement
      }
      expect(hasMxAuto).toBe(false)
    })

    it('should apply px-5 to the body outer container', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert — diary-content 의 조상 중 px-5 가 있어야 한다
      const contentEl = screen.getByTestId('diary-content')
      let ancestor = contentEl.parentElement
      let hasPx5 = false
      while (ancestor) {
        if (ancestor.className && ancestor.className.includes('px-5')) {
          hasPx5 = true
          break
        }
        ancestor = ancestor.parentElement
      }
      expect(hasPx5).toBe(true)
    })

    it('should apply py-6 to the body outer container', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert
      const contentEl = screen.getByTestId('diary-content')
      let ancestor = contentEl.parentElement
      let hasPy6 = false
      while (ancestor) {
        if (ancestor.className && ancestor.className.includes('py-6')) {
          hasPy6 = true
          break
        }
        ancestor = ancestor.parentElement
      }
      expect(hasPy6).toBe(true)
    })
  })

  describe('카드 래퍼 제거 — shadow/rounded 없음', () => {
    it('should not render a card wrapper with shadow-sm class', () => {
      // Arrange & Act
      const { container } = render(<DiaryDetailClient {...defaultProps} />)

      // Assert — 카드 래퍼(shadow-sm)가 제거되어야 한다
      const cardWrapper = container.querySelector('.shadow-sm')
      expect(cardWrapper).toBeNull()
    })

    it('should not render a card wrapper with rounded-lg class', () => {
      // Arrange & Act
      const { container } = render(<DiaryDetailClient {...defaultProps} />)

      // Assert — rounded-lg 카드 스타일이 제거되어야 한다
      const cardWrapper = container.querySelector('.rounded-lg')
      expect(cardWrapper).toBeNull()
    })

    it('should not render a card wrapper with bg-white class inside the body area', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert — 본문 영역(DiaryContent 기준 조상)에 카드용 bg-white 래퍼가 없어야 한다
      const contentEl = screen.getByTestId('diary-content')
      let ancestor = contentEl.parentElement
      let hasCardBgWhite = false
      // header 상위까지는 올라가지 않음 — 본문 레이아웃 내부만 확인
      while (ancestor && !ancestor.className?.includes('min-h-screen')) {
        // shadow-sm 과 결합된 bg-white 가 카드 래퍼를 의미한다
        if (
          ancestor.className &&
          ancestor.className.includes('bg-white') &&
          ancestor.className.includes('shadow')
        ) {
          hasCardBgWhite = true
          break
        }
        ancestor = ancestor.parentElement
      }
      expect(hasCardBgWhite).toBe(false)
    })

    it('should not use p-6 on a card wrapper div (old card inner padding)', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert — 카드 래퍼의 p-6 이 제거되어야 한다
      // DiaryContent 의 부모가 p-6 과 shadow-sm 을 동시에 가지면 카드 래퍼가 남아있는 것
      const contentEl = screen.getByTestId('diary-content')
      const directParent = contentEl.parentElement as HTMLElement
      const isCardWrapper =
        directParent.className.includes('p-6') &&
        directParent.className.includes('shadow')
      expect(isCardWrapper).toBe(false)
    })
  })

  describe('콘텐츠 직접 렌더링 — 카드 없이 표시', () => {
    it('should render diary date content directly without card wrapper', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert — 날짜 메타 정보가 정상 표시되어야 한다
      const dateContainer = screen.getByTestId('diary-detail-date')
      expect(dateContainer).toBeInTheDocument()
      expect(dateContainer.textContent).toContain('2026년 2월 13일 목요일')
    })

    it('should render diary content directly without card wrapper', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert
      const contentEl = screen.getByTestId('diary-content')
      expect(contentEl).toBeInTheDocument()
      expect(contentEl.textContent).toBe('오늘 하루도 좋은 날이었다.')
    })

    it('should render DiaryMeta and DiaryContent as siblings (no card wrapper between them)', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert — DiaryMeta 와 DiaryContent 가 같은 부모 요소 아래에 바로 위치해야 한다
      const dateContainer = screen.getByTestId('diary-detail-date')
      const contentEl = screen.getByTestId('diary-content')

      const dateParent = dateContainer.parentElement
      const contentParent = contentEl.parentElement

      // 두 컴포넌트의 부모가 동일하거나 (형제 관계),
      // 또는 카드 래퍼 없이 바로 연결된 구조여야 한다
      const areSiblings = dateParent === contentParent
      const cardWrapperAbsent =
        !dateParent?.className.includes('shadow') &&
        !dateParent?.className.includes('rounded-lg')

      expect(areSiblings && cardWrapperAbsent).toBe(true)
    })
  })

  describe('기존 기능 유지 확인', () => {
    it('should still render the header with banner role', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert — 레이아웃 변경 후에도 헤더는 유지되어야 한다
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should still show delete button after layout change', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert
      expect(screen.getByRole('button', { name: /삭제|delete/i })).toBeInTheDocument()
    })

    it('should still show edit button after layout change', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert
      expect(screen.getByRole('button', { name: /수정|edit/i })).toBeInTheDocument()
    })

    it('should still display the diary content text after layout change', () => {
      // Arrange & Act
      render(<DiaryDetailClient {...defaultProps} />)

      // Assert
      expect(screen.getByText('오늘 하루도 좋은 날이었다.')).toBeInTheDocument()
    })
  })
})
