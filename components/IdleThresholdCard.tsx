'use client';

import PeriodSelector from '@/components/PeriodSelector';

interface IdleThresholdCardProps {
  selectedValue: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  'data-testid'?: string;
}

export default function IdleThresholdCard({
  selectedValue,
  onChange,
  disabled = false,
  'data-testid': testId,
}: IdleThresholdCardProps) {
  return (
    <div
      data-testid={testId}
      className="bg-white rounded-xl p-4 shadow-sm"
    >
      <div className="mb-3">
        <h3 className="text-base font-medium text-gray-900">자동 삭제 기간</h3>
        <p className="text-sm text-gray-500 mt-0.5">유휴 상태 감지 후 자동 삭제까지의 기간을 설정합니다.</p>
      </div>
      <PeriodSelector
        selectedValue={selectedValue}
        onChange={onChange}
        disabled={disabled}
        data-testid="period-selector"
      />
    </div>
  );
}
