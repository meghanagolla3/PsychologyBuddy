import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/prisma';

// GET - Search students by name or student ID
export async function GET(req: NextRequest) {
  try {
    console.log('Student search API called');
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    console.log('Searching students with query:', query);

    if (!query) {
      console.log('Empty query, returning empty array');
      return NextResponse.json([]);
    }

    // Query users with student information
    const students = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        studentId: {
          not: null
        },
        OR: [
          {
            firstName: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            studentId: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
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
            id: true,
            name: true
          }
        }
      },
      take: 10
    });

    console.log(`Found ${students.length} students`);

    // Transform the data
    const transformedStudents = students.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId || '',
      class: student.classRef?.grade?.toString() || '',
      section: student.classRef?.section || '',
      schoolId: student.school?.id || '',
      schoolName: student.school?.name || ''
    }));

    console.log('Returning students:', transformedStudents);

    return NextResponse.json(transformedStudents);

  } catch (error: any) {
    console.error('Error in student search API:', error);
    return NextResponse.json(
      { error: 'Failed to search students', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
