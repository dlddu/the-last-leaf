import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

import ContactsPage from '@/app/settings/contacts/page'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockContactsData = {
  contacts: [
    {
      contact_id: 'contact-1',
      user_id: 'test-user-id',
      email: 'alice@example.com',
      phone: '010-1111-2222',
    },
    {
      contact_id: 'contact-2',
      user_id: 'test-user-id',
      email: 'bob@example.com',
      phone: '010-3333-4444',
    },
  ],
}

const emptyContactsData = { contacts: [] }

function mockGetSuccess(contacts = mockContactsData) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => contacts,
  })
}

function mockPutSuccess(contacts = mockContactsData) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => contacts,
  })
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('Settings Contacts Flow - Integration Test', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  // -------------------------------------------------------------------------
  // Initial Load (loading → loaded / empty)
  // -------------------------------------------------------------------------

  describe('Initial Load', () => {
    it('should fetch contacts from GET /api/user/contacts on mount', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/contacts',
          expect.objectContaining({ method: 'GET' })
        )
      })
    })

    it('should display page title "연락처 관리"', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/연락처 관리/i)).toBeInTheDocument()
      })
    })

    it('should render ContactCards for each loaded contact', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        const cards = screen.getAllByTestId('contact-card')
        expect(cards).toHaveLength(2)
      })
    })

    it('should pre-fill email and phone inputs with loaded contact data', async () => {
      // Arrange
      mockGetSuccess()

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByDisplayValue('alice@example.com')).toBeInTheDocument()
        expect(screen.getByDisplayValue('010-1111-2222')).toBeInTheDocument()
      })
    })
  })

  // -------------------------------------------------------------------------
  // Empty State
  // -------------------------------------------------------------------------

  describe('Empty State', () => {
    it('should display empty state guidance text when user has no contacts', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/연락처가 없습니다|등록된 연락처|아직 연락처/i)
        ).toBeInTheDocument()
      })
    })

    it('should display AddContactPlaceholder when contact list is empty', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })
    })

    it('should not render any ContactCard when contact list is empty', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        expect(screen.queryAllByTestId('contact-card')).toHaveLength(0)
      })
    })
  })

  // -------------------------------------------------------------------------
  // AddContactPlaceholder
  // -------------------------------------------------------------------------

  describe('AddContactPlaceholder', () => {
    it('should add a blank ContactCard when AddContactPlaceholder is clicked', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      await user.click(screen.getByTestId('add-contact-button'))

      // Assert
      const cards = screen.getAllByTestId('contact-card')
      expect(cards).toHaveLength(1)
    })

    it('should render new ContactCard with empty email and phone inputs', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      await user.click(screen.getByTestId('add-contact-button'))

      // Assert
      const card = screen.getByTestId('contact-card')
      const emailInput = within(card).getByTestId('contact-email')
      const phoneInput = within(card).getByTestId('contact-phone')

      expect(emailInput).toHaveValue('')
      expect(phoneInput).toHaveValue('')
    })

    it('should add multiple ContactCards on multiple clicks', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      await user.click(screen.getByTestId('add-contact-button'))
      await user.click(screen.getByTestId('add-contact-button'))
      await user.click(screen.getByTestId('add-contact-button'))

      // Assert
      expect(screen.getAllByTestId('contact-card')).toHaveLength(3)
    })

    it('should display ContactCard label as "연락처 N"', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      await user.click(screen.getByTestId('add-contact-button'))

      // Assert
      expect(screen.getByText(/연락처\s*1/i)).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // ContactCard — Delete
  // -------------------------------------------------------------------------

  describe('ContactCard Delete', () => {
    it('should remove the ContactCard from the list when delete button is clicked', async () => {
      // Arrange
      mockGetSuccess()
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getAllByTestId('contact-card')).toHaveLength(2)
      })

      // Act
      const firstCard = screen.getAllByTestId('contact-card')[0]
      await user.click(within(firstCard).getByTestId('contact-delete-button'))

      // Assert
      expect(screen.getAllByTestId('contact-card')).toHaveLength(1)
    })

    it('should show empty state after deleting the last ContactCard', async () => {
      // Arrange
      mockGetSuccess({ contacts: [mockContactsData.contacts[0]] })
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getAllByTestId('contact-card')).toHaveLength(1)
      })

      // Act
      const card = screen.getByTestId('contact-card')
      await user.click(within(card).getByTestId('contact-delete-button'))

      // Assert
      expect(screen.queryAllByTestId('contact-card')).toHaveLength(0)
      expect(
        screen.getByText(/연락처가 없습니다|등록된 연락처|아직 연락처/i)
      ).toBeInTheDocument()
    })

    it('should keep remaining cards intact after deleting one', async () => {
      // Arrange
      mockGetSuccess()
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getAllByTestId('contact-card')).toHaveLength(2)
      })

      // Act — delete the first card
      const firstCard = screen.getAllByTestId('contact-card')[0]
      await user.click(within(firstCard).getByTestId('contact-delete-button'))

      // Assert — second card (bob) is still present
      expect(screen.getAllByTestId('contact-card')).toHaveLength(1)
      expect(screen.getByDisplayValue('bob@example.com')).toBeInTheDocument()
    })
  })

  // -------------------------------------------------------------------------
  // Saving State
  // -------------------------------------------------------------------------

  describe('Saving State', () => {
    it('should send PUT request to /api/user/contacts when save button is clicked', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      mockPutSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('add-contact-button'))

      const card = screen.getByTestId('contact-card')
      await user.type(within(card).getByTestId('contact-email'), 'new@example.com')
      await user.type(within(card).getByTestId('contact-phone'), '010-5555-6666')

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/user/contacts',
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('new@example.com'),
          })
        )
      })
    })

    it('should send the full contacts array in the PUT request body', async () => {
      // Arrange
      mockGetSuccess()
      mockPutSuccess()
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getAllByTestId('contact-card')).toHaveLength(2)
      })

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        const putCall = (global.fetch as jest.Mock).mock.calls.find(
          (call) => call[1]?.method === 'PUT'
        )
        expect(putCall).toBeDefined()
        const body = JSON.parse(putCall[1].body)
        expect(body).toHaveProperty('contacts')
        expect(Array.isArray(body.contacts)).toBe(true)
        expect(body.contacts).toHaveLength(2)
      })
    })

    it('should disable save button while saving', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => emptyContactsData,
                }),
              200
            )
          )
      )

      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert — button is disabled immediately after click
      expect(saveButton).toBeDisabled()
    })
  })

  // -------------------------------------------------------------------------
  // Success State
  // -------------------------------------------------------------------------

  describe('Success State', () => {
    it('should show success toast after successful save', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      mockPutSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/저장되었습니다|변경되었습니다|saved|updated/i)
        ).toBeInTheDocument()
      })
    })

    it('should re-enable save button after successful save', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      mockPutSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })
  })

  // -------------------------------------------------------------------------
  // Error State
  // -------------------------------------------------------------------------

  describe('Error State', () => {
    it('should show error message when initial contacts load fails', async () => {
      // Arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      // Act
      render(<ContactsPage />)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })

    it('should show error message when save fails', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })

    it('should re-enable save button after save error', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled()
      })
    })

    it('should handle network error gracefully when saving', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/오류|error|실패|failed/i)
        ).toBeInTheDocument()
      })
    })
  })

  // -------------------------------------------------------------------------
  // Back Navigation
  // -------------------------------------------------------------------------

  describe('Back Navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)
      const user = userEvent.setup()

      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /뒤로|back/i })).toBeInTheDocument()
      })

      // Act
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      await user.click(backButton)

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  // -------------------------------------------------------------------------
  // Full Flow
  // -------------------------------------------------------------------------

  describe('Full Contacts Edit Flow', () => {
    it('should complete: load → add card → fill fields → save → success toast', async () => {
      // Arrange
      mockGetSuccess(emptyContactsData)

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: [{ contact_id: 'new-1', user_id: 'test-user-id', email: 'full@example.com', phone: '010-7777-8888' }],
        }),
      })

      const user = userEvent.setup()

      // Act — Step 1: Render and wait for empty state
      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('add-contact-button')).toBeInTheDocument()
      })

      // Act — Step 2: Add a new contact card
      await user.click(screen.getByTestId('add-contact-button'))

      const card = screen.getByTestId('contact-card')
      await user.type(within(card).getByTestId('contact-email'), 'full@example.com')
      await user.type(within(card).getByTestId('contact-phone'), '010-7777-8888')

      // Act — Step 3: Save
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert — Step 4: Success toast appears
      await waitFor(() => {
        expect(
          screen.getByText(/저장되었습니다|변경되었습니다|saved|updated/i)
        ).toBeInTheDocument()
      })

      // Assert — PUT request was made with the new contact data
      const putCall = (global.fetch as jest.Mock).mock.calls.find(
        (call) => call[1]?.method === 'PUT'
      )
      expect(putCall).toBeDefined()
      expect(putCall[1].body).toContain('full@example.com')
    })

    it('should complete: load → delete card → save → empty state shown', async () => {
      // Arrange
      mockGetSuccess({ contacts: [mockContactsData.contacts[0]] })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyContactsData,
      })

      const user = userEvent.setup()

      // Act — Step 1: Render and wait for loaded card
      render(<ContactsPage />)

      await waitFor(() => {
        expect(screen.getAllByTestId('contact-card')).toHaveLength(1)
      })

      // Act — Step 2: Delete the card
      const card = screen.getByTestId('contact-card')
      await user.click(within(card).getByTestId('contact-delete-button'))

      expect(screen.queryAllByTestId('contact-card')).toHaveLength(0)

      // Act — Step 3: Save
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      await user.click(saveButton)

      // Assert — Success toast
      await waitFor(() => {
        expect(
          screen.getByText(/저장되었습니다|변경되었습니다|saved|updated/i)
        ).toBeInTheDocument()
      })

      // Assert — empty state guidance visible
      expect(
        screen.getByText(/연락처가 없습니다|등록된 연락처|아직 연락처/i)
      ).toBeInTheDocument()
    })
  })
})
