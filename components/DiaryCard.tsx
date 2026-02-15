'use client';

import { useRouter } from 'next/navigation';

interface DiaryCardProps {
  diary: {
    diary_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
  };
}

export default function DiaryCard({ diary }: DiaryCardProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}년 ${month}월 ${day}일`;
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
      className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex gap-2 mb-2 text-sm text-gray-500">
        <span data-testid="diary-date">{formatDate(diary.created_at)}</span>
        <span data-testid="diary-time">{formatTime(diary.created_at)}</span>
      </div>
      <p data-testid="diary-preview" className="text-gray-900 line-clamp-2">
        {diary.content}
      </p>
    </button>
  );
}
