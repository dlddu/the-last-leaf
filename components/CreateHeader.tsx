'use client';

import { useRouter } from 'next/navigation';

interface CreateHeaderProps {
  onSave: () => void;
  onBack?: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

export default function CreateHeader({ onSave, onBack, isSaving, disabled }: CreateHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

        <div data-testid="diary-date" className="text-lg font-medium text-gray-800">
          {formattedDate}
        </div>

        <button
          onClick={onSave}
          disabled={isSaving || disabled}
          aria-label={isSaving ? '저장 중...' : '저장'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </header>
  );
}
