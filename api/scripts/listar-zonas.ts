/**
 * Lista zonas distintas dos pedidos de entrega.
 * Uso: cd api && npx tsx scripts/listar-zonas.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';

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

  try {
    const { rows } = await pool.query<{ zona_entrega: string; qtd: string }>(
      `SELECT zona_entrega, COUNT(*)::text AS qtd
       FROM pedidos_venda
       WHERE tipo_entrega = 'entrega'
         AND zona_entrega IS NOT NULL
         AND TRIM(zona_entrega) != ''
       GROUP BY zona_entrega
       ORDER BY zona_entrega ASC`
    );

    console.log('Zonas (bairros) encontradas nos pedidos de entrega:\n');
    rows.forEach((r, i) => console.log(`${i + 1}. ${r.zona_entrega} (${r.qtd} pedidos)`));
    console.log(`\nTotal: ${rows.length} zonas distintas`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
