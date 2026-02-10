"use client";

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Protected } from '@/src/components/Protected';

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected role={['ADMIN', 'SUPERADMIN']}>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </Protected>
  );
}
