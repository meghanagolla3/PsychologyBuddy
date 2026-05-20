import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testPool() {
  console.log('Testing pool with manual connection string...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    const res = await pool.query('SELECT 1');
    console.log('Query 1 successful:', res.rows);
  } catch (err) {
    console.error('Query 1 failed:', err.message);
  } finally {
    await pool.end();
  }
}

testPool().catch(console.error);
