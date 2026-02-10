import { NextRequest, NextResponse } from 'next/server'
import { SummaryService } from '@/src/services/chats/summaryService'
import prisma from '@/src/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    console.log('Get specific summary request:', sessionId)

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get the session to find the studentId (no auth required for now)
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { studentId: true }
    });
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }
    
    console.log('Found session for student:', session.studentId);

    // Get summary for the session
    const summary = await SummaryService.getSessionSummary(sessionId, session.studentId)

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Summary not found' },
        { status: 404 }
      )
    }

    console.log('Found summary:', summary);

    // Return the expected format
    return NextResponse.json({
      success: true,
      data: {
        mainTopic: summary.mainTopic,
        conversationStart: summary.conversationStart,
        conversationAbout: summary.conversationAbout,
        reflection: summary.reflection,
        createdAt: summary.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error getting summary:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get summary' 
      },
      { status: 500 }
    )
  }
}
