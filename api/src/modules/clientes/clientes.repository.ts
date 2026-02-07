import { getPool } from '../../db/client.js';

export type TipoCliente = 'externo' | 'loja';

export interface Cliente {
  id: string;
  nome: string;
  fone: string | null;
  email: string | null;
  endereco_entrega: string | null;
  tipo: TipoCliente;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export async function list(): Promise<Cliente[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes ORDER BY tipo, nome'
  );
  return rows;
}

export async function findById(id: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function findLoja(): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    "SELECT id, nome, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE tipo = 'loja' LIMIT 1"
  );
  return rows[0] ?? null;
}

export async function create(data: { nome: string; fone?: string; email?: string; endereco_entrega?: string; tipo?: TipoCliente; observacoes?: string }): Promise<Cliente> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const tipo = data.tipo ?? 'externo';
  if (tipo === 'loja') {
    const existing = await findLoja();
    if (existing) throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
  }
  const { rows } = await pool.query<Cliente>(
    `INSERT INTO clientes (nome, fone, email, endereco_entrega, tipo, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, nome, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at`,
    [data.nome, data.fone ?? null, data.email ?? null, data.endereco_entrega ?? null, tipo, data.observacoes ?? null]
  );
  return rows[0];
}

export async function update(id: string, data: { nome?: string; fone?: string; email?: string; endereco_entrega?: string; tipo?: TipoCliente; observacoes?: string }): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  if (data.tipo === 'loja') {
    const existing = await findLoja();
    if (existing && existing.id !== id) throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
  }
  const current = await findById(id);
  if (!current) return null;
  const tipo = data.tipo ?? current.tipo;
  const { rows } = await pool.query<Cliente>(
    `UPDATE clientes SET nome = COALESCE($2, nome), fone = COALESCE($3, fone), email = COALESCE($4, email),
      endereco_entrega = COALESCE($5, endereco_entrega), tipo = COALESCE($6, tipo), observacoes = COALESCE($7, observacoes), updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at`,
    [id, data.nome ?? null, data.fone ?? null, data.email ?? null, data.endereco_entrega ?? null, tipo, data.observacoes ?? null]
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
