import '@testing-library/jest-dom'
import { describe, it, expect } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation (must be before component import)
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

import ContactsClient from '@/components/ContactsClient'

/**
 * 와이어프레임 스펙 검증 테스트 (스타일링 리팩토링 Red Phase)
 *
 * 검증 대상:
 * 1. BackHeader: 우측에 "추가" 텍스트 버튼 (text-indigo-600 font-semibold text-sm)
 *    - onSave 대신 연락처 추가 기능으로 연결
 * 2. 안내 문구: text-xs text-gray-500 mb-4 px-1 스타일
 * 3. AddContactPlaceholder: border-2 border-dashed border-gray-200 rounded-2xl py-8
 * 4. 저장 버튼: w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-medium
 *
 * 기존 settings-contacts.test.tsx 가 검증하는 항목(fetch 호출, 데이터 로드,
 * ContactCard 렌더링, 삭제 동작, 저장 동작, 에러 처리, 네비게이션)은
 * 중복 작성하지 않는다.
 */

function mockGetSuccess(contacts = { contacts: [] }) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => contacts,
  })
}

describe('ContactsClient — 와이어프레임 스타일 스펙', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // BackHeader "추가" 버튼
  // ---------------------------------------------------------------------------

  describe('BackHeader 우측 "추가" 버튼', () => {
    function getHeaderAddButton(): HTMLElement {
      const header = document.querySelector('header[role="banner"]')
      if (!header) throw new Error('header[role="banner"] not found')
      const buttons = header.querySelectorAll('button')
      const addBtn = Array.from(buttons).find((btn) => btn.textContent?.trim() === '추가')
      if (!addBtn) throw new Error('"추가" button not found inside header')
      return addBtn
    }

    it('should render an "추가" button in the header', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — "추가" 텍스트 버튼이 헤더 내에 존재해야 한다
      await waitFor(() => {
        expect(getHeaderAddButton()).toBeInTheDocument()
      })
    })

    it('should apply text-indigo-600 to the "추가" header button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const addButton = getHeaderAddButton()
        expect(addButton.className).toMatch(/text-indigo-600/)
      })
    })

    it('should apply font-semibold to the "추가" header button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const addButton = getHeaderAddButton()
        expect(addButton.className).toMatch(/font-semibold/)
      })
    })

    it('should apply text-sm to the "추가" header button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const addButton = getHeaderAddButton()
        expect(addButton.className).toMatch(/text-sm/)
      })
    })

    it('should add a new contact card when the header "추가" button is clicked', async () => {
      // Arrange
      mockGetSuccess()
      const user = userEvent.setup()

      render(<ContactsClient />)

      // Find the "추가" button specifically inside the header
      await waitFor(() => {
        const header = document.querySelector('header[role="banner"]')
        expect(header).not.toBeNull()
        const buttons = header!.querySelectorAll('button')
        const addBtn = Array.from(buttons).find((btn) => btn.textContent?.trim() === '추가')
        expect(addBtn).toBeDefined()
      })

      // Act — click the header "추가" button
      const header = document.querySelector('header[role="banner"]')!
      const buttons = header.querySelectorAll('button')
      const addBtn = Array.from(buttons).find((btn) => btn.textContent?.trim() === '추가')!
      await user.click(addBtn)

      // Assert — 연락처 카드가 추가되어야 한다
      expect(screen.getAllByTestId('contact-card')).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // 안내 문구 스타일
  // ---------------------------------------------------------------------------

  describe('안내 문구 스타일', () => {
    it('should render the guidance text about inactive detection', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/비활성 감지 시 아래 연락처로 자서전 링크가 전송됩니다/i)
        ).toBeInTheDocument()
      })
    })

    it('should apply text-xs to the guidance text element', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const guidance = screen.getByText(
          /비활성 감지 시 아래 연락처로 자서전 링크가 전송됩니다/i
        )
        expect(guidance.className).toMatch(/text-xs/)
      })
    })

    it('should apply text-gray-500 to the guidance text element', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const guidance = screen.getByText(
          /비활성 감지 시 아래 연락처로 자서전 링크가 전송됩니다/i
        )
        expect(guidance.className).toMatch(/text-gray-500/)
      })
    })

    it('should not use text-sm on the guidance text element (replaced by text-xs)', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — 기존 text-sm 은 text-xs 로 교체되어야 한다
      await waitFor(() => {
        const guidance = screen.getByText(
          /비활성 감지 시 아래 연락처로 자서전 링크가 전송됩니다/i
        )
        expect(guidance.className).not.toMatch(/\btext-sm\b/)
      })
    })

    it('should not use text-gray-600 on the guidance text element (replaced by text-gray-500)', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — 기존 text-gray-600 은 text-gray-500 으로 교체되어야 한다
      await waitFor(() => {
        const guidance = screen.getByText(
          /비활성 감지 시 아래 연락처로 자서전 링크가 전송됩니다/i
        )
        expect(guidance.className).not.toMatch(/text-gray-600/)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // AddContactPlaceholder 스타일
  // ---------------------------------------------------------------------------

  describe('AddContactPlaceholder 스타일', () => {
    it('should retain data-testid="add-contact-button" on the placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — 기존 통합 테스트가 의존하는 testid가 유지되어야 한다
      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })
    })

    it('should apply border-2 to the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).toMatch(/border-2/)
      })
    })

    it('should apply border-dashed to the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).toMatch(/border-dashed/)
      })
    })

    it('should apply border-gray-200 to the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).toMatch(/border-gray-200/)
      })
    })

    it('should not use the old border-gray-300 on the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — 기존 border-gray-300 은 border-gray-200 으로 교체되어야 한다
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).not.toMatch(/border-gray-300/)
      })
    })

    it('should apply rounded-2xl to the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).toMatch(/rounded-2xl/)
      })
    })

    it('should not use the old rounded-xl on the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — 기존 rounded-xl 은 rounded-2xl 로 교체되어야 한다
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).not.toMatch(/\brounded-xl\b/)
      })
    })

    it('should apply py-8 to the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).toMatch(/\bpy-8\b/)
      })
    })

    it('should not use the old py-4 on the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — 기존 py-4 는 py-8 로 교체되어야 한다
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.className).not.toMatch(/\bpy-4\b/)
      })
    })

    it('should render "연락처 추가" text inside the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — "연락처 추가" 텍스트가 플레이스홀더 내에 있어야 한다
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        expect(placeholder.textContent).toMatch(/연락처 추가/)
      })
    })

    it('should render a plus icon inside the add-contact placeholder', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — plus 아이콘(SVG 또는 아이콘 요소)이 플레이스홀더 내에 있어야 한다
      await waitFor(() => {
        const placeholder = screen.getByTestId('add-contact-button')
        const svg = placeholder.querySelector('svg')
        expect(svg).not.toBeNull()
      })
    })
  })

  // ---------------------------------------------------------------------------
  // 저장 버튼 스타일
  // ---------------------------------------------------------------------------

  describe('저장 버튼 스타일 (별도 하단 버튼)', () => {
    it('should render a dedicated save button separate from BackHeader', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert — 헤더와 분리된 독립 저장 버튼이 main 영역 내에 있어야 한다
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        const mainEl = document.querySelector('main')
        expect(mainEl).toContainElement(saveButton)
      })
    })

    it('should apply w-full to the save button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        expect(saveButton.className).toMatch(/w-full/)
      })
    })

    it('should apply bg-indigo-600 to the save button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        expect(saveButton.className).toMatch(/bg-indigo-600/)
      })
    })

    it('should apply text-white to the save button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        expect(saveButton.className).toMatch(/text-white/)
      })
    })

    it('should apply py-3 to the save button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        expect(saveButton.className).toMatch(/\bpy-3\b/)
      })
    })

    it('should apply rounded-xl to the save button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        expect(saveButton.className).toMatch(/rounded-xl/)
      })
    })

    it('should apply font-medium to the save button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        expect(saveButton.className).toMatch(/font-medium/)
      })
    })

    it('should apply mt-6 to the save button', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsClient />)

      // Assert
      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: /저장/i })
        expect(saveButton.className).toMatch(/mt-6/)
      })
    })
  })
})
