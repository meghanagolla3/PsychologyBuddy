import dotenv from 'dotenv';
dotenv.config();
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
console.log('DATABASE_URL contains password:', process.env.DATABASE_URL?.includes('2025'));
console.log('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 20));
