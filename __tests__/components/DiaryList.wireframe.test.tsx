import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock next/navigation (DiaryCard, FAB 등 내부 컴포넌트가 사용)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: () => '/diary',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock fetch (DiaryList 가 마운트 시 API 호출)
global.fetch = jest.fn()

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
global.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver

import DiaryList from '@/components/DiaryList'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - 페이지 레이아웃 컨테이너: min-h-screen bg-gray-50 pb-20
 * - 콘텐츠 영역 내부 패딩: px-4 py-3
 * - blue-600 계열 컬러가 사용되지 않음
 *
 * DiaryList 는 fetch 를 사용하는 Client Component 이므로
 * 초기 로딩 상태(isLoading=true)에서 렌더링되는 최상위 레이아웃을 검증한다.
 * 로딩 완료 후 다이어리 목록이나 빈 상태는 별도 컴포넌트 테스트에서 담당한다.
 */
describe('DiaryList 페이지 레이아웃 — 와이어프레임 스타일 스펙', () => {
  beforeEach(() => {
    jest.clearAllMocks() ;
    // fetch 가 응답을 반환하지 않도록 하여 로딩 상태를 유지
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // never resolves → isLoading stays true
    )
    mockIntersectionObserver.mockClear()
  })

  describe('페이지 배경 — bg-gray-50', () => {
    it('should apply bg-gray-50 to the page root container', () => {
      // Arrange & Act
      const { container } = render(<DiaryList />)

      // Assert — 최상위 또는 콘텐츠 컨테이너에 bg-gray-50 이 적용되어야 한다
      const rootEl = container.firstChild as HTMLElement
      const hasGray50 =
        /bg-gray-50/.test(rootEl.className) ||
        rootEl.querySelector('[class*="bg-gray-50"]') !== null
      expect(hasGray50).toBe(true)
    })

    it('should not use bg-white as the sole page background on the root container', () => {
      // Arrange & Act
      const { container } = render(<DiaryList />)

      // Assert — 페이지 루트가 순수 bg-white 만 갖고 있어서는 안 된다
      // (bg-gray-50 이 있어야 함을 간접 검증)
      const rootEl = container.firstChild as HTMLElement
      const onlyBgWhite =
        /\bbg-white\b/.test(rootEl.className) &&
        !/bg-gray-50/.test(rootEl.className)
      expect(onlyBgWhite).toBe(false)
    })
  })

  describe('페이지 레이아웃 — min-h-screen pb-20', () => {
    it('should apply min-h-screen to the page root container', () => {
      // Arrange & Act
      const { container } = render(<DiaryList />)

      // Assert
      const rootEl = container.firstChild as HTMLElement
      const hasMinHScreen =
        /min-h-screen/.test(rootEl.className) ||
        rootEl.querySelector('[class*="min-h-screen"]') !== null
      expect(hasMinHScreen).toBe(true)
    })

    it('should apply pb-20 to the page root container', () => {
      // Arrange & Act
      const { container } = render(<DiaryList />)

      // Assert — 하단 네비게이션 여백을 위한 pb-20
      const rootEl = container.firstChild as HTMLElement
      const hasPb20 =
        /\bpb-20\b/.test(rootEl.className) ||
        rootEl.querySelector('[class*="pb-20"]') !== null
      expect(hasPb20).toBe(true)
    })
  })

  describe('콘텐츠 영역 패딩 — px-4 py-3', () => {
    it('should apply px-4 to the inner content area', () => {
      // Arrange & Act
      const { container } = render(<DiaryList />)

      // Assert — 페이지 내부 콘텐츠 래퍼에 px-4 가 있어야 한다
      const hasPx4 = container.querySelector('[class*="px-4"]') !== null
      expect(hasPx4).toBe(true)
    })

    it('should apply py-3 to the inner content area', () => {
      // Arrange & Act
      const { container } = render(<DiaryList />)

      // Assert
      const hasPy3 = container.querySelector('[class*="py-3"]') !== null
      expect(hasPy3).toBe(true)
    })
  })

  describe('blue-600 컬러 전면 제거', () => {
    it('should not use blue-600 anywhere in the page layout markup', () => {
      // Arrange & Act
      const { container } = render(<DiaryList />)

      // Assert — 전체 렌더 트리에서 blue-600 Tailwind 클래스가 없어야 한다
      const allElements = container.querySelectorAll('*')
      const hasBlue600 = Array.from(allElements).some((el) =>
        /blue-600/.test((el as HTMLElement).className)
      )
      expect(hasBlue600).toBe(false)
    })
  })
})
