import { NextRequest } from 'next/server';
import { AdminController } from '@/src/components/server/profiles/admin/admin.controller';

// POST /api/admins/[id]/reset-password - Reset admin password (SuperAdmin only)
export const POST = AdminController.resetAdminPassword;
