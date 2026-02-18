'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EditHeader from '@/components/EditHeader';
import DateLabel from '@/components/DateLabel';
import DiaryTextarea from '@/components/DiaryTextarea';
import BottomBar from '@/components/BottomBar';
import ConfirmLeaveModal from '@/components/ConfirmLeaveModal';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

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
  const [diaryId, setDiaryId] = useState<string | null>(null);
  const [diaryDate, setDiaryDate] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDiary = async () => {
      const { id } = await params;
      setDiaryId(id);

      try {
        const response = await fetch(`/api/diary/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (!cancelled) {
            router.push(`/diary`);
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
          router.push(`/diary`);
        }
      }
    };

    loadDiary();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

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
      const response = await fetch(`/api/diary/${diaryId}`, {
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
      router.push(`/diary/${diaryId}`);
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    router.push(`/diary/${diaryId}`);
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  const characterCount = content.length;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <div role="status" aria-label="로딩 중">
          <span className="text-gray-500">로딩 중...</span>
        </div>
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
          <div className="px-4 pt-4">
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
