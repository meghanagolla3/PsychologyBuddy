import prisma from "@/src/prisma";
import { getServerSession } from "next-auth";

export async function getAuthUser() {
  const session = await getServerSession();

  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true }
          }
        }
      },
      adminProfile: {
        include: {
          adminPermissions: {
            include: { permission: true }
          }
        }
      }
    }
  });
}
