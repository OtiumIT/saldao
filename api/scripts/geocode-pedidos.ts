/**
 * Script para preencher lat/lon de todos os pedidos de entrega pendentes.
 * Uso: cd api && npx tsx scripts/geocode-pedidos.ts
 * Requer: DATABASE_URL no .env
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { geocodeOne } from '../src/modules/geocode/geocode.service.js';

const LIMIT_PER_BATCH = 5;
const DELAY_MS = 1100;

async function main() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.error('Configure DATABASE_URL no .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: connStr,
    ssl: connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  });

  let totalProcessed = 0;
  let totalUpdated = 0;

  try {
    for (;;) {
      const { rows } = await pool.query<{ id: string; endereco_entrega: string }>(
        `SELECT id, endereco_entrega FROM pedidos_venda
         WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
           AND (endereco_lat IS NULL OR endereco_lon IS NULL)
           AND (endereco_geocode_falhou IS NOT TRUE)
         ORDER BY data_pedido DESC
         LIMIT $1`,
        [LIMIT_PER_BATCH]
      );

      if (rows.length === 0) {
        console.log('Nenhum pedido pendente.');
        break;
      }

      console.log(`Processando ${rows.length} pedido(s)...`);

      for (const row of rows) {
        const geo = await geocodeOne(row.endereco_entrega);
        if (geo) {
          await pool.query(
            `UPDATE pedidos_venda SET endereco_lat = $1, endereco_lon = $2, updated_at = NOW() WHERE id = $3`,
            [geo.lat, geo.lon, row.id]
          );
          totalUpdated++;
          console.log(`  ✓ ${row.endereco_entrega?.slice(0, 50)}... → ${geo.lat}, ${geo.lon}`);
        } else {
          await pool.query(
            `UPDATE pedidos_venda SET endereco_geocode_falhou = true, updated_at = NOW() WHERE id = $1`,
            [row.id]
          );
          console.log(`  ✗ Não localizado (marcado): ${row.endereco_entrega?.slice(0, 50)}...`);
        }
        totalProcessed++;
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    console.log(`\nConcluído: ${totalProcessed} processados, ${totalUpdated} atualizados.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
