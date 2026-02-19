'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CreateHeader from '@/components/CreateHeader';
import DiaryTextarea from '@/components/DiaryTextarea';
import BottomBar from '@/components/BottomBar';
import ConfirmLeaveModal from '@/components/ConfirmLeaveModal';
import { API_ENDPOINTS } from '@/lib/api-client';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export default function DiaryCreatePage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (saveStatus !== 'saving') {
      setSaveStatus(e.target.value.trim() ? 'dirty' : 'idle');
    }
  };

  const handleSave = useCallback(async () => {
    // Don't save if content is empty or already saving
    if (!content.trim() || saveStatus === 'saving') {
      return;
    }

    setSaveStatus('saving');

    try {
      const response = await fetch(API_ENDPOINTS.DIARY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save diary');
      }

      const data = await response.json();
      setSaveStatus('saved');

      // Navigate to the created diary
      router.push(`/diary/${data.diary_id}`);
    } catch (error) {
      console.error('Error saving diary:', error);
      setSaveStatus('error');
    }
  }, [content, saveStatus, router]);

  const handleBack = () => {
    // Show modal only if there's unsaved content
    if (saveStatus === 'dirty') {
      setShowLeaveModal(true);
    } else {
      router.push('/diary');
    }
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    router.push('/diary');
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  const characterCount = content.length;

  return (
    <div className="flex flex-col h-screen">
      <CreateHeader
        onSave={handleSave}
        onBack={handleBack}
        isSaving={saveStatus === 'saving'}
        disabled={!content.trim()}
      />

      <main className="flex-1 pt-16 pb-16 overflow-hidden">
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
