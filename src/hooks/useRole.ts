import { useAuth } from "@/src/contexts/AuthContext";

export function useRole() {
  const { user, loading } = useAuth();
  const role = user?.role?.name || null;

  return {
    role,
    loading,
    isSuperAdmin: role === 'SUPERADMIN',
    isAdmin: role === 'ADMIN',
    isSchoolSuperAdmin: role === 'SCHOOL_SUPERADMIN',
    isStudent: role === 'STUDENT',
    isParent: role === 'PARENT',
    canManageUsers: ['SUPERADMIN', 'SCHOOL_SUPERADMIN'].includes(role || ''),
    canManageContent: ['SUPERADMIN', 'ADMIN', 'SCHOOL_SUPERADMIN'].includes(role || ''),
    canViewOnly: ['STUDENT', 'PARENT'].includes(role || ''),
  };
}

