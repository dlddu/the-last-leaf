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
      className="flex items-start gap-2 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200"
    >
      {showIcon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
}
