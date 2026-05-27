import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || req.headers.get('x-user-id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Find the user first
    const student = await prisma.user.findUnique({
      where: { studentId: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Find any active chat session for this student
    const activeSession = await prisma.chatSession.findFirst({
      where: {
        userId: student.id,
        isActive: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    if (!activeSession) {
      return NextResponse.json({
        success: true,
        activeSession: null,
      });
    }

    return NextResponse.json({
      success: true,
      activeSession: {
        id: activeSession.id,
        startedAt: activeSession.startedAt,
        mood: activeSession.mood,
        triggers: activeSession.triggers ? activeSession.triggers.split(', ') : [],
      },
    });

  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active session' },
      { status: 500 }
    );
  }
}

