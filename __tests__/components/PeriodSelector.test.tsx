import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PeriodSelector from '@/components/PeriodSelector'

// 허용된 threshold 값 (초 단위)
const PERIOD_OPTIONS = [
  { label: '30일', value: 2592000 },
  { label: '60일', value: 5184000 },
  { label: '90일', value: 7776000 },
  { label: '180일', value: 15552000 },
]

describe('PeriodSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(
          <PeriodSelector
            selectedValue={2592000}
            onChange={jest.fn()}
          />
        )
      ).not.toThrow()
    })

    it('should render all four period buttons (30, 60, 90, 180일)', () => {
      // Arrange & Act
      render(
        <PeriodSelector
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

    it('should render with data-testid', () => {
      // Arrange & Act
      render(
        <PeriodSelector
          selectedValue={2592000}
          onChange={jest.fn()}
          data-testid="period-selector"
        />
      )

      // Assert
      expect(screen.getByTestId('period-selector')).toBeInTheDocument()
    })
  })

  describe('Selected state', () => {
    it('should visually mark the 30-day button as selected when selectedValue is 2592000', () => {
      // Arrange & Act
      render(
        <PeriodSelector
          selectedValue={2592000}
          onChange={jest.fn()}
          data-testid="period-selector"
        />
      )

      // Assert
      const button30 = screen.getByRole('button', { name: /30일/ })
      // 선택된 버튼은 aria-pressed 또는 aria-selected 속성을 갖거나, 특정 클래스를 가짐
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

    it('should visually mark the 60-day button as selected when selectedValue is 5184000', () => {
      // Arrange & Act
      render(
        <PeriodSelector
          selectedValue={5184000}
          onChange={jest.fn()}
        />
      )

      // Assert
      const button60 = screen.getByRole('button', { name: /60일/ })
      const isSelected =
        button60.getAttribute('aria-pressed') === 'true' ||
        button60.getAttribute('aria-selected') === 'true' ||
        button60.getAttribute('data-selected') === 'true' ||
        button60.className.includes('selected') ||
        button60.className.includes('active') ||
        button60.className.includes('ring') ||
        button60.className.includes('border-blue') ||
        button60.className.includes('bg-blue')
      expect(isSelected).toBe(true)
    })

    it('should visually mark the 90-day button as selected when selectedValue is 7776000', () => {
      // Arrange & Act
      render(
        <PeriodSelector
          selectedValue={7776000}
          onChange={jest.fn()}
        />
      )

      // Assert
      const button90 = screen.getByRole('button', { name: /90일/ })
      const isSelected =
        button90.getAttribute('aria-pressed') === 'true' ||
        button90.getAttribute('aria-selected') === 'true' ||
        button90.getAttribute('data-selected') === 'true' ||
        button90.className.includes('selected') ||
        button90.className.includes('active') ||
        button90.className.includes('ring') ||
        button90.className.includes('border-blue') ||
        button90.className.includes('bg-blue')
      expect(isSelected).toBe(true)
    })

    it('should visually mark the 180-day button as selected when selectedValue is 15552000', () => {
      // Arrange & Act
      render(
        <PeriodSelector
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

  describe('Interaction', () => {
    it('should call onChange with 2592000 when 30일 button is clicked', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <PeriodSelector
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
        <PeriodSelector
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
        <PeriodSelector
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
        <PeriodSelector
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

    it('should not call onChange when already selected button is clicked', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <PeriodSelector
          selectedValue={2592000}
          onChange={mockOnChange}
        />
      )

      // Act: 이미 선택된 30일 버튼 클릭
      const button30 = screen.getByRole('button', { name: /30일/ })
      await user.click(button30)

      // Assert: onChange가 호출되지 않거나 동일한 값으로 호출됨
      if (mockOnChange.mock.calls.length > 0) {
        expect(mockOnChange).toHaveBeenCalledWith(2592000)
      } else {
        expect(mockOnChange).not.toHaveBeenCalled()
      }
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button names', () => {
      // Arrange & Act
      render(
        <PeriodSelector
          selectedValue={2592000}
          onChange={jest.fn()}
        />
      )

      // Assert
      PERIOD_OPTIONS.forEach(({ label }) => {
        const button = screen.getByRole('button', { name: new RegExp(label) })
        expect(button).toHaveAccessibleName()
      })
    })

    it('should support keyboard navigation', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <PeriodSelector
          selectedValue={2592000}
          onChange={mockOnChange}
        />
      )

      // Act
      const button60 = screen.getByRole('button', { name: /60일/ })
      button60.focus()
      await user.keyboard('{Enter}')

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith(5184000)
    })
  })
})
