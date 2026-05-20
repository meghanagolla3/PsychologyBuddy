import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/prisma';

async function checkAdminNotifications() {
  console.log('--- Current Admin Notifications ---');
  const notifications = await prisma.adminNotification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: { firstName: true, lastName: true, role: { select: { name: true } } }
      }
    }
  });

  if (notifications.length === 0) {
    console.log('No admin notifications found.');
  } else {
    notifications.forEach((n, i) => {
      console.log(`[${i+1}] Type: ${n.type} | Severity: ${n.severity} | Read: ${n.read}`);
      console.log(`    Msg: ${n.message}`);
      console.log(`    Date: ${n.createdAt.toLocaleString()}`);
      console.log(`    User: ${n.user.firstName} ${n.user.lastName} (${n.user.role.name})`);
      console.log('---');
    });
  }
}

checkAdminNotifications()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
