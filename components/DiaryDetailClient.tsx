'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DetailHeader from '@/components/DetailHeader';
import DiaryMeta from '@/components/DiaryMeta';
import DiaryContent from '@/components/DiaryContent';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { API_ENDPOINTS } from '@/lib/api-client';

interface DiaryDetailClientProps {
  diaryId: string;
  formattedDate: string;
  formattedTime: string;
  content: string;
}

type DeleteStatus = 'idle' | 'deleting';

export default function DiaryDetailClient({
  diaryId,
  formattedDate,
  formattedTime,
  content,
}: DiaryDetailClientProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    setErrorMessage(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteStatus === 'deleting') {
      return;
    }

    setDeleteStatus('deleting');

    try {
      const response = await fetch(API_ENDPOINTS.DIARY_BY_ID(diaryId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.');
      }

      setIsDeleteModalOpen(false);
      setDeleteStatus('idle');
      router.push('/diary');
    } catch (error) {
      setDeleteStatus('idle');
      setIsDeleteModalOpen(false);
      setErrorMessage(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <DetailHeader diaryId={diaryId} onDeleteClick={handleDeleteClick} />
      <main className="px-5 py-6 pt-20">
        <DiaryMeta formattedDate={formattedDate} formattedTime={formattedTime} />
        <DiaryContent content={content} />
      </main>
      {errorMessage && (
        <div role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deleteStatus === 'deleting'}
      />
    </div>
  );
}
