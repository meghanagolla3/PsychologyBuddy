import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselingService, completeSessionSchema } from '@/src/server/counseling/counseling.service';
import { EscalationAlertService } from '@/src/services/escalations/escalation-alert-service';
import prisma from '@/src/prisma';

const counselingService = new CounselingService();

// Complete Session (handles both generic completion and follow-up with report)
export const PATCH = withPermission({
  module: 'COUNSELING_SESSIONS',
  action: 'RESPOND',
})(async (req: NextRequest, { params, user }: any) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    if (!user.id || !user.schoolId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated or not assigned to a school' },
        { status: 401 }
      );
    }

    // Get the session to determine its type
    const session = await prisma.counselingSession.findFirst({
      where: {
        id,
        schoolId: user.schoolId,
        counselorId: user.id,
      },
      include: {
        student: true,
        previousSession: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // If this is a follow-up session with report data, handle it specially
    if (session.sessionType === 'FOLLOW_UP' && body.behavioralTags) {
      // Save the report first
      const report = await prisma.sessionReport.upsert({
        where: { sessionId: id },
        update: {
          behavioralTags: body.behavioralTags || [],
          summary: body.summary || '',
          recommendations: body.recommendations || [],
          notes: body.notes || '',
        },
        create: {
          sessionId: id,
          behavioralTags: body.behavioralTags || [],
          summary: body.summary || '',
          recommendations: body.recommendations || [],
          notes: body.notes || '',
        },
      });

      // Mark current session as completed
      const updatedSession = await prisma.counselingSession.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
        },
      });

      // Resolve any related escalation alerts and update assignment status when session is completed
      try {
        await EscalationAlertService.updateAlertStatusOnSessionCompletion(id);
        console.log('Session completion processed for session:', id);
      } catch (escalationError) {
        console.error('Failed to update alert/assignment status:', escalationError);
        // Don't fail the whole request if status update fails
      }

      // Check if another follow-up is needed based on recommendations
      const needsAnotherFollowUp = body.recommendations && 
        body.recommendations.some((rec: string) => 
          rec.toLowerCase().includes('follow-up') || 
          rec.toLowerCase().includes('continue') ||
          rec.toLowerCase().includes('monitor')
        );

      let nextSession = null;
      if (needsAnotherFollowUp) {
        // Create another follow-up session
        nextSession = await prisma.counselingSession.create({
          data: {
            studentId: session.studentId,
            counselorId: session.counselorId,
            schoolId: session.schoolId,
            classId: session.classId,
            section: session.section,
            sessionType: 'FOLLOW_UP',
            status: 'SCHEDULED',
            scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
            previousSessionId: id,
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true,
              },
            },
          },
        });

        // Update current session to reference the next session
        await prisma.counselingSession.update({
          where: { id },
          data: {
            nextSessionId: nextSession.id,
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          report,
          currentSession: {
            ...session,
            status: 'COMPLETED',
            endedAt: new Date(),
            nextSessionId: nextSession?.id,
          },
          nextSession,
        },
        message: needsAnotherFollowUp 
          ? 'Follow-up session completed and another follow-up scheduled'
          : 'Follow-up session completed successfully',
      });
    } else {
      // Handle generic session completion
      const validatedData = completeSessionSchema.parse(body);
      const completedSession = await counselingService.completeSession(id, user.schoolId, user.id, validatedData);
      
      return NextResponse.json({
        success: true,
        data: completedSession,
        message: 'Session completed successfully',
      });
    }
  } catch (error: any) {
    console.error('Complete session error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    });
    
    if (error.message === 'Session not found') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }

    if (error.message === 'Access denied') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 403 }
      );
    }

    if (error.message === 'Session can only be completed if it is in progress') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to complete session',
        error: error.message,
        details: {
          name: error.name,
          code: error.code,
          meta: error.meta
        }
      },
      { status: 500 }
    );
  }
});
