import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import DateLabel from '@/components/DateLabel'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - div: text-lg font-medium text-gray-800 → text-sm text-gray-400
 *
 * 기존 DateLabel.test.tsx 가 검증하는 항목(렌더링, 날짜 포맷, 한국어 표시,
 * 읽기 전용 동작, 접근성)은 중복 작성하지 않는다.
 */
describe('DateLabel — 와이어프레임 스타일 스펙', () => {
  describe('날짜 타이포그래피 — text-sm text-gray-400', () => {
    it('should apply text-sm to the date element', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.className).toMatch(/text-sm/)
    })

    it('should not use text-lg on the date element', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert — text-lg 는 text-sm 으로 교체되어야 한다
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.className).not.toMatch(/\btext-lg\b/)
    })

    it('should apply text-gray-400 to the date element', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.className).toMatch(/text-gray-400/)
    })

    it('should not use text-gray-800 on the date element', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert — text-gray-800 은 text-gray-400 으로 교체되어야 한다
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.className).not.toMatch(/text-gray-800/)
    })

    it('should not use font-medium on the date element', () => {
      // Arrange & Act
      render(<DateLabel date="2024-06-15T10:00:00.000Z" />)

      // Assert — font-medium 은 와이어프레임 스펙에서 제거되어야 한다
      const dateElement = screen.getByTestId('diary-date')
      expect(dateElement.className).not.toMatch(/font-medium/)
    })
  })
})
