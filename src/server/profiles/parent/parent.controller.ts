import { NextRequest, NextResponse } from 'next/server';
import { ParentService } from './parent.service';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import { CreateParentSchema, UpdateParentSchema, UpdateParentStatusSchema } from './parent.validators';

export class ParentController {
  // POST /api/parents - Create parent (Admin only)
  static createParent = withPermission({
    module: 'USER_MANAGEMENT',
    action: 'CREATE',
  })(async (req: NextRequest, { user }: any) => {
    try {
      const body = await req.json();
      const validatedData = CreateParentSchema.parse(body);

      // Use schoolId from request body for SuperAdmin, or use admin's schoolId
      let schoolId = user.schoolId;
      if ((user.role.name === 'SUPERADMIN' || user.role.name === 'SCHOOL_SUPERADMIN') && validatedData.schoolId) {
        schoolId = validatedData.schoolId;
      }

      const result = await ParentService.createParent({ ...validatedData, schoolId }, user.id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Create parent error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/parents - Get parents (Admin only)
  static getParents = withPermission({
    module: 'USER_MANAGEMENT',
    action: 'VIEW',
  })(async (req: NextRequest, ctx: any) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || undefined;
      const status = searchParams.get('status') || undefined;
      const schoolIdParam = searchParams.get('schoolId') || undefined;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');

      const userSchoolId = ctx.user.school?.id || ctx.user.schoolId;
      let schoolId: string | undefined;

      if (ctx.user.role.name === 'SUPERADMIN') {
        schoolId = schoolIdParam;
      } else {
        schoolId = userSchoolId;
      }

      const result = await ParentService.getAllParents(schoolId, { search, status, page, limit });
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get parents error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // GET /api/parents/[id] - Get parent by ID
  static getParentById = withPermission({
    module: 'USER_MANAGEMENT',
    action: 'VIEW',
  })(async (_req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const result = await ParentService.getParentById(id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Get parent by ID error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PUT /api/parents/[id] - Update parent (Admin only)
  static updateParent = withPermission({
    module: 'USER_MANAGEMENT',
    action: 'UPDATE',
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = UpdateParentSchema.parse(body);
      const result = await ParentService.updateParent(id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update parent error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // PATCH /api/parents/[id] - Update parent status (Admin only)
  static updateParentStatus = withPermission({
    module: 'USER_MANAGEMENT',
    action: 'UPDATE',
  })(async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = UpdateParentStatusSchema.parse(body);
      const result = await ParentService.updateParentStatus(id, validatedData);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Update parent status error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });

  // DELETE /api/parents/[id] - Delete parent (Admin only)
  static deleteParent = withPermission({
    module: 'USER_MANAGEMENT',
    action: 'DELETE',
  })(async (_req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;
      const result = await ParentService.deleteParent(id);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Delete parent error:', error);
      const errorResponse = handleError(error);
      return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
    }
  });
}
