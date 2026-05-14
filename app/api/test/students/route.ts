import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);
    
    // Test student profiles
    const studentCount = await prisma.studentProfile.count();
    console.log('Total student profiles:', studentCount);
    
    // Get a few sample students
    const sampleStudents = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        studentId: {
          not: null
        }
      },
      include: {
        classRef: {
          select: {
            grade: true,
            section: true
          }
        },
        school: {
          select: {
            name: true
          }
        }
      },
      take: 5
    });
    
    console.log('Sample students:', sampleStudents);
    
    return NextResponse.json({
      userCount,
      studentCount,
      sampleStudents: sampleStudents.map((s: any) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        studentId: s.studentId,
        class: (s as any).classRef?.grade,
        section: (s as any).classRef?.section,
        school: (s as any).school?.name
      }))
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Database test failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
