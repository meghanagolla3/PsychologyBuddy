import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/src/prisma';

// Simple debug route without middleware
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('DEBUG ROUTE: Called');
    
    const resolvedParams = await params;
    console.log('DEBUG ROUTE: Params:', resolvedParams);
    
    const meeting = await prisma.parentMeeting.findUnique({
      where: { id: resolvedParams.id },
      include: {
        counselor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    console.log('DEBUG ROUTE: Meeting from DB:', meeting);

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedMeeting = {
      ...meeting,
      counselorName: `${meeting.counselor.firstName} ${meeting.counselor.lastName}`,
      counselorEmail: meeting.counselor.email,
      studentName: `${meeting.student.firstName} ${meeting.student.lastName}`,
      studentEmail: meeting.student.email,
      parentName: meeting.parentName,
      parentEmail: meeting.student.email,
    };

    console.log('DEBUG ROUTE: Formatted meeting:', formattedMeeting);
    
    return NextResponse.json({
      success: true,
      data: formattedMeeting,
      message: 'Meeting details retrieved successfully',
    });

  } catch (error: any) {
    console.error('DEBUG ROUTE: Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
