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
      className="flex gap-2 flex-wrap"
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
