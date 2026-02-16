import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface DiaryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DiaryDetailPage({ params }: DiaryDetailPageProps) {
  const authUser = await requireAuth();
  const { id } = await params;

  const diary = await prisma.diary.findUnique({
    where: {
      diary_id: id,
      user_id: authUser.userId,
    },
  });

  if (!diary) {
    notFound();
  }

  const formattedDate = new Date(diary.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(diary.created_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <p data-testid="diary-detail-date" className="text-sm text-gray-500">{formattedDate} {formattedTime}</p>
        </div>
        <div data-testid="diary-content" className="text-gray-800 whitespace-pre-wrap">
          {diary.content}
        </div>
      </div>
    </div>
  );
}
