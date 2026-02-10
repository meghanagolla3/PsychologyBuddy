import prisma from '@/src/prisma';

export class DatabaseService {
  static async connect() {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  static async disconnect() {
    try {
      await prisma.$disconnect();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Database disconnection failed:', error);
      throw error;
    }
  }

  static async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error: any) {
      return { status: 'unhealthy', error: error?.message || 'Unknown error', timestamp: new Date().toISOString() };
    }
  }
}
