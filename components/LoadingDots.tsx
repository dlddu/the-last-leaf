'use client';

export default function LoadingDots() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}
