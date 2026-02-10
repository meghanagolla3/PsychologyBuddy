import prisma from "../src/prisma";
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
} from "../src/config/permission"; 
import * as bcrypt from "bcryptjs";

/** ============================================
 * HELPERS
 * ============================================ */
async function upsertRole(name: string, description: string) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name, description },
  });
}

async function upsertPermission(key: string, module: string) {
  return prisma.permission.upsert({
    where: { name: key },
    update: {},
    create: { name: key, module },
  });
}

async function upsertRolePermission(roleId: string, permissionId: string) {
  return prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: { roleId, permissionId },
    },
    update: {},
    create: {
      roleId,
      permissionId,
    },
  });
}

async function upsertUser(
  email: string,
  password: string,
  roleId: string,
  schoolId?: string,
  classId?: string,
  studentId?: string,
) {
  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      firstName: email.split("@")[0],
      lastName: "User",
      email,
      password: hashed,
      roleId,
      schoolId,
      classId,
      studentId,
      emailVerified: true,
    },
  });
}

/** ============================================
 * MAIN SEED
 * ============================================ */
async function main() {
  console.log("🌱 Seeding RBAC + Users...");

  // ------------------------------------------------
  // 1. Create Roles
  // ------------------------------------------------
  const superAdminRole = await upsertRole("SUPERADMIN", "System owner");
  const adminRole = await upsertRole("ADMIN", "Organization admin");
  const studentRole = await upsertRole("STUDENT", "Student user");

  // ------------------------------------------------
  // 2. Create Permissions
  // ------------------------------------------------
  for (const perm of ALL_PERMISSIONS) {
    await upsertPermission(perm.key, perm.module);
  }
  const permissionRecords = await prisma.permission.findMany();

  // ------------------------------------------------
  // 3. Assign Permissions to Roles
  // ------------------------------------------------
  for (const key of ROLE_PERMISSIONS.SUPERADMIN) {
    const perm = permissionRecords.find((p: { name: string; id: string }) => p.name === key);
    if (perm) await upsertRolePermission(superAdminRole.id, perm.id);
  }

  for (const key of ROLE_PERMISSIONS.ADMIN) {
    const perm = permissionRecords.find((p: { name: string; id: string }) => p.name === key);
    if (perm) await upsertRolePermission(adminRole.id, perm.id);
  }

  for (const key of ROLE_PERMISSIONS.STUDENT) {
    const perm = permissionRecords.find((p: { name: string; id: string }) => p.name === key);
    if (perm) await upsertRolePermission(studentRole.id, perm.id);
  }

  // ------------------------------------------------
  // 4. Create School + Class (needed for admin/student)
  // ------------------------------------------------
  let school = await prisma.school.findFirst({
    where: { name: "Calm Path High School" },
  });
  
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Calm Path High School",
        address: "Hyderabad",
        email: "school@calmpath.ai",
      },
    });
  }

  const classA = await prisma.class.upsert({
    where: { schoolId_grade_section: { schoolId: school.id, grade: 10, section: "A" } },
    update: {},
    create: {
      schoolId: school.id,
      name: "Class 10-A",
      grade: 10,
      section: "A",
    },
  });

  // ------------------------------------------------
  // 5. Create Super Admin
  // ------------------------------------------------
  const superAdmin = await upsertUser(
    "superadmin@calmpath.ai",
    "SuperAdmin@123",
    superAdminRole.id
  );

  // ------------------------------------------------
  // 6. Create Admin User
  // ------------------------------------------------
  const adminUser = await upsertUser(
    "admin@calmpath.ai",
    "Admin@123",
    adminRole.id,
    school.id
  );

  // Create AdminProfile
  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      department: "Wellness",
    },
  });

  // ------------------------------------------------
  // 7. Create Student User
  // ------------------------------------------------
  const studentUser = await upsertUser(
    "student@calmpath.ai",
    "Student@123",
    studentRole.id,
    school.id,
    classA.id,
    "STU001"
  );

  // Create StudentProfile
  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      status: "ACTIVE",
    },
  });

  console.log("🎉 Seed complete!");
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
