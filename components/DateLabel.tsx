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
    <div data-testid="diary-date" className="text-lg font-medium text-gray-800">
      {formattedDate}
    </div>
  );
}
