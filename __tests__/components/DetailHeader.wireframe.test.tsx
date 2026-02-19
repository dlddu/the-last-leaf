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

import DetailHeader from '@/components/DetailHeader'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - header: max-w-2xl mx-auto 제거 → 전체 너비 (px-4 py-3 유지)
 * - header: border-gray-200 → border-gray-100
 * - 수정 아이콘: heroicons PencilSquareIcon (strokeWidth 1.5, path 특징)
 * - 삭제 아이콘: heroicons TrashIcon (text-red-400 클래스 포함)
 * - 삭제 버튼: hover:bg-red-50 적용
 * - 모든 아이콘 strokeWidth 2 → 1.5
 *
 * 기존 DetailHeader.test.tsx 가 검증하는 항목(role="banner", aria-label 패턴,
 * back/edit/delete 버튼 존재, 기능 동작, 접근성)은 중복 작성하지 않는다.
 */
describe('DetailHeader — 와이어프레임 스타일 스펙', () => {
  const defaultProps = {
    diaryId: 'diary-test-id',
    onDeleteClick: jest.fn(),
  }

  describe('header 테두리 색상', () => {
    it('should use border-gray-100 (not border-gray-200) on the header', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const header = screen.getByRole('banner')
      expect(header.className).toMatch(/border-gray-100/)
    })

    it('should not use the old border-gray-200 on the header', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const header = screen.getByRole('banner')
      expect(header.className).not.toMatch(/border-gray-200/)
    })
  })

  describe('내부 컨테이너 레이아웃 — 전체 너비', () => {
    it('should not use max-w-2xl on the inner container', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — max-w-2xl 는 전체 너비 레이아웃으로 변경되므로 제거되어야 한다
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).not.toMatch(/max-w-2xl/)
    })

    it('should not use mx-auto on the inner container', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — mx-auto 는 max-w 제거와 함께 삭제되어야 한다
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).not.toMatch(/mx-auto/)
    })

    it('should apply px-4 horizontal padding to the inner container', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — 기존 px-4 는 유지되어야 한다
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).toMatch(/px-4/)
    })

    it('should apply py-3 vertical padding to the inner container', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — 기존 py-3 는 유지되어야 한다
      const header = screen.getByRole('banner')
      const innerContainer = header.firstElementChild as HTMLElement
      expect(innerContainer.className).toMatch(/py-3/)
    })
  })

  describe('삭제 버튼 — 빨간 계열 스타일', () => {
    it('should apply text-red-400 to the delete button icon area', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — 삭제 버튼 또는 그 내부에 text-red-400 클래스가 있어야 한다
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      const hasRedClass =
        deleteButton.className.includes('text-red-400') ||
        (deleteButton.querySelector('[class*="text-red-400"]') !== null) ||
        (deleteButton.querySelector('svg')?.className.baseVal?.includes('text-red-400') ?? false)
      expect(hasRedClass).toBe(true)
    })

    it('should apply hover:bg-red-50 to the delete button', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      expect(deleteButton.className).toMatch(/hover:bg-red-50/)
    })

    it('should not use the generic hover:bg-gray-100 on the delete button', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — 삭제 버튼은 빨간 계열 hover를 가져야 한다 (gray hover 제거)
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      expect(deleteButton.className).not.toMatch(/hover:bg-gray-100/)
    })
  })

  describe('수정 아이콘 — PencilSquareIcon (heroicons)', () => {
    it('should render an svg icon inside the edit button', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const editButton = screen.getByRole('button', { name: /수정|edit/i })
      const svg = editButton.querySelector('svg')
      expect(svg).not.toBeNull()
    })

    it('should use strokeWidth of 1.5 on the edit icon path', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — PencilSquareIcon은 strokeWidth 1.5를 사용한다
      const editButton = screen.getByRole('button', { name: /수정|edit/i })
      const paths = editButton.querySelectorAll('path')
      const hasStrokeWidth15 = Array.from(paths).some(
        (path) => path.getAttribute('stroke-width') === '1.5'
      )
      expect(hasStrokeWidth15).toBe(true)
    })

    it('should not use strokeWidth of 2 on the edit icon (old value)', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — 기존 strokeWidth 2는 1.5로 교체되어야 한다
      const editButton = screen.getByRole('button', { name: /수정|edit/i })
      const paths = editButton.querySelectorAll('path')
      const hasStrokeWidth2 = Array.from(paths).some(
        (path) => path.getAttribute('stroke-width') === '2'
      )
      expect(hasStrokeWidth2).toBe(false)
    })
  })

  describe('삭제 아이콘 — TrashIcon (heroicons)', () => {
    it('should render an svg icon inside the delete button', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      const svg = deleteButton.querySelector('svg')
      expect(svg).not.toBeNull()
    })

    it('should use strokeWidth of 1.5 on the delete icon path', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — TrashIcon은 strokeWidth 1.5를 사용한다
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      const paths = deleteButton.querySelectorAll('path')
      const hasStrokeWidth15 = Array.from(paths).some(
        (path) => path.getAttribute('stroke-width') === '1.5'
      )
      expect(hasStrokeWidth15).toBe(true)
    })

    it('should not use strokeWidth of 2 on the delete icon (old value)', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — 기존 strokeWidth 2는 1.5로 교체되어야 한다
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      const paths = deleteButton.querySelectorAll('path')
      const hasStrokeWidth2 = Array.from(paths).some(
        (path) => path.getAttribute('stroke-width') === '2'
      )
      expect(hasStrokeWidth2).toBe(false)
    })
  })

  describe('뒤로 가기 아이콘 — strokeWidth 1.5', () => {
    it('should use strokeWidth of 1.5 on the back button icon', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert — 뒤로 가기 아이콘도 strokeWidth 1.5로 변경되어야 한다
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      const paths = backButton.querySelectorAll('path')
      const hasStrokeWidth15 = Array.from(paths).some(
        (path) => path.getAttribute('stroke-width') === '1.5'
      )
      expect(hasStrokeWidth15).toBe(true)
    })

    it('should not use strokeWidth of 2 on the back button icon (old value)', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      const paths = backButton.querySelectorAll('path')
      const hasStrokeWidth2 = Array.from(paths).some(
        (path) => path.getAttribute('stroke-width') === '2'
      )
      expect(hasStrokeWidth2).toBe(false)
    })
  })
})
