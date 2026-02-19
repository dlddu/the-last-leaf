interface AppLogoProps {
  tagline?: string;
}

export default function AppLogo({ tagline }: AppLogoProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
        <span className="text-2xl" aria-hidden="true">🍃</span>
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">나의 자서전</span>
      {tagline && (
        <span data-testid="app-logo-tagline" className="text-sm text-gray-500 dark:text-gray-400">
          {tagline}
        </span>
      )}
    </div>
  );
}
