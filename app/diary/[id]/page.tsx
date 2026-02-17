import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DiaryDetailClient from '@/components/DiaryDetailClient';

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
    <DiaryDetailClient
      diaryId={id}
      formattedDate={formattedDate}
      formattedTime={formattedTime}
      content={diary.content}
    />
  );
}
