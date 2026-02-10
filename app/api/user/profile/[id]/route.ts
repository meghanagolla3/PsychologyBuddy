import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';

// GET /api/user/profile/[id] - Get student profile (Student only - their own)
export async function GET(req: NextRequest) {
  try {
    const profileUserId = req.nextUrl.pathname.split('/').pop();
    const sessionId = req.cookies.get('sessionId')?.value || 
                    req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionId || !profileUserId) {
      return Response.json(
        { success: false, message: 'Session or user ID required' },
        { status: 401 }
      );
    }

    // Get current user from session
    const response = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
      headers: {
        'Cookie': `sessionId=${sessionId}`,
      },
    });
    
    const authData = await response.json();
    
    if (!authData.success) {
      return Response.json(authData, { status: 401 });
    }

    // Get student profile (students can only see their own)
    const profile = await UserService.getStudentProfile(profileUserId, authData.data.user.id);
    return Response.json(profile);
  } catch (error) {
    console.error('Get student profile error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile/[id] - Update student profile (Student only - their own)
export async function PATCH(req: NextRequest) {
  try {
    const profileUserId = req.nextUrl.pathname.split('/').pop();
    const sessionId = req.cookies.get('sessionId')?.value || 
                    req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionId || !profileUserId) {
      return Response.json(
        { success: false, message: 'Session or user ID required' },
        { status: 401 }
      );
    }

    // Get current user from session
    const response = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
      headers: {
        'Cookie': `sessionId=${sessionId}`,
      },
    });
    
    const authData = await response.json();
    
    if (!authData.success) {
      return Response.json(authData, { status: 401 });
    }

    const body = await req.json();
    
    // Update student profile (students can only update their own)
    const updatedProfile = await UserService.updateStudentProfile(
      profileUserId, 
      authData.data.user.id, 
      body
    );
    
    return Response.json(updatedProfile);
  } catch (error) {
    console.error('Update student profile error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
