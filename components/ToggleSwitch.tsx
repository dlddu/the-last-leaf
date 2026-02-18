'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  'data-testid'?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  'data-testid': testId,
}: ToggleSwitchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        data-testid={testId}
        className="w-4 h-4 accent-indigo-600"
        onChange={handleChange}
      />
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
}
