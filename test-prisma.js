const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('Available models:', Object.keys(prisma).filter(key => !key.startsWith('_') && key !== 'constructor' && key !== '$connect' && key !== '$disconnect' && key !== '$queryRaw' && key !== '$executeRaw' && key !== '$transaction' && key !== '$use' && key !== '$extends'));
    
    // Test if meditationMoodLabel exists
    if (prisma.meditationMoodLabel) {
      console.log('meditationMoodLabel found:', typeof prisma.meditationMoodLabel);
      const moods = await prisma.meditationMoodLabel.findMany();
      console.log('Moods count:', moods.length);
    } else {
      console.log('meditationMoodLabel NOT found');
    }
    
    // Test if moodLabel exists for comparison
    if (prisma.moodLabel) {
      console.log('moodLabel found:', typeof prisma.moodLabel);
    } else {
      console.log('moodLabel NOT found');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
