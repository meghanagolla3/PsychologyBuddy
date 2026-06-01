import prisma from '@/src/prisma';

import { CreateAdminData, UpdateAdminData } from './admin.validators';



export const AdminRepository = {

  // Create admin with profile

  createAdmin: async (data: CreateAdminData & { roleId: string }) => {

    // Debug: Check what models are available in prisma client

    console.log('Available prisma models:', Object.keys(prisma).filter(key => !key.startsWith('_')));

    

    // Debug: Log the incoming data

    console.log('Admin creation data received:', {

      role: data.role,

      schoolId: data.schoolId,

      locationId: data.locationId,

      hasLocationId: !!data.locationId,

      locationIdLength: data.locationId?.length

    });

    

    const result = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        roleId: data.roleId,
        ...(data.schoolId && { schoolId: data.schoolId }),
        ...(data.locationId && { locationId: data.locationId }),
        emailVerified: true,
        adminProfile: {
          create: {
            department: data.department || 'General Administration',
          },
        },
      },
      include: {
        role: true,
        adminProfile: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });



    // Assign default permissions to all admins (except SUPERADMIN who has all permissions)

    if (data.role !== 'SUPERADMIN') {

      try {

        console.log('Assigning default permissions to admin:', result.id);

        

        // Default permission names for all admins

        const defaultPermissionNames = [

          'dashboard.view',

          'activity.view', 

          'escalations.view',

          'settings.view'

        ];

        

        // Get permission IDs from permission names

        const permissionRecords = await prisma.permission.findMany({

          where: {

            name: {

              in: defaultPermissionNames

            }

          }

        });



        // Create admin permissions

        if (permissionRecords.length > 0 && result.adminProfile?.id) {

          const newPermissions = permissionRecords.map(permission => ({

            adminProfileId: result.adminProfile!.id,

            permissionId: permission.id

          }));



          await prisma.adminPermission.createMany({

            data: newPermissions

          });

          

          console.log(`Assigned ${newPermissions.length} default permissions to admin ${result.id}`);

        }

      } catch (error) {

        console.error('Error assigning default permissions:', error);

        // Don't fail the admin creation if default permission assignment fails

      }

    }



    return result;

  },



  // Get all admins (SuperAdmin only)

  getAllAdmins: async (schoolId?: string, locationId?: string, page: number = 1, limit: number = 10) => {
    const whereClause: any = {

      role: {

        name: {

          in: ['ADMIN', 'SCHOOL_SUPERADMIN', 'SUPERADMIN'],

        },

      },

    };



    // Add school filter if provided

    if (schoolId && schoolId !== 'all') {

      whereClause.schoolId = schoolId;

    }



    // Add location filter if provided
    if (locationId && locationId !== 'all') {
      whereClause.locationId = locationId;
    }



    // Get total count for pagination

    const total = await prisma.user.count({

      where: whereClause,

    });



    // Get paginated results

    const admins = await prisma.user.findMany({

      where: whereClause,

      select: {

        id: true,

        email: true,

        firstName: true,

        lastName: true,

        phone: true,

        status: true,

        createdAt: true,

        updatedAt: true,

        emailVerified: true,

        roleId: true,

        schoolId: true,
        locationId: true,
        role: {

          include: {

            rolePermissions: {

              include: {

                permission: true

              }

            }

          }

        },

        adminProfile: {

          include: {

            adminPermissions: {

              include: {

                permission: true

              }

            }

          }

        },

        school: {

          select: {

            id: true,

            name: true,

          },

        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },

      },

      orderBy: {

        createdAt: 'desc',

      },

      skip: (page - 1) * limit,

      take: limit,

    });



    // Calculate pagination info

    const totalPages = Math.ceil(total / limit);



    // Get location assignments for ADMIN role users
    // Location assignments are stored directly on User model via locationId field
    // Location data is now included in the main query
    const adminsWithLocations = admins.map((admin: any) => {
      if (admin.role.name === 'ADMIN' && admin.location) {
        return {
          ...admin,
          assignedLocations: [admin.location]
        };
      }
      
      return {
        ...admin,
        assignedLocations: []
      };
    });



    return adminsWithLocations;

  },



  // Get admin by ID

  getAdminById: async (id: string) => {

    return prisma.user.findUnique({

      where: { id },

      select: {

        id: true,

        email: true,

        firstName: true,

        lastName: true,

        phone: true,

        status: true,

        createdAt: true,

        updatedAt: true,

        emailVerified: true,

        roleId: true,

        schoolId: true,

        password: true, // Include password so it can be removed in service layer

        role: {

          include: {

            rolePermissions: {

              include: {

                permission: true

              }

            }

          }

        },

        adminProfile: {

          include: {

            adminPermissions: {

              include: {

                permission: true

              }

            }

          }

        },

        school: {

          select: {

            id: true,

            name: true,

          },

        },

      },

    });

  },



  // Update admin

  updateAdmin: async (id: string, data: UpdateAdminData) => {

    // First, get the current admin to check their role

    const currentAdmin = await prisma.user.findUnique({

      where: { id },

      include: { role: true }

    });



    if (!currentAdmin) {

      throw new Error('Admin not found');

    }



    // Update admin basic info
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.status && { status: data.status }),
        ...(data.schoolId && { schoolId: data.schoolId }),
        ...(data.locationId !== undefined && { locationId: data.locationId }),
        adminProfile: {
          upsert: {
            create: {
              ...(data.department && { department: data.department }),
              ...(data.profileImage && { profileImage: data.profileImage }),
            },
            update: {
              ...(data.department && { department: data.department }),
              ...(data.profileImage && { profileImage: data.profileImage }),
            },
          },
        },
      },
      include: {
        role: true,
        adminProfile: true,
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
      },
    });

    return updatedAdmin;

  },



  // Update admin password

  updateAdminPassword: async (id: string, hashedPassword: string) => {

    return prisma.user.update({

      where: { id },

      data: {

        password: hashedPassword,

      },

      select: {

        id: true,

        email: true,

      },

    });

  },



  // Update admin status (deactivate/suspend)

  updateAdminStatus: async (id: string, status: string) => {

    return prisma.user.update({

      where: { id },

      data: {

        status: status,

      },

      include: {

        role: true,

        adminProfile: true,

        school: {

          select: {

            id: true,

            name: true,

          },

        },

      },

    });

  },



  // Delete admin (hard delete - completely remove from database)

  deleteAdmin: async (id: string) => {

    // First get the admin data to return before deletion

    const admin = await prisma.user.findUnique({

      where: { id },

      include: {

        role: true,

        adminProfile: true,

        school: {

          select: {

            id: true,

            name: true,

          },

        },

      },

    });



    if (!admin) {

      throw new Error('Admin not found');

    }



    // Perform hard delete

    await prisma.user.delete({

      where: { id },

    });



    return admin;

  },



  // Check if admin email exists

  findAdminByEmail: async (email: string) => {

    return prisma.user.findFirst({

      where: {

        email,

        role: {

          name: {

            in: ['ADMIN', 'SCHOOL_SUPERADMIN', 'SUPERADMIN'],

          },

        },

      },

      include: {

        role: true,

        adminProfile: true,

      },

    });

  },



  // Update admin permissions

  updateAdminPermissions: async (id: string, permissions: string[]) => {

    // First, get the admin with their profile to get the correct adminProfileId

    const admin = await prisma.user.findUnique({

      where: { id },

      include: {

        adminProfile: true

      }

    });



    if (!admin || !admin.adminProfile) {

      throw new Error('Admin profile not found');

    }



    // Get permission IDs from permission names

    const permissionRecords = await prisma.permission.findMany({

      where: {

        name: {

          in: permissions

        }

      }

    });



    // Delete existing admin permissions

    await prisma.adminPermission.deleteMany({

      where: {

        adminProfileId: admin.adminProfile.id

      }

    });



    // Create new admin permissions

    const newPermissions = permissionRecords.map(permission => ({

      adminProfileId: admin.adminProfile!.id,

      permissionId: permission.id

    }));



    if (newPermissions.length > 0) {

      await prisma.adminPermission.createMany({

        data: newPermissions

      });

    }



    // Return updated admin with permissions

    return prisma.user.findUnique({

      where: { id },

      select: {

        id: true,

        email: true,

        firstName: true,

        lastName: true,

        phone: true,

        status: true,

        createdAt: true,

        updatedAt: true,

        emailVerified: true,

        roleId: true,

        schoolId: true,

        password: true, // Include password so it can be removed in service layer

        role: {

          include: {

            rolePermissions: {

              include: {

                permission: true

              }

            }

          }

        },

        adminProfile: {

          include: {

            adminPermissions: {

              include: {

                permission: true

              }

            }

          }

        },

        school: {

          select: {

            id: true,

            name: true,

          },

        },

      },

    }) as any; // Type assertion to ensure password is included

  },



  // Check if school already has an admin

  findAdminBySchoolId: async (schoolId: string) => {

    return prisma.user.findFirst({

      where: {

        schoolId,

        role: {

          name: {

            in: ['ADMIN', 'SCHOOL_SUPERADMIN'],

          },

        },

      },

      include: {

        role: true,

        adminProfile: true,

      },

    });

  },

};


