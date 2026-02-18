interface DividerProps {
  text?: string;
}

export default function Divider({ text = '또는' }: DividerProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 border-t border-gray-300" />
      <span className="text-sm text-gray-500">{text}</span>
      <div className="flex-1 border-t border-gray-300" />
    </div>
  );
}
