import { User } from '@/src/generated/prisma/client';

type UserWithPermissions = User & {
  role?: {
    rolePermissions?: {
      permission: {
        name: string;
      };
    }[];
  } | null;
  adminProfile?: {
    adminPermissions?: {
      permission: {
        name: string;
      };
    }[];
  } | null;
};

export function extractUserPermissions(user: UserWithPermissions | null) {
  if (!user) return [];

  const rolePerms = user.role?.rolePermissions?.map((rp) => rp.permission.name) || [];
  const adminPerms = user.adminProfile?.adminPermissions?.map((ap) => ap.permission.name) || [];

  const all = new Set([...rolePerms, ...adminPerms]);
  return Array.from(all);
}
