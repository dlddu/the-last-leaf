'use client';

import { useState, useEffect, useCallback } from 'react';
import DiaryListHeader from './DiaryListHeader';
import DiaryCardList from './DiaryCardList';
import EmptyState from './EmptyState';
import FAB from './FAB';
import LoadingDots from './LoadingDots';
import type { Diary } from '@/lib/types';
import { API_ENDPOINTS, mapDiaries } from '@/lib/api-client';
import type { DiaryListResponse } from '@/lib/api-client';
import { PAGINATION_DEFAULT_LIMIT } from '@/lib/constants';

export default function DiaryList() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchDiaries = useCallback(async (cursor?: string | null) => {
    try {
      const url = cursor
        ? `${API_ENDPOINTS.DIARY}?cursor=${cursor}&limit=${PAGINATION_DEFAULT_LIMIT}`
        : `${API_ENDPOINTS.DIARY}?limit=${PAGINATION_DEFAULT_LIMIT}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch diaries');
      }

      const data: DiaryListResponse = await response.json();
      const newDiaries = mapDiaries(data.diaries);

      if (cursor) {
        // Append to existing diaries
        setDiaries((prev) => [...prev, ...newDiaries]);
      } else {
        // Replace all diaries
        setDiaries(newDiaries);
      }

      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Error fetching diaries:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const handleLoadMore = useCallback(() => {
    if (nextCursor && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchDiaries(nextCursor);
    }
  }, [nextCursor, isLoadingMore, fetchDiaries]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <DiaryListHeader totalCount={diaries.length} />
      <div className="px-4 py-3">
        {isLoading ? (
          <LoadingDots />
        ) : diaries.length === 0 ? (
          <EmptyState />
        ) : (
          <DiaryCardList
            diaries={diaries}
            onLoadMore={handleLoadMore}
            hasMore={nextCursor !== null}
          />
        )}
      </div>

      <FAB />
    </div>
  );
}
