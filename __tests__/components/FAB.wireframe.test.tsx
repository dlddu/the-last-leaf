import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock Next.js router (must be before component import)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

import FAB from '@/components/FAB'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - 아이콘: lucide-react Pencil 아이콘 (기존 + SVG 플러스 아이콘 → 연필)
 * - 위치: bottom-24 right-5 (기존 bottom-20 right-6 → 변경)
 * - 크기: w-14 h-14 유지
 * - 색상: bg-indigo-600 (blue-600 제거)
 *
 * 기존 FAB.test.tsx 가 검증하는 항목(fab-create-diary testid, button 태그,
 * aria-label="새 일기 작성", fixed, bottom/right 클래스 존재 여부, z- 클래스,
 * rounded, shadow, 내비게이션 동작, 접근성)은 중복 작성하지 않는다.
 */
describe('FAB — 와이어프레임 스타일 스펙', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Pencil 아이콘 사용', () => {
    it('should render an SVG icon inside the FAB button', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert
      const button = screen.getByTestId('fab-create-diary')
      const svg = button.querySelector('svg')
      expect(svg).not.toBeNull()
    })

    it('should not use the old plus/cross path (M12 4v16m8-8H4) inside the icon', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert — 기존 십자(+) 아이콘 path 데이터가 제거되어야 한다
      const button = screen.getByTestId('fab-create-diary')
      const paths = button.querySelectorAll('path')
      const hasPlusCrossPath = Array.from(paths).some((path) =>
        /M12 4v16m8-8H4/i.test(path.getAttribute('d') ?? '')
      )
      expect(hasPlusCrossPath).toBe(false)
    })

    it('should render a pencil icon (Pencil from lucide-react or equivalent SVG)', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert — Pencil 아이콘은 lucide-react 가 생성하는 SVG 구조를 가진다.
      // lucide SVG 는 일반적으로 stroke="currentColor" 를 사용하며
      // data-lucide 속성 또는 특정 path 패턴을 포함한다.
      // 최소한 SVG 내부에 path 요소가 있어야 한다.
      const button = screen.getByTestId('fab-create-diary')
      const svg = button.querySelector('svg')
      expect(svg).not.toBeNull()

      // lucide-react Pencil 아이콘은 path를 포함한다
      const paths = svg!.querySelectorAll('path')
      expect(paths.length).toBeGreaterThan(0)
    })
  })

  describe('FAB 위치 — bottom-24 right-5', () => {
    it('should apply bottom-24 class to the FAB button', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert — 와이어프레임 스펙: bottom-24 (기존 bottom-20 에서 변경)
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).toMatch(/bottom-24/)
    })

    it('should apply right-5 class to the FAB button', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert — 와이어프레임 스펙: right-5 (기존 right-6 에서 변경)
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).toMatch(/right-5/)
    })

    it('should not use the old bottom-20 class', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).not.toMatch(/\bbottom-20\b/)
    })

    it('should not use the old right-6 class', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).not.toMatch(/\bright-6\b/)
    })
  })

  describe('FAB 크기 및 색상', () => {
    it('should apply w-14 class to the FAB button', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).toMatch(/\bw-14\b/)
    })

    it('should apply h-14 class to the FAB button', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).toMatch(/\bh-14\b/)
    })

    it('should apply bg-indigo-600 to the FAB button', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).toMatch(/bg-indigo-600/)
    })

    it('should not use blue-600 on the FAB button', () => {
      // Arrange & Act
      render(<FAB />)

      // Assert — blue-600 은 indigo-600 으로 전면 교체되어야 한다
      const button = screen.getByTestId('fab-create-diary')
      expect(button.className).not.toMatch(/bg-blue-600/)
    })
  })
})
