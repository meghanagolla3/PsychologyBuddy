import { ParentRepository } from './parent.repository';
import { PasswordUtil } from '@/src/utils/password.util';
import { ApiResponse } from '@/src/utils/api-response';
import { AuthError } from '@/src/utils/errors';
import { CreateParentData, UpdateParentData, UpdateParentStatusData } from './parent.validators';
import prisma from '@/src/prisma';

export class ParentService {
  // Create parent (Admin only)
  static async createParent(data: CreateParentData, creatorId: string) {
    try {
      // Check if email already exists
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw AuthError.conflict('User with this email already exists');
      }

      // Check if phone already exists
      if (data.phone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: data.phone },
        });
        if (existingPhone) {
          throw AuthError.conflict('User with this phone number already exists');
        }
      }

      // Get PARENT role ID
      const parentRole = await prisma.role.findUnique({
        where: { name: 'PARENT' },
      });
      if (!parentRole) {
        throw new Error('PARENT role not found');
      }

      // Generate password if not provided
      const password = data.password || ParentService.generateDefaultPassword();

      const parent = await ParentRepository.createParent({
        ...data,
        roleId: parentRole.id,
        password,
      });

      return ApiResponse.success(parent, 'Parent created successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get all parents
  static async getAllParents(schoolId?: string, filters?: { search?: string; status?: string; page?: number; limit?: number }) {
    try {
      const result = await ParentRepository.getParentsBySchool(schoolId, filters);
      return ApiResponse.success(result, 'Parents retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Get parent by ID
  static async getParentById(id: string) {
    try {
      const parent = await ParentRepository.getParentById(id);
      if (!parent || parent.role.name !== 'PARENT') {
        throw AuthError.notFound('Parent not found');
      }
      return ApiResponse.success(parent, 'Parent retrieved successfully');
    } catch (error) {
      throw error;
    }
  }

  // Update parent
  static async updateParent(id: string, data: UpdateParentData) {
    try {
      const existingParent = await ParentRepository.getParentById(id);
      if (!existingParent || existingParent.role.name !== 'PARENT') {
        throw AuthError.notFound('Parent not found');
      }

      // Check if email already exists for another user
      if (data.email && data.email !== existingParent.email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email: data.email },
        });
        if (existingEmail && existingEmail.id !== id) {
          throw AuthError.conflict('User with this email already exists');
        }
      }

      // Check if phone already exists for another user
      if (data.phone && data.phone !== existingParent.phone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: data.phone },
        });
        if (existingPhone && existingPhone.id !== id) {
          throw AuthError.conflict('User with this phone number already exists');
        }
      }

      const updatedParent = await ParentRepository.updateParent(id, data);
      return ApiResponse.success(updatedParent, 'Parent updated successfully');
    } catch (error) {
      throw error;
    }
  }

  // Update parent status
  static async updateParentStatus(id: string, data: UpdateParentStatusData) {
    try {
      const existingParent = await ParentRepository.getParentById(id);
      if (!existingParent || existingParent.role.name !== 'PARENT') {
        throw AuthError.notFound('Parent not found');
      }

      const updatedParent = await ParentRepository.updateParentStatus(id, data.status);
      return ApiResponse.success(updatedParent, 'Parent status updated successfully');
    } catch (error) {
      throw error;
    }
  }

  // Delete parent
  static async deleteParent(id: string) {
    try {
      const existingParent = await ParentRepository.getParentById(id);
      if (!existingParent || existingParent.role.name !== 'PARENT') {
        throw AuthError.notFound('Parent not found');
      }

      await ParentRepository.deleteParent(id);
      return ApiResponse.success(null, 'Parent deleted successfully');
    } catch (error) {
      throw error;
    }
  }

  private static generateDefaultPassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allChars = lowercase + uppercase + numbers;

    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    for (let i = 3; i < 8; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
