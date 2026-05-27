import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Check if student ID already exists
    const existingStudent = await prisma.user.findFirst({
      where: {
        studentId: studentId,
        role: {
          name: 'STUDENT'
        }
      }
    });

    return NextResponse.json({
      exists: !!existingStudent
    });

  } catch (error) {
    console.error('Error checking student ID:', error);
    return NextResponse.json(
      { error: 'Failed to check student ID' },
      { status: 500 }
    );
  }
}

