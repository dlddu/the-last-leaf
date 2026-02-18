'use client';

import Link from 'next/link';

export default function EmptyState() {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <div
        data-testid="empty-state-illustration"
        role="img"
        aria-label="일기가 없습니다"
        className="mb-6"
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="50" fill="#F3F4F6" />
          <path
            d="M45 40H75C77.2091 40 79 41.7909 79 44V76C79 78.2091 77.2091 80 75 80H45C42.7909 80 41 78.2091 41 76V44C41 41.7909 42.7909 40 45 40Z"
            stroke="#9CA3AF"
            strokeWidth="2"
            fill="white"
          />
          <line x1="48" y1="50" x2="72" y2="50" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="48" y1="58" x2="72" y2="58" stroke="#D1D5DB" strokeWidth="2" />
          <line x1="48" y1="66" x2="65" y2="66" stroke="#D1D5DB" strokeWidth="2" />
        </svg>
      </div>
      <p className="text-gray-600 mb-6 text-center">
        아직 작성한 일기가 없어요.<br />
        첫 번째 일기를 작성해보세요!
      </p>
      <Link
        href="/diary/new"
        role="button"
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        첫 일기 쓰기
      </Link>
    </div>
  );
}
