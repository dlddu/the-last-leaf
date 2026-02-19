'use client';

import { useRouter } from 'next/navigation';

interface MenuItemProps {
  label: string;
  href?: string;
  onClick?: () => void;
  testId?: string;
  variant?: 'default' | 'danger';
  icon?: string;
  sub?: string;
}

export default function MenuItem({ label, href, onClick, testId, variant = 'default', icon, sub }: MenuItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  const textColorClass = variant === 'danger' ? 'text-red-500' : 'text-gray-800';

  return (
    <button
      data-testid={testId}
      onClick={handleClick}
      className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 ${textColorClass}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <span className="text-xl flex-shrink-0">{icon}</span>
        )}
        <div className="flex flex-col items-start min-w-0">
          <span className={textColorClass}>{label}</span>
          {sub && (
            <span className="text-xs text-gray-400 truncate">{sub}</span>
          )}
        </div>
      </div>
      {variant !== 'danger' && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400 flex-shrink-0"
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
