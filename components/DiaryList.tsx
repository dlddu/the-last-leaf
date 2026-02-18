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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DiaryListHeader totalCount={diaries.length} />
      <div className="px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
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
