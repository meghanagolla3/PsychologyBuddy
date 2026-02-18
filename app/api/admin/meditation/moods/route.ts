import { NextRequest } from 'next/server';
import { MeditationMoodsController } from '@/src/server/controllers/meditation.moods.controller';

// GET /api/admin/meditation/moods - Get all meditation moods
export const GET = MeditationMoodsController.getMeditationMoods;

// POST /api/admin/meditation/moods - Create meditation mood
export const POST = MeditationMoodsController.createMeditationMood;
