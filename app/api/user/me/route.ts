import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';
import { withPermission } from '@/src/middleware/permission.middleware';

// GET /api/user/me - Get current user profile
export async function GET(req: NextRequest) {
  try {
    // Get session from cookie
    const sessionId = req.cookies.get('sessionId')?.value || 
                    req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionId) {
      return Response.json(
        { success: false, message: 'No session provided' },
        { status: 401 }
      );
    }

    // For now, we'll need to get user from session
    // This would ideally use the auth service
    const response = await fetch(`${req.nextUrl.origin}/api/auth/me`, {
      headers: {
        'Cookie': `sessionId=${sessionId}`,
      },
    });
    
    const authData = await response.json();
    
    if (!authData.success) {
      return Response.json(authData, { status: 401 });
    }

    // Get full user profile using UserService
    const userProfile = await UserService.getCurrentUser(
      authData.data.user.id,
      authData.data.user.role.name
    );

    return Response.json(userProfile);
  } catch (error) {
    console.error('Get user profile error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
