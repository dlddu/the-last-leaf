export default function DiaryDetailLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* 헤더 영역 스켈레톤 */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-gray-200 rounded-lg" />
            <div className="h-9 w-9 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6 pt-20">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* 날짜/시간 영역 스켈레톤 */}
          <div className="mb-4">
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>

          {/* 본문 영역 스켈레톤 */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-4/5 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
