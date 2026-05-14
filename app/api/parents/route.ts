import { NextRequest } from 'next/server';
import { ParentController } from '@/src/server/profiles/parent/parent.controller';

// POST /api/parents - Create parent (Admin only)
export const POST = ParentController.createParent;

// GET /api/parents - Get parents (Admin only)
export const GET = ParentController.getParents;
