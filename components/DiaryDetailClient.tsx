'use client';

import { useState } from 'react';
import DetailHeader from '@/components/DetailHeader';
import DiaryMeta from '@/components/DiaryMeta';
import DiaryContent from '@/components/DiaryContent';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

interface DiaryDetailClientProps {
  diaryId: string;
  formattedDate: string;
  formattedTime: string;
  content: string;
}

export default function DiaryDetailClient({
  diaryId,
  formattedDate,
  formattedTime,
  content,
}: DiaryDetailClientProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    // 실제 삭제 API 호출은 추후 구현
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <DetailHeader diaryId={diaryId} onDeleteClick={handleDeleteClick} />
      <div className="max-w-2xl mx-auto p-6 pt-20">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DiaryMeta formattedDate={formattedDate} formattedTime={formattedTime} />
          <DiaryContent content={content} />
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
