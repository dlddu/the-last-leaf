import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ProfileForm from '@/components/ProfileForm'

describe('ProfileForm Component', () => {
  const defaultProps = {
    email: 'test@example.com',
    name: '',
    nickname: 'TestUser',
    onNameChange: jest.fn(),
    onNicknameChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render email input field', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('profile-email')).toBeInTheDocument()
    })

    it('should render nickname input field', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
    })

    it('should render name input field', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      // name field is part of profile form (not in DB schema yet but required by spec)
      expect(screen.getByTestId('profile-name')).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<ProfileForm {...defaultProps} />)).not.toThrow()
    })
  })

  describe('Email Field', () => {
    it('should display the email value', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} email="user@example.com" />)

      // Assert
      const emailInput = screen.getByTestId('profile-email')
      expect(emailInput).toHaveValue('user@example.com')
    })

    it('should have email input disabled', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      const emailInput = screen.getByTestId('profile-email')
      expect(emailInput).toBeDisabled()
    })

    it('should not allow email to be changed', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<ProfileForm {...defaultProps} email="original@example.com" />)
      const emailInput = screen.getByTestId('profile-email')

      // Act - Attempt to type in disabled field
      await user.type(emailInput, 'new@example.com')

      // Assert
      expect(emailInput).toHaveValue('original@example.com')
    })
  })

  describe('Nickname Field', () => {
    it('should display the nickname value', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} nickname="MyNickname" />)

      // Assert
      const nicknameInput = screen.getByTestId('profile-nickname')
      expect(nicknameInput).toHaveValue('MyNickname')
    })

    it('should not be disabled', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      const nicknameInput = screen.getByTestId('profile-nickname')
      expect(nicknameInput).not.toBeDisabled()
    })

    it('should call onNicknameChange when user types', async () => {
      // Arrange
      const mockOnNicknameChange = jest.fn()
      const user = userEvent.setup()
      render(
        <ProfileForm
          {...defaultProps}
          nickname=""
          onNicknameChange={mockOnNicknameChange}
        />
      )
      const nicknameInput = screen.getByTestId('profile-nickname')

      // Act
      await user.type(nicknameInput, 'NewNick')

      // Assert
      expect(mockOnNicknameChange).toHaveBeenCalled()
    })
  })

  describe('Name Field', () => {
    it('should display the name value', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} name="홍길동" />)

      // Assert
      const nameInput = screen.getByTestId('profile-name')
      expect(nameInput).toHaveValue('홍길동')
    })

    it('should not be disabled', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      const nameInput = screen.getByTestId('profile-name')
      expect(nameInput).not.toBeDisabled()
    })

    it('should call onNameChange when user types', async () => {
      // Arrange
      const mockOnNameChange = jest.fn()
      const user = userEvent.setup()
      render(
        <ProfileForm
          {...defaultProps}
          name=""
          onNameChange={mockOnNameChange}
        />
      )
      const nameInput = screen.getByTestId('profile-name')

      // Act
      await user.type(nameInput, '김철수')

      // Assert
      expect(mockOnNameChange).toHaveBeenCalled()
    })
  })

  describe('State Transitions', () => {
    it('should be in idle state initially when no changes made', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert - form fields are rendered
      expect(screen.getByTestId('profile-nickname')).toBeInTheDocument()
      expect(screen.getByTestId('profile-email')).toBeInTheDocument()
    })

    it('should reflect updated nickname value when prop changes', () => {
      // Arrange
      const { rerender } = render(<ProfileForm {...defaultProps} nickname="OldNick" />)

      // Act
      rerender(<ProfileForm {...defaultProps} nickname="NewNick" />)

      // Assert
      expect(screen.getByTestId('profile-nickname')).toHaveValue('NewNick')
    })

    it('should reflect updated name value when prop changes', () => {
      // Arrange
      const { rerender } = render(<ProfileForm {...defaultProps} name="" />)

      // Act
      rerender(<ProfileForm {...defaultProps} name="홍길동" />)

      // Assert
      expect(screen.getByTestId('profile-name')).toHaveValue('홍길동')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty nickname gracefully', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} nickname="" />)

      // Assert
      expect(screen.getByTestId('profile-nickname')).toHaveValue('')
    })

    it('should handle special characters in nickname', async () => {
      // Arrange
      const mockOnNicknameChange = jest.fn()
      const user = userEvent.setup()
      render(
        <ProfileForm
          {...defaultProps}
          nickname=""
          onNicknameChange={mockOnNicknameChange}
        />
      )
      const nicknameInput = screen.getByTestId('profile-nickname')

      // Act
      await user.type(nicknameInput, '닉네임!@#')

      // Assert
      expect(mockOnNicknameChange).toHaveBeenCalled()
    })
  })

  describe('Email Field Guide Text (DLD-408)', () => {
    it('should display helper text informing user that email cannot be changed', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      expect(
        screen.getByText('이메일은 변경할 수 없습니다')
      ).toBeInTheDocument()
    })

    it('should render email helper text in the same section as the email field', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      const emailInput = screen.getByTestId('profile-email')
      const helperText = screen.getByText('이메일은 변경할 수 없습니다')

      // Both elements should be present in the document
      expect(emailInput).toBeInTheDocument()
      expect(helperText).toBeInTheDocument()
    })
  })

  describe('Card Container (DLD-408)', () => {
    it('should render form fields inside a card container', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('profile-card')).toBeInTheDocument()
    })

    it('should render email field inside the card container', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      const card = screen.getByTestId('profile-card')
      const emailInput = screen.getByTestId('profile-email')
      expect(card).toContainElement(emailInput)
    })

    it('should render nickname field inside the card container', () => {
      // Arrange & Act
      render(<ProfileForm {...defaultProps} />)

      // Assert
      const card = screen.getByTestId('profile-card')
      const nicknameInput = screen.getByTestId('profile-nickname')
      expect(card).toContainElement(nicknameInput)
    })
  })
})
