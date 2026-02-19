'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="Logout"
      className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-3.5 text-sm font-medium text-gray-500 text-center disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}
