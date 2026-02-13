import { NextRequest } from 'next/server';
import { AdminController } from '@/src/components/server/profiles/admin/admin.controller';

// GET /api/admins/[id] - Get admin by ID (SuperAdmin only)
export const GET = AdminController.getAdminById;

// PUT /api/admins/[id] - Update admin (SuperAdmin only)
export const PUT = AdminController.updateAdmin;

// PATCH /api/admins/[id] - Update admin status (SuperAdmin only)
export const PATCH = AdminController.updateAdminStatus;

// DELETE /api/admins/[id] - Delete admin (SuperAdmin only)
export const DELETE = AdminController.deleteAdmin;
