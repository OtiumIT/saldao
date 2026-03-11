/**
 * Conta pedidos de entrega sem lat/lon.
 * Uso: cd api && npx tsx scripts/count-geocode-pendentes.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.error('DATABASE_URL não configurada');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: connStr,
    ssl: connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  });

  const { rows: pendentes } = await pool.query<{ total: string }>(
    `SELECT COUNT(*) as total FROM pedidos_venda
     WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
       AND TRIM(endereco_entrega) != ''
       AND (endereco_lat IS NULL OR endereco_lon IS NULL)
       AND (endereco_geocode_falhou IS NOT TRUE)`
  );

  const { rows: falhou } = await pool.query<{ total: string }>(
    `SELECT COUNT(*) as total FROM pedidos_venda
     WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
       AND TRIM(endereco_entrega) != ''
       AND endereco_geocode_falhou = true`
  );

  const { rows: completo } = await pool.query<{ total: string }>(
    `SELECT COUNT(*) as total FROM pedidos_venda
     WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
       AND TRIM(endereco_entrega) != ''
       AND endereco_lat IS NOT NULL AND endereco_lon IS NOT NULL`
  );

  console.log('Sem lat/lon (pendentes de geocode):', pendentes[0]?.total ?? 0);
  console.log('Marcados como falha (não localizados):', falhou[0]?.total ?? 0);
  console.log('Com lat/lon preenchidos:', completo[0]?.total ?? 0);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
