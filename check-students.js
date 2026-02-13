const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function checkStudents() {
  try {
    // Check total students
    const totalStudents = await prisma.user.count({
      where: {
        role: {
          name: 'STUDENT'
        }
      }
    });
    
    console.log(`Total students in database: ${totalStudents}`);
    
    // Check students by school
    const schoolId = 'cmlclsko900018cf0whiop5vg';
    const studentsInSchool = await prisma.user.count({
      where: {
        role: {
          name: 'STUDENT'
        },
        schoolId: schoolId
      }
    });
    
    console.log(`Students in school ${schoolId}: ${studentsInSchool}`);
    
    // Get all users to see what roles exist
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: {
          select: {
            name: true
          }
        },
        schoolId: true
      },
      take: 10
    });
    
    console.log('Sample users:');
    console.log(JSON.stringify(allUsers, null, 2));
    
    // Check if the school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true }
    });
    
    console.log(`School info:`, school);
    
  } catch (error) {
    console.error('Error checking students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
