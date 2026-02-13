import { StudentRepository } from './student.repository';
import { PasswordUtil } from '@/src/utils/password.util';
import { ApiResponse } from '@/src/utils/api-response';
import { AuthError } from '@/src/utils/errors';
import { CreateStudentData, UpdateStudentData, StudentSelfUpdateData, ResetStudentPasswordData, UpdateStudentStatusData } from './student.validators';
import prisma from '@/src/prisma';

export class StudentService {
  // Create student (Admin only)
  static async createStudent(data: CreateStudentData, creatorId: string, schoolId: string) {
    try {
      // Auto-generate studentId if not provided
      let studentId = data.studentId;
      if (!studentId) {
        const generatedIdResult = await StudentRepository.generateUniqueStudentId(schoolId, data.classId);
        studentId = generatedIdResult;
      }

      // Use provided schoolId from parameter
      const finalSchoolId = schoolId;

      // Check if student with this ID already exists in the same school
      const existingStudent = await StudentRepository.findStudentByStudentId(studentId);
      if (existingStudent && existingStudent.schoolId === finalSchoolId) {
        throw AuthError.conflict('Student with this ID already exists');
      }

      // Check if student email already exists (if provided)
      if (data.email) {
        const existingEmail = await StudentRepository.findStudentByEmail(data.email);
        if (existingEmail) {
          throw AuthError.conflict('Student with this email already exists');
        }
      }

      // Get student role
      const studentRole = await prisma.role.findUnique({
        where: { name: 'STUDENT' },
      });

      if (!studentRole) {
        throw new Error('Student role not found');
      }

      // Generate password if not provided
      const password = data.password || `Student@${Date.now()}`;

      // Hash password
      const hashedPassword = await PasswordUtil.hash(password);

      // Create student with profile
      const student = await StudentRepository.createStudent({
        ...data,
        studentId,
        password: hashedPassword,
        roleId: studentRole.id,
        schoolId: finalSchoolId,
      });

      // Remove password from response
      const { password: _, ...studentWithoutPassword } = student;

      return ApiResponse.success(studentWithoutPassword, 'Student created successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get students by school (Admin only - school-scoped)
  static async getStudentsBySchool(schoolId?: string, filters?: { search?: string; status?: string; classId?: string }) {
    try {
      const students = await StudentRepository.getStudentsBySchool(schoolId, filters);
      
      // Remove passwords from response
      const studentsWithoutPasswords = students.map(student => {
        const { password, ...studentWithoutPassword } = student;
        return studentWithoutPassword;
      });

      return ApiResponse.success(studentsWithoutPasswords, 'Students retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get student by ID
  static async getStudentById(id: string, requesterId?: string) {
    try {
      const student = await StudentRepository.getStudentById(id);
      
      if (!student) {
        throw AuthError.notFound('Student not found');
      }

      // Remove password from response
      const { password, ...studentWithoutPassword } = student;

      return ApiResponse.success(studentWithoutPassword, 'Student retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Update student (Admin only)
  static async updateStudent(id: string, data: UpdateStudentData) {
    try {
      // Check if student exists
      const existingStudent = await StudentRepository.getStudentById(id);
      if (!existingStudent) {
        throw AuthError.notFound('Student not found');
      }

      // Check if email is being updated and already exists
      if (data.email && data.email !== existingStudent.email) {
        const existingEmail = await StudentRepository.findStudentByEmail(data.email);
        if (existingEmail) {
          throw AuthError.conflict('Student with this email already exists');
        }
      }

      // Update student
      const updatedStudent = await StudentRepository.updateStudent(id, data);

      // Remove password from response
      const { password, ...studentWithoutPassword } = updatedStudent;

      return ApiResponse.success(studentWithoutPassword, 'Student updated successfully');
    } catch (error) {
      throw error;
    }
  }

  // Student self-update (limited fields)
  static async studentSelfUpdate(id: string, data: StudentSelfUpdateData) {
    try {
      // Check if student exists
      const existingStudent = await StudentRepository.getStudentById(id);
      if (!existingStudent) {
        throw AuthError.notFound('Student not found');
      }

      // Update student (limited fields only)
      const updatedStudent = await StudentRepository.studentSelfUpdate(id, data);

      // Remove password from response
      const { password, ...studentWithoutPassword } = updatedStudent;

      return ApiResponse.success(studentWithoutPassword, 'Profile updated successfully');
    } catch (error) {
      throw error;
    }
  }

  // Reset student password (Admin only)
  static async resetStudentPassword(id: string, data: ResetStudentPasswordData) {
    try {
      // Check if student exists
      const existingStudent = await StudentRepository.getStudentById(id);
      if (!existingStudent) {
        throw AuthError.notFound('Student not found');
      }

      // Hash new password
      const hashedPassword = await PasswordUtil.hash(data.newPassword);

      // Update password
      const updatedStudent = await StudentRepository.updateStudentPassword(id, hashedPassword);

      return ApiResponse.success(updatedStudent, 'Student password reset successfully');
    } catch (error) {
      throw error;
    }
  }

  // Update student status (Admin only)
  static async updateStudentStatus(id: string, data: UpdateStudentStatusData) {
    try {
      // Check if student exists
      const existingStudent = await StudentRepository.getStudentById(id);
      if (!existingStudent) {
        throw AuthError.notFound('Student not found');
      }

      // Update status
      const updatedStudent = await StudentRepository.updateStudentStatus(id, data.status);

      // Remove password from response
      const { password, ...studentWithoutPassword } = updatedStudent;

      return ApiResponse.success(studentWithoutPassword, `Student status updated to ${data.status}`);
    } catch (error) {
      throw error;
    }
  }

  // Delete student (Admin only)
  static async deleteStudent(id: string) {
    try {
      // Check if student exists
      const existingStudent = await StudentRepository.getStudentById(id);
      if (!existingStudent) {
        throw AuthError.notFound('Student not found');
      }

      // Soft delete by setting status to INACTIVE
      const deletedStudent = await StudentRepository.deleteStudent(id);

      // Remove password from response
      const { password, ...studentWithoutPassword } = deletedStudent;

      return ApiResponse.success(studentWithoutPassword, 'Student deleted successfully');
    } catch (error) {
      throw error;
    }
  }

  // Generate unique student ID
  static async generateUniqueStudentId(schoolId: string, classId: string) {
    try {
      const studentId = await StudentRepository.generateUniqueStudentId(schoolId, classId);
      return ApiResponse.success({ studentId }, 'Student ID generated successfully');
    } catch (error) {
      throw error;
    }
  }

  // Generate student email
  static async generateStudentEmail(studentId: string, schoolDomain: string) {
    try {
      const email = await StudentRepository.generateStudentEmail(studentId, schoolDomain);
      return ApiResponse.success({ email }, 'Student email generated successfully');
    } catch (error) {
      throw error;
    }
  }
}
