import prisma from '@/src/prisma';
import { PasswordUtil } from '@/src/utils/password.util';
import { CreateParentData, UpdateParentData } from './parent.validators';

export const ParentRepository = {
  // Create parent with profile
  createParent: async (data: CreateParentData & { roleId: string }) => {
    const parent = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password ? await PasswordUtil.hash(data.password) : undefined,
        roleId: data.roleId,
        schoolId: data.schoolId,
        status: data.status || 'ACTIVE',
        emailVerified: true,
        parentProfile: {
          create: {
            department: "Parent Services",
          },
        },
      },
      include: {
        role: true,
        school: {
          select: { id: true, name: true },
        },
        parentProfile: true,
      },
    });

    if (data.studentId) {
      await prisma.user.update({
        where: { id: data.studentId },
        data: { parentId: parent.id },
      });
    }

    return parent;
  },

  // Get parents by school (Admin only - school-scoped)
  getParentsBySchool: async (schoolId?: string, filters?: { search?: string; status?: string; page?: number; limit?: number }) => {
    const whereCondition: any = {
      role: {
        name: 'PARENT',
      },
    };

    if (schoolId) {
      whereCondition.schoolId = schoolId;
    }

    if (filters?.status) {
      whereCondition.status = filters.status;
    }

    if (filters?.search) {
      whereCondition.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [parents, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          role: true,
          school: {
            select: { id: true, name: true },
          },
          parentProfile: true,
          adminProfile: {
            select: { profileImageUrl: true },
          },
        },
      }),
      prisma.user.count({ where: whereCondition }),
    ]);

    return { parents, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // Get parent by ID
  getParentById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        school: {
          select: { id: true, name: true },
        },
        parentProfile: true,
        adminProfile: {
          select: { profileImageUrl: true },
        },
      },
    });
  },

  // Update parent
  updateParent: async (id: string, data: UpdateParentData) => {
    const userUpdate: any = {};
    if (data.firstName !== undefined) userUpdate.firstName = data.firstName;
    if (data.lastName !== undefined) userUpdate.lastName = data.lastName;
    if (data.email !== undefined) userUpdate.email = data.email;
    if (data.phone !== undefined) userUpdate.phone = data.phone;
    if (data.status !== undefined) userUpdate.status = data.status;

    const profileUpdate: any = {};

    return prisma.user.update({
      where: { id },
      data: {
        ...userUpdate,
        ...(Object.keys(profileUpdate).length > 0 && {
          parentProfile: {
            upsert: {
              create: profileUpdate,
              update: profileUpdate,
            },
          },
        }),
      },
      include: {
        role: true,
        school: {
          select: { id: true, name: true },
        },
        parentProfile: true,
        adminProfile: {
          select: { profileImageUrl: true },
        },
      },
    });
  },

  // Update parent status
  updateParentStatus: async (id: string, status: string) => {
    return prisma.user.update({
      where: { id },
      data: { status },
      include: {
        role: true,
        school: {
          select: { id: true, name: true },
        },
        parentProfile: true,
      },
    });
  },

  // Delete parent
  deleteParent: async (id: string) => {
    return prisma.user.delete({
      where: { id },
      include: {
        role: true,
        parentProfile: true,
      },
    });
  },
};
