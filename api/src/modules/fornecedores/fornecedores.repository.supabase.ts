/**
 * Repository de Fornecedores usando Supabase Data API (sem policies)
 * Substitui fornecedores.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { Fornecedor, FiltrosFornecedor, TipoFornecedor } from './fornecedores.repository.js';

export async function list(env: Env, filtros?: FiltrosFornecedor): Promise<Fornecedor[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (filtros?.tipo) {
    filters.tipo = filtros.tipo;
  }
  return db.select<Fornecedor>(client, 'fornecedores', {
    filters,
    orderBy: { column: 'nome', ascending: true },
  });
}

export async function findById(env: Env, id: string): Promise<Fornecedor | null> {
  const client = getDataClient(env);
  return db.findById<Fornecedor>(client, 'fornecedores', id);
}

export async function create(
  env: Env,
  data: {
    nome: string;
    fone?: string;
    email?: string;
    contato?: string;
    observacoes?: string;
    tipo?: TipoFornecedor | null;
  }
): Promise<Fornecedor> {
  const client = getDataClient(env);
  const results = await db.insert<Fornecedor>(client, 'fornecedores', {
    nome: data.nome,
    fone: data.fone ?? null,
    email: data.email ?? null,
    contato: data.contato ?? null,
    observacoes: data.observacoes ?? null,
    tipo: data.tipo ?? null,
  });
  return results[0];
}

export async function update(
  env: Env,
  id: string,
  data: {
    nome?: string;
    fone?: string;
    email?: string;
    contato?: string;
    observacoes?: string;
    tipo?: TipoFornecedor | null;
  }
): Promise<Fornecedor | null> {
  const client = getDataClient(env);
  const current = await findById(env, id);
  if (!current) return null;

  const updateData: Partial<Fornecedor> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.fone !== undefined) updateData.fone = data.fone ?? null;
  if (data.email !== undefined) updateData.email = data.email ?? null;
  if (data.contato !== undefined) updateData.contato = data.contato ?? null;
  if (data.observacoes !== undefined) updateData.observacoes = data.observacoes ?? null;
  if (data.tipo !== undefined) updateData.tipo = data.tipo ?? null;

  return db.update<Fornecedor>(client, 'fornecedores', id, updateData);
}

export async function remove(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    await db.remove(client, 'fornecedores', id);
    return true;
  } catch (error) {
    return false;
  }
}
