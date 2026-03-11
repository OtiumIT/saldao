/**
 * Preenche lat/lon dos pedidos usando Google Geocoding (fallback para os que falharam com Nominatim).
 * Uso: cd api && npx tsx scripts/geocode-pedidos-google.ts
 * Requer: DATABASE_URL e GOOGLE_MAPS_API_KEY no .env
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { geocodeAddressToLatLon } from '../src/lib/google-maps.js';

const DELAY_MS = 350;

async function main() {
  const connStr = process.env.DATABASE_URL;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!connStr) {
    console.error('Configure DATABASE_URL no .env');
    process.exit(1);
  }
  if (!apiKey?.trim()) {
    console.error('Configure GOOGLE_MAPS_API_KEY no .env');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: connStr,
    ssl: connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  });

  let totalProcessed = 0;
  let totalUpdated = 0;

  try {
    const { rows } = await pool.query<{ id: string; endereco_entrega: string }>(
      `SELECT id, endereco_entrega FROM pedidos_venda
       WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
         AND TRIM(endereco_entrega) != ''
         AND (endereco_lat IS NULL OR endereco_lon IS NULL)
       ORDER BY data_pedido DESC`
    );

    if (rows.length === 0) {
      console.log('Nenhum pedido sem lat/lon.');
      return;
    }

    console.log(`${rows.length} pedido(s) sem lat/lon (incl. marcados como falha).\n`);

    for (const row of rows) {
      const geo = await geocodeAddressToLatLon(apiKey, row.endereco_entrega);
      if (geo) {
        await pool.query(
          `UPDATE pedidos_venda SET endereco_lat = $1, endereco_lon = $2, endereco_geocode_falhou = false, updated_at = NOW() WHERE id = $3`,
          [geo.lat, geo.lon, row.id]
        );
        totalUpdated++;
        console.log(`  ✓ ${row.endereco_entrega.slice(0, 55)}... → ${geo.lat}, ${geo.lon}`);
      } else {
        console.log(`  ✗ Não localizado: ${row.endereco_entrega.slice(0, 55)}...`);
      }
      totalProcessed++;
      await new Promise((r) => setTimeout(r, DELAY_MS));
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
