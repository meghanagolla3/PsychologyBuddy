import { useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";

export function useUserPermissions() {
  const { user, loading: authLoading } = useAuth();
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userRole = user?.role?.name;
  const isSuperAdmin = userRole === 'SUPERADMIN';
  const isAdmin = userRole === 'ADMIN';
  const isStudent = userRole === 'STUDENT';
  const isParent = userRole === 'PARENT';

  useEffect(() => {
    if (authLoading) return;
    
    if (userRole) {
      // Import role permissions from config
      import("@/src/config/permission").then(({ ROLE_PERMISSIONS }) => {
        const userPermissions = [...(ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [])];
        setPerms(userPermissions);
        setLoading(false);
      });
    } else {
      setPerms([]);
      setLoading(false);
    }
  }, [userRole, authLoading]);

  return {
    loading: authLoading || loading,
    permissions: perms,
    isSuperAdmin,
    isAdmin,
    isStudent,
    isParent,
    can: (perm: string) => perms.includes(perm),
    canView: (module: string) => perms.includes(`${module}.view`),
    canCreate: (module: string) => perms.includes(`${module}.create`),
    canUpdate: (module: string) => perms.includes(`${module}.update`),
    canDelete: (module: string) => perms.includes(`${module}.delete`),
    canRespond: (module: string) => perms.includes(`${module}.respond`),
    canAssign: (module: string) => perms.includes(`${module}.assign`),
    canManage: (module: string) => perms.includes(`${module}.manage`),
  };
}

