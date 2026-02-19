'use client';

import ToggleSwitch from '@/components/ToggleSwitch';
import WarningBanner from '@/components/WarningBanner';

interface TimerPauseCardProps {
  isPaused: boolean;
  onToggle: (isPaused: boolean) => void;
  disabled?: boolean;
  'data-testid'?: string;
}

export default function TimerPauseCard({
  isPaused,
  onToggle,
  disabled = false,
  'data-testid': testId,
}: TimerPauseCardProps) {
  return (
    <div
      data-testid={testId}
      className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">타이머 일시정지</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">자동 삭제 타이머를 일시정지합니다.</p>
        </div>
        <ToggleSwitch
          checked={isPaused}
          onChange={onToggle}
          disabled={disabled}
          data-testid="timer-pause-toggle"
        />
      </div>

      {isPaused && (
        <div className="mt-3">
          <WarningBanner
            message="타이머가 중지된 동안에는 자동 삭제가 진행되지 않습니다."
            data-testid="timer-pause-warning-banner"
          />
        </div>
      )}
    </div>
  );
}
