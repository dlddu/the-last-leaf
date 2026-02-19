'use client';

import { useRouter } from 'next/navigation';

interface EditHeaderProps {
  onSave: () => void;
  onBack?: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

export default function EditHeader({ onSave, onBack, isSaving, disabled }: EditHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
    >
      <div className="px-5 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          aria-label="뒤로가기"
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
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

        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
          수정하기
        </div>

        <button
          onClick={onSave}
          disabled={isSaving || disabled}
          aria-label={isSaving ? '저장 중...' : '저장'}
          className="text-indigo-600 font-semibold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </header>
  );
}
