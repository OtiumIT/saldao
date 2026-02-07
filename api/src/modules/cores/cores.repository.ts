import { getPool } from '../../db/client.js';

export interface Cor {
  id: string;
  nome: string;
  codigo: string | null;
  created_at: string;
  updated_at: string;
}

export async function list(): Promise<Cor[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Cor>(
    'SELECT id, nome, codigo, created_at, updated_at FROM cores ORDER BY nome'
  );
  return rows;
}

export async function findById(id: string): Promise<Cor | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cor>('SELECT id, nome, codigo, created_at, updated_at FROM cores WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function create(data: { nome: string; codigo?: string | null }): Promise<Cor> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<Cor>(
    'INSERT INTO cores (nome, codigo) VALUES ($1, $2) RETURNING id, nome, codigo, created_at, updated_at',
    [data.nome.trim(), data.codigo?.trim() ?? null]
  );
  return rows[0];
}

export async function update(id: string, data: { nome?: string; codigo?: string | null }): Promise<Cor | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (data.nome !== undefined) {
    updates.push(`nome = $${i++}`);
    values.push(data.nome.trim());
  }
  if (data.codigo !== undefined) {
    updates.push(`codigo = $${i++}`);
    values.push(data.codigo?.trim() ?? null);
  }
  if (updates.length === 0) return findById(id);
  updates.push('updated_at = NOW()');
  values.push(id);
  const { rows } = await pool.query<Cor>(
    `UPDATE cores SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, nome, codigo, created_at, updated_at`,
    values
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM cores WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
