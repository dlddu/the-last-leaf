'use client';

interface DiaryListHeaderProps {
  totalCount: number;
}

export default function DiaryListHeader({ totalCount }: DiaryListHeaderProps) {
  const formatCount = (count: number) => {
    // Handle negative numbers by using absolute value
    const absCount = Math.abs(Math.floor(count));
    return absCount.toLocaleString();
  };

  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-gray-900">
        내 일기 <span className="text-blue-600">{formatCount(totalCount)}</span>
      </h1>
    </div>
  );
}
