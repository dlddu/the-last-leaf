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

  describe('Layout Style (리디자인)', () => {
    it('should apply sticky class (not fixed) to header element', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert - sticky 포지셔닝이어야 함 (fixed가 아님)
      const header = screen.getByRole('banner')
      expect(header.className).toMatch(/sticky/)
      expect(header.className).not.toMatch(/\bfixed\b/)
    })

    it('should apply top-0 class to header element', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert
      const header = screen.getByRole('banner')
      expect(header.className).toMatch(/top-0/)
    })

    it('should apply border-gray-100 class (not border-gray-200) to header', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert - border-gray-100이어야 함
      const header = screen.getByRole('banner')
      expect(header.className).toMatch(/border-gray-100/)
      expect(header.className).not.toMatch(/border-gray-200/)
    })

    it('should not apply left-0 or right-0 fixed positioning classes', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert - fixed 포지셔닝 관련 left-0/right-0이 없어야 함
      const header = screen.getByRole('banner')
      expect(header.className).not.toMatch(/\bfixed\b/)
    })
  })

  describe('Title Style (리디자인)', () => {
    it('should apply text-xl class to heading (not text-lg)', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert - text-xl이어야 함 (text-lg 아님)
      const heading = screen.getByRole('heading', { name: /설정/i })
      expect(heading.className).toMatch(/text-xl/)
      expect(heading.className).not.toMatch(/text-lg/)
    })

    it('should apply font-bold class to heading (not font-medium)', () => {
      // Arrange & Act
      render(<SettingsHeader />)

      // Assert - font-bold이어야 함 (font-medium 아님)
      const heading = screen.getByRole('heading', { name: /설정/i })
      expect(heading.className).toMatch(/font-bold/)
      expect(heading.className).not.toMatch(/font-medium/)
    })
  })
})
