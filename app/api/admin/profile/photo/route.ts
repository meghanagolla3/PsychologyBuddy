import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/src/middleware/permission.middleware';
import { handleError } from '@/src/utils/errors';
import prisma from '@/src/prisma';
import { uploadToS3, deleteFromS3, getPresignedUrl } from '@/src/utils/s3';

// POST /api/admin/profile/photo - Upload profile photo
export const POST = withPermission({ 
  module: 'SETTINGS', 
  action: 'UPDATE' 
})(async (req: NextRequest, { user }: any) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: { message: 'No file provided', code: 400 } },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get current profile image to delete it if it exists (prevents orphans)
    const existingProfile = await prisma.adminProfile.findUnique({
      where: { userId: user.id },
      select: { profileImageUrl: true }
    });

    // Upload using centralized S3 service (handles validation internally)
    let dataUrl: string;
    try {
      dataUrl = await uploadToS3(buffer, file.name, file.type);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: { message: validationError.message, code: 400 } },
        { status: 400 }
      );
    }

    // Delete old profile image from S3 if it exists
    if (existingProfile?.profileImageUrl) {
      try {
        await deleteFromS3(existingProfile.profileImageUrl);
      } catch (delError) {
        console.warn('Failed to delete old image from S3:', delError);
      }
    }

    // Update admin profile with new photo
    const updatedProfile = await prisma.adminProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        profileImageUrl: dataUrl,
      },
      update: {
        profileImageUrl: dataUrl,
      },
      include: {
        adminPermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Get the full user data with the same structure as the profile API
    const fullUserData = await prisma.user.findUnique({
      where: { id: user.id },
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

    return NextResponse.json({
      success: true,
      message: 'Profile photo updated successfully',
      data: fullUserData
    });

  } catch (error) {
    console.error('Upload profile photo error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

// GET /api/admin/profile/photo - Generate pre-signed URL for temporary secure access
export const GET = withPermission({
  module: 'SETTINGS',
  action: 'VIEW'
})(async (req: NextRequest, { user }: any) => {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: { message: 'Missing key parameter', code: 400 } }, { status: 400 });
  }
  try {
    const signedUrl = await getPresignedUrl(key);
    return NextResponse.json({ success: true, url: signedUrl });
  } catch (error) {
    console.error('Generate signed URL error:', error);
    return NextResponse.json({ error: { message: 'Failed to generate signed URL', code: 500 } }, { status: 500 });
  }
});

// DELETE /api/admin/profile/photo - Remove profile photo
export const DELETE = withPermission({
  module: 'SETTINGS',
  action: 'UPDATE'
})(async (req: NextRequest, { user }: any) => {
  try {
    // Find current profile to get image URL for deletion
    const existingProfile = await prisma.adminProfile.findUnique({
      where: { userId: user.id },
      select: { profileImageUrl: true }
    });

    if (!existingProfile) {
      return NextResponse.json({
        success: false,
        error: { message: 'No profile photo to remove', code: 404 }
      }, { status: 404 });
    }

    // Delete image from S3 if it exists
    if (existingProfile.profileImageUrl) {
      try {
        await deleteFromS3(existingProfile.profileImageUrl);
      } catch (delError) {
        console.warn('Failed to delete image from S3:', delError);
      }
    }

    const updatedProfile = await prisma.adminProfile.update({
      where: { userId: user.id },
      data: { profileImageUrl: null },
      include: {
        adminPermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Get the full user data with the same structure as the profile API
    const fullUserData = await prisma.user.findUnique({
      where: { id: user.id },
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
            name: true
          }
        }
      }
    });
    return NextResponse.json({ success: true, message: 'Profile photo removed successfully', data: fullUserData });
  } catch (error) {
    console.error('Remove profile photo error:', error);
    const errorResponse = handleError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.error?.code || 500 });
  }
});

