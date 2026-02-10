// src/auth/auth.repository.ts
import prisma from "@/src/prisma";

export const AuthRepository = {
  // Student login uses studentId (from User table)
  findStudentByStudentId: (studentId: string) =>
    prisma.user.findFirst({
      where: { 
        studentId: studentId,
        role: { name: 'STUDENT' }
      },
      include: { 
        role: true, 
        studentProfile: true,
        school: true,
        classRef: true
      },
    }),

  // Admin / Superadmin login uses email
  findUserByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
      include: { 
        role: true, 
        adminProfile: true,
        school: true
      },
    }),

  // Create session
  createSession: (sessionId: string, userId: string, roleId: string, expiresAt: Date) =>
    prisma.session.create({
      data: {
        sessionId,
        userId,
        roleId,
        expiresAt,
      },
    }),

  // Find session by sessionId
  findSessionBySessionId: (sessionId: string) =>
    prisma.session.findUnique({
      where: { sessionId },
      include: {
        user: {
          include: {
            role: true,
            studentProfile: true,
            adminProfile: true,
            school: true,
            classRef: true,
          },
        },
      },
    }),

  // Delete session (logout)
  deleteSession: (sessionId: string) =>
    prisma.session.delete({
      where: { sessionId },
    }),

  // Clean expired sessions
  deleteExpiredSessions: () =>
    prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    }),
};
