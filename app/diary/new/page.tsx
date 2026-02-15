import { requireAuth } from '@/lib/auth-server';

export default async function NewDiaryPage() {
  await requireAuth();

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">새 일기 작성</h1>
        <p className="text-gray-500 text-sm">
          This is a placeholder for new diary creation page.
        </p>
      </div>
    </div>
  );
}
