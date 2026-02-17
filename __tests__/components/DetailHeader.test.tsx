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

import DetailHeader from '@/components/DetailHeader'

describe('DetailHeader Component', () => {
  const defaultProps = {
    diaryId: 'diary-test-id',
    onDeleteClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the header element', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should display back button', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('should display edit icon button', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const editButton = screen.getByRole('button', { name: /수정|edit/i })
      expect(editButton).toBeInTheDocument()
    })

    it('should display delete icon button', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })
      expect(deleteButton).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<DetailHeader {...defaultProps} />)).not.toThrow()
    })
  })

  describe('Back Button Interaction', () => {
    it('should navigate back when back button is clicked', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockBack = jest.fn()
      useRouter.mockReturnValue({ back: mockBack, push: jest.fn() })

      const user = userEvent.setup()
      render(<DetailHeader {...defaultProps} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      await user.click(backButton)

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should support keyboard navigation for back button', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockBack = jest.fn()
      useRouter.mockReturnValue({ back: mockBack, push: jest.fn() })

      const user = userEvent.setup()
      render(<DetailHeader {...defaultProps} />)
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })

      // Act
      backButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edit Button Interaction', () => {
    it('should navigate to /diary/:id/edit when edit button is clicked', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ back: jest.fn(), push: mockPush })

      const user = userEvent.setup()
      const diaryId = 'diary-test-id'
      render(<DetailHeader diaryId={diaryId} onDeleteClick={jest.fn()} />)
      const editButton = screen.getByRole('button', { name: /수정|edit/i })

      // Act
      await user.click(editButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith(`/diary/${diaryId}/edit`)
    })

    it('should support keyboard activation for edit button', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ back: jest.fn(), push: mockPush })

      const user = userEvent.setup()
      const diaryId = 'diary-edit-id'
      render(<DetailHeader diaryId={diaryId} onDeleteClick={jest.fn()} />)
      const editButton = screen.getByRole('button', { name: /수정|edit/i })

      // Act
      editButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockPush).toHaveBeenCalledWith(`/diary/${diaryId}/edit`)
    })
  })

  describe('Delete Button Interaction', () => {
    it('should call onDeleteClick when delete button is clicked', async () => {
      // Arrange
      const mockOnDeleteClick = jest.fn()
      const user = userEvent.setup()
      render(<DetailHeader diaryId="diary-test-id" onDeleteClick={mockOnDeleteClick} />)
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })

      // Act
      await user.click(deleteButton)

      // Assert
      expect(mockOnDeleteClick).toHaveBeenCalledTimes(1)
    })

    it('should support keyboard activation for delete button', async () => {
      // Arrange
      const mockOnDeleteClick = jest.fn()
      const user = userEvent.setup()
      render(<DetailHeader diaryId="diary-test-id" onDeleteClick={mockOnDeleteClick} />)
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })

      // Act
      deleteButton.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnDeleteClick).toHaveBeenCalledTimes(1)
    })

    it('should open delete modal when delete button is clicked', async () => {
      // Arrange
      const mockOnDeleteClick = jest.fn()
      const user = userEvent.setup()
      render(<DetailHeader diaryId="diary-test-id" onDeleteClick={mockOnDeleteClick} />)
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })

      // Act
      await user.click(deleteButton)

      // Assert - onDeleteClick is the handler to trigger modal
      expect(mockOnDeleteClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on all buttons', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const backButton = screen.getByRole('button', { name: /뒤로|back/i })
      const editButton = screen.getByRole('button', { name: /수정|edit/i })
      const deleteButton = screen.getByRole('button', { name: /삭제|delete/i })

      expect(backButton).toHaveAccessibleName()
      expect(editButton).toHaveAccessibleName()
      expect(deleteButton).toHaveAccessibleName()
    })

    it('should have banner landmark role', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      // Arrange & Act
      render(<DetailHeader {...defaultProps} />)

      // Assert
      const buttons = screen.getAllByRole('button')
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabIndex', '-1')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should pass diaryId correctly to edit navigation', async () => {
      // Arrange
      const { useRouter } = require('next/navigation')
      const mockPush = jest.fn()
      useRouter.mockReturnValue({ back: jest.fn(), push: mockPush })

      const user = userEvent.setup()
      const specialDiaryId = 'clx1y2z3a4b5c6d7e8f9g0h1'
      render(<DetailHeader diaryId={specialDiaryId} onDeleteClick={jest.fn()} />)
      const editButton = screen.getByRole('button', { name: /수정|edit/i })

      // Act
      await user.click(editButton)

      // Assert
      expect(mockPush).toHaveBeenCalledWith(`/diary/${specialDiaryId}/edit`)
    })

    it('should unmount gracefully', () => {
      // Arrange
      const { unmount } = render(<DetailHeader {...defaultProps} />)

      // Act & Assert
      expect(() => unmount()).not.toThrow()
    })
  })
})
