import { AuthError } from '@/src/utils/errors';
import { AppError } from '@/src/lib/errors/custom-errors';
import { sessionStore, SessionUtil } from '../../utils/session-server.util';
import { DatabaseService } from '@/src/lib/database/database-service';

export class AuthMiddleware {
  static async authenticate(request: Request) {
    // Check for Bearer token first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');
    
    // If no authorization header, check if token might be in other headers
    // or if the entire authHeader is just the student ID
    if (!token && authHeader) {
      token = authHeader.trim();
    }
    
    if (token) {
      // TODO: Implement proper JWT verification
      // For now, treat the token as a student ID for testing
      const studentId = token.trim(); // Remove any whitespace
      
      try {
        // Look up real user by student ID
        const user = await DatabaseService.getUserByStudentId(studentId);
        
        if (user) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
            firstName: user.firstName,
            lastName: user.lastName,
            studentId: user.studentId
          };
        } else {
          throw new AppError('Student not found', 404);
        }
      } catch (error) {
        console.error("Error in authentication:", error);
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError('Authentication service error', 500);
      }
    }
    
    // No authentication found
    throw new AppError('Authentication required - Bearer token or valid session needed', 401);
  }
  
  private static isSessionExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  static async authorize(user: any, requiredRole?: string) {
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (requiredRole && user.role?.name !== requiredRole) {
      throw new AppError('Insufficient permissions', 403);
    }

    return true;
  }

  static createErrorResponse(message: string, status: number = 500, errors?: any[]): Response {
    const body = {
      error: message,
      status,
      ...(errors && { errors })
    };

    return new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static handleApiError(error: any): Response {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      return this.createErrorResponse(error.message, 500);
    }
    
    return this.createErrorResponse('Internal server error', 500);
  }
}
