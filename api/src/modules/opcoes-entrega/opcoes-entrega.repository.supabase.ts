import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { OpcaoEntrega, CreateOpcaoEntregaData, TipoOpcaoEntrega } from './opcoes-entrega.repository.js';

function mapRow(r: Record<string, unknown>): OpcaoEntrega {
  return {
    id: r.id as string,
    nome: r.nome as string,
    tipo: r.tipo as TipoOpcaoEntrega,
    valor_fixo: r.valor_fixo != null ? Number(r.valor_fixo) : null,
    valor_por_andar: r.valor_por_andar != null ? Number(r.valor_por_andar) : null,
    ordem: Number(r.ordem ?? 0),
    ativo: Boolean(r.ativo ?? true),
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  };
}

export async function list(env: Env): Promise<OpcaoEntrega[]> {
  const client = getDataClient(env);
  const rows = await db.select<Record<string, unknown>>(client, 'opcoes_entrega', {
    orderBy: { column: 'ordem', ascending: true },
  });
  return rows.map(mapRow);
}

export async function findById(env: Env, id: string): Promise<OpcaoEntrega | null> {
  const client = getDataClient(env);
  const row = await db.findById<Record<string, unknown>>(client, 'opcoes_entrega', id);
  return row ? mapRow(row) : null;
}

export async function create(env: Env, data: CreateOpcaoEntregaData): Promise<OpcaoEntrega> {
  const client = getDataClient(env);
  const results = await db.insert<Record<string, unknown>>(client, 'opcoes_entrega', {
    nome: data.nome.trim(),
    tipo: data.tipo,
    valor_fixo: data.valor_fixo ?? null,
    valor_por_andar: data.valor_por_andar ?? null,
    ordem: data.ordem ?? 0,
    ativo: data.ativo ?? true,
  });
  return mapRow(results[0]);
}

export async function update(
  env: Env,
  id: string,
  data: Partial<CreateOpcaoEntregaData>
): Promise<OpcaoEntrega | null> {
  const client = getDataClient(env);
  const current = await findById(env, id);
  if (!current) return null;

  const updateData: Record<string, unknown> = {};
  if (data.nome !== undefined) updateData.nome = data.nome.trim();
  if (data.tipo !== undefined) updateData.tipo = data.tipo;
  if (data.valor_fixo !== undefined) updateData.valor_fixo = data.valor_fixo;
  if (data.valor_por_andar !== undefined) updateData.valor_por_andar = data.valor_por_andar;
  if (data.ordem !== undefined) updateData.ordem = data.ordem;
  if (data.ativo !== undefined) updateData.ativo = data.ativo;

  const updated = await db.update<Record<string, unknown>>(client, 'opcoes_entrega', id, updateData);
  return updated ? mapRow(updated) : null;
}

export async function remove(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    await db.remove(client, 'opcoes_entrega', id);
    return true;
  } catch {
    return false;
  }
}

export async function getConfig(env: Env, chave: string): Promise<string | null> {
  const client = getDataClient(env);
  const rows = await db.select<{ chave: string; valor: string | null }>(client, 'config_entrega', {
    filters: { chave },
  });
  return rows[0]?.valor ?? null;
}

export async function setConfig(env: Env, chave: string, valor: string | null): Promise<void> {
  const client = getDataClient(env);
  const { error } = await client.from('config_entrega').upsert({ chave, valor }, { onConflict: 'chave' });
  if (error) throw new Error(`Supabase config error: ${error.message}`);
}
