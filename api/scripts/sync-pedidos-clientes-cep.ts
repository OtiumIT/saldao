/**
 * Sincroniza CEP: pedidos com mesmo endereço do cliente → atualiza cliente com CEP.
 * Depois: busca CEP em todos os endereços de vendas e atualiza os clientes.
 * Uso: cd api && npx tsx scripts/sync-pedidos-clientes-cep.ts
 * Requer: DATABASE_URL e GOOGLE_MAPS_API_KEY no .env
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { geocodeAddressToCep } from '../src/lib/google-maps.js';

const DELAY_MS = 300;

function normalizeAddr(s: string): string {
  return (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

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
    const { rows } = await pool.query<{
      pedido_id: string;
      cliente_id: string;
      endereco_pedido: string;
      endereco_cliente: string | null;
      cep_cliente: string | null;
    }>(
      `SELECT p.id AS pedido_id, p.cliente_id, p.endereco_entrega AS endereco_pedido,
              c.endereco_entrega AS endereco_cliente, c.cep AS cep_cliente
       FROM pedidos_venda p
       JOIN clientes c ON c.id = p.cliente_id
       WHERE p.tipo_entrega = 'entrega'
         AND p.endereco_entrega IS NOT NULL
         AND TRIM(p.endereco_entrega) != ''
       ORDER BY p.data_pedido DESC`
    );

    const toUpdate = new Map<string, { endereco: string; cliente_id: string }>();
    for (const r of rows) {
      if (!r.cliente_id) continue;
      const cepVazio = !r.cep_cliente || r.cep_cliente.replace(/\D/g, '').length === 0;
      if (!cepVazio) continue;
      const endereco = r.endereco_pedido?.trim() ?? '';
      if (!endereco) continue;
      const mesmoEndereco =
        !r.endereco_cliente ||
        normalizeAddr(r.endereco_pedido) === normalizeAddr(r.endereco_cliente);
      if (mesmoEndereco) {
        toUpdate.set(r.cliente_id, { endereco, cliente_id: r.cliente_id });
      } else {
        toUpdate.set(r.cliente_id, { endereco, cliente_id: r.cliente_id });
      }
    }

    const unique = Array.from(toUpdate.values());
    console.log(`\n1. Pedidos com endereço → atualizar CEP do cliente`);
    console.log(`${unique.length} cliente(s) sem CEP encontrado(s) via pedidos.\n`);

    for (const { endereco, cliente_id } of unique) {
      const cep = await geocodeAddressToCep(apiKey, endereco);
      if (cep) {
        await pool.query(
          `UPDATE clientes SET cep = $1, endereco_entrega = COALESCE(NULLIF(TRIM(endereco_entrega),''), $2), updated_at = NOW() WHERE id = $3`,
          [cep, endereco, cliente_id]
        );
        totalUpdated++;
        console.log(`  ✓ ${endereco.slice(0, 60)}... → CEP ${cep}`);
      } else {
        console.log(`  ✗ Não localizado: ${endereco.slice(0, 60)}...`);
      }
      totalProcessed++;
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }

    console.log(`\nConcluído: ${totalProcessed} processados, ${totalUpdated} clientes atualizados.`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
