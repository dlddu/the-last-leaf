'use client';

import { useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="일기 삭제 확인"
        aria-describedby="delete-modal-description"
        className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto">
          <TrashIcon className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center">
          일기를 삭제할까요?
        </h3>
        <p id="delete-modal-description" className="text-sm text-gray-500 text-center">
          삭제된 일기는 복구할 수 없습니다.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
          >
            {isDeleting ? '삭제 중' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}
