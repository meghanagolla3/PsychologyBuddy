import { NextResponse } from "next/server";
import prisma from "@/src/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get today's mood checkin for the student
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    const moodCheckin = await prisma.moodCheckin.findFirst({
      where: {
        studentId: studentId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: !!moodCheckin,
      moodCheckin: moodCheckin ? {
        id: moodCheckin.id,
        mood: moodCheckin.mood,
        notes: moodCheckin.notes,
        createdAt: moodCheckin.createdAt
      } : null
    });

  } catch (error) {
    console.error("Error checking today's mood checkin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check today's mood checkin" },
      { status: 500 }
    );
  }
}
