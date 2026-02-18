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
      className="flex items-center gap-4 px-4 py-5 bg-white"
    >
      <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
        {initial}
      </div>
      <div className="flex flex-col min-w-0">
        <span
          data-testid="user-nickname"
          className="text-base font-semibold text-gray-900 truncate"
        >
          {nickname}
        </span>
        <span
          data-testid="user-email"
          className="text-sm text-gray-500 truncate"
        >
          {email}
        </span>
      </div>
    </div>
  );
}
