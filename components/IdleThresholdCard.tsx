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
      className="bg-white rounded-2xl p-5 border border-gray-100"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-900">비활성 판단 기간</h3>
        <p className="text-xs text-gray-400 mt-0.5">마지막 일기 작성 후 이 기간이 지나면 자서전을 생성합니다</p>
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
