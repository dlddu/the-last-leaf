'use client';

import { useState, useEffect } from 'react';
import BackHeader from '@/components/BackHeader';
import ContactCard from '@/components/ContactCard';

interface Contact {
  contact_id?: string;
  user_id?: string;
  email: string;
  phone: string;
}

type PageStatus = 'loading' | 'loaded' | 'saving' | 'success' | 'error';

export default function ContactsClient() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/user/contacts', { method: 'GET' });
        if (!response.ok) {
          setStatus('error');
          setMessage('연락처를 불러오는 중 오류가 발생했습니다.');
          return;
        }
        const data = await response.json();
        setContacts(
          (data.contacts ?? []).map((c: Contact) => ({
            contact_id: c.contact_id,
            user_id: c.user_id,
            email: c.email ?? '',
            phone: c.phone ?? '',
          }))
        );
        setStatus('loaded');
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
      const response = await fetch('/api/user/contacts', {
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

      const data = await response.json();
      setContacts(
        (data.contacts ?? []).map((c: Contact) => ({
          contact_id: c.contact_id,
          user_id: c.user_id,
          email: c.email ?? '',
          phone: c.phone ?? '',
        }))
      );
      setStatus('success');
      setMessage('저장되었습니다.');
    } catch (error) {
      setStatus('error');
      setMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const isSaving = status === 'saving';

  return (
    <main className="min-h-screen pt-16 pb-24 bg-gray-50">
      <BackHeader
        title="연락처 관리"
        onSave={handleSave}
        isSaving={isSaving}
      />

      {message && (
        <div
          className={`mx-4 mt-4 px-4 py-3 rounded-lg text-sm ${
            status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {status === 'loading' && (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      )}

      {status !== 'loading' && (
        <div className="px-4 py-6 flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            비활성 감지 시 아래 연락처로 자서전 링크가 전송됩니다.
          </p>

          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
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
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            + 연락처 추가
          </button>
        </div>
      )}
    </main>
  );
}
