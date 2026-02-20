/**
 * Repository de Parcelamento usando Supabase Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { OpcaoParcelamento } from './parcelamento.repository.js';

function toOpcao(r: OpcaoParcelamento & { parcelas?: unknown; taxa_percentual?: unknown }): OpcaoParcelamento {
  return {
    ...r,
    parcelas: typeof r.parcelas === 'number' ? r.parcelas : Number(r.parcelas),
    taxa_percentual: typeof r.taxa_percentual === 'number' ? r.taxa_percentual : Number(r.taxa_percentual),
  };
}

export async function list(env: Env): Promise<OpcaoParcelamento[]> {
  const client = getDataClient(env);
  const rows = await db.select<OpcaoParcelamento>(client, 'opcoes_parcelamento', {
    orderBy: { column: 'parcelas', ascending: true },
  });
  return rows.map(toOpcao);
}

export async function findById(env: Env, id: string): Promise<OpcaoParcelamento | null> {
  const client = getDataClient(env);
  const r = await db.findById<OpcaoParcelamento>(client, 'opcoes_parcelamento', id);
  return r ? toOpcao(r) : null;
}

export async function findByParcelas(env: Env, parcelas: number): Promise<OpcaoParcelamento | null> {
  const client = getDataClient(env);
  const rows = await db.select<OpcaoParcelamento>(client, 'opcoes_parcelamento', {
    filters: { parcelas },
  });
  const r = rows[0];
  return r ? toOpcao(r) : null;
}

export async function update(
  env: Env,
  id: string,
  data: { taxa_percentual: number }
): Promise<OpcaoParcelamento | null> {
  const client = getDataClient(env);
  const updated = await db.update<OpcaoParcelamento>(client, 'opcoes_parcelamento', id, {
    taxa_percentual: data.taxa_percentual,
    updated_at: new Date().toISOString(),
  } as unknown as Partial<OpcaoParcelamento>);
  return updated ? toOpcao(updated) : null;
}

export async function updateByParcelas(
  env: Env,
  parcelas: number,
  taxa_percentual: number
): Promise<OpcaoParcelamento | null> {
  const op = await findByParcelas(env, parcelas);
  if (!op) return null;
  return update(env, op.id, { taxa_percentual });
}
