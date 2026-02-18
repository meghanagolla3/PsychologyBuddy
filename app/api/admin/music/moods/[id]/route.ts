import { NextRequest } from 'next/server';
import { MusicMoodsController } from '@/src/server/controllers/music.moods.controller';

// GET /api/admin/music/moods/[id] - Get music mood by ID
export const GET = MusicMoodsController.getMusicMoodById;

// PUT /api/admin/music/moods/[id] - Update music mood
export const PUT = MusicMoodsController.updateMusicMood;

// DELETE /api/admin/music/moods/[id] - Delete music mood
export const DELETE = MusicMoodsController.deleteMusicMood;
