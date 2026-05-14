import { NextRequest, NextResponse } from 'next/server';
import { StudentRepository } from '@/src/server/profiles/student/student.repository';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';

// GET /api/students/by-parent/[parentId] - Get students by parent ID (Admin only)
export const GET = withPermission({
  module: 'USER_MANAGEMENT',
  action: 'VIEW',
})(async (_req: NextRequest, { params }: any) => {
  try {
    const { parentId } = await params;
    
    if (!parentId) {
      return NextResponse.json(
        { success: false, message: 'Parent ID is required' },
        { status: 400 }
      );
    }

    const students = await StudentRepository.getStudentsByParentId(parentId);
    
    return NextResponse.json({
      success: true,
      data: students,
      message: 'Students retrieved successfully'
    });
  } catch (error) {
    console.error('Get students by parent ID error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
