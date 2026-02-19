import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import IdleThresholdCard from '@/components/IdleThresholdCard'

describe('IdleThresholdCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(
          <IdleThresholdCard
            selectedValue={2592000}
            onChange={jest.fn()}
          />
        )
      ).not.toThrow()
    })

    it('should render with data-testid', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
          data-testid="idle-threshold-card"
        />
      )

      // Assert
      expect(screen.getByTestId('idle-threshold-card')).toBeInTheDocument()
    })

    it('should render the PeriodSelector', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert
      expect(screen.getByTestId('period-selector')).toBeInTheDocument()
    })

    it('should render a card title or label', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert: 카드에 제목이 있어야 함 (예: "유휴 시간", "기간", "idle threshold" 등)
      expect(
        screen.getByRole('heading', { name: /유휴|기간|자동|threshold|period/i })
      ).toBeInTheDocument()
    })

    it('should render all four period buttons', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert
      expect(screen.getByRole('button', { name: /30일/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /60일/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /90일/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /180일/ })).toBeInTheDocument()
    })
  })

  describe('Selected value', () => {
    it('should show 30일 as selected when selectedValue is 2592000', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert: 30일 버튼이 선택 상태임을 나타내야 함
      const button30 = screen.getByRole('button', { name: /30일/ })
      const isSelected =
        button30.getAttribute('aria-pressed') === 'true' ||
        button30.getAttribute('aria-selected') === 'true' ||
        button30.getAttribute('data-selected') === 'true' ||
        button30.className.includes('selected') ||
        button30.className.includes('active') ||
        button30.className.includes('ring') ||
        button30.className.includes('border-blue') ||
        button30.className.includes('bg-blue')
      expect(isSelected).toBe(true)
    })

    it('should show 180일 as selected when selectedValue is 15552000', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={15552000}
          onChange={jest.fn()}
        />
      )

      // Assert
      const button180 = screen.getByRole('button', { name: /180일/ })
      const isSelected =
        button180.getAttribute('aria-pressed') === 'true' ||
        button180.getAttribute('aria-selected') === 'true' ||
        button180.getAttribute('data-selected') === 'true' ||
        button180.className.includes('selected') ||
        button180.className.includes('active') ||
        button180.className.includes('ring') ||
        button180.className.includes('border-blue') ||
        button180.className.includes('bg-blue')
      expect(isSelected).toBe(true)
    })
  })

  describe('Wireframe spec - DLD-410 redesign styles', () => {
    it('should render card container with rounded-2xl class', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
          data-testid="idle-threshold-card"
        />
      )

      // Assert: 와이어프레임 스펙 - rounded-2xl
      const card = screen.getByTestId('idle-threshold-card')
      expect(card.className).toContain('rounded-2xl')
    })

    it('should render card container with p-5 padding class', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
          data-testid="idle-threshold-card"
        />
      )

      // Assert: 와이어프레임 스펙 - p-5
      const card = screen.getByTestId('idle-threshold-card')
      expect(card.className).toContain('p-5')
    })

    it('should render card container with border-gray-100 class', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
          data-testid="idle-threshold-card"
        />
      )

      // Assert: 와이어프레임 스펙 - border border-gray-100
      const card = screen.getByTestId('idle-threshold-card')
      expect(card.className).toContain('border-gray-100')
    })

    it('should render updated title text 비활성 판단 기간', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert: 와이어프레임 스펙 - 새로운 제목 텍스트
      expect(screen.getByText('비활성 판단 기간')).toBeInTheDocument()
    })

    it('should render title with text-sm font-medium classes', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert: 와이어프레임 스펙 - text-sm font-medium
      const title = screen.getByText('비활성 판단 기간')
      expect(title.className).toContain('text-sm')
      expect(title.className).toContain('font-medium')
    })

    it('should render updated description text about autobiography generation', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert: 와이어프레임 스펙 - 새로운 설명 텍스트
      expect(
        screen.getByText('마지막 일기 작성 후 이 기간이 지나면 자서전을 생성합니다')
      ).toBeInTheDocument()
    })

    it('should render description with text-xs text-gray-400 classes', () => {
      // Arrange & Act
      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert: 와이어프레임 스펙 - text-xs text-gray-400
      const description = screen.getByText(
        '마지막 일기 작성 후 이 기간이 지나면 자서전을 생성합니다'
      )
      expect(description.className).toContain('text-xs')
      expect(description.className).toContain('text-gray-400')
    })
  })

  describe('Interaction', () => {
    it('should call onChange with 2592000 when 30일 button is clicked', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <IdleThresholdCard
          selectedValue={5184000}
          onChange={mockOnChange}
        />
      )

      // Act
      const button30 = screen.getByRole('button', { name: /30일/ })
      await user.click(button30)

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(2592000)
    })

    it('should call onChange with 5184000 when 60일 button is clicked', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={mockOnChange}
        />
      )

      // Act
      const button60 = screen.getByRole('button', { name: /60일/ })
      await user.click(button60)

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(5184000)
    })

    it('should call onChange with 7776000 when 90일 button is clicked', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={mockOnChange}
        />
      )

      // Act
      const button90 = screen.getByRole('button', { name: /90일/ })
      await user.click(button90)

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(7776000)
    })

    it('should call onChange with 15552000 when 180일 button is clicked', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <IdleThresholdCard
          selectedValue={2592000}
          onChange={mockOnChange}
        />
      )

      // Act
      const button180 = screen.getByRole('button', { name: /180일/ })
      await user.click(button180)

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(15552000)
    })
  })
})
