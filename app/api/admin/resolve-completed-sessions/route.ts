import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get all completed sessions
    const completedSessions = await prisma.counselingSession.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        escalation: true
      }
    });
    
    let resolvedCount = 0;
    let linkedCount = 0;
    
    for (const session of completedSessions) {
      
      if (session.escalationId && session.escalation && session.escalation.status !== 'resolved') {
        // Resolve the escalation
        await prisma.escalationAlert.update({
          where: { id: session.escalationId },
          data: {
            status: 'resolved',
            updatedAt: new Date()
          }
        });
        
        resolvedCount++;
      } else if (!session.escalationId) {
        // Try to find escalation by sessionId first
        let alertBySession = await prisma.escalationAlert.findFirst({
          where: {
            sessionId: session.id
          }
        });
        
        // If not found by exact sessionId, try to find by student
        if (!alertBySession) {
          // Get session completion time (or use updatedAt as fallback)
          const sessionTime = session.updatedAt || session.createdAt;
          const searchWindow = {
            gte: new Date(sessionTime.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
            lte: new Date(sessionTime.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days after
          };
          
          // Try to find any open escalation for this student
          const allStudentAlerts = await prisma.escalationAlert.findMany({
            where: {
              studentId: session.studentId,
              status: 'open'
            },
            orderBy: { createdAt: 'desc' }
          });
          
          alertBySession = allStudentAlerts[0]; // Get the most recent one
        }
        
        if (alertBySession && alertBySession.status !== 'resolved') {
          // Link the session to the escalation
          await prisma.counselingSession.update({
            where: { id: session.id },
            data: { escalationId: alertBySession.id }
          });
          
          // Resolve the escalation
          await prisma.escalationAlert.update({
            where: { id: alertBySession.id },
            data: {
              status: 'resolved',
              updatedAt: new Date()
            }
          });
          
          resolvedCount++;
          linkedCount++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      resolvedCount,
      linkedCount,
      totalSessions: completedSessions.length,
      message: `Resolved ${resolvedCount} escalation alerts for completed sessions`
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to resolve completed sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
