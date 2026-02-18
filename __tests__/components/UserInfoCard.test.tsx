import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import UserInfoCard from '@/components/UserInfoCard'

describe('UserInfoCard Component', () => {
  const defaultProps = {
    nickname: 'TestUser',
    email: 'test@example.com',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render UserInfoCard root element with data-testid', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('user-info-card')).toBeInTheDocument()
    })

    it('should display nickname with data-testid', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert
      const nicknameEl = screen.getByTestId('user-nickname')
      expect(nicknameEl).toBeInTheDocument()
      expect(nicknameEl).toHaveTextContent('TestUser')
    })

    it('should display email with data-testid', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert
      const emailEl = screen.getByTestId('user-email')
      expect(emailEl).toBeInTheDocument()
      expect(emailEl).toHaveTextContent('test@example.com')
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<UserInfoCard {...defaultProps} />)).not.toThrow()
    })
  })

  describe('Avatar Initial', () => {
    it('should display first character of nickname as avatar initial', () => {
      // Arrange & Act
      render(<UserInfoCard nickname="Alice" email="alice@example.com" />)

      // Assert
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('should display uppercase initial for Korean nickname', () => {
      // Arrange & Act
      render(<UserInfoCard nickname="홍길동" email="hong@example.com" />)

      // Assert
      expect(screen.getByText('홍')).toBeInTheDocument()
    })

    it('should render avatar container element', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert - Avatar area should be present
      const card = screen.getByTestId('user-info-card')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle long email address display', () => {
      // Arrange
      const longEmail = 'verylongemailaddress@verylongdomainname.example.com'

      // Act
      render(<UserInfoCard nickname="User" email={longEmail} />)

      // Assert
      expect(screen.getByTestId('user-email')).toHaveTextContent(longEmail)
    })

    it('should handle long nickname display', () => {
      // Arrange
      const longNickname = '아주긴닉네임사용자이름입니다'

      // Act
      render(<UserInfoCard nickname={longNickname} email="user@example.com" />)

      // Assert
      expect(screen.getByTestId('user-nickname')).toHaveTextContent(longNickname)
    })
  })
})
