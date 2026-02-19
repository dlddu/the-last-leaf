'use client';

export default function SettingsHeader() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-10 bg-white border-b border-gray-100"
    >
      <div className="px-5 py-4 flex items-center justify-center">
        <h1 className="text-xl font-bold text-gray-800">설정</h1>
      </div>
    </header>
  );
}
