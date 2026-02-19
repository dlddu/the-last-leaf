'use client';

import type { Contact } from '@/lib/types';

interface ContactCardProps {
  index: number;
  contact: Contact;
  onChange: (index: number, field: 'email' | 'phone', value: string) => void;
  onDelete: (index: number) => void;
}

export default function ContactCard({ index, contact, onChange, onDelete }: ContactCardProps) {
  return (
    <div
      data-testid="contact-card"
      className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
          연락처 {index + 1}
        </span>
        <button
          data-testid="contact-delete-button"
          onClick={() => onDelete(index)}
          aria-label="삭제"
          className="text-xs text-red-400 hover:text-red-500 transition-colors focus:outline-none"
        >
          삭제
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">이메일</label>
        <input
          data-testid="contact-email"
          type="email"
          value={contact.email}
          onChange={(e) => onChange(index, 'email', e.target.value)}
          placeholder="이메일 주소"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">전화번호</label>
        <input
          data-testid="contact-phone"
          type="tel"
          value={contact.phone}
          onChange={(e) => onChange(index, 'phone', e.target.value)}
          placeholder="전화번호"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
