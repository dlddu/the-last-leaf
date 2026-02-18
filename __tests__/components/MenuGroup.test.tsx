import '@testing-library/jest-dom'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'

import MenuGroup from '@/components/MenuGroup'

describe('MenuGroup Component', () => {
  const defaultProps = {
    title: '계정',
    children: <div data-testid="menu-item-child">메뉴 아이템</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render group title', () => {
      // Arrange & Act
      render(<MenuGroup {...defaultProps} />)

      // Assert
      expect(screen.getByText('계정')).toBeInTheDocument()
    })

    it('should render children elements', () => {
      // Arrange & Act
      render(<MenuGroup {...defaultProps} />)

      // Assert
      expect(screen.getByTestId('menu-item-child')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      // Arrange
      const multiChildren = (
        <>
          <div data-testid="child-1">아이템 1</div>
          <div data-testid="child-2">아이템 2</div>
        </>
      )

      // Act
      render(<MenuGroup title="환경설정" children={multiChildren} />)

      // Assert
      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
    })

    it('should render without crashing', () => {
      // Arrange & Act & Assert
      expect(() => render(<MenuGroup {...defaultProps} />)).not.toThrow()
    })
  })

  describe('Account MenuGroup', () => {
    it('should render "계정" group title', () => {
      // Arrange & Act
      render(<MenuGroup title="계정" children={<></>} />)

      // Assert
      expect(screen.getByText('계정')).toBeInTheDocument()
    })
  })

  describe('Settings MenuGroup', () => {
    it('should render "환경설정" group title', () => {
      // Arrange & Act
      render(<MenuGroup title="환경설정" children={<></>} />)

      // Assert
      expect(screen.getByText('환경설정')).toBeInTheDocument()
    })
  })

  describe('Danger MenuGroup', () => {
    it('should render "위험" group title', () => {
      // Arrange & Act
      render(<MenuGroup title="위험" children={<></>} />)

      // Assert
      expect(screen.getByText('위험')).toBeInTheDocument()
    })
  })
})
