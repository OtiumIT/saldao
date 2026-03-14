/**
 * Job de geocode para pedidos de venda.
 * Roda a cada 15 min via Cloudflare Cron + em background ao criar/editar venda.
 * Preenche endereco_lat, endereco_lon, zona_entrega e micro_regiao_entrega.
 * Usa Nominatim + fallback Google Maps. Zona/macro via reverse geocode + mapeamento customizado.
 *
 * Nunca bloqueia a resposta: usa waitUntil (Workers) ou setImmediate (Node).
 */

/** Agenda o job em background sem bloquear a resposta. Workers: waitUntil. Node: setImmediate. */
export function scheduleGeocodeInBackground(
  env: Env,
  executionCtx?: { waitUntil?: (p: Promise<unknown>) => void } | null
): void {
  const run = () => runGeocodeJob(env).catch((err) => console.error('[geocode-job]', err));
  if (executionCtx?.waitUntil) {
    executionCtx.waitUntil(run());
  } else {
    setTimeout(() => run(), 0);
  }
}
import { Pool } from 'pg';
import type { Env } from '../../types/worker-env.js';
import { getEnv } from '../../config/env.worker.js';
import { geocodeOneWithFallback } from './geocode.service.js';
import { reverseGeocodeToBairroEMicroRegiao } from '../../lib/google-maps.js';
import { zonaToMacroRegiao } from '../../lib/zona-macro-mapping.js';
import { sugerirMacroPorBairro } from '../../lib/llm-zona-macro.js';

const LIMIT_PER_RUN = 5;
const DELAY_MS = 350;
const LLM_DELAY_MS = 500;

async function obterMacro(bairro: string | null, microRegiao: string | null, openaiKey: string | null): Promise<string | null> {
  if (!bairro?.trim()) return microRegiao ?? null;
  const doMapping = zonaToMacroRegiao(bairro);
  if (doMapping) return doMapping;
  if (openaiKey?.trim()) {
    try {
      const macro = await sugerirMacroPorBairro(bairro, openaiKey);
      await new Promise((r) => setTimeout(r, LLM_DELAY_MS));
      return macro ?? microRegiao ?? null;
    } catch {
      return microRegiao ?? null;
    }
  }
  return microRegiao ?? null;
}

export async function runGeocodeJob(env: Env): Promise<{ processed: number; updated: number }> {
  const connStr = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL ?? null;
  if (!connStr) {
    console.warn('[geocode-job] HYPERDRIVE/DATABASE_URL not configured, skipping');
    return { processed: 0, updated: 0 };
  }

  const pool = new Pool({
    connectionString: connStr,
    max: 1,
    ssl: connStr.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    statement_timeout: 25000,
  });

  const { googleMaps, openai } = getEnv(env);
  const googleApiKey = googleMaps?.apiKey ?? null;
  const openaiKey = openai?.apiKey ?? null;

  try {
    const { rows } = await pool.query<{ id: string; endereco_entrega: string }>(
      `SELECT id, endereco_entrega FROM pedidos_venda
       WHERE tipo_entrega = 'entrega' AND endereco_entrega IS NOT NULL
         AND (endereco_lat IS NULL OR endereco_lon IS NULL)
         AND (endereco_geocode_falhou IS NOT TRUE)
       ORDER BY data_pedido DESC
       LIMIT $1`,
      [LIMIT_PER_RUN]
    );

    let updated = 0;
    for (const row of rows) {
      const geo = await geocodeOneWithFallback(row.endereco_entrega, googleApiKey);
      if (geo) {
        let zona: string | null = null;
        let micro: string | null = null;
        if (googleApiKey?.trim()) {
          const { bairro, microRegiao } = await reverseGeocodeToBairroEMicroRegiao(
            googleApiKey,
            geo.lat,
            geo.lon
          );
          zona = bairro ?? null;
          micro = await obterMacro(bairro ?? null, microRegiao ?? null, openaiKey);
          await new Promise((r) => setTimeout(r, DELAY_MS));
        }
        await pool.query(
          `UPDATE pedidos_venda SET endereco_lat = $1, endereco_lon = $2, zona_entrega = COALESCE($3, zona_entrega), micro_regiao_entrega = COALESCE($4, micro_regiao_entrega), updated_at = NOW() WHERE id = $5`,
          [geo.lat, geo.lon, zona, micro, row.id]
        );
        updated++;
      } else {
        await pool.query(
          `UPDATE pedidos_venda SET endereco_geocode_falhou = true, updated_at = NOW() WHERE id = $1`,
          [row.id]
        );
      }
      await new Promise((r) => setTimeout(r, 1100));
    }

    // Fase 2: pedidos com lat/lon mas sem zona ou macro (ex.: geocode antigo)
    if (googleApiKey?.trim()) {
      const { rows: semZona } = await pool.query<{
        id: string;
        endereco_lat: number;
        endereco_lon: number;
      }>(
        `SELECT id, endereco_lat, endereco_lon FROM pedidos_venda
         WHERE tipo_entrega = 'entrega' AND endereco_lat IS NOT NULL AND endereco_lon IS NOT NULL
           AND (zona_entrega IS NULL OR zona_entrega = '' OR micro_regiao_entrega IS NULL OR micro_regiao_entrega = '')
         ORDER BY data_pedido DESC
         LIMIT $1`,
        [LIMIT_PER_RUN]
      );
      for (const row of semZona) {
        const { bairro, microRegiao } = await reverseGeocodeToBairroEMicroRegiao(
          googleApiKey,
          Number(row.endereco_lat),
          Number(row.endereco_lon)
        );
        const zona = bairro ?? null;
        const micro = await obterMacro(bairro ?? null, microRegiao ?? null, openaiKey);
        if (zona || micro) {
          await pool.query(
            `UPDATE pedidos_venda SET zona_entrega = COALESCE($1, zona_entrega), micro_regiao_entrega = COALESCE($2, micro_regiao_entrega), updated_at = NOW() WHERE id = $3`,
            [zona, micro, row.id]
          );
          updated++;
        }
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }

    return { processed: rows.length, updated };
  } finally {
    await pool.end();
  }
}
