import { NextResponse } from "next/server";
import prisma from "@/src/prisma";

export async function POST(req: Request) {
  try {
    console.log('Session validation request received');
    
    const { sessionId, studentId } = await req.json();

    if (!sessionId || !studentId) {
      console.log('Missing required fields:', { sessionId, studentId });
      return NextResponse.json(
        { error: "Session ID and Student ID are required" },
        { status: 400 }
      );
    }

    console.log('Validating session:', { sessionId, studentId });

    // Check if Prisma is available
    if (!prisma) {
      console.error('Prisma client not available');
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Find the session
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        studentId: studentId,
      },
      include: {
        messages: {
          select: {
            id: true,
            senderType: true,
            content: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    console.log('Session validation result:', session);

    if (!session) {
      // Try to get all student sessions for debugging
      let allStudentSessions: any[] = [];
      try {
        allStudentSessions = await prisma.chatSession.findMany({
          where: { studentId: studentId },
          select: { id: true, isActive: true, startedAt: true }
        });
      } catch (e) {
        console.error('Failed to get student sessions:', e);
      }
      
      return NextResponse.json({
        valid: false,
        error: "Session not found",
        allStudentSessions
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      session: {
        id: session.id,
        isActive: session.isActive,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        messageCount: session.messages.length
      }
    });

  } catch (error) {
    console.error("Session validation error:", error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('prisma')) {
        return NextResponse.json(
          { error: "Database error: " + error.message },
          { status: 500 }
        );
      }
      
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: "Invalid request format" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to validate session: " + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
