import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import DiaryListHeader from '@/components/DiaryListHeader'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - sticky top-0 상단 고정
 * - 좌측 '내 일기' (text-xl font-bold) + 우측 '총 N개' (text-sm text-gray-400) 분리 레이아웃
 * - bg-white border-b border-gray-100 px-5 py-4 전체 너비
 *
 * 기존 DiaryListHeader.test.tsx 가 검증하는 항목(렌더링, 카운트 표시,
 * 제목 텍스트, 접근성 heading)은 중복 작성하지 않는다.
 */
describe('DiaryListHeader — 와이어프레임 스타일 스펙', () => {
  describe('Sticky 헤더 포지셔닝', () => {
    it('should apply sticky class to the header container', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      const header = container.firstChild as HTMLElement
      expect(header.className).toMatch(/sticky/)
    })

    it('should apply top-0 class to stay at the very top', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      const header = container.firstChild as HTMLElement
      expect(header.className).toMatch(/top-0/)
    })
  })

  describe('헤더 배경 및 하단 테두리 스타일', () => {
    it('should have white background (bg-white)', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      const header = container.firstChild as HTMLElement
      expect(header.className).toMatch(/bg-white/)
    })

    it('should have bottom border (border-b)', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      const header = container.firstChild as HTMLElement
      expect(header.className).toMatch(/border-b/)
    })

    it('should use light gray border color (border-gray-100)', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      const header = container.firstChild as HTMLElement
      expect(header.className).toMatch(/border-gray-100/)
    })

    it('should apply horizontal padding px-5', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      const header = container.firstChild as HTMLElement
      expect(header.className).toMatch(/px-5/)
    })

    it('should apply vertical padding py-4', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert
      const header = container.firstChild as HTMLElement
      expect(header.className).toMatch(/py-4/)
    })
  })

  describe('좌우 분리 레이아웃 — 내 일기 / 총 N개', () => {
    it('should render "내 일기" title with text-xl class', () => {
      // Arrange & Act
      render(<DiaryListHeader totalCount={3} />)

      // Assert
      const title = screen.getByText(/내 일기/i)
      expect(title.className).toMatch(/text-xl/)
    })

    it('should render "내 일기" title with font-bold class', () => {
      // Arrange & Act
      render(<DiaryListHeader totalCount={3} />)

      // Assert
      const title = screen.getByText(/내 일기/i)
      expect(title.className).toMatch(/font-bold/)
    })

    it('should render total count label "총 N개" format', () => {
      // Arrange & Act
      render(<DiaryListHeader totalCount={7} />)

      // Assert — 카운트 라벨이 "총 N개" 형태를 포함해야 함
      expect(screen.getByText(/총.*7.*개|7.*개/)).toBeInTheDocument()
    })

    it('should apply text-sm to the count label element', () => {
      // Arrange & Act
      render(<DiaryListHeader totalCount={7} />)

      // Assert
      const countLabel = screen.getByText(/총.*7.*개|7.*개/)
      expect(countLabel.className).toMatch(/text-sm/)
    })

    it('should apply text-gray-400 to the count label element', () => {
      // Arrange & Act
      render(<DiaryListHeader totalCount={7} />)

      // Assert
      const countLabel = screen.getByText(/총.*7.*개|7.*개/)
      expect(countLabel.className).toMatch(/text-gray-400/)
    })

    it('should place title and count in separate elements (not a single inline span)', () => {
      // Arrange & Act
      render(<DiaryListHeader totalCount={10} />)

      // Assert — 제목과 카운트가 별도의 DOM 요소여야 한다
      const title = screen.getByText(/내 일기/i)
      const count = screen.getByText(/총.*10.*개|10.*개/)
      expect(title).not.toBe(count)
    })

    it('should use flex layout on the header inner container for left-right split', () => {
      // Arrange & Act
      const { container } = render(<DiaryListHeader totalCount={5} />)

      // Assert — 내부 레이아웃 컨테이너가 flex를 사용해야 한다
      const flexContainer =
        container.querySelector('.flex') ??
        container.querySelector('[class*="flex"]')
      expect(flexContainer).not.toBeNull()
    })

    it('should show "총 0개" when count is zero', () => {
      // Arrange & Act
      render(<DiaryListHeader totalCount={0} />)

      // Assert
      expect(screen.getByText(/총.*0.*개|0.*개/)).toBeInTheDocument()
    })
  })
})
