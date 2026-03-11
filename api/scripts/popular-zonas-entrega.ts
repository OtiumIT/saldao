/**
 * Preenche zona_entrega nos pedidos a partir de lat/lon (reverse geocode).
 * Zona = bairro/região para facilitar agrupar entregas ao selecionar para o caminhão.
 *
 * Uso: cd api && npx tsx scripts/popular-zonas-entrega.ts [--dry-run]
 * Requer: DATABASE_URL e GOOGLE_MAPS_API_KEY no .env
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { reverseGeocodeToBairroEMicroRegiao } from '../src/lib/google-maps.js';
import { zonaToMacroRegiao } from '../src/lib/zona-macro-mapping.js';

const DELAY_MS = 350;

async function main() {
  const connStr = process.env.DATABASE_URL;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const dryRun = process.argv.includes('--dry-run');

  if (!connStr) {
    console.error('Configure DATABASE_URL no .env');
    process.exit(1);
  }
  if (!apiKey?.trim()) {
    console.error('Configure GOOGLE_MAPS_API_KEY no .env');
    process.exit(1);
  }

  if (dryRun) console.log('Modo --dry-run: nenhuma alteração será feita.\n');

  const pool = new Pool({
    connectionString: connStr,
    ssl: connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const { rows } = await pool.query<{
      id: string;
      endereco_entrega: string;
      endereco_lat: number;
      endereco_lon: number;
      zona_entrega: string | null;
      micro_regiao_entrega: string | null;
    }>(
      `SELECT id, endereco_entrega, endereco_lat, endereco_lon, zona_entrega, micro_regiao_entrega
       FROM pedidos_venda
       WHERE tipo_entrega = 'entrega'
         AND endereco_entrega IS NOT NULL
         AND endereco_lat IS NOT NULL
         AND endereco_lon IS NOT NULL
       ORDER BY data_pedido DESC`
    );

    if (rows.length === 0) {
      console.log('Nenhum pedido com lat/lon para preencher zona.');
      return;
    }

    const semZonaOuMicro = rows.filter((r) => !r.zona_entrega?.trim() || !r.micro_regiao_entrega?.trim());
    console.log(`${rows.length} pedido(s) com geocode. ${semZonaOuMicro.length} sem zona ou micro-região.\n`);

    let atualizados = 0;
    for (const row of semZonaOuMicro) {
      const lat = Number(row.endereco_lat);
      const lon = Number(row.endereco_lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

      const { bairro, microRegiao } = await reverseGeocodeToBairroEMicroRegiao(apiKey, lat, lon);
      await new Promise((r) => setTimeout(r, DELAY_MS));

      const zona = bairro ?? 'Sem zona';
      // Preferir mapeamento customizado (zona → macro) quando disponível
      const micro = (bairro && zonaToMacroRegiao(bairro)) ?? microRegiao ?? '—';
      console.log(`  ${row.endereco_entrega.slice(0, 45)}... → ${zona} | ${micro}`);

      if (!dryRun && (bairro || microRegiao)) {
        await pool.query(
          `UPDATE pedidos_venda SET zona_entrega = COALESCE($1, zona_entrega), micro_regiao_entrega = COALESCE($2, micro_regiao_entrega), updated_at = NOW() WHERE id = $3`,
          [bairro ?? row.zona_entrega, microRegiao ?? row.micro_regiao_entrega, row.id]
        );
        atualizados++;
      }
    }

    console.log(`\nConcluído: ${atualizados} pedido(s) atualizado(s).`);
    if (dryRun && semZonaOuMicro.length > 0) {
      console.log('Execute sem --dry-run para aplicar.');
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
