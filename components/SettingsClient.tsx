'use client';

import SettingsHeader from '@/components/SettingsHeader';
import UserInfoCard from '@/components/UserInfoCard';
import MenuGroup from '@/components/MenuGroup';
import MenuItem from '@/components/MenuItem';
import LogoutButton from '@/components/LogoutButton';
import { API_ENDPOINTS } from '@/lib/api-client';
import type { UserProfileResponse } from '@/lib/api-client';
import { useFetch } from '@/hooks/useFetch';

export default function SettingsClient() {
  const { data } = useFetch<UserProfileResponse>(API_ENDPOINTS.USER_PROFILE);
  const profile = data?.user ?? null;

  return (
    <main className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-950">
      <SettingsHeader />

      {profile && (
        <UserInfoCard nickname={profile.nickname} email={profile.email} />
      )}

      <div className="mt-4 px-4">
        <MenuGroup title="계정">
          <MenuItem
            label="프로필 관리"
            href="/settings/profile"
            testId="menu-item-profile"
            icon="👤"
            sub="이름, 닉네임"
          />
          <MenuItem
            label="연락처 관리"
            href="/settings/contacts"
            icon="📞"
            sub="긴급 연락처"
          />
        </MenuGroup>

        <MenuGroup title="환경설정">
          <MenuItem
            label="타이머 일시 중지"
            href="/settings/preferences"
            icon="⏸️"
            sub="비활성 감지 일시 중지"
          />
        </MenuGroup>

        <MenuGroup title="위험">
          <MenuItem
            label="계정 탈퇴"
            variant="danger"
            href="/settings/withdraw"
            icon="🚪"
          />
        </MenuGroup>

        <LogoutButton />
      </div>
    </main>
  );
}
