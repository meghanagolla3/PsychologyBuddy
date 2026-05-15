"use client";

import React, { useState } from 'react';
import { Bell, Menu, X } from "lucide-react";
import { ParentSidebar } from './ParentSidebar';
import { Protected } from '@/src/components/Protected';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Protected role={['PARENT']}>
      <div className="flex h-screen bg-[#f2f3f4] overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Desktop: Fixed, Mobile: Fixed with overlay */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <ParentSidebar setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-white px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            {/* Right side items */}
            <div className="flex items-center gap-4">
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" strokeWidth={1.8} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-info ring-2 ring-card" />
              </button>
            </div>
          </header>
          
          {/* Responsive Content Area */}
          <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </Protected>
  );
}

export function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
