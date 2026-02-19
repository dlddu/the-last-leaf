'use client';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface BottomBarProps {
  characterCount: number;
  saveStatus: SaveStatus;
}

export default function BottomBar({ characterCount, saveStatus }: BottomBarProps) {
  const formatCharCount = (count: number) => {
    if (count < 0) return '0';
    return count.toLocaleString('ko-KR');
  };

  return (
    <footer
      role="contentinfo"
      className="fixed bottom-0 left-0 right-0 z-10 w-full bg-white border-t border-gray-100"
    >
      <div className="px-5 py-3 flex items-center justify-between">
        <div data-testid="char-count" className="text-sm text-gray-600">
          {formatCharCount(characterCount)}자
        </div>
        <div
          data-testid="save-status"
          aria-live="polite"
          className="text-xs text-gray-400"
        >
          자동 저장됨
        </div>
      </div>
    </footer>
  );
}
