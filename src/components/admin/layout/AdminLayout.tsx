"use client";

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Protected } from '@/src/components/Protected';
import { SchoolFilterProvider } from '@/src/contexts/SchoolFilterContext';

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Protected role={['ADMIN', 'SUPERADMIN']}>
      <SchoolFilterProvider>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </SchoolFilterProvider>
    </Protected>
  );
}
