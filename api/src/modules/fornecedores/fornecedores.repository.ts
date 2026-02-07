import { getPool } from '../../db/client.js';

export type TipoFornecedor = 'insumos' | 'revenda';

export interface Fornecedor {
  id: string;
  nome: string;
  fone: string | null;
  email: string | null;
  contato: string | null;
  observacoes: string | null;
  tipo: TipoFornecedor | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLS = 'id, nome, fone, email, contato, observacoes, tipo, created_at, updated_at';

export interface FiltrosFornecedor {
  tipo?: TipoFornecedor;
}

export async function list(filtros?: FiltrosFornecedor): Promise<Fornecedor[]> {
  const pool = getPool();
  if (!pool) return [];
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filtros?.tipo) {
    conditions.push('tipo = $1');
    params.push(filtros.tipo);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query<Fornecedor>(
    `SELECT ${SELECT_COLS} FROM fornecedores ${where} ORDER BY nome`,
    params
  );
  return rows;
}

export async function findById(id: string): Promise<Fornecedor | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Fornecedor>(
    `SELECT ${SELECT_COLS} FROM fornecedores WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create(data: { nome: string; fone?: string; email?: string; contato?: string; observacoes?: string; tipo?: TipoFornecedor | null }): Promise<Fornecedor> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<Fornecedor>(
    `INSERT INTO fornecedores (nome, fone, email, contato, observacoes, tipo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${SELECT_COLS}`,
    [data.nome, data.fone ?? null, data.email ?? null, data.contato ?? null, data.observacoes ?? null, data.tipo ?? null]
  );
  return rows[0];
}

export async function update(id: string, data: { nome?: string; fone?: string; email?: string; contato?: string; observacoes?: string; tipo?: TipoFornecedor | null }): Promise<Fornecedor | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<Fornecedor>(
    `UPDATE fornecedores SET nome = COALESCE($2, nome), fone = COALESCE($3, fone), email = COALESCE($4, email),
      contato = COALESCE($5, contato), observacoes = COALESCE($6, observacoes), tipo = COALESCE($7, tipo), updated_at = NOW()
     WHERE id = $1
     RETURNING ${SELECT_COLS}`,
    [id, data.nome ?? null, data.fone ?? null, data.email ?? null, data.contato ?? null, data.observacoes ?? null, data.tipo ?? null]
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM fornecedores WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
