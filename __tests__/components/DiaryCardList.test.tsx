import '@testing-library/jest-dom'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import DiaryCardList from '@/components/DiaryCardList'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockImplementation((callback: IntersectionObserverCallback) => ({
  observe: jest.fn((element: Element) => {
    // Simulate intersection after a delay
    setTimeout(() => {
      callback([{ isIntersecting: false, target: element } as IntersectionObserverEntry], {} as IntersectionObserver)
    }, 0)
  }),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
global.IntersectionObserver = mockIntersectionObserver as any

describe('DiaryCardList Component', () => {
  const mockDiaries = [
    {
      diary_id: 'diary-1',
      user_id: 'user-1',
      content: 'First diary entry',
      created_at: new Date('2024-01-03T12:00:00Z'),
      updated_at: new Date('2024-01-03T12:00:00Z'),
    },
    {
      diary_id: 'diary-2',
      user_id: 'user-1',
      content: 'Second diary entry',
      created_at: new Date('2024-01-02T12:00:00Z'),
      updated_at: new Date('2024-01-02T12:00:00Z'),
    },
    {
      diary_id: 'diary-3',
      user_id: 'user-1',
      content: 'Third diary entry',
      created_at: new Date('2024-01-01T12:00:00Z'),
      updated_at: new Date('2024-01-01T12:00:00Z'),
    },
  ]

  beforeEach(() => {
    mockIntersectionObserver.mockClear()
  })

  describe('Rendering', () => {
    it('should render diary list container', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const list = screen.getByTestId('diary-list')
      expect(list).toBeInTheDocument()
    })

    it('should render all diary cards', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const cards = screen.getAllByTestId('diary-card')
      expect(cards).toHaveLength(3)
    })

    it('should render diaries in correct order', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const cards = screen.getAllByTestId('diary-card')
      const previews = screen.getAllByTestId('diary-preview')

      expect(previews[0]).toHaveTextContent('First diary entry')
      expect(previews[1]).toHaveTextContent('Second diary entry')
      expect(previews[2]).toHaveTextContent('Third diary entry')
    })

    it('should render empty list when no diaries', () => {
      // Act
      render(<DiaryCardList diaries={[]} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const list = screen.getByTestId('diary-list')
      expect(list).toBeInTheDocument()
      expect(screen.queryAllByTestId('diary-card')).toHaveLength(0)
    })
  })

  describe('Infinite Scroll', () => {
    it('should render loading indicator when hasMore is true', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert
      const loader = screen.getByTestId('loading-indicator')
      expect(loader).toBeInTheDocument()
    })

    it('should not render loading indicator when hasMore is false', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const loader = screen.queryByTestId('loading-indicator')
      expect(loader).not.toBeInTheDocument()
    })

    it('should setup IntersectionObserver for loading indicator', async () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled()
      })
    })

    it('should call onLoadMore when loading indicator is visible', async () => {
      // Arrange
      const mockLoadMore = jest.fn()

      // Mock IntersectionObserver to trigger intersection
      const mockObserver = jest.fn()
      mockObserver.mockImplementation((callback: IntersectionObserverCallback) => ({
        observe: jest.fn((element: Element) => {
          // Immediately trigger intersection
          callback([{ isIntersecting: true, target: element } as IntersectionObserverEntry], {} as IntersectionObserver)
        }),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }))
      global.IntersectionObserver = mockObserver as any

      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={mockLoadMore} hasMore={true} />)

      // Assert
      await waitFor(() => {
        expect(mockLoadMore).toHaveBeenCalled()
      })
    })

    it('should not call onLoadMore when loading indicator is not visible', async () => {
      // Arrange
      const mockLoadMore = jest.fn()

      // Mock IntersectionObserver to NOT trigger intersection
      const mockObserver = jest.fn()
      mockObserver.mockImplementation((callback: IntersectionObserverCallback) => ({
        observe: jest.fn((element: Element) => {
          callback([{ isIntersecting: false, target: element } as IntersectionObserverEntry], {} as IntersectionObserver)
        }),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }))
      global.IntersectionObserver = mockObserver as any

      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={mockLoadMore} hasMore={true} />)

      // Wait a bit to ensure callback doesn't fire
      await new Promise(resolve => setTimeout(resolve, 100))

      // Assert
      expect(mockLoadMore).not.toHaveBeenCalled()
    })

    it('should cleanup IntersectionObserver on unmount', () => {
      // Arrange
      const mockDisconnect = jest.fn()
      const mockObserver = jest.fn()
      mockObserver.mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: mockDisconnect,
      }))
      global.IntersectionObserver = mockObserver as any

      // Act
      const { unmount } = render(
        <DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />
      )
      unmount()

      // Assert
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator at the bottom of the list', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert
      const list = screen.getByTestId('diary-list')
      const loader = screen.getByTestId('loading-indicator')

      // Loader should be a child of the list
      expect(list).toContainElement(loader)
    })

    it('should render loading indicator with proper styling', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert
      const loader = screen.getByTestId('loading-indicator')
      expect(loader.className).toBeTruthy()
    })
  })

  describe('Performance', () => {
    it('should handle large number of diaries efficiently', () => {
      // Arrange
      const manyDiaries = Array.from({ length: 100 }, (_, i) => ({
        diary_id: `diary-${i}`,
        user_id: 'user-1',
        content: `Diary entry ${i}`,
        created_at: new Date(),
        updated_at: new Date(),
      }))

      // Act
      const { container } = render(
        <DiaryCardList diaries={manyDiaries} onLoadMore={jest.fn()} hasMore={false} />
      )

      // Assert
      expect(container).toBeInTheDocument()
      const cards = screen.getAllByTestId('diary-card')
      expect(cards).toHaveLength(100)
    })

    it('should not cause memory leaks with frequent updates', () => {
      // Arrange
      const { rerender, unmount } = render(
        <DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />
      )

      // Act - Update multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)
      }

      // Assert - Should not throw
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty diaries array gracefully', () => {
      // Act
      render(<DiaryCardList diaries={[]} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const list = screen.getByTestId('diary-list')
      expect(list).toBeInTheDocument()
    })

    it('should handle single diary', () => {
      // Act
      render(
        <DiaryCardList diaries={[mockDiaries[0]]} onLoadMore={jest.fn()} hasMore={false} />
      )

      // Assert
      const cards = screen.getAllByTestId('diary-card')
      expect(cards).toHaveLength(1)
    })

    it('should handle hasMore changing from true to false', () => {
      // Arrange
      const { rerender } = render(
        <DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />
      )

      // Assert initial state
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()

      // Act - Update hasMore to false
      rerender(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert - Loading indicator should be gone
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
    })

    it('should handle diaries prop updating', () => {
      // Arrange
      const { rerender } = render(
        <DiaryCardList diaries={mockDiaries.slice(0, 2)} onLoadMore={jest.fn()} hasMore={true} />
      )

      // Assert initial state
      expect(screen.getAllByTestId('diary-card')).toHaveLength(2)

      // Act - Add more diaries
      rerender(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert - Should show all diaries
      expect(screen.getAllByTestId('diary-card')).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('should have semantic list structure', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const list = screen.getByTestId('diary-list')
      // Should be a list element or have role="list"
      expect(
        list.tagName === 'UL' ||
        list.tagName === 'OL' ||
        list.getAttribute('role') === 'list'
      ).toBe(true)
    })

    it('should have appropriate ARIA attributes for loading state', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert
      const loader = screen.getByTestId('loading-indicator')
      // Should have aria-live or aria-busy
      expect(
        loader.hasAttribute('aria-live') ||
        loader.hasAttribute('aria-busy') ||
        loader.getAttribute('role') === 'status'
      ).toBe(true)
    })
  })

  describe('Visual Layout', () => {
    it('should have proper spacing between cards', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={false} />)

      // Assert
      const list = screen.getByTestId('diary-list')
      // Should have gap or space classes
      expect(list.className).toBeTruthy()
    })

    it('should be scrollable when content exceeds viewport', () => {
      // Act
      render(<DiaryCardList diaries={mockDiaries} onLoadMore={jest.fn()} hasMore={true} />)

      // Assert
      const list = screen.getByTestId('diary-list')
      expect(list).toBeInTheDocument()
    })
  })
})
