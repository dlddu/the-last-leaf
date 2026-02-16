'use client';

import { useState, useEffect, useCallback } from 'react';
import DiaryListHeader from './DiaryListHeader';
import DiaryCardList from './DiaryCardList';
import EmptyState from './EmptyState';
import FAB from './FAB';

interface Diary {
  diary_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export default function DiaryList() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchDiaries = useCallback(async (cursor?: string | null) => {
    try {
      const url = cursor
        ? `/api/diary?cursor=${cursor}&limit=10`
        : '/api/diary?limit=10';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch diaries');
      }

      const data = await response.json();

      // Convert date strings to Date objects
      const newDiaries = data.diaries.map((diary: any) => ({
        ...diary,
        created_at: new Date(diary.created_at),
        updated_at: new Date(diary.updated_at),
      }));

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto p-6">
        <DiaryListHeader totalCount={diaries.length} />

        {diaries.length === 0 ? (
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
