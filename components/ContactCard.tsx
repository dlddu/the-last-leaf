'use client';

interface Contact {
  email: string;
  phone: string;
}

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
      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">연락처 {index + 1}</span>
        <button
          data-testid="contact-delete-button"
          onClick={() => onDelete(index)}
          aria-label="삭제"
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">이메일</label>
        <input
          data-testid="contact-email"
          type="email"
          value={contact.email}
          onChange={(e) => onChange(index, 'email', e.target.value)}
          placeholder="이메일 주소"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">전화번호</label>
        <input
          data-testid="contact-phone"
          type="tel"
          value={contact.phone}
          onChange={(e) => onChange(index, 'phone', e.target.value)}
          placeholder="전화번호"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>
    </div>
  );
}
