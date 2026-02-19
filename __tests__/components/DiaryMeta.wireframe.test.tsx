import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import DiaryMeta from '@/components/DiaryMeta'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - 날짜: h2 태그로 변경 (text-lg font-semibold text-gray-900)
 * - 시간: 별도 span 요소 (text-xs text-gray-400), '오후 HH:MM 작성' 형식
 * - 날짜와 시간을 별도 요소로 분리 표시 (기존: 하나의 p 태그 안에 합산)
 * - 날짜 포맷에 요일 포함 (예: '2026년 2월 13일 목요일')
 * - data-testid="diary-detail-date" 유지 (diary-detail-date 컨테이너에 위치)
 *
 * 기존 DiaryMeta.test.tsx 가 검증하는 항목(data-testid 존재, 날짜/시간 텍스트 포함,
 * 한국어 포맷, 엣지 케이스)은 중복 작성하지 않는다.
 */
describe('DiaryMeta — 와이어프레임 스타일 스펙', () => {
  const mockFormattedDate = '2026년 2월 13일 목요일'
  const mockFormattedTime = '오후 3:30 작성'

  describe('날짜 — h2 태그 및 타이포그래피', () => {
    it('should render the date using an h2 element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 날짜는 h2 시맨틱 태그로 렌더링되어야 한다
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
    })

    it('should display formattedDate text inside an h2 element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.textContent).toContain(mockFormattedDate)
    })

    it('should apply text-lg to the date h2 element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.className).toMatch(/text-lg/)
    })

    it('should apply font-semibold to the date h2 element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.className).toMatch(/font-semibold/)
    })

    it('should apply text-gray-900 to the date h2 element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.className).toMatch(/text-gray-900/)
    })

    it('should not use text-sm on the date element (old style)', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 기존 text-sm 은 날짜 요소에서 제거되어야 한다
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.className).not.toMatch(/\btext-sm\b/)
    })

    it('should not use text-gray-500 on the date element (old style)', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 기존 text-gray-500 은 날짜 요소에서 제거되어야 한다
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.className).not.toMatch(/text-gray-500/)
    })
  })

  describe('시간 — 별도 span 요소 및 타이포그래피', () => {
    it('should render formattedTime in a separate element from formattedDate', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 날짜(h2)와 시간이 별도의 DOM 요소이어야 한다
      const heading = screen.getByRole('heading', { level: 2 })
      // h2 텍스트에 시간이 포함되어 있으면 분리가 안 된 것
      expect(heading.textContent).not.toContain(mockFormattedTime)
    })

    it('should display formattedTime text in the document', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const container = screen.getByTestId('diary-detail-date')
      expect(container.textContent).toContain(mockFormattedTime)
    })

    it('should apply text-xs to the time element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 시간 요소는 text-xs 클래스를 가져야 한다
      const container = screen.getByTestId('diary-detail-date')
      const timeElement = container.querySelector('[class*="text-xs"]') as HTMLElement | null
      expect(timeElement).not.toBeNull()
    })

    it('should apply text-gray-400 to the time element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 시간 요소는 text-gray-400 클래스를 가져야 한다
      const container = screen.getByTestId('diary-detail-date')
      const timeElement = container.querySelector('[class*="text-gray-400"]') as HTMLElement | null
      expect(timeElement).not.toBeNull()
    })

    it('should render the time element as a span tag', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 시간은 span 인라인 요소로 렌더링되어야 한다
      const container = screen.getByTestId('diary-detail-date')
      const span = container.querySelector('span')
      expect(span).not.toBeNull()
      expect(span?.textContent).toContain(mockFormattedTime)
    })

    it('should display "작성" label in the time element', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const container = screen.getByTestId('diary-detail-date')
      const span = container.querySelector('span')
      expect(span?.textContent).toContain('작성')
    })
  })

  describe('날짜 포맷 — 요일 포함', () => {
    it('should display weekday in the formattedDate (요일 포함)', () => {
      // Arrange
      const dateWithWeekday = '2026년 2월 13일 목요일'

      // Act
      render(<DiaryMeta formattedDate={dateWithWeekday} formattedTime={mockFormattedTime} />)

      // Assert — formattedDate prop에 요일이 포함된 경우 h2에 표시되어야 한다
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.textContent).toMatch(/월요일|화요일|수요일|목요일|금요일|토요일|일요일/)
    })

    it('should display "목요일" for Thursday correctly', () => {
      // Arrange
      const thursdayDate = '2026년 2월 13일 목요일'

      // Act
      render(<DiaryMeta formattedDate={thursdayDate} formattedTime={mockFormattedTime} />)

      // Assert
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.textContent).toContain('목요일')
    })

    it('should display full year, month, day, and weekday together', () => {
      // Arrange
      const fullDate = '2026년 2월 13일 목요일'

      // Act
      render(<DiaryMeta formattedDate={fullDate} formattedTime={mockFormattedTime} />)

      // Assert
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading.textContent).toContain('2026')
      expect(heading.textContent).toContain('2월')
      expect(heading.textContent).toContain('13일')
      expect(heading.textContent).toContain('목요일')
    })
  })

  describe('data-testid 유지', () => {
    it('should maintain data-testid="diary-detail-date" on the container', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert — 기존 testid는 컨테이너 수준에서 유지되어야 한다
      const container = screen.getByTestId('diary-detail-date')
      expect(container).toBeInTheDocument()
    })

    it('should include both date and time content under data-testid="diary-detail-date"', () => {
      // Arrange & Act
      render(<DiaryMeta formattedDate={mockFormattedDate} formattedTime={mockFormattedTime} />)

      // Assert
      const container = screen.getByTestId('diary-detail-date')
      expect(container.textContent).toContain(mockFormattedDate)
      expect(container.textContent).toContain(mockFormattedTime)
    })
  })
})
