import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}))

import BackHeader from '@/components/BackHeader'

describe('BackHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render header element', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should display title text', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)

      // Assert
      expect(screen.getByText('프로필 관리')).toBeInTheDocument()
    })

    it('should display back button', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)

      // Assert
      expect(screen.getByRole('button', { name: /뒤로|back/i })).toBeInTheDocument()
    })

    it('should display save button', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)

      // Assert
      expect(screen.getByRole('button', { name: /저장|save/i })).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)).not.toThrow()
    })
  })

  describe('Back Button', () => {
    it('should call router.back() when back button clicked and no onBack provided', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockBack = jest.fn()
      useRouter.mockReturnValue({ back: mockBack, push: jest.fn() })

      const user = userEvent.setup()
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.click(backButton)

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should call custom onBack handler when provided', async () => {
      // Arrange
      const mockOnBack = jest.fn()
      const user = userEvent.setup()
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} onBack={mockOnBack} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.click(backButton)

      // Assert
      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    it('should support keyboard navigation for back button', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockBack = jest.fn()
      useRouter.mockReturnValue({ back: mockBack, push: jest.fn() })

      const user = userEvent.setup()
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      backButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Save Button', () => {
    it('should call onSave when save button clicked', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<BackHeader title="프로필 관리" onSave={mockOnSave} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.click(saveButton)

      // Assert
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })

    it('should disable save button when isSaving is true', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} isSaving={true} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).toBeDisabled()
    })

    it('should enable save button when isSaving is false', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} isSaving={false} />)

      // Assert
      const saveButton = screen.getByRole('button', { name: /저장|save/i })
      expect(saveButton).not.toBeDisabled()
    })

    it('should not call onSave when button is disabled', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<BackHeader title="프로필 관리" onSave={mockOnSave} isSaving={true} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      await user.click(saveButton)

      // Assert
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should support keyboard activation for save button', async () => {
      // Arrange
      const mockOnSave = jest.fn()
      const user = userEvent.setup()
      render(<BackHeader title="프로필 관리" onSave={mockOnSave} />)
      const saveButton = screen.getByRole('button', { name: /저장|save/i })

      // Act
      saveButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have banner landmark role', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should have accessible names on buttons', () => {
      // Arrange & Act
      render(<BackHeader title="프로필 관리" onSave={jest.fn()} />)

      // Assert
      expect(screen.getByRole('button', { name: /뒤로|back/i })).toHaveAccessibleName()
      expect(screen.getByRole('button', { name: /저장|save/i })).toHaveAccessibleName()
    })
  })
})
