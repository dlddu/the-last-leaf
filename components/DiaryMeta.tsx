'use client';

interface DiaryMetaProps {
  createdAt: Date;
}

export default function DiaryMeta({ createdAt }: DiaryMetaProps) {
  const date = new Date(createdAt);

  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="text-gray-500 text-sm">
      <span data-testid="diary-detail-date" className="mr-2">
        {formattedDate}
      </span>
      <span data-testid="diary-detail-time">
        {formattedTime} 작성
      </span>
    </div>
  );
}
