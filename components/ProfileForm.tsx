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
    <div data-testid="profile-card" className="bg-white rounded-2xl p-5 border border-gray-100 mx-4 mt-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 mb-1.5">
          <label htmlFor="profile-email" className="text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="profile-email"
            data-testid="profile-email"
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">이메일은 변경할 수 없습니다</p>
        </div>

        <div className="flex flex-col gap-1 mb-1.5">
          <label htmlFor="profile-nickname" className="text-sm font-medium text-gray-700">
            닉네임
          </label>
          <input
            id="profile-nickname"
            data-testid="profile-nickname"
            type="text"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1 mb-1.5">
          <label htmlFor="profile-name" className="text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            id="profile-name"
            data-testid="profile-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
