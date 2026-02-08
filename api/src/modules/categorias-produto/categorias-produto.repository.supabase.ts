/**
 * Repository de Categorias de Produto usando Supabase Data API (sem policies)
 * Substitui categorias-produto.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { CategoriaProduto } from './categorias-produto.repository.js';

export async function list(env: Env): Promise<CategoriaProduto[]> {
  const client = getDataClient(env);
  return db.select<CategoriaProduto>(client, 'categorias_produto', {
    orderBy: { column: 'nome', ascending: true },
  });
}

export async function findById(env: Env, id: string): Promise<CategoriaProduto | null> {
  const client = getDataClient(env);
  return db.findById<CategoriaProduto>(client, 'categorias_produto', id);
}

export async function create(env: Env, data: { nome: string }): Promise<CategoriaProduto> {
  const client = getDataClient(env);
  const results = await db.insert<CategoriaProduto>(client, 'categorias_produto', {
    nome: data.nome.trim(),
  });
  return results[0];
}

export async function update(env: Env, id: string, data: { nome?: string }): Promise<CategoriaProduto | null> {
  const client = getDataClient(env);
  const current = await findById(env, id);
  if (!current) return null;

  const updateData: Partial<CategoriaProduto> = {};
  if (data.nome !== undefined) {
    updateData.nome = data.nome.trim();
  }

  return db.update<CategoriaProduto>(client, 'categorias_produto', id, updateData);
}

export async function remove(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    // Primeiro atualiza produtos para remover categoria_id
    await client.from('produtos').update({ categoria_id: null }).eq('categoria_id', id);
    // Depois remove a categoria
    await db.remove(client, 'categorias_produto', id);
    return true;
  } catch (error) {
    return false;
  }
}
