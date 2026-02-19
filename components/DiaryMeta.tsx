'use client';

interface DiaryMetaProps {
  formattedDate: string;
  formattedTime: string;
}

export default function DiaryMeta({ formattedDate, formattedTime }: DiaryMetaProps) {
  return (
    <div className="mb-4" data-testid="diary-detail-date">
      <h2 className="text-lg font-semibold text-gray-900">{formattedDate}</h2>
      <span className="text-xs text-gray-400">{formattedTime}</span>
    </div>
  );
}
