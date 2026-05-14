import { NextRequest, NextResponse } from 'next/server';
import { CounselorService } from '../counselor/counselor.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import { CreateCounselorSchema, UpdateCounselorSchema, UpdateCounselorStatusSchema } from '../counselor/counselor.validators';

export class CounselorController {
  // POST /api/counselors - Create counselor (Admin, SuperAdmin, School SuperAdmin)
  static createCounselor = withPermission({ 
    module: 'COUNSELOR_MANAGEMENT', 
    action: 'CREATE' 
  })(async (req: NextRequest, { user }: any) => {
    try {
      const body = await req.json();
      const validatedData = CreateCounselorSchema.parse(body);
      
      const result = await CounselorService.createCounselor(validatedData, user.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Create counselor error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/counselors - Get all counselors (Admin, SuperAdmin, School SuperAdmin)
  static getCounselors = withPermission({ 
    module: 'COUNSELOR_MANAGEMENT', 
    action: 'VIEW' 
  })(async (req: NextRequest, ctx: any) => {
    try {
      const { searchParams } = new URL(req.url);
      const schoolId = searchParams.get('schoolId') || undefined;
      const locationId = searchParams.get('locationId') || undefined;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      
      // For SCHOOL_SUPERADMIN and ADMIN, only show counselors from their school
      // For SUPERADMIN, use the schoolId parameter (if provided)
      const effectiveSchoolId = ctx.user.role.name === 'SUPERADMIN' ? (schoolId ?? undefined) : ctx.userSchoolId;
      
      const result = await CounselorService.getAllCounselors(effectiveSchoolId, ctx.userSchoolId, locationId, page, limit);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get counselors error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/counselors/[id] - Get counselor by ID (Admin, SuperAdmin, School SuperAdmin)
  static getCounselorById = withPermission({ 
    module: 'COUNSELOR_MANAGEMENT', 
    action: 'VIEW' 
  })(async (req: NextRequest, ctx: any) => {
    try {
      const { id } = ctx.params;
      
      const result = await CounselorService.getCounselorById(id, ctx.userSchoolId, ctx.user.role.name);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get counselor by ID error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/counselors/[id] - Update counselor (Admin, SuperAdmin, School SuperAdmin)
  static updateCounselor = withPermission({ 
    module: 'COUNSELOR_MANAGEMENT', 
    action: 'UPDATE' 
  })(async (req: NextRequest, ctx: any) => {
    try {
      const { id } = ctx.params;
      const body = await req.json();
      const validatedData = UpdateCounselorSchema.parse(body);
      
      const result = await CounselorService.updateCounselor(id, validatedData, ctx.userSchoolId, ctx.user.role.name);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update counselor error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PATCH /api/counselors/[id] - Update counselor status (Admin, SuperAdmin, School SuperAdmin)
  static updateCounselorStatus = withPermission({ 
    module: 'COUNSELOR_MANAGEMENT', 
    action: 'UPDATE' 
  })(async (req: NextRequest, ctx: any) => {
    try {
      const { id } = ctx.params;
      const body = await req.json();
      const validatedData = UpdateCounselorStatusSchema.parse(body);
      
      const result = await CounselorService.updateCounselorStatus(id, validatedData, ctx.userSchoolId, ctx.user.role.name);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update counselor status error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/counselors/[id] - Delete counselor (SuperAdmin only)
  static deleteCounselor = withPermission({ 
    module: 'COUNSELOR_MANAGEMENT', 
    action: 'DELETE' 
  })(async (req: NextRequest, ctx: any) => {
    try {
      const { id } = ctx.params;
      
      // Only SUPERADMIN can delete counselors
      if (ctx.user.role.name !== 'SUPERADMIN') {
        return NextResponse.json(
          { success: false, message: 'Only SuperAdmin can delete counselors' },
          { status: 403 }
        );
      }
      
      const result = await CounselorService.deleteCounselor(id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete counselor error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // POST /api/counselors/[id]/assign-students - Assign students to counselor
  static assignStudents = withPermission({ 
    module: 'COUNSELOR_MANAGEMENT', 
    action: 'UPDATE' 
  })(async (req: NextRequest, ctx: any) => {
    try {
      const { id } = await ctx.params;
      const body = await req.json();
      const { studentIds, level, escalationAlertId } = body;
      
      const result = await CounselorService.assignStudents(id, studentIds, ctx.user.id, level, escalationAlertId);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Assign students error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
