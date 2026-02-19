'use client';

import { useState, useEffect } from 'react';
import BackHeader from '@/components/BackHeader';
import ProfileForm from '@/components/ProfileForm';
import StatusMessage from '@/components/StatusMessage';
import type { UserProfile, ProfilePageStatus } from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/api-client';
import type { UserProfileResponse } from '@/lib/api-client';

export default function ProfilePage() {
  const [status, setStatus] = useState<ProfilePageStatus>('loading');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.USER_PROFILE, { method: 'GET' });
        if (!response.ok) {
          setStatus('error');
          setMessage('프로필을 불러오는 중 오류가 발생했습니다.');
          return;
        }
        const data: UserProfileResponse = await response.json();
        setProfile(data.user);
        setNickname(data.user.nickname ?? '');
        setName(data.user.name ?? '');
        setStatus('idle');
      } catch (error) {
        setStatus('error');
        setMessage('프로필을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchProfile();
  }, []);

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    if (status !== 'saving') {
      setStatus('dirty');
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (status !== 'saving') {
      setStatus('dirty');
    }
  };

  const handleSave = async () => {
    setStatus('saving');
    setMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, name }),
      });

      if (!response.ok) {
        setStatus('error');
        setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }

      const data = await response.json();
      setProfile(data.user);
      setNickname(data.user.nickname ?? '');
      setName(data.user.name ?? '');
      setStatus('success');
      setMessage('저장되었습니다.');
    } catch (error) {
      setStatus('error');
      setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const isSaving = status === 'saving';

  return (
    <main className="min-h-screen pt-16 pb-24 bg-gray-50 dark:bg-gray-950">
      <BackHeader
        title="프로필 관리"
        onSave={handleSave}
        isSaving={isSaving}
      />

      <StatusMessage
        message={message}
        variant={status === 'success' ? 'success' : 'error'}
      />

      {(status === 'loading') && (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
        </div>
      )}

      {profile && (
        <ProfileForm
          email={profile.email}
          name={name}
          nickname={nickname}
          onNameChange={handleNameChange}
          onNicknameChange={handleNicknameChange}
        />
      )}
    </main>
  );
}
