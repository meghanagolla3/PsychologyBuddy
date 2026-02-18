import { AuthRepository } from '@/src/server/repository/auth.repository';
import { PasswordUtil } from '@/src/utils/password.util';
import { SessionUtil } from '@/src/utils/session-server.util';
import { ApiResponse } from '@/src/utils/api-response';
import { AuthError } from '@/src/utils/errors';

export class AuthService {
  // Student login
  static async studentLogin(studentId: string, password: string) {
    try {
      // Find student by studentId
      const student = await AuthRepository.findStudentByStudentId(studentId);
      
      if (!student) {
        throw AuthError.invalidCredentials('Student not found');
      }

      if (!student.password) {
        throw AuthError.invalidCredentials('Password not set');
      }

      // Verify password
      const isPasswordValid = await PasswordUtil.verify(password, student.password);
      
      if (!isPasswordValid) {
        throw AuthError.invalidCredentials('Invalid password');
      }

      // Create session
      const sessionId = SessionUtil.generateSessionId();
      const expiresAt = SessionUtil.getExpirationTime();
      
      await AuthRepository.createSession(sessionId, student.id, student.roleId, expiresAt);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = student;
      
      return ApiResponse.success({
        user: userWithoutPassword,
        sessionId,
        expiresAt,
      }, 'Login successful');

    } catch (error) {
      throw error;
    }
  }

  // Admin login
  static async adminLogin(email: string, password: string) {
    try {
      // Find user by email
      const user = await AuthRepository.findUserByEmail(email);
      
      if (!user) {
        throw AuthError.invalidCredentials('User not found');
      }

      if (!user.password) {
        throw AuthError.invalidCredentials('Password not set');
      }

      // Verify password
      const isPasswordValid = await PasswordUtil.verify(password, user.password);
      
      if (!isPasswordValid) {
        throw AuthError.invalidCredentials('Invalid password');
      }

      // Create session
      const sessionId = SessionUtil.generateSessionId();
      const expiresAt = SessionUtil.getExpirationTime();
      
      await AuthRepository.createSession(sessionId, user.id, user.roleId, expiresAt);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      
      return ApiResponse.success({
        user: userWithoutPassword,
        sessionId,
        expiresAt,
      }, 'Login successful');

    } catch (error) {
      throw error;
    }
  }

  // Get current user from session
  static async me(sessionId: string) {
    try {
      if (!sessionId) {
        throw AuthError.unauthorized('No session provided');
      }

      // Find session
      const session = await AuthRepository.findSessionBySessionId(sessionId);
      
      if (!session) {
        throw AuthError.unauthorized('Invalid session');
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        // Clean up expired session
        await AuthRepository.deleteSession(sessionId);
        throw AuthError.unauthorized('Session expired');
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = session.user;
      
      return ApiResponse.success({
        user: userWithoutPassword,
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
        }
      }, 'User retrieved successfully');

    } catch (error) {
      throw error;
    }
  }

  // Logout
  static async logout(sessionId: string) {
    try {
      if (!sessionId) {
        throw AuthError.unauthorized('No session provided');
      }

      // Delete session
      await AuthRepository.deleteSession(sessionId);
      
      return ApiResponse.success(null, 'Logout successful');

    } catch (error) {
      throw error;
    }
  }

  // Clean expired sessions (utility function)
  static async cleanExpiredSessions() {
    try {
      await AuthRepository.deleteExpiredSessions();
      return ApiResponse.success(null, 'Expired sessions cleaned');
    } catch (error) {
      throw error;
    }
  }
}
