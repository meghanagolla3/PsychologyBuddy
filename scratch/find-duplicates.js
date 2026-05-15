const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for duplicate notifications...');
  const notifications = await prisma.adminNotification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const seen = new Map();
  const duplicates = [];

  notifications.forEach(n => {
    const key = `${n.userId}-${n.alertId}-${n.message}`;
    if (seen.has(key)) {
      duplicates.push({
        first: seen.get(key),
        second: n
      });
    } else {
      seen.set(key, n);
    }
  });

  if (duplicates.length === 0) {
    console.log('No exact duplicates (same userId, alertId, and message) found in last 50.');
  } else {
    console.log(`Found ${duplicates.length} duplicate pairs!`);
    duplicates.forEach((d, i) => {
      console.log(`Duplicate ${i+1}:`);
      console.log(`  AlertId: ${d.first.alertId}`);
      console.log(`  Message: ${d.first.message}`);
      console.log(`  Created: ${d.first.createdAt} vs ${d.second.createdAt}`);
      console.log('---');
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
