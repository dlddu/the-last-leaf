'use client';

import { useRouter } from 'next/navigation';
import type { Diary } from '@/lib/types';

interface DiaryCardProps {
  diary: Diary;
}

export default function DiaryCard({ diary }: DiaryCardProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[d.getDay()];
    return `${year}년 ${month}월 ${day}일 ${weekday}`;
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${period} ${displayHours}:${displayMinutes}`;
  };

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
