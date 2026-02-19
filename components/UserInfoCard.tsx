'use client';

interface UserInfoCardProps {
  nickname: string;
  email: string;
}

export default function UserInfoCard({ nickname, email }: UserInfoCardProps) {
  const initial = nickname.charAt(0);

  return (
    <div
      data-testid="user-info-card"
      className="flex items-center gap-4 bg-white dark:bg-gray-900 mx-4 mt-4 rounded-2xl p-5 border border-gray-100 dark:border-gray-800"
    >
      <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xl font-bold text-indigo-600">
          {initial}
        </span>
      </div>
      <div className="flex flex-col min-w-0">
        <span
          data-testid="user-nickname"
          className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate"
        >
          {nickname}
        </span>
        <span
          data-testid="user-email"
          className="text-sm text-gray-500 dark:text-gray-400 truncate"
        >
          {email}
        </span>
      </div>
    </div>
  );
}
