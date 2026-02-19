'use client';

interface WarningBannerProps {
  message: string;
  showIcon?: boolean;
  'data-testid'?: string;
}

export default function WarningBanner({
  message,
  showIcon = false,
  'data-testid': testId,
}: WarningBannerProps) {
  return (
    <div
      role="alert"
      data-testid={testId}
      className="bg-amber-50 border border-amber-200 rounded-xl p-3"
    >
      <p className="text-xs text-amber-700">{message}</p>
    </div>
  );
}
