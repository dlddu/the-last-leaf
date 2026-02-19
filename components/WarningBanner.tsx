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
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3"
    >
      <p className="text-xs text-amber-700 dark:text-amber-300">{message}</p>
    </div>
  );
}
