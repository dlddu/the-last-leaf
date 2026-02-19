const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * Format a date as Korean date string with weekday.
 * e.g. "2024년 1월 15일 월"
 */
export function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  return `${year}년 ${month}월 ${day}일 ${weekday}`;
}

/**
 * Format a date as Korean time string with AM/PM.
 * e.g. "오후 2:30"
 */
export function formatTime(date: Date): string {
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${period} ${displayHours}:${displayMinutes}`;
}
