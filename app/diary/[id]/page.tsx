import { requireAuth } from '@/lib/auth-server';

interface DiaryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  await requireAuth();
  const { id } = await params;

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">일기 상세</h1>
        <p className="text-gray-600">Diary ID: {id}</p>
        <p className="text-gray-500 text-sm mt-4">
          This is a placeholder for diary detail page.
        </p>
      </div>
    </div>
  );
}
