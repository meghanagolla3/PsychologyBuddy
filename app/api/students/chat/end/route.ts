import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    console.log('End chat session request:', sessionId);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Update the session to mark it as inactive
    const updatedSession = await prisma.chatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat session ended successfully'
    });

  } catch (error) {
    console.error('Error ending chat session:', error);
    return NextResponse.json(
      { error: 'Failed to end chat session' },
      { status: 500 }
    );
  }
}
