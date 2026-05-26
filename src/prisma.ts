import { Pool } from 'pg'
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

// Lazy initialization to ensure env vars are loaded
const getPrisma = () => {
    if (process.env.NODE_ENV === 'production') {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        })
        const adapter = new PrismaPg(pool)
        return new PrismaClient({ adapter })
    }

    // In development, always recreate the client to ensure schema changes are picked up
    // This is less efficient but ensures the client has the latest schema
    const url = process.env.DATABASE_URL;
    console.log('[Prisma] Initializing pool. URL length:', url?.length || 0);

    if (!url) {
        console.error('[Prisma] CRITICAL: DATABASE_URL is undefined!');
    }

    const pool = new Pool({
        connectionString: url,
    })
    const adapter = new PrismaPg(pool)
    globalForPrisma.prisma = new PrismaClient({ adapter })
    return globalForPrisma.prisma
}

const prisma = getPrisma()

export default prisma