'use client';

interface DiaryTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
}

export default function DiaryTextarea({ value, onChange, autoFocus }: DiaryTextareaProps) {
  return (
    <textarea
      data-testid="diary-content-input"
      value={value}
      onChange={onChange}
      placeholder="오늘 하루는 어땠나요?"
      autoFocus={autoFocus}
      aria-label="일기 내용 입력"
      className="w-full h-full resize-none text-base p-4 focus:outline-none border-none"
      style={{ fontSize: '16px' }}
    />
  );
}
