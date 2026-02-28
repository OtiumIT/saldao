/**
 * Repository de Clientes usando Supabase Data API (sem policies)
 * Substitui clientes.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { Cliente, TipoCliente } from './clientes.repository.js';
import { normalizeCpf, normalizeCnpj, normalizeDigits } from './clientes.repository.js';

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

export async function findByCpf(env: Env, cpfNormalized: string): Promise<Cliente | null> {
  const client = getDataClient(env);
  const results = await db.select<Cliente>(client, 'clientes', {
    filters: { cpf: cpfNormalized },
    limit: 1,
  });
  return results[0] ?? null;
}

export async function findByCnpj(env: Env, cnpjNormalized: string): Promise<Cliente | null> {
  const client = getDataClient(env);
  const results = await db.select<Cliente>(client, 'clientes', {
    filters: { cnpj: cnpjNormalized },
    limit: 1,
  });
  return results[0] ?? null;
}

/** Busca por nome ou qualquer texto (ILIKE). Limite 20. */
export async function searchByQuery(env: Env, q: string): Promise<Cliente[]> {
  const trimmed = (q ?? '').trim();
  if (!trimmed) return [];
  const client = getDataClient(env);
  const pattern = `%${trimmed.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
  const { data, error } = await client
    .from('clientes')
    .select('*')
    .ilike('nome', pattern)
    .order('nome', { ascending: true })
    .limit(20);
  if (error) throw new Error(error.message);
  return (data || []) as Cliente[];
}

export async function findByIdentifier(env: Env, digits: string): Promise<Cliente | null> {
  if (!digits || digits.length < 10) return null;
  if (digits.length === 14) return findByCnpj(env, digits);
  if (digits.length === 11) {
    const byCpf = await findByCpf(env, digits);
    if (byCpf) return byCpf;
    const all = await list(env);
    return all.find((c) => c.fone && normalizeDigits(c.fone) === digits) ?? null;
  }
  const all = await list(env);
  return all.find((c) => c.fone && normalizeDigits(c.fone) === digits) ?? null;
}

export async function findLoja(env: Env): Promise<Cliente | null> {
  const client = getDataClient(env);
  const results = await db.select<Cliente>(client, 'clientes', {
    filters: { tipo: 'loja' },
    limit: 1,
  });
  return results[0] ?? null;
}

/** Retorna a quantidade total de clientes (para limite do plano). */
export async function count(env: Env): Promise<number> {
  const client = getDataClient(env);
  const { count: total } = await db.selectWithCount<Cliente>(client, 'clientes', { limit: 1 });
  return total;
}

export async function create(
  env: Env,
  data: {
    nome: string;
    cpf?: string | null;
    cnpj?: string | null;
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
    if (existing) throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
  }

  const cpfNorm = data.cpf != null && data.cpf !== '' ? normalizeCpf(data.cpf) : null;
  const cnpjNorm = data.cnpj != null && data.cnpj !== '' ? normalizeCnpj(data.cnpj) : null;
  if (cpfNorm) {
    const existing = await findByCpf(env, cpfNorm);
    if (existing) throw new Error('Já existe um cliente com este CPF.');
  }
  if (cnpjNorm) {
    const existing = await findByCnpj(env, cnpjNorm);
    if (existing) throw new Error('Já existe um cliente com este CNPJ.');
  }

  const results = await db.insert<Cliente>(client, 'clientes', {
    nome: data.nome,
    cpf: cpfNorm,
    cnpj: cnpjNorm,
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
    cpf?: string | null;
    cnpj?: string | null;
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
    if (existing && existing.id !== id) throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
  }

  const current = await findById(env, id);
  if (!current) return null;

  let cpfNorm: string | null = current.cpf ?? null;
  let cnpjNorm: string | null = current.cnpj ?? null;
  if (data.cpf !== undefined) {
    cpfNorm = data.cpf != null && data.cpf !== '' ? normalizeCpf(data.cpf) : null;
    if (cpfNorm) {
      const existing = await findByCpf(env, cpfNorm);
      if (existing && existing.id !== id) throw new Error('Já existe um cliente com este CPF.');
    }
  }
  if (data.cnpj !== undefined) {
    cnpjNorm = data.cnpj != null && data.cnpj !== '' ? normalizeCnpj(data.cnpj) : null;
    if (cnpjNorm) {
      const existing = await findByCnpj(env, cnpjNorm);
      if (existing && existing.id !== id) throw new Error('Já existe um cliente com este CNPJ.');
    }
  }

  const updateData: Partial<Cliente> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.cpf !== undefined) updateData.cpf = cpfNorm;
  if (data.cnpj !== undefined) updateData.cnpj = cnpjNorm;
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
