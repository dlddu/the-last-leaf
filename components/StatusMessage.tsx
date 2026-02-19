'use client';

interface StatusMessageProps {
  message: string;
  variant: 'success' | 'error';
}

export default function StatusMessage({ message, variant }: StatusMessageProps) {
  if (!message) return null;

  const className =
    variant === 'success'
      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';

  return (
    <div className={`mx-4 mt-4 px-4 py-3 rounded-lg text-sm ${className}`}>
      {message}
    </div>
  );
}
