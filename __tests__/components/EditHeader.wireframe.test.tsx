import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

// Mock next/navigation (must be before component import)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

import EditHeader from '@/components/EditHeader'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - header: border-gray-200 → border-gray-100
 * - 내부 컨테이너: max-w-2xl mx-auto 제거 → px-5 py-3 전체 너비
 * - 타이틀 "수정하기": text-lg font-medium text-gray-800 → text-sm font-medium
 * - 저장 버튼: px-4 py-2 bg-indigo-600 text-white rounded-lg 배경 있음 → text-indigo-600 font-semibold text-sm 배경 없음
 *
 * 기존 EditHeader.test.tsx 가 검증하는 항목(role="banner", 기능 동작,
 * aria-label, fixed positioning, 접근성)은 중복 작성하지 않는다.
 */
describe('EditHeader — 와이어프레임 스타일 스펙', () => {
  describe('header 테두리 색상', () => {
    it('should use border-gray-100 (not border-gray-200) on the header', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const header = screen.getByRole('banner')
      expect(header.className).toMatch(/border-gray-100/)
    })

    it('should not use the old border-gray-200 on the header', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const header = screen.getByRole('banner')
      expect(header.className).not.toMatch(/border-gray-200/)
    })
  })

  describe('내부 컨테이너 레이아웃 — 전체 너비', () => {
    it('should apply px-5 to the inner container', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert — 내부 컨테이너가 px-5 수평 패딩을 가져야 한다
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).toMatch(/px-5/)
    })

    it('should apply py-3 to the inner container', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).toMatch(/py-3/)
    })

    it('should not use max-w-2xl on the inner container', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert — max-w-2xl 는 전체 너비 레이아웃으로 변경되므로 제거되어야 한다
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).not.toMatch(/max-w-2xl/)
    })

    it('should not use mx-auto on the inner container', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert — mx-auto 는 max-w 제거와 함께 삭제되어야 한다
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).not.toMatch(/mx-auto/)
    })
  })

  describe('타이틀 "수정하기" 타이포그래피 — text-sm', () => {
    it('should apply text-sm to the title element', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const title = screen.getByText('수정하기')
      expect(title.className).toMatch(/text-sm/)
    })

    it('should not use text-lg on the title element', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert — text-lg 는 text-sm 으로 교체되어야 한다
      const title = screen.getByText('수정하기')
      expect(title.className).not.toMatch(/\btext-lg\b/)
    })

    it('should apply font-medium to the title element', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const title = screen.getByText('수정하기')
      expect(title.className).toMatch(/font-medium/)
    })
  })

  describe('저장 버튼 — 배경 없는 텍스트 스타일', () => {
    it('should apply text-indigo-600 to the save button', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton.className).toMatch(/text-indigo-600/)
    })

    it('should apply font-semibold to the save button', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton.className).toMatch(/font-semibold/)
    })

    it('should apply text-sm to the save button', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton.className).toMatch(/text-sm/)
    })

    it('should not use bg-indigo-600 on the save button (background removed)', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert — 배경색이 제거되어야 한다
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton.className).not.toMatch(/bg-indigo-600/)
    })

    it('should not use text-white on the save button (white text removed with background)', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton.className).not.toMatch(/\btext-white\b/)
    })

    it('should not use rounded-lg on the save button (rounded removed with background)', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert — rounded-lg 는 배경이 있는 버튼 스타일의 일부였으므로 제거되어야 한다
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton.className).not.toMatch(/\brounded-lg\b/)
    })

    it('should not use px-4 padding on the save button (padding removed with background)', () => {
      // Arrange & Act
      render(<EditHeader onSave={jest.fn()} isSaving={false} />)

      // Assert — px-4 py-2 패딩은 배경 있는 버튼 스타일의 일부였으므로 제거되어야 한다
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton.className).not.toMatch(/\bpx-4\b/)
    })
  })
})
