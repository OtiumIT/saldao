import { getPool } from '../../db/client.js';

export interface CategoriaProduto {
  id: string;
  nome: string;
  created_at: string;
  updated_at: string;
}

export async function list(): Promise<CategoriaProduto[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<CategoriaProduto>(
    'SELECT id, nome, created_at, updated_at FROM categorias_produto ORDER BY nome'
  );
  return rows;
}

export async function findById(id: string): Promise<CategoriaProduto | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<CategoriaProduto>(
    'SELECT id, nome, created_at, updated_at FROM categorias_produto WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function create(data: { nome: string }): Promise<CategoriaProduto> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<CategoriaProduto>(
    `INSERT INTO categorias_produto (nome) VALUES ($1)
     RETURNING id, nome, created_at, updated_at`,
    [data.nome.trim()]
  );
  return rows[0];
}

export async function update(id: string, data: { nome?: string }): Promise<CategoriaProduto | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<CategoriaProduto>(
    `UPDATE categorias_produto SET nome = COALESCE($2, nome), updated_at = NOW()
     WHERE id = $1 RETURNING id, nome, created_at, updated_at`,
    [id, data.nome != null ? data.nome.trim() : null]
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('UPDATE produtos SET categoria_id = NULL WHERE categoria_id = $1', [id]);
  const { rowCount: del } = await pool.query('DELETE FROM categorias_produto WHERE id = $1', [id]);
  return (del ?? 0) > 0;
}
