/**
 * Job de geocode para pedidos de venda.
 * Roda a cada 15 min via Cloudflare Cron.
 * Preenche endereco_lat/endereco_lon nos pedidos que ainda não têm.
 */
import { Pool } from 'pg';
import type { Env } from '../../types/worker-env.js';
import { geocodeOne } from './geocode.service.js';

const LIMIT_PER_RUN = 5;

export async function runGeocodeJob(env: Env): Promise<{ processed: number; updated: number }> {
  const connStr = env.HYPERDRIVE?.connectionString;
  if (!connStr) {
    console.warn('[geocode-job] HYPERDRIVE not configured, skipping');
    return { processed: 0, updated: 0 };
  }

  const pool = new Pool({
    connectionString: connStr,
    max: 1,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 25000,
  });

  try {
    const { rows } = await pool.query<{ id: string; endereco_entrega: string }>(
      `SELECT id, endereco_entrega FROM pedidos_venda
       WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
         AND (endereco_lat IS NULL OR endereco_lon IS NULL)
       ORDER BY data_pedido DESC
       LIMIT $1`,
      [LIMIT_PER_RUN]
    );

    let updated = 0;
    for (const row of rows) {
      const geo = await geocodeOne(row.endereco_entrega);
      if (geo) {
        await pool.query(
          `UPDATE pedidos_venda SET endereco_lat = $1, endereco_lon = $2, updated_at = NOW() WHERE id = $3`,
          [geo.lat, geo.lon, row.id]
        );
        updated++;
      }
      await new Promise((r) => setTimeout(r, 1100));
    }

    return { processed: rows.length, updated };
  } finally {
    await pool.end();
  }
}
