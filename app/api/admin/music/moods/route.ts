import { NextRequest } from 'next/server';
import { MusicMoodsController } from '@/src/server/controllers/music.moods.controller';

// GET /api/admin/music/moods - Get all music moods
export const GET = MusicMoodsController.getMusicMoods;

// POST /api/admin/music/moods - Create music mood
export const POST = MusicMoodsController.createMusicMood;
