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
      className="fixed bottom-24 right-5 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    </button>
  );
}
