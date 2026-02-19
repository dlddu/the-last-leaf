interface DateLabelProps {
  date: string;
}

export default function DateLabel({ date }: DateLabelProps) {
  const parsedDate = new Date(date);
  const formattedDate = parsedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div data-testid="diary-date" className="text-sm text-gray-400">
      {formattedDate}
    </div>
  );
}
