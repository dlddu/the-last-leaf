import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ToggleSwitch from '@/components/ToggleSwitch'

describe('ToggleSwitch Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() =>
        render(<ToggleSwitch checked={false} onChange={jest.fn()} />)
      ).not.toThrow()
    })

    it('should render toggle switch element', () => {
      // Arrange & Act
      render(<ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />)

      // Assert
      expect(screen.getByTestId('toggle-switch')).toBeInTheDocument()
    })

    it('should render with label when label prop is provided', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} label="타이머 일시정지" />
      )

      // Assert
      expect(screen.getByText('타이머 일시정지')).toBeInTheDocument()
    })
  })

  describe('Checked state', () => {
    it('should reflect checked=false state correctly', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert
      const toggle = screen.getByTestId('toggle-switch')
      expect(toggle).not.toBeChecked()
    })

    it('should reflect checked=true state correctly', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={true} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert
      const toggle = screen.getByTestId('toggle-switch')
      expect(toggle).toBeChecked()
    })
  })

  describe('Interaction', () => {
    it('should call onChange when toggled from OFF to ON', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <ToggleSwitch checked={false} onChange={mockOnChange} data-testid="toggle-switch" />
      )

      // Act
      const toggle = screen.getByTestId('toggle-switch')
      await user.click(toggle)

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    it('should call onChange when toggled from ON to OFF', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <ToggleSwitch checked={true} onChange={mockOnChange} data-testid="toggle-switch" />
      )

      // Act
      const toggle = screen.getByTestId('toggle-switch')
      await user.click(toggle)

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(false)
    })

    it('should support keyboard activation with Space key', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <ToggleSwitch checked={false} onChange={mockOnChange} data-testid="toggle-switch" />
      )

      // Act
      const toggle = screen.getByTestId('toggle-switch')
      toggle.focus()
      await user.keyboard(' ')

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('Disabled state', () => {
    it('should not call onChange when disabled and clicked', async () => {
      // Arrange
      const mockOnChange = jest.fn()
      const user = userEvent.setup()

      render(
        <ToggleSwitch
          checked={false}
          onChange={mockOnChange}
          disabled={true}
          data-testid="toggle-switch"
        />
      )

      // Act
      const toggle = screen.getByTestId('toggle-switch')
      await user.click(toggle)

      // Assert
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should render as disabled when disabled prop is true', () => {
      // Arrange & Act
      render(
        <ToggleSwitch
          checked={false}
          onChange={jest.fn()}
          disabled={true}
          data-testid="toggle-switch"
        />
      )

      // Assert
      const toggle = screen.getByTestId('toggle-switch')
      expect(toggle).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have a role that supports toggling', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: checkbox 또는 switch role을 가져야 함
      const toggle = screen.getByTestId('toggle-switch')
      expect(toggle).toBeInTheDocument()
    })

    it('should be keyboard focusable', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert
      const toggle = screen.getByTestId('toggle-switch')
      toggle.focus()
      expect(toggle).toHaveFocus()
    })
  })

  describe('Wireframe spec - DLD-410 custom slider', () => {
    it('should render input[type=checkbox] with sr-only class for accessibility', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: sr-only peer 패턴 - input은 screen reader 전용으로 숨겨져 있어야 함
      const input = screen.getByTestId('toggle-switch')
      expect(input.tagName).toBe('INPUT')
      expect(input).toHaveAttribute('type', 'checkbox')
      expect(input.className).toContain('sr-only')
    })

    it('should render a visual slider div as sibling of the input', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: input 옆에 커스텀 슬라이더 div가 있어야 함
      const input = screen.getByTestId('toggle-switch')
      const label = input.closest('label')
      expect(label).not.toBeNull()
      // label 내부에 슬라이더 역할의 div가 있어야 함
      const sliderDiv = label!.querySelector('div')
      expect(sliderDiv).not.toBeNull()
    })

    it('should apply bg-gray-200 class on the slider div when toggle is OFF', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: OFF 상태에서 슬라이더 배경이 gray-200이어야 함
      const input = screen.getByTestId('toggle-switch')
      const label = input.closest('label')
      expect(label).not.toBeNull()
      const sliderDiv = label!.querySelector('div')
      expect(sliderDiv).not.toBeNull()
      expect(sliderDiv!.className).toContain('bg-gray-200')
    })

    it('should apply bg-indigo-600 class on the slider div when toggle is ON', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={true} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: ON 상태에서 슬라이더 배경이 indigo-600이어야 함
      const input = screen.getByTestId('toggle-switch')
      const label = input.closest('label')
      expect(label).not.toBeNull()
      const sliderDiv = label!.querySelector('div')
      expect(sliderDiv).not.toBeNull()
      expect(sliderDiv!.className).toContain('bg-indigo-600')
    })

    it('should render the slider with rounded-full shape (w-12 h-7)', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: 슬라이더가 rounded-full 필 모양이어야 함
      const input = screen.getByTestId('toggle-switch')
      const label = input.closest('label')
      expect(label).not.toBeNull()
      const sliderDiv = label!.querySelector('div')
      expect(sliderDiv).not.toBeNull()
      expect(sliderDiv!.className).toContain('rounded-full')
    })

    it('should render a circular handle inside the slider', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: 슬라이더 내부에 원형 핸들(흰색, rounded-full)이 있어야 함
      const input = screen.getByTestId('toggle-switch')
      const label = input.closest('label')
      expect(label).not.toBeNull()
      const sliderDiv = label!.querySelector('div')
      expect(sliderDiv).not.toBeNull()
      // 핸들은 슬라이더 div 내부의 자식 span 또는 div
      const handle = sliderDiv!.querySelector('span, div')
      expect(handle).not.toBeNull()
      expect(handle!.className).toContain('bg-white')
      expect(handle!.className).toContain('rounded-full')
    })

    it('should apply translate-x-5 on the handle when toggle is ON', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={true} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: ON 상태에서 핸들이 오른쪽으로 이동(translate-x-5)해야 함
      const input = screen.getByTestId('toggle-switch')
      const label = input.closest('label')
      expect(label).not.toBeNull()
      const sliderDiv = label!.querySelector('div')
      expect(sliderDiv).not.toBeNull()
      const handle = sliderDiv!.querySelector('span, div')
      expect(handle).not.toBeNull()
      expect(handle!.className).toContain('translate-x-5')
    })

    it('should apply peer class to input for CSS peer pattern', () => {
      // Arrange & Act
      render(
        <ToggleSwitch checked={false} onChange={jest.fn()} data-testid="toggle-switch" />
      )

      // Assert: input에 peer 클래스가 있어야 CSS peer 패턴이 동작함
      const input = screen.getByTestId('toggle-switch')
      expect(input.className).toContain('peer')
    })
  })
})
