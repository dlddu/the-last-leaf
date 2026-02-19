'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import Modal from '@/components/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({ isOpen, onConfirm, onCancel, isDeleting = false }: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      ariaLabel="일기 삭제 확인"
      ariaDescribedBy="delete-modal-description"
      className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-2xl p-6 space-y-4"
      align="bottom"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto">
        <TrashIcon className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">
        일기를 삭제할까요?
      </h3>
      <p id="delete-modal-description" className="text-sm text-gray-500 dark:text-gray-400 text-center">
        삭제된 일기는 복구할 수 없습니다.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium"
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
    </Modal>
  );
}
