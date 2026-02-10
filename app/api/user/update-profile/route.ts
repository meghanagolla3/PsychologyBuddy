import { NextRequest } from 'next/server';
import { UserService } from '@/src/services/user.service';

// PATCH /api/user/update-profile - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = req.cookies.get('sessionId')?.value || 
                    req.headers.get('authorization')?.replace('Bearer ', '');

    if (!sessionId) {
      return Response.json(
        { success: false, message: 'No session provided' },
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

    // Update profile using UserService
    const updatedProfile = await UserService.updateProfile(
      authData.data.user.id,
      authData.data.user.role.name,
      body
    );

    return Response.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
