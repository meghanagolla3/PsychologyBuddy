'use client';

import React, { useState } from 'react';
import { Bell, Menu, X } from "lucide-react";
import { Sidebar } from './CounselorSidebar';
import { CounselorNotifications } from './CounselorNotifications';
import { Protected } from '@/src/components/Protected';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Protected role={['COUNSELOR']}>
      <div className="flex h-screen bg-[#f2f3f4] overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex" />

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white transition-transform duration-300 ease-in-out lg:hidden transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <img src="/logo1.png" alt="Logo" className="h-10 w-auto" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Sidebar className="flex-1 border-r-0" onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex h-[72px] shrink-0 items-center justify-between lg:justify-end border-b border-border bg-white px-4 md:px-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4">
              <CounselorNotifications />
            </div>
          </header>

          <div className="flex-1 overflow-auto px-4 md:px-8 py-4 md:py-2">
            <div className="mx-auto w-full max-w-8xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </Protected>
  );
}

export function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

export default CounselorLayout;

