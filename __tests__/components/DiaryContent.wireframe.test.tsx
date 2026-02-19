import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import DiaryContent from '@/components/DiaryContent'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - text-base 클래스 적용 (기존 없음)
 * - text-gray-700 클래스 적용 (기존 text-gray-800 → 변경)
 * - leading-relaxed 유지
 * - whitespace-pre-wrap 유지
 * - data-testid="diary-content" 유지
 *
 * 기존 DiaryContent.test.tsx 가 검증하는 항목(data-testid 존재, 텍스트 내용,
 * whitespace-pre-wrap 클래스 존재, 접근성, 엣지 케이스)은 중복 작성하지 않는다.
 */
describe('DiaryContent — 와이어프레임 스타일 스펙', () => {
  describe('text-base 폰트 크기', () => {
    it('should apply text-base class to the content element', () => {
      // Arrange & Act
      render(<DiaryContent content="오늘 하루도 좋은 날이었다." />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.className).toMatch(/\btext-base\b/)
    })
  })

  describe('text-gray-700 텍스트 색상', () => {
    it('should apply text-gray-700 to the content element', () => {
      // Arrange & Act
      render(<DiaryContent content="오늘 하루도 좋은 날이었다." />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.className).toMatch(/text-gray-700/)
    })

    it('should not use text-gray-800 on the content element (old color)', () => {
      // Arrange & Act
      render(<DiaryContent content="오늘 하루도 좋은 날이었다." />)

      // Assert — 기존 text-gray-800 은 text-gray-700 으로 교체되어야 한다
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.className).not.toMatch(/text-gray-800/)
    })
  })

  describe('leading-relaxed 줄간격 유지', () => {
    it('should still apply leading-relaxed to the content element', () => {
      // Arrange & Act
      render(<DiaryContent content="오늘 하루도 좋은 날이었다." />)

      // Assert — 리디자인 이후에도 줄간격 클래스는 유지되어야 한다
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.className).toMatch(/leading-relaxed/)
    })
  })

  describe('whitespace-pre-wrap 유지', () => {
    it('should still apply whitespace-pre-wrap to the content element', () => {
      // Arrange & Act
      render(<DiaryContent content="줄바꿈\n포함 내용" />)

      // Assert — 리디자인 이후에도 공백 보존 클래스는 유지되어야 한다
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.className).toMatch(/whitespace-pre-wrap/)
    })
  })

  describe('전체 클래스 조합 — 4개 클래스 동시 적용', () => {
    it('should apply all four required classes together: text-base, text-gray-700, leading-relaxed, whitespace-pre-wrap', () => {
      // Arrange & Act
      render(<DiaryContent content="테스트 내용입니다." />)

      // Assert — 네 가지 클래스가 모두 동시에 적용되어야 한다
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.className).toMatch(/\btext-base\b/)
      expect(contentElement.className).toMatch(/text-gray-700/)
      expect(contentElement.className).toMatch(/leading-relaxed/)
      expect(contentElement.className).toMatch(/whitespace-pre-wrap/)
    })

    it('should apply all required classes with Korean diary content', () => {
      // Arrange
      const koreanContent = '오늘은 맑은 날이었다.\n공원을 산책하며 많은 생각을 했다.'

      // Act
      render(<DiaryContent content={koreanContent} />)

      // Assert
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement.className).toMatch(/\btext-base\b/)
      expect(contentElement.className).toMatch(/text-gray-700/)
      expect(contentElement.className).toMatch(/leading-relaxed/)
      expect(contentElement.className).toMatch(/whitespace-pre-wrap/)
    })
  })

  describe('data-testid 유지', () => {
    it('should maintain data-testid="diary-content" after redesign', () => {
      // Arrange & Act
      render(<DiaryContent content="내용" />)

      // Assert — 리디자인 후에도 testid는 반드시 유지되어야 한다
      const contentElement = screen.getByTestId('diary-content')
      expect(contentElement).toBeInTheDocument()
    })
  })
})
