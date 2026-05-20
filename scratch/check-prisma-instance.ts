import prisma from '../src/prisma';

console.log('Available models in prisma instance:');
const models = Object.keys(prisma).filter(k => !k.startsWith('$') && typeof (prisma as any)[k] === 'object');
console.log(JSON.stringify(models, null, 2));

if (models.includes('counselorNotification')) {
  console.log('SUCCESS: counselorNotification is present');
} else {
  console.log('FAILURE: counselorNotification is NOT present');
}
