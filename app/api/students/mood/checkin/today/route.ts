import { NextResponse } from "next/server";
import { DatabaseService } from "@/src/lib/database/database-service";
import { createAPIHandler } from "@/src/lib/create-api-handler";

export const GET = createAPIHandler.get(
  async (params, context) => {
    // Use the authenticated user's ID instead of requiring studentId parameter
    const userId = context.id;
    
    // Get today's mood checkin for the user
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    const moodCheckin = await DatabaseService.getTodayMoodCheckin(userId);

    return {
      hasCheckin: !!moodCheckin,
      moodCheckin: moodCheckin ? {
        id: moodCheckin.id,
        mood: moodCheckin.mood,
        notes: moodCheckin.notes,
        createdAt: moodCheckin.createdAt
      } : null
    };
  },
  { requireAuth: true }
);
