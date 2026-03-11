/**
 * Script para preencher CEP de clientes que têm endereço mas não têm CEP.
 * Uso: cd api && npx tsx scripts/geocode-clientes-cep.ts
 * Requer: DATABASE_URL e GOOGLE_MAPS_API_KEY no .env
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { geocodeAddressToCep } from '../src/lib/google-maps.js';

const DELAY_MS = 300;

async function main() {
  const connStr = process.env.DATABASE_URL;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!connStr) {
    console.error('Configure DATABASE_URL no .env');
    process.exit(1);
  }
  if (!apiKey?.trim()) {
    console.error('Configure GOOGLE_MAPS_API_KEY no .env (Geocoding API)');
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
      `SELECT id, endereco_entrega FROM clientes
       WHERE endereco_entrega IS NOT NULL AND TRIM(endereco_entrega) != ''
         AND (cep IS NULL OR TRIM(COALESCE(cep, '')) = '')
       ORDER BY nome`
    );

    if (rows.length === 0) {
      console.log('Nenhum cliente sem CEP com endereço preenchido.');
      return;
    }

    console.log(`${rows.length} cliente(s) sem CEP encontrado(s).\n`);

    for (const row of rows) {
      const cep = await geocodeAddressToCep(apiKey, row.endereco_entrega);
      if (cep) {
        await pool.query(
          `UPDATE clientes SET cep = $1, updated_at = NOW() WHERE id = $2`,
          [cep, row.id]
        );
        totalUpdated++;
        console.log(`  ✓ ${row.endereco_entrega.slice(0, 60)}... → CEP ${cep}`);
      } else {
        console.log(`  ✗ Não localizado: ${row.endereco_entrega.slice(0, 60)}...`);
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
