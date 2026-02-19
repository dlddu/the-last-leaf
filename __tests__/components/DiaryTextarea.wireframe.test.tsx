import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import DiaryTextarea from '@/components/DiaryTextarea'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - p-4 → px-5 py-6
 * - h-full → min-h-[60vh]
 * - 추가: leading-relaxed
 * - placeholder 색상: placeholder-gray-300 (placeholder 클래스 추가)
 *
 * 기존 DiaryTextarea.test.tsx 가 검증하는 항목(data-testid 존재, role="textbox",
 * placeholder 텍스트 존재, 값 렌더링, resize-none, h-full/h-screen, w-full,
 * 기능 동작, 접근성)은 중복 작성하지 않는다.
 */
describe('DiaryTextarea — 와이어프레임 스타일 스펙', () => {
  describe('패딩 — px-5 py-6', () => {
    it('should apply px-5 horizontal padding', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea.className).toMatch(/px-5/)
    })

    it('should apply py-6 vertical padding', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea.className).toMatch(/py-6/)
    })

    it('should not use the old p-4 shorthand padding', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert — p-4 는 px-5 py-6 로 교체되어야 한다
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea.className).not.toMatch(/\bp-4\b/)
    })
  })

  describe('최소 높이 — min-h-[60vh]', () => {
    it('should apply min-h-[60vh] to the textarea', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea.className).toMatch(/min-h-\[60vh\]/)
    })

    it('should not use h-full as the sole height class', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert — h-full 은 min-h-[60vh] 로 교체되어야 한다
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea.className).not.toMatch(/\bh-full\b/)
    })
  })

  describe('줄 높이 — leading-relaxed', () => {
    it('should apply leading-relaxed to the textarea', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea.className).toMatch(/leading-relaxed/)
    })
  })

  describe('placeholder 색상 — placeholder-gray-300', () => {
    it('should apply placeholder-gray-300 to the textarea', () => {
      // Arrange & Act
      render(<DiaryTextarea value="" onChange={jest.fn()} />)

      // Assert
      const textarea = screen.getByTestId('diary-content-input')
      expect(textarea.className).toMatch(/placeholder-gray-300/)
    })
  })
})
