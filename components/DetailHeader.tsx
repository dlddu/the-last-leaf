'use client';

import { useRouter } from 'next/navigation';

interface DetailHeaderProps {
  diaryId: string;
  onDeleteClick: () => void;
}

export default function DetailHeader({ diaryId, onDeleteClick }: DetailHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/diary/${diaryId}/edit`);
  };

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200"
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            aria-label="수정"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            onClick={onDeleteClick}
            aria-label="삭제"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
