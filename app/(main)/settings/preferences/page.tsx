'use client';

import { useState, useEffect } from 'react';
import BackHeader from '@/components/BackHeader';
import TimerPauseCard from '@/components/TimerPauseCard';
import IdleThresholdCard from '@/components/IdleThresholdCard';

type PageStatus = 'loading' | 'idle' | 'saving' | 'success' | 'error';

interface Preferences {
  timer_status: string;
  timer_idle_threshold_sec: number;
}

export default function PreferencesPage() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences', { method: 'GET' });
        if (!response.ok) {
          setStatus('error');
          setMessage('설정을 불러오는 중 오류가 발생했습니다.');
          return;
        }
        const data = await response.json();
        setPreferences(data);
        setStatus('idle');
      } catch (error) {
        setStatus('error');
        setMessage('설정을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = async (isPaused: boolean) => {
    if (!preferences) return;

    const previousPreferences = { ...preferences };
    const newTimerStatus = isPaused ? 'paused' : 'inactive';
    const apiTimerStatus = isPaused ? 'PAUSED' : 'INACTIVE';

    // Optimistically update local state
    setPreferences({ ...preferences, timer_status: newTimerStatus });
    setStatus('saving');
    setMessage('');

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_status: apiTimerStatus }),
      });

      if (!response.ok) {
        setStatus('error');
        setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        setPreferences(previousPreferences);
        return;
      }

      const data = await response.json();
      setPreferences(data);
      setStatus('success');
      setMessage('저장되었습니다.');
    } catch (error) {
      setStatus('error');
      setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setPreferences(previousPreferences);
    }
  };

  const handlePeriodChange = async (value: number) => {
    if (!preferences) return;

    const previousPreferences = { ...preferences };

    // Optimistically update local state
    setPreferences({ ...preferences, timer_idle_threshold_sec: value });
    setStatus('saving');
    setMessage('');

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timer_idle_threshold_sec: value }),
      });

      if (!response.ok) {
        setStatus('error');
        setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        setPreferences(previousPreferences);
        return;
      }

      const data = await response.json();
      setPreferences(data);
      setStatus('success');
      setMessage('저장되었습니다.');
    } catch (error) {
      setStatus('error');
      setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      setPreferences(previousPreferences);
    }
  };

  const isSaving = status === 'saving';
  const isPaused = preferences?.timer_status === 'paused';

  return (
    <main className="min-h-screen pt-16 pb-24 bg-gray-50 dark:bg-gray-950">
      <BackHeader title="환경설정" />

      {message && (
        <div
          className={`mx-4 mt-4 px-4 py-3 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {status === 'loading' && (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
        </div>
      )}

      {preferences && (
        <div className="mt-4 px-4 space-y-4">
          <TimerPauseCard
            isPaused={isPaused}
            onToggle={handleToggle}
            disabled={isSaving}
          />

          <IdleThresholdCard
            selectedValue={preferences.timer_idle_threshold_sec}
            onChange={handlePeriodChange}
            disabled={isSaving}
          />
        </div>
      )}
    </main>
  );
}
