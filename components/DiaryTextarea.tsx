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
      className="w-full min-h-[60vh] resize-none text-base px-5 py-6 focus:outline-none border-none leading-relaxed placeholder-gray-300"
      style={{ fontSize: '16px' }}
    />
  );
}
