import { NextRequest } from 'next/server';
import { MoodController } from '@/src/server/controllers/mood.controller';

// GET /api/moods/[id] - Get mood by ID (Admin & SuperAdmin)
export const GET = MoodController.getMoodById;

// PUT /api/moods/[id] - Update mood (Admin & SuperAdmin)
export const PUT = MoodController.updateMood;

// DELETE /api/moods/[id] - Delete mood (Admin & SuperAdmin)
export const DELETE = MoodController.deleteMood;
