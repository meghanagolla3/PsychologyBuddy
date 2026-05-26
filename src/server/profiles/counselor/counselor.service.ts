import { CounselorRepository } from './counselor.repository';
import { PasswordUtil } from '@/src/utils/password.util';
import { ApiResponse } from '@/src/utils/api-response';
import { AuthError } from '@/src/utils/errors';
import { CreateCounselorRequest, UpdateCounselorRequest, UpdateCounselorStatusRequest } from './counselor.validators';
import prisma from '@/src/prisma';

export class CounselorService {
  // Create counselor (Admin, SuperAdmin, School SuperAdmin)
  static async createCounselor(data: CreateCounselorRequest, creatorId: string) {
    try {
      // Check if any user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      
      if (existingUser) {
        throw AuthError.conflict('A user with this email already exists');
      }

      // Get counselor role
      const role = await prisma.role.findUnique({
        where: { name: 'COUNSELOR' },
      });

      if (!role) {
        throw new Error('Counselor role not found');
      }

      // Get creator's school information if schoolId is not provided
      let finalSchoolId = data.schoolId;
      if (!finalSchoolId) {
        const creator = await prisma.user.findUnique({
          where: { id: creatorId },
          select: { schoolId: true }
        });
        if (!creator || !creator.schoolId) {
          throw new Error('Creator school not found');
        }
        finalSchoolId = creator.schoolId;
      }

      // Hash password
      const hashedPassword = await PasswordUtil.hash(data.password);

      // Create counselor with profile
      const counselor = await CounselorRepository.createCounselor({
        ...data,
        schoolId: finalSchoolId,
        password: hashedPassword,
        roleId: role.id,
        createdBy: creatorId,
      });

      // Remove password from response
      const { password, ...counselorWithoutPassword } = counselor;

      return ApiResponse.success(counselorWithoutPassword, 'Counselor created successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get all counselors (Admin, SuperAdmin, School SuperAdmin)
  static async getAllCounselors(schoolId?: string, userSchoolId?: string, locationId?: string, page: number = 1, limit: number = 10) {
    try {
      const counselors = await CounselorRepository.getAllCounselors(schoolId, locationId, page, limit);
      
      // Get total count for pagination
      const total = await prisma.user.count({
        where: {
          role: {
            name: 'COUNSELOR',
          },
          ...(schoolId && schoolId !== 'all' && { schoolId }),
          ...(locationId && locationId !== 'all' && {
            locationId: locationId
          }),
        },
      });

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);

      return ApiResponse.success({
        counselors,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      }, 'Counselors retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get counselor by ID
  static async getCounselorById(id: string, userSchoolId?: string, userRole?: string) {
    try {
      const counselor = await CounselorRepository.getCounselorById(id);
      
      if (!counselor) {
        throw AuthError.notFound('Counselor not found');
      }

      // Check if user has access to this counselor
      if (userRole !== 'SUPERADMIN' && counselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      // Remove password from response
      const { password, ...counselorWithoutPassword } = counselor;

      return ApiResponse.success(counselorWithoutPassword, 'Counselor retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Update counselor (Admin, SuperAdmin, School SuperAdmin)
  static async updateCounselor(id: string, data: UpdateCounselorRequest, userSchoolId?: string, userRole?: string) {
    try {
      // Check if counselor exists and user has access
      const existingCounselor = await CounselorRepository.getCounselorById(id);
      
      if (!existingCounselor) {
        throw AuthError.notFound('Counselor not found');
      }

      if (userRole !== 'SUPERADMIN' && existingCounselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      // If email is being updated, check if it's already taken
      if (data.email && data.email !== existingCounselor.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: data.email,
            id: { not: id }
          }
        });

        if (emailExists) {
          throw AuthError.conflict('Email already exists');
        }
      }

      const updatedCounselor = await CounselorRepository.updateCounselor(id, data);

      return ApiResponse.success(updatedCounselor, 'Counselor updated successfully');
    } catch (error) {
      throw error;
    }
  }

  // Update counselor status (Admin, SuperAdmin, School SuperAdmin)
  static async updateCounselorStatus(id: string, data: UpdateCounselorStatusRequest, userSchoolId?: string, userRole?: string) {
    try {
      // Check if counselor exists and user has access
      const existingCounselor = await CounselorRepository.getCounselorById(id);
      
      if (!existingCounselor) {
        throw AuthError.notFound('Counselor not found');
      }

      if (userRole !== 'SUPERADMIN' && existingCounselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      const updatedCounselor = await CounselorRepository.updateCounselorStatus(id, data.status);

      return ApiResponse.success(updatedCounselor, 'Counselor status updated successfully');
    } catch (error) {
      throw error;
    }
  }

  // Delete counselor (SuperAdmin only)
  static async deleteCounselor(id: string) {
    try {
      // Check if counselor exists
      const existingCounselor = await CounselorRepository.getCounselorById(id);
      
      if (!existingCounselor) {
        throw AuthError.notFound('Counselor not found');
      }

      // Check if counselor has active escalations or sessions
      const activeEscalations = await prisma.escalationAlert.count({
        where: {
          assignedTo: id,
          status: 'ACTIVE'
        }
      });

      if (activeEscalations > 0) {
        throw new AuthError('Cannot delete counselor with active escalations. Please reassign or close escalations first.', 400);
      }

      const deletedCounselor = await CounselorRepository.deleteCounselor(id);

      return ApiResponse.success(deletedCounselor, 'Counselor deleted successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get session history for a counselor
  static async getSessionHistory(counselorId: string, userSchoolId?: string, userRole?: string, page: number = 1, limit: number = 20) {
    try {
      // Verify counselor exists and user has access
      const counselor = await CounselorRepository.getCounselorById(counselorId);
      if (!counselor) {
        throw AuthError.notFound('Counselor not found');
      }

      if (userRole !== 'SUPERADMIN' && counselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      const result = await CounselorRepository.getSessionHistory(counselorId, page, limit);
      return ApiResponse.success(result, 'Session history retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get sessions for a specific date
  static async getSessionsByDate(counselorId: string, date: string, userSchoolId?: string, userRole?: string) {
    try {
      // Verify counselor exists and user has access
      const counselor = await CounselorRepository.getCounselorById(counselorId);
      if (!counselor) {
        throw AuthError.notFound('Counselor not found');
      }

      if (userRole !== 'SUPERADMIN' && counselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      const sessionDate = new Date(date);
      const sessions = await CounselorRepository.getSessionsByDate(counselorId, sessionDate);
      return ApiResponse.success(sessions, 'Sessions retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get sessions for a month (for calendar)
  static async getSessionsByMonth(counselorId: string, year: number, month: number, userSchoolId?: string, userRole?: string) {
    try {
      // Verify counselor exists and user has access
      const counselor = await CounselorRepository.getCounselorById(counselorId);
      if (!counselor) {
        throw AuthError.notFound('Counselor not found');
      }

      if (userRole !== 'SUPERADMIN' && counselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      const sessions = await CounselorRepository.getSessionsByMonth(counselorId, year, month);
      return ApiResponse.success(sessions, 'Monthly sessions retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get active challenges (escalation alerts)
  static async getActiveChallenges(counselorId: string, userSchoolId?: string, userRole?: string) {
    try {
      // Verify counselor exists and user has access
      const counselor = await CounselorRepository.getCounselorById(counselorId);
      if (!counselor) {
        throw AuthError.notFound('Counselor not found');
      }

      if (userRole !== 'SUPERADMIN' && counselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      const challenges = await CounselorRepository.getActiveChallenges(counselorId);
      return ApiResponse.success(challenges, 'Challenges retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get wellness challenges for a counselor
  static async getWellnessChallenges(counselorId: string, userSchoolId?: string, userRole?: string) {
    try {
      // Verify counselor exists and user has access
      const counselor = await CounselorRepository.getCounselorById(counselorId);
      if (!counselor) {
        throw AuthError.notFound('Counselor not found');
      }

      if (userRole !== 'SUPERADMIN' && counselor.schoolId !== userSchoolId) {
        throw AuthError.forbidden('Access denied to this counselor');
      }

      const challenges = await CounselorRepository.getWellnessChallenges(counselorId);
      return ApiResponse.success(challenges, 'Wellness challenges retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  static async assignStudents(counselorId: string, studentIds: string[], assignedBy: string, level?: string, escalationAlertId?: string) {
    try {
      // Verify counselor exists and is a COUNSELOR role
      const counselor = await CounselorRepository.getCounselorById(counselorId);
      if (!counselor || counselor.role.name !== 'COUNSELOR') {
        throw new AuthError('Counselor not found or invalid role', 400);
      }

      // Verify counselor is assigned to a school
      if (!counselor.schoolId) {
        throw new AuthError('Counselor must be assigned to a school before students can be assigned', 400);
      }

      // Get students to verify they belong to the same school as the counselor
      const students = await prisma.user.findMany({
        where: {
          id: { in: studentIds },
          role: { name: 'STUDENT' }
        },
        include: {
          school: {
            select: { id: true, name: true }
          }
        }
      });

      if (students.length !== studentIds.length) {
        throw new AuthError('Some students not found or are not valid students', 400);
      }

      // Verify all students belong to the counselor's school
      const studentsFromDifferentSchool = students.filter(student => student.schoolId !== counselor.schoolId);
      if (studentsFromDifferentSchool.length > 0) {
        const studentNames = studentsFromDifferentSchool.map(s => `${s.firstName} ${s.lastName} (${s.school?.name})`).join(', ');
        throw new AuthError(`Cannot assign students from different schools. The following students are not from ${counselor.school?.name}: ${studentNames}`, 400);
      }

      // Check counselor capacity - REMOVED: maxStudents field doesn't exist in schema
      // const counselorProfile = counselor.counselorProfile;
      // const maxStudents = counselorProfile?.maxStudents || 10;
      // const currentAssignments = await CounselorRepository.getCurrentAssignmentsCount(counselorId);

      // if (currentAssignments + studentIds.length > maxStudents) {
      //   throw new AuthError(`Cannot assign ${studentIds.length} students. Counselor capacity is ${maxStudents} and currently has ${currentAssignments} assignments.`, 400);
      // }

      // Process assignments
      let assignmentsCreated = 0;
      let assignmentsUpdated = 0;

      for (const studentId of studentIds) {
        const student = students.find(s => s.id === studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : "a student";
        
        if (escalationAlertId) {
          // Check if an assignment for this specific alert already exists
          const existingAlertAssignment = await prisma.counselorAssignment.findFirst({
            where: {
              studentId,
              escalationAlertId
            }
          });

          if (existingAlertAssignment) {
            // Update the existing assignment for this alert (e.g., if re-assigning to a different counselor)
            await prisma.counselorAssignment.update({
              where: { id: existingAlertAssignment.id },
              data: {
                counselorId,
                level,
                status: 'ACTIVE',
                sessionStatus: 'PENDING'
              }
            });
            assignmentsUpdated++;
            console.log(`[CounselorService] Updated existing assignment ${existingAlertAssignment.id} for alert ${escalationAlertId}`);
          } else {
            // Create a new assignment for this alert
            await prisma.counselorAssignment.create({
              data: {
                counselorId,
                studentId,
                escalationAlertId,
                assignedBy,
                level,
                status: 'ACTIVE',
                sessionStatus: 'PENDING'
              }
            });
            assignmentsCreated++;
            console.log(`[CounselorService] Created new assignment for alert ${escalationAlertId}`);
          }
          
          // Also update the escalation alert itself with the assigned counselor
          await prisma.escalationAlert.update({
            where: { id: escalationAlertId },
            data: { assignedTo: counselorId }
          });

          // Create notification for the counselor
          await prisma.counselorNotification.create({
            data: {
              userId: counselorId,
              alertId: escalationAlertId,
              type: 'escalation',
              message: `New high-risk case assigned: ${studentName}`,
              severity: level === 'critical' ? 'critical' : 'high',
              read: false
            }
          });
        } else {
          // General assignment (no specific alert)
          // Always create a new record for history as requested by user
          await prisma.counselorAssignment.create({
            data: {
              counselorId,
              studentId,
              assignedBy,
              level,
              status: 'ACTIVE',
              sessionStatus: 'PENDING'
            }
          });
          assignmentsCreated++;
          console.log(`[CounselorService] Created new general assignment for student ${studentId}`);

          // Create notification for the counselor
          await prisma.counselorNotification.create({
            data: {
              userId: counselorId,
              type: 'system',
              message: `New student assigned: ${studentName}`,
              severity: 'medium',
              read: false
            }
          });
        }
      }
      
      return ApiResponse.success({
        assignmentsCreated,
        assignmentsUpdated,
        studentsAssigned: studentIds.length,
        studentsSkipped: 0,
        counselorName: `${counselor.firstName} ${counselor.lastName}`,
        alreadyAssigned: false
      }, `Successfully processed assignments for ${studentIds.length} students`);
    } catch (error) {
      throw error;
    }
  }
}
