'use client';

import { useEffect } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({ isOpen, onConfirm, onCancel, isDeleting = false }: DeleteConfirmModalProps) {
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
        aria-label="일기 삭제 확인"
        aria-describedby="delete-modal-description"
        className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-modal-description" className="text-lg font-semibold text-gray-800 mb-4">
          일기를 삭제할까요?
        </h2>
        <p className="text-gray-600 mb-6">
          삭제된 일기는 복구할 수 없습니다.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            aria-label="취소"
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            autoFocus
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            aria-label={isDeleting ? '삭제 중' : '삭제'}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? '삭제 중' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
