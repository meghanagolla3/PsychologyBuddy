import { NextRequest } from 'next/server';
import { MoodController } from '@/src/components/server/content/labels/moods/mood.controller';

// GET /api/labels/moods - Get all moods (Admin & SuperAdmin)
export const GET = MoodController.getMoods;

// POST /api/labels/moods - Create mood (Admin & SuperAdmin)
export const POST = MoodController.createMood;
