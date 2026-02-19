'use client';

import { useState, useEffect } from 'react';
import BackHeader from '@/components/BackHeader';
import ContactCard from '@/components/ContactCard';
import StatusMessage from '@/components/StatusMessage';
import PageLoading from '@/components/PageLoading';
import type { Contact, PageStatus } from '@/lib/types';
import { API_ENDPOINTS, mapContacts } from '@/lib/api-client';
import type { ContactsResponse } from '@/lib/api-client';

export default function ContactsClient() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.USER_CONTACTS, { method: 'GET' });
        if (!response.ok) {
          setStatus('error');
          setMessage('연락처를 불러오는 중 오류가 발생했습니다.');
          return;
        }
        const data: ContactsResponse = await response.json();
        setContacts(mapContacts(data.contacts ?? []));
        setStatus('idle');
      } catch (error) {
        setStatus('error');
        setMessage('연락처를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchContacts();
  }, []);

  const handleChange = (index: number, field: 'email' | 'phone', value: string) => {
    setContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDelete = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddContact = () => {
    setContacts((prev) => [...prev, { email: '', phone: '' }]);
  };

  const handleSave = async () => {
    setStatus('saving');
    setMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.USER_CONTACTS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contacts: contacts.map((c) => ({ email: c.email, phone: c.phone })),
        }),
      });

      if (!response.ok) {
        setStatus('error');
        setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }

      const data: ContactsResponse = await response.json();
      setContacts(mapContacts(data.contacts ?? []));
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
        title="연락처 관리"
        rightLabel="추가"
        onRightAction={handleAddContact}
      />

      <StatusMessage
        message={message}
        variant={status === 'success' ? 'success' : 'error'}
      />

      {status === 'loading' && <PageLoading />}

      {status !== 'loading' && (
        <div className="px-4 py-6 flex flex-col gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
            비활성 감지 시 아래 연락처로 자서전 링크가 전송됩니다.
          </p>

          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              등록된 연락처가 없습니다.
            </p>
          ) : (
            contacts.map((contact, index) => (
              <ContactCard
                key={index}
                index={index}
                contact={contact}
                onChange={handleChange}
                onDelete={handleDelete}
              />
            ))
          )}

          <button
            data-testid="add-contact-button"
            onClick={handleAddContact}
            className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 dark:text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 flex flex-col items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>연락처 추가</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            aria-label={isSaving ? '저장 중...' : '저장'}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}
    </main>
  );
}
