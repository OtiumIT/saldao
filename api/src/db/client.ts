import { Pool } from 'pg';

const connectionString = typeof process !== 'undefined' ? process.env.DATABASE_URL : undefined;

function isSupabaseUrl(url: string): boolean {
  try {
    const u = new URL(url.replace(/^postgresql:\/\//, 'https://'));
    return u.hostname.includes('supabase.co');
  } catch {
    return false;
  }
}

/** Pool usado em Node (dev ou servidor). */
const nodePool: Pool | null = connectionString
  ? new Pool({
      connectionString,
      ...(isSupabaseUrl(connectionString)
        ? { ssl: { rejectUnauthorized: false } }
        : {}),
    })
  : null;

/** Pool injetado no Worker (Hyperdrive); definido no fetch handler. */
let workerPool: Pool | null = null;

/** Define o Pool no contexto Worker (Hyperdrive). Chamar no início do fetch. */
export function setWorkerPool(pool: Pool): void {
  workerPool = pool;
}

export function getPool(): Pool | null {
  // No Workers, sempre usa workerPool (Hyperdrive)
  // nodePool só existe em ambiente Node.js
  if (typeof process === 'undefined' || !process.env) {
    // Estamos em Workers - só retorna workerPool
    return workerPool;
  }
  // Estamos em Node.js - pode usar nodePool como fallback
  return workerPool ?? nodePool;
}

export default nodePool;
