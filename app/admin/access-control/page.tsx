"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePermissions } from '@/src/hooks/usePermissions';
import { UnifiedAdminDashboard } from '@/src/components/admin/layout/AdminSidebar';

export default function AccessControlPage() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const router = useRouter();

  // Redirect if not authenticated or not SuperAdmin
  React.useEffect(() => {
    if (!user || !permissions.isSuperAdmin || !permissions.hasPermission('access.control.manage')) {
      router.push('/login');
    }
  }, [user, permissions, router]);

  if (!user || !permissions.isSuperAdmin || !permissions.hasPermission('access.control.manage')) {
    return <div>Loading...</div>;
  }

  return <UnifiedAdminDashboard activeSection="access-control" />;
}
