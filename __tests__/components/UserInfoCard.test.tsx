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

  describe('Avatar Style (리디자인)', () => {
    it('should apply bg-indigo-100 class to avatar container (not bg-indigo-600)', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert - 아바타 배경이 bg-indigo-100이어야 함 (bg-indigo-600이 아님)
      const card = screen.getByTestId('user-info-card')
      const avatarContainer = card.querySelector('[class*="indigo"]')
      expect(avatarContainer).toBeInTheDocument()
      expect(avatarContainer?.className).toMatch(/indigo-100/)
      expect(avatarContainer?.className).not.toMatch(/indigo-600/)
    })

    it('should apply text-indigo-600 class to initial text (not text-white)', () => {
      // Arrange & Act
      render(<UserInfoCard nickname="Alice" email="alice@example.com" />)

      // Assert - 이니셜 텍스트 색상이 text-indigo-600이어야 함 (text-white가 아님)
      const initialEl = screen.getByText('A')
      expect(initialEl.className).toMatch(/indigo-600/)
      expect(initialEl.className).not.toMatch(/text-white/)
    })

    it('should not have text-white class on avatar initial', () => {
      // Arrange & Act
      render(<UserInfoCard nickname="TestUser" email="test@example.com" />)

      // Assert
      const initialEl = screen.getByText('T')
      expect(initialEl.className).not.toContain('text-white')
    })
  })

  describe('Card Layout Style (리디자인)', () => {
    it('should apply rounded-2xl class to card container', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert - 카드가 rounded-2xl 스타일을 가져야 함
      const card = screen.getByTestId('user-info-card')
      expect(card.className).toMatch(/rounded-2xl/)
    })

    it('should apply border border-gray-100 class to card container', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert - 카드에 border 스타일이 있어야 함
      const card = screen.getByTestId('user-info-card')
      expect(card.className).toMatch(/border/)
    })

    it('should preserve data-testid attributes after redesign', () => {
      // Arrange & Act
      render(<UserInfoCard {...defaultProps} />)

      // Assert - 모든 data-testid 유지
      expect(screen.getByTestId('user-info-card')).toBeInTheDocument()
      expect(screen.getByTestId('user-nickname')).toBeInTheDocument()
      expect(screen.getByTestId('user-email')).toBeInTheDocument()
    })
  })
})
