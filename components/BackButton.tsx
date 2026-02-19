'use client';

interface BackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  strokeWidth?: number;
}

export default function BackButton({ onClick, ariaLabel = '뒤로가기', strokeWidth = 2 }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
          strokeWidth={strokeWidth}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
  );
}
