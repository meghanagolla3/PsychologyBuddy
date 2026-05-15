import dotenv from 'dotenv';
dotenv.config();
async function test() {
  const { DatabaseService } = await import('../src/lib/database/database-service');
  const health = await DatabaseService.healthCheck();
  console.log('Health Check:', health);
  
  if (health.status === 'healthy') {
    console.log('Database is healthy. Testing a query...');
    try {
      const users = await (DatabaseService as any).getUserById('any-id');
      console.log('Query successful');
    } catch (e) {
      console.log('Query failed but connection is okay');
    }
  }
}

test().catch(console.error);
