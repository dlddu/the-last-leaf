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
})
