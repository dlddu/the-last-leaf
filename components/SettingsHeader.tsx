'use client';

export default function SettingsHeader() {
  return (
    <header
      role="banner"
      className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
    >
      <div className="px-5 py-4 flex items-center justify-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">설정</h1>
      </div>
    </header>
  );
}
