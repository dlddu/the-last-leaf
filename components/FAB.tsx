'use client';

import { useRouter } from 'next/navigation';

export default function FAB() {
  const router = useRouter();

  const handleClick = () => {
    if (router) {
      router.push('/diary/new');
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="새 일기 작성"
      data-testid="fab-create-diary"
      className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
}
