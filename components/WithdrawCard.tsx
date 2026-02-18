'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type WithdrawState = 'idle' | 'confirmed' | 'processing' | 'error';

const DELETION_ITEMS = [
  '일기 데이터',
  '자서전 데이터',
  '프로필 정보',
  '계정 정보',
];

function WarningIcon() {
  return (
    <div
      data-testid="withdraw-warning-icon"
      className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-red-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="경고"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
  );
}

function DeletionList() {
  return (
    <ul
      data-testid="withdraw-deletion-list"
      className="mt-4 space-y-2"
    >
      {DELETION_ITEMS.map((item) => (
        <li
          key={item}
          data-testid="withdraw-deletion-item"
          className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg text-sm text-red-700"
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

interface ConfirmCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ConfirmCheckbox({ checked, onChange }: ConfirmCheckboxProps) {
  return (
    <label
      className="flex items-start gap-3 mt-6 cursor-pointer"
    >
      <input
        type="checkbox"
        data-testid="withdraw-consent-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
      />
      <span className="text-sm text-gray-700">
        위 내용을 확인했으며, 탈퇴에 동의합니다
      </span>
    </label>
  );
}

interface WithdrawButtonProps {
  state: WithdrawState;
  onClick: () => void;
}

function WithdrawButton({ state, onClick }: WithdrawButtonProps) {
  const isDisabled = state === 'idle' || state === 'processing';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="mt-6 w-full py-3 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      {state === 'processing' ? '처리 중...' : '탈퇴하기'}
    </button>
  );
}

export default function WithdrawCard() {
  const router = useRouter();
  const [state, setState] = useState<WithdrawState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheckboxChange = (checked: boolean) => {
    if (state === 'processing') return;
    setState(checked ? 'confirmed' : 'idle');
    setErrorMessage('');
  };

  const handleWithdraw = async () => {
    if (state !== 'confirmed') return;

    setState('processing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data.error || '오류가 발생했습니다. 다시 시도해주세요.');
        setState('confirmed');
        return;
      }

      setState('idle');
      router.push('/login');
    } catch (error) {
      setErrorMessage('오류가 발생했습니다. 다시 시도해주세요.');
      setState('confirmed');
    }
  };

  const isChecked = state === 'confirmed' || state === 'processing';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <WarningIcon />

      <h2 className="mt-4 text-center text-xl font-bold text-gray-900">
        계정 탈퇴
      </h2>

      <p className="mt-2 text-center text-sm text-gray-500">
        탈퇴 시 아래 데이터가 영구적으로 삭제되며 되돌릴 수 없습니다.
      </p>

      <DeletionList />

      {errorMessage && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <ConfirmCheckbox
        checked={isChecked}
        onChange={handleCheckboxChange}
      />

      <WithdrawButton
        state={state}
        onClick={handleWithdraw}
      />
    </div>
  );
}
