'use client';

interface DiaryContentProps {
  content: string;
}

export default function DiaryContent({ content }: DiaryContentProps) {
  return (
    <p
      data-testid="diary-content"
      className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
    >
      {content}
    </p>
  );
}
