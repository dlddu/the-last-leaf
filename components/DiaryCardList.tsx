'use client';

import { useEffect, useRef } from 'react';
import DiaryCard from './DiaryCard';

interface Diary {
  diary_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

interface DiaryCardListProps {
  diaries: Diary[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function DiaryCardList({ diaries, onLoadMore, hasMore }: DiaryCardListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Setup new observer if there's a loading indicator
    if (hasMore && loadingRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            onLoadMore();
          }
        },
        {
          threshold: 0.1,
        }
      );

      observerRef.current.observe(loadingRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, onLoadMore]);

  return (
    <div data-testid="diary-list" className="grid grid-cols-1 gap-4">
      {diaries.map((diary) => (
        <div key={diary.diary_id}>
          <DiaryCard diary={diary} />
        </div>
      ))}

      {hasMore && (
        <div
          ref={loadingRef}
          data-testid="loading-indicator"
          role="status"
          aria-live="polite"
          className="flex justify-center py-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
