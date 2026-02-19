'use client';

import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

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
        <BackButton onClick={handleBack} />

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
