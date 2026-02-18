'use client';

import { useRouter } from 'next/navigation';

interface MenuItemProps {
  label: string;
  href?: string;
  onClick?: () => void;
  testId?: string;
  variant?: 'default' | 'danger';
}

export default function MenuItem({ label, href, onClick, testId, variant = 'default' }: MenuItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const textColorClass = variant === 'danger' ? 'text-red-600' : 'text-gray-800';

  return (
    <button
      data-testid={testId}
      onClick={handleClick}
      className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${textColorClass}`}
    >
      <span className={textColorClass}>{label}</span>
      {variant !== 'danger' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </button>
  );
}
