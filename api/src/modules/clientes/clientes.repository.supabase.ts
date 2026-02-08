/**
 * Repository de Clientes usando Supabase Data API (sem policies)
 * Substitui clientes.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { Cliente, TipoCliente } from './clientes.repository.js';

export async function list(env: Env): Promise<Cliente[]> {
  const client = getDataClient(env);
  return db.select<Cliente>(client, 'clientes', {
    orderBy: { column: 'tipo', ascending: true },
  });
}

export async function findById(env: Env, id: string): Promise<Cliente | null> {
  const client = getDataClient(env);
  return db.findById<Cliente>(client, 'clientes', id);
}

export async function findLoja(env: Env): Promise<Cliente | null> {
  const client = getDataClient(env);
  const results = await db.select<Cliente>(client, 'clientes', {
    filters: { tipo: 'loja' },
    limit: 1,
  });
  return results[0] ?? null;
}

export async function create(
  env: Env,
  data: {
    nome: string;
    fone?: string;
    email?: string;
    endereco_entrega?: string;
    tipo?: TipoCliente;
    observacoes?: string;
  }
): Promise<Cliente> {
  const client = getDataClient(env);
  const tipo = data.tipo ?? 'externo';

  if (tipo === 'loja') {
    const existing = await findLoja(env);
    if (existing) {
      throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
    }
  }

  const results = await db.insert<Cliente>(client, 'clientes', {
    nome: data.nome,
    fone: data.fone ?? null,
    email: data.email ?? null,
    endereco_entrega: data.endereco_entrega ?? null,
    tipo,
    observacoes: data.observacoes ?? null,
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
    endereco_entrega?: string;
    tipo?: TipoCliente;
    observacoes?: string;
  }
): Promise<Cliente | null> {
  const client = getDataClient(env);

  if (data.tipo === 'loja') {
    const existing = await findLoja(env);
    if (existing && existing.id !== id) {
      throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
    }
  }

  const current = await findById(env, id);
  if (!current) return null;

  const updateData: Partial<Cliente> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.fone !== undefined) updateData.fone = data.fone ?? null;
  if (data.email !== undefined) updateData.email = data.email ?? null;
  if (data.endereco_entrega !== undefined) updateData.endereco_entrega = data.endereco_entrega ?? null;
  if (data.tipo !== undefined) updateData.tipo = data.tipo;
  if (data.observacoes !== undefined) updateData.observacoes = data.observacoes ?? null;

  return db.update<Cliente>(client, 'clientes', id, updateData);
}

export async function remove(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    await db.remove(client, 'clientes', id);
    return true;
  } catch (error) {
    return false;
  }
}
