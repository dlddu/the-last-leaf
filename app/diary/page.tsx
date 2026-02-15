import { requireAuth } from '@/lib/auth-server';
import DiaryList from '@/components/DiaryList';

export default async function DiaryPage() {
  await requireAuth();

  return <DiaryList />;
}
