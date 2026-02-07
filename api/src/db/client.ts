import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export function getPool(): Pool | null {
  return pool;
}

export default pool;
