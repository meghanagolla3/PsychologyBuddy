"use client";

import React from "react";
import Header from "./Header";

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
}

export default function StudentLayout({ children, title }: StudentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-10">
        {children}
      </main>
    </div>
  );
}
