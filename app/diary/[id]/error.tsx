'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DiaryDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DiaryDetailError({ error, reset }: DiaryDetailErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Diary detail error:', error);
  }, [error]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">오류가 발생했습니다</h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || '일기를 불러오는 중 문제가 발생했습니다.'}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            다시 시도
          </button>
          <button
            onClick={handleBack}
            className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
