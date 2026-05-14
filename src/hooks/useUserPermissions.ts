import { useEffect, useState } from "react";

export function useUserPermissions() {
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [isParent, setIsParent] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.user?.role?.name) {
          // Get permissions from role
          const userRole = data.data.user.role.name;
          setIsSuperAdmin(userRole === 'SUPERADMIN');
          setIsAdmin(userRole === 'ADMIN');
          setIsStudent(userRole === 'STUDENT');
          setIsParent(userRole === 'PARENT');
          
          // Import role permissions from config
          import("@/src/config/permission").then(({ ROLE_PERMISSIONS }) => {
            const userPermissions = [...(ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [])];
            setPerms(userPermissions);
          });
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch user permissions:', error);
        setLoading(false);
      });
  }, []);

  return {
    loading,
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
