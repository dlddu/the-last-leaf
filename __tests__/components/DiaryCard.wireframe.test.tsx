import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import DiaryCard from '@/components/DiaryCard'

// Mock next/navigation
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

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - 카드 컨테이너: bg-white rounded-xl p-4 border border-gray-100
 * - 날짜: text-sm font-semibold text-gray-800 (좌측)
 * - 시간: text-xs text-gray-400 (우측)
 * - 날짜/시간 분리 배치 (justify-between 또는 별도 요소)
 * - preview: text-sm text-gray-600 line-clamp-2 leading-relaxed
 *
 * 기존 DiaryCard.test.tsx 가 검증하는 항목(data-testid 존재, 텍스트 내용,
 * 날짜/시간 포맷, line-clamp 클래스 존재, 접근성, 엣지 케이스)은
 * 중복 작성하지 않는다.
 */
describe('DiaryCard — 와이어프레임 스타일 스펙', () => {
  const mockDiary = {
    diary_id: 'test-diary-id',
    user_id: 'test-user-id',
    content: '오늘 하루도 수고했다. 좋은 하루였다.',
    created_at: new Date('2024-03-15T14:30:00Z'),
    updated_at: new Date('2024-03-15T14:30:00Z'),
  }

  describe('카드 컨테이너 스타일', () => {
    it('should apply rounded-xl to the card container', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      expect(card.className).toMatch(/rounded-xl/)
    })

    it('should have white background (bg-white) on the card', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      expect(card.className).toMatch(/bg-white/)
    })

    it('should apply p-4 padding to the card', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      expect(card.className).toMatch(/\bp-4\b/)
    })

    it('should have border class on the card', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      expect(card.className).toMatch(/border/)
    })

    it('should use border-gray-100 (light border) on the card', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const card = screen.getByTestId('diary-card')
      expect(card.className).toMatch(/border-gray-100/)
    })
  })

  describe('날짜 요소 타이포그래피', () => {
    it('should apply text-sm to the date element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      expect(date.className).toMatch(/text-sm/)
    })

    it('should apply font-semibold to the date element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      expect(date.className).toMatch(/font-semibold/)
    })

    it('should apply text-gray-800 to the date element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const date = screen.getByTestId('diary-date')
      expect(date.className).toMatch(/text-gray-800/)
    })
  })

  describe('시간 요소 타이포그래피', () => {
    it('should apply text-xs to the time element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const time = screen.getByTestId('diary-time')
      expect(time.className).toMatch(/text-xs/)
    })

    it('should apply text-gray-400 to the time element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const time = screen.getByTestId('diary-time')
      expect(time.className).toMatch(/text-gray-400/)
    })
  })

  describe('날짜/시간 분리 배치', () => {
    it('should place date and time in a flex container with space-between or equivalent', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert — 날짜와 시간의 공통 부모가 justify-between 혹은 분리 정렬 클래스를 가져야 한다
      const date = screen.getByTestId('diary-date')
      const time = screen.getByTestId('diary-time')
      const dateParent = date.parentElement as HTMLElement
      const timeParent = time.parentElement as HTMLElement

      // 같은 부모 아래에서 justify-between 으로 양끝 정렬되거나
      // 서로 다른 부모에 각각 배치되어 분리 레이아웃을 형성해야 한다
      const sharedParentHasJustifyBetween =
        dateParent === timeParent &&
        /justify-between/.test(dateParent.className)

      const separateParents = dateParent !== timeParent

      expect(sharedParentHasJustifyBetween || separateParents).toBe(true)
    })
  })

  describe('프리뷰 텍스트 스타일', () => {
    it('should apply text-sm to the preview element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview.className).toMatch(/text-sm/)
    })

    it('should apply text-gray-600 to the preview element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview.className).toMatch(/text-gray-600/)
    })

    it('should apply leading-relaxed to the preview element', () => {
      // Arrange & Act
      render(<DiaryCard diary={mockDiary} />)

      // Assert
      const preview = screen.getByTestId('diary-preview')
      expect(preview.className).toMatch(/leading-relaxed/)
    })
  })
})
