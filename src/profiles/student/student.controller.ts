import { NextRequest, NextResponse } from 'next/server';
import { StudentService } from './student.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import { CreateStudentSchema, UpdateStudentSchema, StudentSelfUpdateSchema, ResetStudentPasswordSchema, UpdateStudentStatusSchema } from './student.validators';

export class StudentController {
  // POST /api/students - Create student (Admin only)
  static createStudent = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'CREATE' 
  })(async (req: NextRequest, { user }: any) => {
    try {
      const body = await req.json();
      const validatedData = CreateStudentSchema.parse(body);
      
      // Use schoolId from request body for SuperAdmin, or use admin's schoolId
      let schoolId = user.schoolId;
      if (user.role.name === 'SUPERADMIN' && validatedData.schoolId) {
        schoolId = validatedData.schoolId;
      }
      
      const result = await StudentService.createStudent(validatedData, user.id, schoolId);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Create student error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/students - Get students by school (Admin only)
  static getStudents = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'VIEW' 
  })(async (req: NextRequest, { user }: any) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || undefined;
      const status = searchParams.get('status') || undefined;
      const classId = searchParams.get('classId') || undefined;

      // Get schoolId from user, but allow undefined for SUPERADMIN
      const userSchoolId = user.school?.id || user.schoolId;
      let schoolId;
      if (user.role.name === 'SUPERADMIN') {
        schoolId = userSchoolId || undefined; // Convert null to undefined
      } else {
        schoolId = userSchoolId; // Must exist for non-SUPERADMIN
      }

      const result = await StudentService.getStudentsBySchool(schoolId, { search, status, classId });
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get students error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/students/:id - Get student by ID
  static getStudentById = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'VIEW' 
  })(async (req: NextRequest, { params }: any, { user }: any) => {
    try {
      // Students can only view their own profile
      if (user.role.name === 'STUDENT' && params.id !== user.id) {
        const errorResponse = { success: false, error: { code: 403, message: 'Access denied' } };
        return NextResponse.json(errorResponse, { status: 403 });
      }

      const result = await StudentService.getStudentById(params.id, user.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get student error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/students/:id - Update student (Admin only)
  static updateStudent = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = UpdateStudentSchema.parse(body);
      
      const result = await StudentService.updateStudent(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update student error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/students/:id/profile - Student self-update (Student only)
  static studentSelfUpdate = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any, { user }: any) => {
    try {
      // Students can only update their own profile
      if (user.role.name !== 'STUDENT' || params.id !== user.id) {
        const errorResponse = { success: false, error: { code: 403, message: 'Access denied' } };
        return NextResponse.json(errorResponse, { status: 403 });
      }

      const body = await req.json();
      const validatedData = StudentSelfUpdateSchema.parse(body);
      
      const result = await StudentService.studentSelfUpdate(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Student self-update error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/students/:id/reset-password - Reset student password (Admin only)
  static resetStudentPassword = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = ResetStudentPasswordSchema.parse(body);
      
      const result = await StudentService.resetStudentPassword(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Reset student password error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PATCH /api/students/:id/status - Update student status (Admin only)
  static updateStudentStatus = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'UPDATE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const body = await req.json();
      const validatedData = UpdateStudentStatusSchema.parse(body);
      
      const result = await StudentService.updateStudentStatus(params.id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update student status error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/students/:id - Delete student (Admin only)
  static deleteStudent = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'DELETE' 
  })(async (req: NextRequest, { params }: any) => {
    try {
      const result = await StudentService.deleteStudent(params.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete student error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/students/generate-id - Generate unique student ID (Admin only)
  static generateStudentId = withPermission({ 
    module: 'USER_MANAGEMENT', 
    action: 'CREATE' 
  })(async (req: NextRequest, { user }: any) => {
    try {
      const body = await req.json();
      const { classId } = body;
      
      if (!classId) {
        const errorResponse = { success: false, error: { code: 400, message: 'Class ID is required' } };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      const result = await StudentService.generateUniqueStudentId(user.schoolId, classId);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Generate student ID error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
