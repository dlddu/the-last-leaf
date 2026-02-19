import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import EmptyState from '@/components/EmptyState'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - 일러스트레이션 컨테이너: w-20 h-20 bg-indigo-100 rounded-full
 * - 아이콘: book 아이콘 (indigo-400 색상)
 * - 텍스트 2줄 구성
 * - CTA 버튼: bg-indigo-600 rounded-xl
 * - blue-600 컬러가 indigo-600으로 교체됨
 *
 * 기존 EmptyState.test.tsx 가 검증하는 항목(data-testid 존재, 일러스트레이션
 * role/aria-label, 메시지 텍스트, 버튼 href, 레이아웃 flex/grid/center,
 * 접근성, 반응형)은 중복 작성하지 않는다.
 */
describe('EmptyState — 와이어프레임 스타일 스펙', () => {
  describe('일러스트레이션 컨테이너 스타일 (indigo 테마)', () => {
    it('should apply w-20 to the illustration container', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      expect(illustration.className).toMatch(/\bw-20\b/)
    })

    it('should apply h-20 to the illustration container', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      expect(illustration.className).toMatch(/\bh-20\b/)
    })

    it('should apply bg-indigo-100 to the illustration container', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      expect(illustration.className).toMatch(/bg-indigo-100/)
    })

    it('should apply rounded-full to the illustration container', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert
      const illustration = screen.getByTestId('empty-state-illustration')
      expect(illustration.className).toMatch(/rounded-full/)
    })

    it('should not use the old gray circle style (bg-gray-) on the illustration container', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert — 이전 회색 계열 배경은 제거되어야 한다
      const illustration = screen.getByTestId('empty-state-illustration')
      expect(illustration.className).not.toMatch(/bg-gray-/)
    })
  })

  describe('아이콘 — indigo-400 컬러의 book 아이콘', () => {
    it('should render an icon inside the illustration container', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert — SVG 또는 아이콘 요소가 일러스트레이션 내부에 있어야 한다
      const illustration = screen.getByTestId('empty-state-illustration')
      const icon = illustration.querySelector('svg') ?? illustration.querySelector('[class*="icon"]')
      expect(icon).not.toBeNull()
    })

    it('should use indigo-400 color class on the icon element', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert — 아이콘 자체 또는 SVG 래퍼에 indigo-400 관련 클래스가 있어야 한다
      const illustration = screen.getByTestId('empty-state-illustration')
      const iconOrWrapper =
        illustration.querySelector('[class*="indigo-400"]') ??
        illustration.querySelector('svg[class*="indigo"]') ??
        illustration.querySelector('[stroke*="indigo"]')

      // className 전체에서 indigo-400 문자열 포함 여부로도 확인
      const illustrationHTML = illustration.innerHTML
      expect(
        iconOrWrapper !== null || illustrationHTML.includes('indigo-400')
      ).toBe(true)
    })
  })

  describe('텍스트 2줄 구성', () => {
    it('should render at least two lines of descriptive text', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert — br 태그 또는 별도 p/span 요소로 2줄이 구성되어야 한다
      const container = screen.getByTestId('empty-state')

      const brCount = container.querySelectorAll('br').length
      const paragraphCount = container.querySelectorAll('p, span').length

      // br 태그가 1개 이상이거나, 텍스트 줄 역할을 하는 요소가 2개 이상
      expect(brCount >= 1 || paragraphCount >= 2).toBe(true)
    })
  })

  describe('CTA 버튼 — indigo-600 rounded-xl 스타일', () => {
    it('should apply bg-indigo-600 to the CTA button', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button.className).toMatch(/bg-indigo-600/)
    })

    it('should apply rounded-xl to the CTA button', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert — 기존 rounded-lg 대신 rounded-xl 로 변경되어야 한다
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button.className).toMatch(/rounded-xl/)
    })

    it('should not use rounded-lg on the CTA button (replaced by rounded-xl)', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert — 이전 rounded-lg 는 제거되어야 한다
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button.className).not.toMatch(/\brounded-lg\b/)
    })

    it('should not use blue-600 on the CTA button (replaced by indigo-600)', () => {
      // Arrange & Act
      render(<EmptyState />)

      // Assert
      const button = screen.getByRole('button', { name: /첫 일기|일기 쓰기|작성/i })
      expect(button.className).not.toMatch(/bg-blue-600/)
    })
  })
})
