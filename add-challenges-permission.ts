import prisma from './src/prisma';

async function addChallengesViewPermission() {
  try {
    console.log('Adding challenges.view permission for students...');
    
    // Find the Student role
    const studentRole = await prisma.role.findFirst({
      where: { name: 'Student' }
    });

    if (!studentRole) {
      console.error('Student role not found');
      return;
    }

    // Find or create the challenges.view permission
    let challengesPermission = await prisma.permission.findFirst({
      where: { name: 'challenges.view' }
    });

    if (!challengesPermission) {
      console.log('Creating challenges.view permission...');
      challengesPermission = await prisma.permission.create({
        data: {
          name: 'challenges.view',
          module: 'challenges',
          description: 'View assigned challenges and track progress'
        }
      });
    }

    // Check if the permission is already linked to the Student role
    const existingRolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: studentRole.id,
        permissionId: challengesPermission.id
      }
    });

    if (!existingRolePermission) {
      console.log('Linking challenges.view permission to Student role...');
      await prisma.rolePermission.create({
        data: {
          roleId: studentRole.id,
          permissionId: challengesPermission.id
        }
      });
    }

    console.log('challenges.view permission successfully added to Student role!');
    console.log('Permission ID:', challengesPermission.id);
    console.log('Role ID:', studentRole.id);
    
  } catch (error) {
    console.error('Error adding challenges.view permission:', error);
  }
}

// Run the function
addChallengesViewPermission();
