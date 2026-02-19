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
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">내 일기</h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">총 {formatCount(totalCount)}개</span>
      </div>
    </div>
  );
}
