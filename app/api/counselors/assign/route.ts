import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { CounselorService } from '@/src/server/profiles/counselor/counselor.service';
import { handleError } from '@/src/utils/errors';

export const POST = withPermission({ 
  module: 'COUNSELOR_MANAGEMENT', 
  action: 'ASSIGN' 
})(async (request: NextRequest, { user }: any) => {
  try {
    const { counselorId, studentIds, assignedBy, level, escalationAlertId } = await request.json();

    // Validate required fields
    if (!counselorId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: counselorId and studentIds' },
        { status: 400 }
      );
    }

    if (!assignedBy) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: assignedBy' },
        { status: 400 }
      );
    }

    console.log('Assigning students to counselor:', { counselorId, studentIds, assignedBy, level, escalationAlertId });

    // Use the existing CounselorService.assignStudents method
    const result = await CounselorService.assignStudents(counselorId, studentIds, assignedBy, level, escalationAlertId);

    console.log('Assignment result:', result);

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${studentIds.length} student(s) to counselor`,
      data: result.data,
      assignmentsCreated: result.data?.assignmentsCreated || 0,
      studentsAssigned: result.data?.studentsAssigned || 0
    });

  } catch (error) {
    console.error('Error assigning students to counselor:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});
