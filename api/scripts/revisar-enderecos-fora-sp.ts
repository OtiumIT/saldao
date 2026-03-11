/**
 * Revisa pedidos de venda cujo endereço geocodificado está fora do estado de SP
 * e atualiza com o endereço correto (re-geocode sem forçar São Paulo).
 *
 * Uso: cd api && npx tsx scripts/revisar-enderecos-fora-sp.ts [--dry-run]
 * Requer: DATABASE_URL e GOOGLE_MAPS_API_KEY no .env
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { reverseGeocodeToState, geocodeAddressEnriquecidoBrasil } from '../src/lib/google-maps.js';

const DELAY_MS = 400;

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

  if (dryRun) {
    console.log('Modo --dry-run: nenhuma alteração será feita.\n');
  }

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
      data_pedido: string;
      cliente_nome: string | null;
    }>(
      `SELECT p.id, p.endereco_entrega, p.endereco_lat, p.endereco_lon, p.data_pedido, c.nome AS cliente_nome
       FROM pedidos_venda p
       LEFT JOIN clientes c ON c.id = p.cliente_id
       WHERE p.tipo_entrega = 'entrega'
         AND p.endereco_entrega IS NOT NULL
         AND TRIM(p.endereco_entrega) != ''
         AND p.endereco_lat IS NOT NULL
         AND p.endereco_lon IS NOT NULL
       ORDER BY p.data_pedido DESC`
    );

    if (rows.length === 0) {
      console.log('Nenhum pedido com lat/lon para revisar.');
      return;
    }

    console.log(`${rows.length} pedido(s) com geocode. Verificando quais estão fora de SP...\n`);

    let foraDeSP = 0;
    let atualizados = 0;

    for (const row of rows) {
      const lat = Number(row.endereco_lat);
      const lon = Number(row.endereco_lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

      const estado = await reverseGeocodeToState(apiKey, lat, lon);
      await new Promise((r) => setTimeout(r, DELAY_MS));

      const isSP = estado === 'SP' || estado === 'São Paulo';
      if (isSP) continue;

      foraDeSP++;
      console.log(`  Fora de SP (${estado ?? '?'}): ${row.endereco_entrega.slice(0, 60)}...`);
      console.log(`    Pedido ${row.id} | ${row.data_pedido} | ${row.cliente_nome ?? '—'}`);

      const geo = await geocodeAddressEnriquecidoBrasil(apiKey, row.endereco_entrega);
      await new Promise((r) => setTimeout(r, DELAY_MS));

      if (!geo) {
        console.log(`    ✗ Não foi possível re-geocodificar. Mantendo como está.\n`);
        continue;
      }

      const formatted = geo.endereco_formatado.trim();
      const muitoGenerico = formatted.length < 30 || formatted === 'Brazil' || /^[^,]+,\s*Brazil$/i.test(formatted);
      if (muitoGenerico) {
        console.log(`    ✗ Endereço formatado muito genérico: "${formatted}". Mantendo como está.\n`);
        continue;
      }

      console.log(`    → ${formatted}`);
      if (geo.cep) console.log(`    CEP: ${geo.cep}`);

      if (!dryRun) {
        await pool.query(
          `UPDATE pedidos_venda
           SET endereco_entrega = $1, endereco_lat = $2, endereco_lon = $3, updated_at = NOW()
           WHERE id = $4`,
          [geo.endereco_formatado, geo.lat, geo.lon, row.id]
        );
        const { rows: pedidoRows } = await pool.query<{ cliente_id: string | null }>(
          `SELECT cliente_id FROM pedidos_venda WHERE id = $1`,
          [row.id]
        );
        if (pedidoRows[0]?.cliente_id) {
          await pool.query(
            `UPDATE clientes SET endereco_entrega = $1, updated_at = NOW() WHERE id = $2`,
            [geo.endereco_formatado, pedidoRows[0].cliente_id]
          );
          console.log(`    ✓ Pedido e cliente atualizados.`);
        } else {
          console.log(`    ✓ Pedido atualizado.`);
        }
        atualizados++;
      }
      console.log('');
    }

    console.log(`\nResumo: ${foraDeSP} pedido(s) fora de SP.`);
    if (!dryRun && atualizados > 0) {
      console.log(`${atualizados} atualizado(s) com endereço correto.`);
    } else if (dryRun && foraDeSP > 0) {
      console.log('Execute sem --dry-run para aplicar as alterações.');
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
