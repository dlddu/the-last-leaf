'use client';

export default function SettingsHeader() {
  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200"
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center">
        <h1 className="text-lg font-medium text-gray-800">설정</h1>
      </div>
    </header>
  );
}
