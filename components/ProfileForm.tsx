'use client';

interface ProfileFormProps {
  email: string;
  name: string;
  nickname: string;
  onNameChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
}

export default function ProfileForm({
  email,
  name,
  nickname,
  onNameChange,
  onNicknameChange,
}: ProfileFormProps) {
  return (
    <div data-testid="profile-card" className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 mx-4 mt-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 mb-1.5">
          <label htmlFor="profile-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            이메일
          </label>
          <input
            id="profile-email"
            data-testid="profile-email"
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed focus:outline-none"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
        </div>

        <div className="flex flex-col gap-1 mb-1.5">
          <label htmlFor="profile-nickname" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            닉네임
          </label>
          <input
            id="profile-nickname"
            data-testid="profile-nickname"
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1 mb-1.5">
          <label htmlFor="profile-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            이름
          </label>
          <input
            id="profile-name"
            data-testid="profile-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
