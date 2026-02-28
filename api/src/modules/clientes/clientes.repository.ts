import { getPool } from '../../db/client.js';

export type TipoCliente = 'externo' | 'loja';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
  fone: string | null;
  email: string | null;
  endereco_entrega: string | null;
  tipo: TipoCliente;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

/** Retorna só dígitos do input (para CPF/CNPJ/WhatsApp) */
export function normalizeDigits(value: string | null | undefined): string {
  if (value == null || typeof value !== 'string') return '';
  return value.replace(/\D/g, '');
}

/** Retorna só os 11 dígitos do CPF ou null se inválido */
export function normalizeCpf(cpf: string | null | undefined): string | null {
  const d = normalizeDigits(cpf);
  return d.length === 11 ? d : null;
}

/** Retorna só os 14 dígitos do CNPJ ou null se inválido */
export function normalizeCnpj(cnpj: string | null | undefined): string | null {
  const d = normalizeDigits(cnpj);
  return d.length === 14 ? d : null;
}

export async function list(): Promise<Cliente[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes ORDER BY tipo, nome'
  );
  return rows;
}

export async function findByCpf(cpfNormalized: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE cpf = $1 LIMIT 1',
    [cpfNormalized]
  );
  return rows[0] ?? null;
}

export async function findByCnpj(cnpjNormalized: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE cnpj = $1 LIMIT 1',
    [cnpjNormalized]
  );
  return rows[0] ?? null;
}

/** Busca por nome ou qualquer texto (ILIKE no nome). Limite 20. */
export async function searchByQuery(q: string): Promise<Cliente[]> {
  const trimmed = (q ?? '').trim();
  if (!trimmed) return [];
  const pool = getPool();
  if (!pool) return [];
  const pattern = `%${trimmed.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`;
  const { rows } = await pool.query<Cliente>(
    `SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at
     FROM clientes WHERE nome ILIKE $1 ORDER BY nome LIMIT 20`,
    [pattern]
  );
  return rows;
}

/** Busca por CPF (11 dígitos), CNPJ (14) ou WhatsApp/fone. Em 11 dígitos tenta CPF e depois fone. */
export async function findByIdentifier(digits: string): Promise<Cliente | null> {
  if (!digits || digits.length < 10) return null;
  if (digits.length === 14) return findByCnpj(digits);
  if (digits.length === 11) {
    const byCpf = await findByCpf(digits);
    if (byCpf) return byCpf;
    const pool = getPool();
    if (!pool) return null;
    const { rows } = await pool.query<Cliente>(
      `SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at
       FROM clientes WHERE regexp_replace(COALESCE(fone,''), '\D', '', 'g') = $1 LIMIT 1`,
      [digits]
    );
    return rows[0] ?? null;
  }
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    `SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at
     FROM clientes WHERE regexp_replace(COALESCE(fone,''), '\D', '', 'g') = $1 LIMIT 1`,
    [digits]
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function findLoja(): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    "SELECT id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE tipo = 'loja' LIMIT 1"
  );
  return rows[0] ?? null;
}

/** Retorna a quantidade total de clientes (para limite do plano). */
export async function count(): Promise<number> {
  const pool = getPool();
  if (!pool) return 0;
  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM clientes');
  return parseInt(rows[0]?.count ?? '0', 10);
}

export async function create(data: { nome: string; cpf?: string | null; cnpj?: string | null; fone?: string; email?: string; endereco_entrega?: string; tipo?: TipoCliente; observacoes?: string }): Promise<Cliente> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const tipo = data.tipo ?? 'externo';
  if (tipo === 'loja') {
    const existing = await findLoja();
    if (existing) throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
  }
  const cpfNorm = data.cpf != null && data.cpf !== '' ? normalizeCpf(data.cpf) : null;
  const cnpjNorm = data.cnpj != null && data.cnpj !== '' ? normalizeCnpj(data.cnpj) : null;
  if (cpfNorm) {
    const existing = await findByCpf(cpfNorm);
    if (existing) throw new Error('Já existe um cliente com este CPF.');
  }
  if (cnpjNorm) {
    const existing = await findByCnpj(cnpjNorm);
    if (existing) throw new Error('Já existe um cliente com este CNPJ.');
  }
  const { rows } = await pool.query<Cliente>(
    `INSERT INTO clientes (nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at`,
    [data.nome, cpfNorm, cnpjNorm, data.fone ?? null, data.email ?? null, data.endereco_entrega ?? null, tipo, data.observacoes ?? null]
  );
  return rows[0];
}

export async function update(id: string, data: { nome?: string; cpf?: string | null; cnpj?: string | null; fone?: string; email?: string; endereco_entrega?: string; tipo?: TipoCliente; observacoes?: string }): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  if (data.tipo === 'loja') {
    const existing = await findLoja();
    if (existing && existing.id !== id) throw new Error('Já existe um cliente tipo Loja. Só pode haver um.');
  }
  const current = await findById(id);
  if (!current) return null;
  const tipo = data.tipo ?? current.tipo;
  let cpfNorm: string | null = current.cpf;
  let cnpjNorm: string | null = current.cnpj;
  if (data.cpf !== undefined) {
    cpfNorm = data.cpf != null && data.cpf !== '' ? normalizeCpf(data.cpf) : null;
    if (cpfNorm) {
      const existing = await findByCpf(cpfNorm);
      if (existing && existing.id !== id) throw new Error('Já existe um cliente com este CPF.');
    }
  }
  if (data.cnpj !== undefined) {
    cnpjNorm = data.cnpj != null && data.cnpj !== '' ? normalizeCnpj(data.cnpj) : null;
    if (cnpjNorm) {
      const existing = await findByCnpj(cnpjNorm);
      if (existing && existing.id !== id) throw new Error('Já existe um cliente com este CNPJ.');
    }
  }
  const { rows } = await pool.query<Cliente>(
    `UPDATE clientes SET nome = COALESCE($2, nome), cpf = $3, cnpj = $4, fone = COALESCE($5, fone), email = COALESCE($6, email),
      endereco_entrega = COALESCE($7, endereco_entrega), tipo = COALESCE($8, tipo), observacoes = COALESCE($9, observacoes), updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, cpf, cnpj, fone, email, endereco_entrega, tipo, observacoes, created_at, updated_at`,
    [id, data.nome ?? null, cpfNorm, cnpjNorm, data.fone ?? null, data.email ?? null, data.endereco_entrega ?? null, tipo, data.observacoes ?? null]
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
