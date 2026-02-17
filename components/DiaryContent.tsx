'use client';

interface DiaryContentProps {
  content: string;
}

export default function DiaryContent({ content }: DiaryContentProps) {
  return (
    <p
      data-testid="diary-content"
      className="whitespace-pre-wrap text-gray-800 leading-relaxed"
    >
      {content}
    </p>
  );
}
