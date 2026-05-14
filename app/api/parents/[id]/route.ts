import { NextRequest } from 'next/server';
import { ParentController } from '@/src/server/profiles/parent/parent.controller';

// GET /api/parents/[id] - Get parent by ID
export const GET = ParentController.getParentById;

// PUT /api/parents/[id] - Update parent (Admin only)
export const PUT = ParentController.updateParent;

// PATCH /api/parents/[id] - Update parent status (Admin only)
export const PATCH = ParentController.updateParentStatus;

// DELETE /api/parents/[id] - Delete parent (Admin only)
export const DELETE = ParentController.deleteParent;
