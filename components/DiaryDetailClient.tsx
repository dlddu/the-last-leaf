'use client';

import DetailHeader from '@/components/DetailHeader';

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
  const handleDeleteClick = () => {
    // 삭제 처리 (추후 구현)
  };

  return (
    <div className="min-h-screen">
      <DetailHeader diaryId={diaryId} onDeleteClick={handleDeleteClick} />
      <div className="max-w-2xl mx-auto p-6 pt-20">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <p data-testid="diary-detail-date" className="text-sm text-gray-500">
              {formattedDate} {formattedTime}
            </p>
          </div>
          <div data-testid="diary-content" className="text-gray-800 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
