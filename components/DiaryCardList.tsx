'use client';

import { useEffect, useRef } from 'react';
import DiaryCard from './DiaryCard';
import type { Diary } from '@/lib/types';

interface DiaryCardListProps {
  diaries: Diary[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function DiaryCardList({ diaries, onLoadMore, hasMore }: DiaryCardListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLLIElement | null>(null);

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
    <ul data-testid="diary-list" className="grid grid-cols-1 gap-4 list-none p-0 m-0">
      {diaries.map((diary) => (
        <li key={diary.diary_id}>
          <DiaryCard diary={diary} />
        </li>
      ))}

      {hasMore && (
        <li
          ref={loadingRef}
          data-testid="loading-indicator"
          role="status"
          aria-live="polite"
          className="flex justify-center items-center gap-1 py-4"
        >
          <span
            className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          />
          <span
            className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <span
            className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </li>
      )}
    </ul>
  );
}
