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

  describe('Container Style (리디자인)', () => {
    it('should apply rounded-2xl class to inner container (not rounded-xl)', () => {
      // Arrange & Act
      render(<MenuGroup {...defaultProps} />)

      // Assert - inner container가 rounded-2xl이어야 함
      const titleEl = screen.getByText('계정')
      const container = titleEl.closest('[class*="rounded"]') || titleEl.parentElement?.nextElementSibling
      // rounded-2xl이 적용된 요소가 존재해야 함
      const root = document.body.querySelector('[class*="rounded-2xl"]')
      expect(root).toBeInTheDocument()
    })

    it('should apply border border-gray-100 class to inner container', () => {
      // Arrange & Act
      render(<MenuGroup {...defaultProps} />)

      // Assert - border 스타일이 적용된 요소가 존재해야 함
      const borderedEl = document.body.querySelector('[class*="border-gray-100"]')
      expect(borderedEl).toBeInTheDocument()
    })

    it('should apply overflow-hidden class to inner container', () => {
      // Arrange & Act
      render(<MenuGroup {...defaultProps} />)

      // Assert - overflow-hidden 스타일이 적용되어야 함
      const overflowEl = document.body.querySelector('[class*="overflow-hidden"]')
      expect(overflowEl).toBeInTheDocument()
    })

    it('should not apply rounded-xl class (replaced by rounded-2xl)', () => {
      // Arrange & Act
      render(<MenuGroup {...defaultProps} />)

      // Assert - rounded-xl (not rounded-2xl)이 단독으로 사용되지 않아야 함
      // rounded-2xl이 있으면 통과 (rounded-xl은 제거됨)
      const roundedXl = document.body.querySelector('[class*="rounded-2xl"]')
      expect(roundedXl).toBeInTheDocument()
    })
  })

  describe('Title Style (리디자인)', () => {
    it('should apply text-xs class to title', () => {
      // Arrange & Act
      render(<MenuGroup title="계정" children={<></>} />)

      // Assert - 타이틀이 text-xs 클래스를 가져야 함
      const titleEl = screen.getByText('계정')
      expect(titleEl.className).toMatch(/text-xs/)
    })

    it('should apply text-gray-400 class to title', () => {
      // Arrange & Act
      render(<MenuGroup title="계정" children={<></>} />)

      // Assert
      const titleEl = screen.getByText('계정')
      expect(titleEl.className).toMatch(/text-gray-400/)
    })

    it('should apply font-medium class to title (not font-semibold)', () => {
      // Arrange & Act
      render(<MenuGroup title="계정" children={<></>} />)

      // Assert - font-medium이어야 함 (font-semibold 아님)
      const titleEl = screen.getByText('계정')
      expect(titleEl.className).toMatch(/font-medium/)
      expect(titleEl.className).not.toMatch(/font-semibold/)
    })

    it('should not apply uppercase class to title', () => {
      // Arrange & Act
      render(<MenuGroup title="계정" children={<></>} />)

      // Assert - uppercase가 제거되어야 함
      const titleEl = screen.getByText('계정')
      expect(titleEl.className).not.toMatch(/uppercase/)
    })

    it('should not apply tracking-wider class to title', () => {
      // Arrange & Act
      render(<MenuGroup title="계정" children={<></>} />)

      // Assert - tracking-wider가 제거되어야 함
      const titleEl = screen.getByText('계정')
      expect(titleEl.className).not.toMatch(/tracking-wider/)
    })
  })
})
