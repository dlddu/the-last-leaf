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
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="profile-email" className="text-sm font-medium text-gray-600">
          이메일
        </label>
        <input
          id="profile-email"
          data-testid="profile-email"
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="profile-nickname" className="text-sm font-medium text-gray-600">
          닉네임
        </label>
        <input
          id="profile-nickname"
          data-testid="profile-nickname"
          type="text"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="profile-name" className="text-sm font-medium text-gray-600">
          이름
        </label>
        <input
          id="profile-name"
          data-testid="profile-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>
    </div>
  );
}
