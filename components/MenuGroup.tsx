'use client';

import React from 'react';

interface MenuGroupProps {
  title: string;
  children: React.ReactNode;
}

export default function MenuGroup({ title, children }: MenuGroupProps) {
  return (
    <div className="mb-6">
      <div className="px-5 pt-4 pb-2">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
          {title}
        </span>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
