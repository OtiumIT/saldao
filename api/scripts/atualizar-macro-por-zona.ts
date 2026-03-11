/**
 * Atualiza micro_regiao_entrega dos pedidos com base no mapeamento zona → macro.
 * Usa o mapeamento customizado em api/src/lib/zona-macro-mapping.ts.
 *
 * Uso: cd api && npx tsx scripts/atualizar-macro-por-zona.ts [--dry-run] [--llm]
 *
 * --llm: Para zonas sem mapeamento, usa LLM (OpenAI) para sugerir macro.
 *        Requer OPENAI_API_KEY. Salva sugestões em api/data/zona-macro-overrides.json.
 *
 * Requer: DATABASE_URL no .env
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { zonaToMacroRegiao, addZonaMacroOverride } from '../src/lib/zona-macro-mapping.js';
import { sugerirMacroPorBairro } from '../src/lib/llm-zona-macro.js';

const LLM_DELAY_MS = 500;

async function main() {
  const connStr = process.env.DATABASE_URL;
  const apiKey = process.env.OPENAI_API_KEY;
  const dryRun = process.argv.includes('--dry-run');
  const useLlm = process.argv.includes('--llm');

  if (!connStr) {
    console.error('Configure DATABASE_URL no .env');
    process.exit(1);
  }

  if (useLlm && !apiKey?.trim()) {
    console.error('Para --llm, configure OPENAI_API_KEY no .env');
    process.exit(1);
  }

  if (dryRun) console.log('Modo --dry-run: nenhuma alteração será feita.\n');
  if (useLlm) console.log('Modo --llm: usando OpenAI para zonas sem mapeamento.\n');

  const pool = new Pool({
    connectionString: connStr,
    ssl: connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const { rows } = await pool.query<{ id: string; zona_entrega: string | null }>(
      `SELECT id, zona_entrega
       FROM pedidos_venda
       WHERE tipo_entrega = 'entrega'
         AND zona_entrega IS NOT NULL
         AND TRIM(zona_entrega) != ''`
    );

    const zonasUnicas = [...new Set(rows.map((r) => r.zona_entrega ?? '').filter(Boolean))].sort();

    if (useLlm && apiKey) {
      for (const zona of zonasUnicas) {
        if (zonaToMacroRegiao(zona)) continue;
        try {
          const macro = await sugerirMacroPorBairro(zona, apiKey);
          await new Promise((r) => setTimeout(r, LLM_DELAY_MS));
          if (macro && !dryRun) {
            addZonaMacroOverride(zona, macro);
            console.log(`  ${zona} → ${macro} (LLM, salvo em overrides)`);
          } else if (macro) {
            console.log(`  ${zona} → ${macro} (LLM, dry-run)`);
          }
        } catch (e) {
          console.error(`  LLM falhou para "${zona}":`, e);
        }
      }
    }

    let atualizados = 0;
    const semMacro: string[] = [];

    for (const row of rows) {
      const macro = zonaToMacroRegiao(row.zona_entrega);
      if (!macro) {
        semMacro.push(row.zona_entrega ?? '');
        continue;
      }

      if (!dryRun) {
        await pool.query(
          `UPDATE pedidos_venda SET micro_regiao_entrega = $1, updated_at = NOW() WHERE id = $2`,
          [macro, row.id]
        );
        atualizados++;
      } else {
        console.log(`  ${row.zona_entrega} → ${macro}`);
        atualizados++;
      }
    }

    console.log(`\nPedidos com zona mapeada: ${atualizados}`);
    if (semMacro.length > 0) {
      const unicas = [...new Set(semMacro)].sort();
      console.log(`Zonas sem mapeamento (${unicas.length}): ${unicas.join(', ')}`);
      if (useLlm) console.log('Execute novamente com --llm para tentar classificar via LLM.');
    }
    if (!dryRun && atualizados > 0) {
      console.log(`${atualizados} pedido(s) atualizado(s).`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
