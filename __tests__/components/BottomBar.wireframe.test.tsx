import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import BottomBar from '@/components/BottomBar'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - footer: border-gray-200 → border-gray-100
 * - 내부 컨테이너: max-w-2xl mx-auto 제거 → 전체 너비 (px-5 py-3로 변경)
 * - 글자 수: "N 글자" → "N자" (단위 변경)
 * - 저장 상태: 상태별 다색 텍스트 → "자동 저장됨" text-xs text-gray-400 단일 표시
 *
 * 기존 BottomBar.test.tsx 가 검증하는 항목(role="contentinfo", data-testid 존재,
 * aria-live, fixed positioning, w-full, z- 클래스, 기능 동작, 접근성)은
 * 중복 작성하지 않는다.
 */
describe('BottomBar — 와이어프레임 스타일 스펙', () => {
  describe('footer 테두리 색상', () => {
    it('should use border-gray-100 (not border-gray-200) on the footer', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).toMatch(/border-gray-100/)
    })

    it('should not use the old border-gray-200 on the footer', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).not.toMatch(/border-gray-200/)
    })
  })

  describe('내부 컨테이너 레이아웃 — 전체 너비', () => {
    it('should apply px-5 to the inner container', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert — 내부 컨테이너가 px-5 수평 패딩을 가져야 한다
      const footer = screen.getByRole('contentinfo')
      const innerContainer = footer.firstElementChild as HTMLElement
      expect(innerContainer.className).toMatch(/px-5/)
    })

    it('should apply py-3 to the inner container', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const footer = screen.getByRole('contentinfo')
      const innerContainer = footer.firstElementChild as HTMLElement
      expect(innerContainer.className).toMatch(/py-3/)
    })

    it('should not use max-w-2xl on the inner container', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert — max-w-2xl 는 전체 너비 레이아웃으로 변경되므로 제거되어야 한다
      const footer = screen.getByRole('contentinfo')
      const innerContainer = footer.firstElementChild as HTMLElement
      expect(innerContainer.className).not.toMatch(/max-w-2xl/)
    })

    it('should not use mx-auto on the inner container', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert — mx-auto 는 max-w 제거와 함께 삭제되어야 한다
      const footer = screen.getByRole('contentinfo')
      const innerContainer = footer.firstElementChild as HTMLElement
      expect(innerContainer.className).not.toMatch(/mx-auto/)
    })
  })

  describe('글자 수 단위 — "N자" 형식', () => {
    it('should display character count with "자" unit (not "글자")', () => {
      // Arrange & Act
      render(<BottomBar characterCount={42} saveStatus="idle" />)

      // Assert — "N자" 형식이어야 한다 (기존 "N 글자" 에서 변경)
      const charCount = screen.getByTestId('char-count')
      expect(charCount.textContent).toMatch(/자$/)
    })

    it('should not use the old "글자" unit suffix', () => {
      // Arrange & Act
      render(<BottomBar characterCount={42} saveStatus="idle" />)

      // Assert — "글자" 단위는 "자" 로 교체되어야 한다
      const charCount = screen.getByTestId('char-count')
      expect(charCount.textContent).not.toMatch(/글자/)
    })

    it('should display "0자" when character count is zero', () => {
      // Arrange & Act
      render(<BottomBar characterCount={0} saveStatus="idle" />)

      // Assert
      const charCount = screen.getByTestId('char-count')
      expect(charCount.textContent).toMatch(/0자/)
    })

    it('should display formatted count followed by "자" for large numbers', () => {
      // Arrange & Act
      render(<BottomBar characterCount={1000} saveStatus="idle" />)

      // Assert — 천 단위 구분자 포함 "N자" 형식
      const charCount = screen.getByTestId('char-count')
      expect(charCount.textContent).toMatch(/1[,.]?000자/)
    })
  })

  describe('저장 상태 — 단일 "자동 저장됨" 텍스트', () => {
    it('should display "자동 저장됨" as the save status text', () => {
      // Arrange & Act — 모든 상태에서 동일한 "자동 저장됨" 텍스트를 표시해야 한다
      render(<BottomBar characterCount={10} saveStatus="saved" />)

      // Assert
      const saveStatus = screen.getByTestId('save-status')
      expect(saveStatus.textContent).toMatch(/자동 저장됨/)
    })

    it('should apply text-xs to the save status element', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saved" />)

      // Assert
      const saveStatus = screen.getByTestId('save-status')
      expect(saveStatus.className).toMatch(/text-xs/)
    })

    it('should apply text-gray-400 to the save status element', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saved" />)

      // Assert
      const saveStatus = screen.getByTestId('save-status')
      expect(saveStatus.className).toMatch(/text-gray-400/)
    })

    it('should not use status-dependent color classes on the save status element', () => {
      // Arrange & Act — 모든 상태에서 단일 색상(text-gray-400)만 사용해야 한다
      render(<BottomBar characterCount={10} saveStatus="error" />)

      // Assert — 상태별 다색 클래스(text-red-600, text-green-600 등)가 없어야 한다
      const saveStatus = screen.getByTestId('save-status')
      expect(saveStatus.className).not.toMatch(/text-red-600/)
      expect(saveStatus.className).not.toMatch(/text-green-600/)
      expect(saveStatus.className).not.toMatch(/text-indigo-600/)
      expect(saveStatus.className).not.toMatch(/text-orange-600/)
    })

    it('should not use text-sm on the save status element (replaced by text-xs)', () => {
      // Arrange & Act
      render(<BottomBar characterCount={10} saveStatus="saved" />)

      // Assert — text-sm 은 text-xs 로 교체되어야 한다
      const saveStatus = screen.getByTestId('save-status')
      expect(saveStatus.className).not.toMatch(/\btext-sm\b/)
    })
  })
})
