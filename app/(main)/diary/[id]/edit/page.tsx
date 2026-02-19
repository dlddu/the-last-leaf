'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import EditHeader from '@/components/EditHeader';
import DateLabel from '@/components/DateLabel';
import DiaryTextarea from '@/components/DiaryTextarea';
import BottomBar from '@/components/BottomBar';
import ConfirmLeaveModal from '@/components/ConfirmLeaveModal';
import { API_ENDPOINTS } from '@/lib/api-client';
import type { SaveStatus } from '@/lib/types';

type ErrorState = 'not_found' | 'forbidden' | null;

interface DiaryData {
  diary_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface DiaryEditPageProps {
  params: Promise<{ id: string }>;
}

export default function DiaryEditPage({ params }: DiaryEditPageProps) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [diaryId, setDiaryId] = useState<string | null>(null);
  const [diaryDate, setDiaryDate] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDiary = async () => {
      const { id } = await params;
      setDiaryId(id);

      try {
        const response = await fetch(API_ENDPOINTS.DIARY_BY_ID(id), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (!cancelled) {
            if (response.status === 403) {
              setError('forbidden');
            } else if (response.status === 404) {
              setError('not_found');
            } else {
              routerRef.current.push(`/diary`);
            }
            setIsLoading(false);
          }
          return;
        }

        const data: DiaryData = await response.json();

        if (!cancelled) {
          setContent(data.content);
          setDiaryDate(data.created_at);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading diary:', error);
        if (!cancelled) {
          routerRef.current.push(`/diary`);
        }
      }
    };

    loadDiary();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (saveStatus !== 'saving') {
      setSaveStatus('dirty');
    }
  };

  const handleSave = useCallback(async () => {
    if (!content.trim() || saveStatus === 'saving' || !diaryId) {
      return;
    }

    setSaveStatus('saving');

    try {
      const response = await fetch(API_ENDPOINTS.DIARY_BY_ID(diaryId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save diary');
      }

      setSaveStatus('saved');
      router.push(`/diary/${diaryId}`);
    } catch (error) {
      console.error('Error saving diary:', error);
      setSaveStatus('error');
    }
  }, [content, saveStatus, diaryId, router]);

  const handleBack = () => {
    if (saveStatus === 'dirty') {
      setShowLeaveModal(true);
    } else {
      router.back();
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    router.back();
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  const characterCount = content?.length || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div role="status" aria-label="로딩 중">
          <span className="text-gray-500 dark:text-gray-400">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error === 'forbidden') {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">403</h1>
        <p className="text-gray-500 dark:text-gray-400">권한이 없습니다</p>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">404</h1>
        <p className="text-gray-500 dark:text-gray-400">일기를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <EditHeader
        onSave={handleSave}
        onBack={handleBack}
        isSaving={saveStatus === 'saving'}
        disabled={!content.trim()}
      />

      <main className="flex-1 pt-16 pb-16 overflow-hidden">
        {diaryDate && (
          <div className="px-5 pt-6 mb-4">
            <DateLabel date={diaryDate} />
          </div>
        )}
        <DiaryTextarea
          value={content}
          onChange={handleContentChange}
        />
      </main>

      <BottomBar
        characterCount={characterCount}
        saveStatus={saveStatus}
      />

      <ConfirmLeaveModal
        isOpen={showLeaveModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </div>
  );
}
