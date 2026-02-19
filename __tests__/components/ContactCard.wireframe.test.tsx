import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import ContactCard from '@/components/ContactCard'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * - 카드 컨테이너: bg-white rounded-2xl p-5 border border-gray-100
 * - 연락처 레이블: indigo 뱃지 (text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full)
 * - 삭제 버튼: X 아이콘 → "삭제" 텍스트 (text-xs text-red-400 hover:text-red-500)
 * - 인풋 스타일: rounded-xl px-4 py-3 (기존 rounded-lg px-3 py-2 에서 변경)
 * - 포커스 링: ring-indigo-500 (기존 ring-indigo-600 또는 ring-blue-500 에서 변경)
 *
 * 기존 settings-contacts.test.tsx 가 검증하는 항목(data-testid 존재, 기능 동작,
 * 입력값 변경, 삭제 동작, 접근성)은 중복 작성하지 않는다.
 */
describe('ContactCard — 와이어프레임 스타일 스펙', () => {
  const defaultProps = {
    index: 0,
    contact: { email: 'test@example.com', phone: '010-1234-5678' },
    onChange: jest.fn(),
    onDelete: jest.fn(),
  }

  describe('카드 컨테이너 스타일', () => {
    it('should apply rounded-2xl to the card container', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const card = screen.getByTestId('contact-card')
      expect(card.className).toMatch(/rounded-2xl/)
    })

    it('should not use the old rounded-xl on the card container', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 rounded-xl 은 rounded-2xl 로 교체되어야 한다
      const card = screen.getByTestId('contact-card')
      expect(card.className).not.toMatch(/\brounded-xl\b/)
    })

    it('should apply p-5 padding to the card container', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const card = screen.getByTestId('contact-card')
      expect(card.className).toMatch(/\bp-5\b/)
    })

    it('should not use the old p-4 padding on the card container', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 p-4 는 p-5 로 교체되어야 한다
      const card = screen.getByTestId('contact-card')
      expect(card.className).not.toMatch(/\bp-4\b/)
    })

    it('should use border-gray-100 (lighter border) on the card container', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const card = screen.getByTestId('contact-card')
      expect(card.className).toMatch(/border-gray-100/)
    })

    it('should not use the old border-gray-200 on the card container', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 border-gray-200 은 border-gray-100 으로 교체되어야 한다
      const card = screen.getByTestId('contact-card')
      expect(card.className).not.toMatch(/border-gray-200/)
    })

    it('should have white background (bg-white) on the card container', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const card = screen.getByTestId('contact-card')
      expect(card.className).toMatch(/bg-white/)
    })
  })

  describe('연락처 레이블 — indigo 뱃지 스타일', () => {
    it('should apply text-indigo-600 to the contact label', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).toMatch(/text-indigo-600/)
    })

    it('should apply bg-indigo-50 to the contact label', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).toMatch(/bg-indigo-50/)
    })

    it('should apply rounded-full to the contact label (badge shape)', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).toMatch(/rounded-full/)
    })

    it('should apply text-xs to the contact label', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).toMatch(/text-xs/)
    })

    it('should apply font-medium to the contact label', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).toMatch(/font-medium/)
    })

    it('should apply px-2 to the contact label', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).toMatch(/\bpx-2\b/)
    })

    it('should apply py-1 to the contact label', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).toMatch(/\bpy-1\b/)
    })

    it('should not use old gray text color on the contact label', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 text-gray-600 은 indigo 뱃지로 교체되어야 한다
      const label = screen.getByText(/연락처\s*1/i)
      expect(label.className).not.toMatch(/text-gray-600/)
    })

    it('should display correct label number for second contact (index=1)', () => {
      // Arrange & Act
      render(
        <ContactCard
          {...defaultProps}
          index={1}
        />
      )

      // Assert
      expect(screen.getByText(/연락처\s*2/i)).toBeInTheDocument()
    })
  })

  describe('삭제 버튼 — "삭제" 텍스트 스타일', () => {
    it('should display "삭제" text on the delete button', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — X 아이콘 대신 "삭제" 텍스트를 표시해야 한다
      const deleteButton = screen.getByTestId('contact-delete-button')
      expect(deleteButton.textContent).toMatch(/삭제/)
    })

    it('should apply text-xs to the delete button', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const deleteButton = screen.getByTestId('contact-delete-button')
      expect(deleteButton.className).toMatch(/text-xs/)
    })

    it('should apply text-red-400 to the delete button', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const deleteButton = screen.getByTestId('contact-delete-button')
      expect(deleteButton.className).toMatch(/text-red-400/)
    })

    it('should apply hover:text-red-500 to the delete button', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const deleteButton = screen.getByTestId('contact-delete-button')
      expect(deleteButton.className).toMatch(/hover:text-red-500/)
    })

    it('should not render an SVG X icon inside the delete button', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — X 아이콘(M6 18L18 6 경로)이 제거되어야 한다
      const deleteButton = screen.getByTestId('contact-delete-button')
      const svg = deleteButton.querySelector('svg')
      // SVG가 없거나, 있더라도 X 아이콘 경로(M6 18L18 6)가 없어야 한다
      if (svg) {
        const paths = svg.querySelectorAll('path')
        const hasXIconPath = Array.from(paths).some((path) =>
          (path.getAttribute('d') ?? '').includes('M6 18L18 6')
        )
        expect(hasXIconPath).toBe(false)
      } else {
        expect(svg).toBeNull()
      }
    })
  })

  describe('이메일 인풋 스타일', () => {
    it('should apply rounded-xl to the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).toMatch(/rounded-xl/)
    })

    it('should not use the old rounded-lg on the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 rounded-lg 는 rounded-xl 로 교체되어야 한다
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).not.toMatch(/\brounded-lg\b/)
    })

    it('should apply px-4 to the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).toMatch(/\bpx-4\b/)
    })

    it('should not use the old px-3 on the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 px-3 은 px-4 로 교체되어야 한다
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).not.toMatch(/\bpx-3\b/)
    })

    it('should apply py-3 to the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).toMatch(/\bpy-3\b/)
    })

    it('should not use the old py-2 on the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 py-2 는 py-3 로 교체되어야 한다
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).not.toMatch(/\bpy-2\b/)
    })

    it('should apply focus:ring-indigo-500 to the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).toMatch(/focus:ring-indigo-500/)
    })

    it('should not use the old focus:ring-indigo-600 on the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 ring-indigo-600 은 ring-indigo-500 으로 교체되어야 한다
      const emailInput = screen.getByTestId('contact-email')
      expect(emailInput.className).not.toMatch(/focus:ring-indigo-600/)
    })
  })

  describe('전화번호 인풋 스타일', () => {
    it('should apply rounded-xl to the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).toMatch(/rounded-xl/)
    })

    it('should not use the old rounded-lg on the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 rounded-lg 는 rounded-xl 로 교체되어야 한다
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).not.toMatch(/\brounded-lg\b/)
    })

    it('should apply px-4 to the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).toMatch(/\bpx-4\b/)
    })

    it('should not use the old px-3 on the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 px-3 은 px-4 로 교체되어야 한다
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).not.toMatch(/\bpx-3\b/)
    })

    it('should apply py-3 to the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).toMatch(/\bpy-3\b/)
    })

    it('should not use the old py-2 on the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 py-2 는 py-3 로 교체되어야 한다
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).not.toMatch(/\bpy-2\b/)
    })

    it('should apply focus:ring-indigo-500 to the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).toMatch(/focus:ring-indigo-500/)
    })

    it('should not use the old focus:ring-indigo-600 on the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 ring-indigo-600 은 ring-indigo-500 으로 교체되어야 한다
      const phoneInput = screen.getByTestId('contact-phone')
      expect(phoneInput.className).not.toMatch(/focus:ring-indigo-600/)
    })
  })

  describe('data-testid 유지 확인', () => {
    it('should retain data-testid="contact-card" on the root element', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert — 기존 통합 테스트가 의존하는 testid가 유지되어야 한다
      expect(screen.getByTestId('contact-card')).toBeInTheDocument()
    })

    it('should retain data-testid="contact-delete-button" on the delete button', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('contact-delete-button')).toBeInTheDocument()
    })

    it('should retain data-testid="contact-email" on the email input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('contact-email')).toBeInTheDocument()
    })

    it('should retain data-testid="contact-phone" on the phone input', () => {
      // Arrange & Act
      render(<ContactCard {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('contact-phone')).toBeInTheDocument()
    })
  })
})
