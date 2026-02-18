'use client';

import BackHeader from '@/components/BackHeader';
import WithdrawCard from '@/components/WithdrawCard';

export default function WithdrawPage() {
  return (
    <main className="min-h-screen pt-16 pb-24 bg-gray-50">
      <BackHeader title="계정 탈퇴" />

      <div className="mt-4 px-4">
        <WithdrawCard />
      </div>
    </main>
  );
}
