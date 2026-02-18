import { requireAuth } from '@/lib/auth-server';
import SettingsClient from '@/components/SettingsClient';

export default async function SettingsPage() {
  await requireAuth();

  return <SettingsClient />;
}
