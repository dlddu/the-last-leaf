'use client';

import { useEffect } from 'react';

interface ConfirmLeaveModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmLeaveModal({ isOpen, onConfirm, onCancel }: ConfirmLeaveModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="저장하지 않고 나가기 확인"
        aria-describedby="modal-description"
        className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-description" className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          저장하지 않고 나갈까요?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          작성 중인 내용이 저장되지 않습니다.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            aria-label="취소"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            autoFocus
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            aria-label="나가기"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}
