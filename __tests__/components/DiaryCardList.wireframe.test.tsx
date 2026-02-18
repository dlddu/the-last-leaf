import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock next/navigation (DiaryCard 내부에서 useRouter 사용)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/diary',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockImplementation((callback: IntersectionObserverCallback) => ({
  observe: jest.fn((element: Element) => {
    setTimeout(() => {
      callback(
        [{ isIntersecting: false, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    }, 0)
  }),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
global.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver

import DiaryCardList from '@/components/DiaryCardList'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - 로딩 인디케이터: 스피너 대신 3개의 바운싱 도트
 * - 각 도트: w-2 h-2 bg-gray-300 rounded-full animate-bounce
 * - animation-delay로 순차 애니메이션 (도트가 정확히 3개)
 *
 * 기존 DiaryCardList.test.tsx 가 검증하는 항목(data-testid 존재, 카드 렌더링,
 * hasMore 조건, IntersectionObserver, 접근성 ARIA, list 시맨틱 구조)은
 * 중복 작성하지 않는다.
 */
describe('DiaryCardList — 와이어프레임 로딩 인디케이터 스펙', () => {
  const mockDiaries = [
    {
      diary_id: 'diary-1',
      user_id: 'user-1',
      content: 'First diary entry',
      created_at: new Date('2024-01-03T12:00:00Z'),
      updated_at: new Date('2024-01-03T12:00:00Z'),
    },
  ]

  beforeEach(() => {
    mockIntersectionObserver.mockClear()
  })

  describe('바운싱 도트 로딩 인디케이터', () => {
    it('should render exactly 3 bouncing dots inside the loading indicator', () => {
      // Arrange & Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert
      const loader = screen.getByTestId('loading-indicator')
      // animate-bounce 클래스를 가진 자식 요소가 정확히 3개여야 한다
      const bouncingDots = loader.querySelectorAll('.animate-bounce')
      expect(bouncingDots).toHaveLength(3)
    })

    it('should apply w-2 class to each of the 3 bouncing dots', () => {
      // Arrange & Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert — 도트가 3개 존재하고 각각 w-2 를 가져야 한다
      const loader = screen.getByTestId('loading-indicator')
      const bouncingDots = Array.from(loader.querySelectorAll('.animate-bounce'))
      expect(bouncingDots).toHaveLength(3)
      bouncingDots.forEach((dot) => {
        expect(dot.className).toMatch(/\bw-2\b/)
      })
    })

    it('should apply h-2 class to each of the 3 bouncing dots', () => {
      // Arrange & Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert — 도트가 3개 존재하고 각각 h-2 를 가져야 한다
      const loader = screen.getByTestId('loading-indicator')
      const bouncingDots = Array.from(loader.querySelectorAll('.animate-bounce'))
      expect(bouncingDots).toHaveLength(3)
      bouncingDots.forEach((dot) => {
        expect(dot.className).toMatch(/\bh-2\b/)
      })
    })

    it('should apply bg-gray-300 to each of the 3 bouncing dots', () => {
      // Arrange & Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert — 도트가 3개 존재하고 각각 bg-gray-300 을 가져야 한다
      const loader = screen.getByTestId('loading-indicator')
      const bouncingDots = Array.from(loader.querySelectorAll('.animate-bounce'))
      expect(bouncingDots).toHaveLength(3)
      bouncingDots.forEach((dot) => {
        expect(dot.className).toMatch(/bg-gray-300/)
      })
    })

    it('should apply rounded-full to each of the 3 bouncing dots', () => {
      // Arrange & Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert — 도트가 3개 존재하고 각각 rounded-full 을 가져야 한다
      const loader = screen.getByTestId('loading-indicator')
      const bouncingDots = Array.from(loader.querySelectorAll('.animate-bounce'))
      expect(bouncingDots).toHaveLength(3)
      bouncingDots.forEach((dot) => {
        expect(dot.className).toMatch(/rounded-full/)
      })
    })

    it('should not render a spinning circle (animate-spin) inside the loading indicator', () => {
      // Arrange & Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert — 기존 스피너(animate-spin)는 제거되어야 한다
      const loader = screen.getByTestId('loading-indicator')
      const spinner = loader.querySelector('.animate-spin')
      expect(spinner).toBeNull()
    })

    it('should apply inline animation-delay style or delay class to create sequential animation', () => {
      // Arrange & Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert — 순차 애니메이션을 위해 두 번째 또는 세 번째 도트에
      // animation-delay 인라인 스타일 또는 delay-* Tailwind 클래스가 있어야 한다
      const loader = screen.getByTestId('loading-indicator')
      const dots = Array.from(loader.querySelectorAll('.animate-bounce'))

      const hasDelayStyle = dots.some(
        (dot) =>
          (dot as HTMLElement).style.animationDelay !== '' ||
          dot.className.match(/delay-/)
      )
      expect(hasDelayStyle).toBe(true)
    })
  })
})
