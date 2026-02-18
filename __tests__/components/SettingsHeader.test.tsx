import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import SettingsHeader from '@/components/SettingsHeader'

describe('SettingsHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render header element', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should display "설정" as heading text', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert
      expect(screen.getByText('설정')).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<SettingsHeader />)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have banner landmark role', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('should have heading element for settings title', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert
      expect(screen.getByRole('heading', { name: /설정/i })).toBeInTheDocument()
    })
  })
})
