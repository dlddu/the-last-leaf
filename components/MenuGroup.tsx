'use client';

import React from 'react';

interface MenuGroupProps {
  title: string;
  children: React.ReactNode;
}

export default function MenuGroup({ title, children }: MenuGroupProps) {
  return (
    <div className="mb-6">
      <div className="px-4 py-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="bg-white rounded-xl overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}
