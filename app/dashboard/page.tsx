import { requireAuth } from '@/lib/auth-server';
import { PrismaClient } from '@prisma/client';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const authUser = await requireAuth();

  // Fetch user details
  const user = await prisma.user.findUnique({
    where: { user_id: authUser.userId },
    select: {
      nickname: true,
      email: true,
      created_at: true,
      last_active_at: true,
      timer_status: true,
    },
  });

  if (!user) {
    return (
      <main className="min-h-screen p-8">
        <h1 className="text-2xl font-bold">User not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user.nickname}!</h2>
          <div className="space-y-2 text-gray-600">
            <p>Email: {user.email}</p>
            <p>Timer Status: {user.timer_status}</p>
            <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
            <p>Last active: {new Date(user.last_active_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/diary"
            className="bg-indigo-600 text-white p-6 rounded-lg hover:bg-indigo-700 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Diary</h3>
            <p className="text-sm">Write and manage your diary entries</p>
          </Link>

          <Link
            href="/settings"
            className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600 transition"
          >
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-sm">Manage your account settings</p>
          </Link>

          <div className="bg-purple-500 text-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Safety Timer</h3>
            <p className="text-sm">Status: {user.timer_status}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
