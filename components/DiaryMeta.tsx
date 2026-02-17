'use client';

interface DiaryMetaProps {
  formattedDate: string;
  formattedTime: string;
}

export default function DiaryMeta({ formattedDate, formattedTime }: DiaryMetaProps) {
  return (
    <div className="mb-4">
      <p data-testid="diary-detail-date" className="text-sm text-gray-500">
        {formattedDate} {formattedTime}
      </p>
    </div>
  );
}
