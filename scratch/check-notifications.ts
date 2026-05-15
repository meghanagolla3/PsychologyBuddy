import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.counselorNotification.count();
  const latest = await prisma.counselorNotification.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true, role: { select: { name: true } } } } }
  });

  console.log('Total Counselor Notifications:', count);
  console.log('Latest 5 Notifications:', JSON.stringify(latest, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
