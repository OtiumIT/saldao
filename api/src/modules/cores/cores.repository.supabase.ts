/**
 * Repository de Cores usando Supabase Data API (sem policies)
 * Substitui cores.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { Cor } from './cores.repository.js';

export async function list(env: Env): Promise<Cor[]> {
  const client = getDataClient(env);
  return db.select<Cor>(client, 'cores', {
    orderBy: { column: 'nome', ascending: true },
  });
}

export async function findById(env: Env, id: string): Promise<Cor | null> {
  const client = getDataClient(env);
  return db.findById<Cor>(client, 'cores', id);
}

export async function create(env: Env, data: { nome: string; codigo?: string | null }): Promise<Cor> {
  const client = getDataClient(env);
  const results = await db.insert<Cor>(client, 'cores', {
    nome: data.nome.trim(),
    codigo: data.codigo?.trim() ?? null,
  });
  return results[0];
}

export async function update(env: Env, id: string, data: { nome?: string; codigo?: string | null }): Promise<Cor | null> {
  const client = getDataClient(env);
  const current = await findById(env, id);
  if (!current) return null;

  const updateData: Partial<Cor> = {};
  if (data.nome !== undefined) updateData.nome = data.nome.trim();
  if (data.codigo !== undefined) updateData.codigo = data.codigo?.trim() ?? null;

  return db.update<Cor>(client, 'cores', id, updateData);
}

export async function remove(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    await db.remove(client, 'cores', id);
    return true;
  } catch (error) {
    return false;
  }
}
