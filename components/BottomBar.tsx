'use client';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface BottomBarProps {
  characterCount: number;
  saveStatus: SaveStatus;
}

export default function BottomBar({ characterCount, saveStatus }: BottomBarProps) {
  const getStatusText = () => {
    switch (saveStatus) {
      case 'idle':
        return '';
      case 'dirty':
        return '저장되지 않음';
      case 'saving':
        return '저장 중...';
      case 'saved':
        return '저장됨';
      case 'error':
        return '저장 실패';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'error':
        return 'text-red-600';
      case 'saved':
        return 'text-green-600';
      case 'saving':
        return 'text-blue-600';
      case 'dirty':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCharCount = (count: number) => {
    if (count < 0) return '0';
    return count.toLocaleString('ko-KR');
  };

  return (
    <footer
      role="contentinfo"
      className="fixed bottom-0 left-0 right-0 z-10 w-full bg-white border-t border-gray-200 px-4 py-3"
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div data-testid="char-count" className="text-sm text-gray-600">
          {formatCharCount(characterCount)} 글자
        </div>
        <div
          data-testid="save-status"
          aria-live="polite"
          className={`text-sm ${getStatusColor()}`}
        >
          {getStatusText()}
        </div>
      </div>
    </footer>
  );
}
