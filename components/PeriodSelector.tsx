'use client';

const PERIOD_OPTIONS = [
  { label: '30일', value: 2592000, days: 30 },
  { label: '60일', value: 5184000, days: 60 },
  { label: '90일', value: 7776000, days: 90 },
  { label: '180일', value: 15552000, days: 180 },
];

interface PeriodSelectorProps {
  selectedValue: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  'data-testid'?: string;
}

export default function PeriodSelector({
  selectedValue,
  onChange,
  disabled = false,
  'data-testid': testId,
}: PeriodSelectorProps) {
  return (
    <div
      data-testid={testId}
      className="flex gap-2"
    >
      {PERIOD_OPTIONS.map(({ label, value, days }) => {
        const isSelected = selectedValue === value;
        return (
          <button
            key={value}
            type="button"
            data-testid={`idle-period-${days}`}
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onChange(value)}
            className={`rounded-xl flex-1 py-2.5 text-sm font-medium transition-colors border ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
