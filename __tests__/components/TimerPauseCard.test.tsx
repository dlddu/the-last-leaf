import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TimerPauseCard from '@/components/TimerPauseCard'

describe('TimerPauseCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(
          <TimerPauseCard
            isPaused={false}
            onToggle={jest.fn()}
          />
        )
      ).not.toThrow()
    })

    it('should render with data-testid', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
          data-testid="timer-pause-card"
        />
      )

      // Assert
      expect(screen.getByTestId('timer-pause-card')).toBeInTheDocument()
    })

    it('should render the toggle switch', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
        />
      )

      // Assert
      expect(screen.getByTestId('timer-pause-toggle')).toBeInTheDocument()
    })

    it('should render a title or label for the card', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
        />
      )

      // Assert: 카드에 제목이 있어야 함 (예: "타이머 일시정지", "일시정지" 등)
      expect(
        screen.getByRole('heading', { name: /일시정지|타이머|pause/i })
      ).toBeInTheDocument()
    })
  })

  describe('Toggle state - isPaused=false (OFF)', () => {
    it('should render toggle in OFF state when isPaused is false', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
        />
      )

      // Assert
      const toggle = screen.getByTestId('timer-pause-toggle')
      expect(toggle).not.toBeChecked()
    })

    it('should NOT show WarningBanner when isPaused is false', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
        />
      )

      // Assert
      expect(screen.queryByTestId('timer-pause-warning-banner')).not.toBeInTheDocument()
    })
  })

  describe('Toggle state - isPaused=true (ON)', () => {
    it('should render toggle in ON state when isPaused is true', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={true}
          onToggle={jest.fn()}
        />
      )

      // Assert
      const toggle = screen.getByTestId('timer-pause-toggle')
      expect(toggle).toBeChecked()
    })

    it('should show WarningBanner when isPaused is true', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={true}
          onToggle={jest.fn()}
        />
      )

      // Assert
      expect(screen.getByTestId('timer-pause-warning-banner')).toBeInTheDocument()
    })

    it('should display warning message in WarningBanner when isPaused is true', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={true}
          onToggle={jest.fn()}
        />
      )

      // Assert: 경고 메시지가 화면에 표시되어야 함
      const warningBanner = screen.getByTestId('timer-pause-warning-banner')
      expect(warningBanner).toBeVisible()
      expect(warningBanner.textContent?.length).toBeGreaterThan(0)
    })
  })

  describe('Interaction', () => {
    it('should call onToggle with true when toggle clicked from OFF state', async () => {
      // Arrange
      const mockOnToggle = jest.fn()
      const user = userEvent.setup()

      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={mockOnToggle}
        />
      )

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      expect(mockOnToggle).toHaveBeenCalledTimes(1)
      expect(mockOnToggle).toHaveBeenCalledWith(true)
    })

    it('should call onToggle with false when toggle clicked from ON state', async () => {
      // Arrange
      const mockOnToggle = jest.fn()
      const user = userEvent.setup()

      render(
        <TimerPauseCard
          isPaused={true}
          onToggle={mockOnToggle}
        />
      )

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      expect(mockOnToggle).toHaveBeenCalledTimes(1)
      expect(mockOnToggle).toHaveBeenCalledWith(false)
    })
  })

  describe('Disabled state', () => {
    it('should not call onToggle when disabled', async () => {
      // Arrange
      const mockOnToggle = jest.fn()
      const user = userEvent.setup()

      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={mockOnToggle}
          disabled={true}
        />
      )

      // Act
      const toggle = screen.getByTestId('timer-pause-toggle')
      await user.click(toggle)

      // Assert
      expect(mockOnToggle).not.toHaveBeenCalled()
    })
  })

  describe('Wireframe spec - DLD-410 redesign styles', () => {
    it('should render card container with rounded-2xl class', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
          data-testid="timer-pause-card"
        />
      )

      // Assert: 와이어프레임 스펙 - rounded-2xl
      const card = screen.getByTestId('timer-pause-card')
      expect(card.className).toContain('rounded-2xl')
    })

    it('should render card container with p-5 padding class', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
          data-testid="timer-pause-card"
        />
      )

      // Assert: 와이어프레임 스펙 - p-5
      const card = screen.getByTestId('timer-pause-card')
      expect(card.className).toContain('p-5')
    })

    it('should render card container with border-gray-100 class', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
          data-testid="timer-pause-card"
        />
      )

      // Assert: 와이어프레임 스펙 - border border-gray-100
      const card = screen.getByTestId('timer-pause-card')
      expect(card.className).toContain('border-gray-100')
    })

    it('should render updated title text 타이머 일시 중지', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
        />
      )

      // Assert: 와이어프레임 스펙 - 새로운 타이틀 텍스트
      expect(screen.getByText('타이머 일시 중지')).toBeInTheDocument()
    })

    it('should render updated description text about inactive detection pause', () => {
      // Arrange & Act
      render(
        <TimerPauseCard
          isPaused={false}
          onToggle={jest.fn()}
        />
      )

      // Assert: 와이어프레임 스펙 - 새로운 설명 텍스트
      expect(
        screen.getByText('활성화하면 비활성 감지가 일시 중지됩니다')
      ).toBeInTheDocument()
    })
  })
})
