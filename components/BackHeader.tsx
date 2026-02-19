'use client';

import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

interface BackHeaderProps {
  title: string;
  onSave?: () => void;
  onBack?: () => void;
  isSaving?: boolean;
  rightLabel?: string;
  onRightAction?: () => void;
}

export default function BackHeader({ title, onSave, onBack, isSaving = false, rightLabel, onRightAction }: BackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const hasCustomRight = rightLabel !== undefined && onRightAction !== undefined;

  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <BackButton onClick={handleBack} />

        <h1 className="text-lg font-medium text-gray-800 dark:text-gray-200">{title}</h1>

        {hasCustomRight ? (
          <button
            onClick={onRightAction}
            aria-label={rightLabel}
            className="text-indigo-600 font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {rightLabel}
          </button>
        ) : (
          <button
            onClick={onSave}
            disabled={isSaving}
            aria-label={isSaving ? '저장 중...' : '저장'}
            className="text-indigo-600 font-semibold text-sm disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        )}
      </div>
    </header>
  );
}
