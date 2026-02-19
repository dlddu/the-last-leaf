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
        className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-indigo-400"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <p className="text-gray-600 mb-6 text-center">
        아직 작성한 일기가 없어요.<br />
        첫 번째 일기를 작성해보세요!
      </p>
      <Link
        href="/diary/new"
        role="button"
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
      >
        첫 일기 쓰기
      </Link>
    </div>
  );
}
