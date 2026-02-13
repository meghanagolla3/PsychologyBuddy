import { NextRequest } from 'next/server';
import { AdminController } from '@/src/components/server/profiles/admin/admin.controller';

// POST /api/admins - Create admin (SuperAdmin only)
export const POST = AdminController.createAdmin;

// GET /api/admins - Get all admins (SuperAdmin only)
export const GET = AdminController.getAdmins;
