'use client';

import { useRouter } from 'next/navigation';
import type { Diary } from '@/lib/types';
import { formatDate, formatTime } from '@/lib/date-utils';

interface DiaryCardProps {
  diary: Diary;
}

export default function DiaryCard({ diary }: DiaryCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/diary/${diary.diary_id}`);
  };

  return (
    <button
      data-testid="diary-card"
      onClick={handleClick}
      className="w-full text-left bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <span data-testid="diary-date" className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {formatDate(diary.created_at)}
        </span>
        <span data-testid="diary-time" className="text-xs text-gray-400 dark:text-gray-500">
          {formatTime(diary.created_at)}
        </span>
      </div>
      <p data-testid="diary-preview" className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
        {diary.content}
      </p>
    </button>
  );
}
