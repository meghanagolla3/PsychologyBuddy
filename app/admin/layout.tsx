"use client";

import React from 'react';
import { AdminLayout as AdminLayoutComponent } from '@/src/components/admin/layout/AdminLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutComponent>{children}</AdminLayoutComponent>;
}
