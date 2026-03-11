import { getPool } from '../../db/client.js';

export type TipoCliente = 'externo' | 'loja';

export interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
  fone: string | null;
  email: string | null;
  cep: string | null;
  endereco_entrega: string | null;
  tipo: TipoCliente;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

/** Cliente com estatísticas de vendas (compras do cliente na loja) */
export interface ClienteCompleto extends Cliente {
  data_ultima_compra: string | null;
  total_compras: number;
  total_gasto: number;
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
    'SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes ORDER BY created_at DESC'
  );
  return rows;
}

/** Lista clientes com estatísticas de vendas (data última compra, total compras, total gasto). Mais lento. */
export async function listCompleto(): Promise<ClienteCompleto[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<ClienteCompleto & { data_ultima_compra: string | null; total_compras: string; total_gasto: string }>(
    `SELECT c.id, c.nome, c.cpf, c.cnpj, c.fone, c.email, c.cep, c.endereco_entrega, c.tipo, c.observacoes, c.created_at, c.updated_at,
       MAX(p.data_pedido)::text AS data_ultima_compra,
       COUNT(p.id)::text AS total_compras,
       COALESCE(SUM(p.total), 0)::text AS total_gasto
     FROM clientes c
     LEFT JOIN pedidos_venda p ON p.cliente_id = c.id AND p.status != 'cancelado'
     GROUP BY c.id
     ORDER BY c.created_at DESC`
  );
  return rows.map((r) => ({
    ...r,
    data_ultima_compra: r.data_ultima_compra,
    total_compras: parseInt(r.total_compras, 10),
    total_gasto: parseFloat(r.total_gasto),
  }));
}

export async function findByCpf(cpfNormalized: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE cpf = $1 LIMIT 1',
    [cpfNormalized]
  );
  return rows[0] ?? null;
}

export async function findByCnpj(cnpjNormalized: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE cnpj = $1 LIMIT 1',
    [cnpjNormalized]
  );
  return rows[0] ?? null;
}

export async function findByEmail(emailNormalized: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE LOWER(TRIM(email)) = $1 AND email IS NOT NULL AND email != \'\' LIMIT 1',
    [emailNormalized]
  );
  return rows[0] ?? null;
}

export async function findByFoneNormalized(foneDigits: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool || foneDigits.length < 10) return null;
  const { rows } = await pool.query<Cliente>(
    `SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at
     FROM clientes WHERE regexp_replace(COALESCE(fone,''), '\D', '', 'g') = $1 LIMIT 1`,
    [foneDigits]
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
    `SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at
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
      `SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at
       FROM clientes WHERE regexp_replace(COALESCE(fone,''), '\D', '', 'g') = $1 LIMIT 1`,
      [digits]
    );
    return rows[0] ?? null;
  }
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    `SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at
     FROM clientes WHERE regexp_replace(COALESCE(fone,''), '\D', '', 'g') = $1 LIMIT 1`,
    [digits]
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    'SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function findLoja(): Promise<Cliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Cliente>(
    "SELECT id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at FROM clientes WHERE tipo = 'loja' LIMIT 1"
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

export async function create(data: { nome: string; cpf?: string | null; cnpj?: string | null; fone?: string; email?: string; cep?: string | null; endereco_entrega?: string; tipo?: TipoCliente; observacoes?: string }): Promise<Cliente> {
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
  const emailNorm = data.email != null && data.email.trim() !== '' ? data.email.trim().toLowerCase() : null;
  if (emailNorm) {
    const existing = await findByEmail(emailNorm);
    if (existing) throw new Error('Já existe um cliente com este e-mail.');
  }
  const foneDigits = data.fone != null && data.fone.trim() !== '' ? normalizeDigits(data.fone) : null;
  if (foneDigits && foneDigits.length >= 10) {
    const existing = await findByFoneNormalized(foneDigits);
    if (existing) throw new Error('Já existe um cliente com este telefone/WhatsApp.');
  }
  const { rows } = await pool.query<Cliente>(
    `INSERT INTO clientes (nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at`,
    [data.nome, cpfNorm, cnpjNorm, data.fone ?? null, data.email ?? null, data.cep ?? null, data.endereco_entrega ?? null, tipo, data.observacoes ?? null]
  );
  return rows[0];
}

export async function update(id: string, data: { nome?: string; cpf?: string | null; cnpj?: string | null; fone?: string; email?: string; cep?: string | null; endereco_entrega?: string; tipo?: TipoCliente; observacoes?: string }): Promise<Cliente | null> {
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
  const emailNorm = (data.email ?? current.email) != null && String(data.email ?? current.email).trim() !== '' ? String(data.email ?? current.email).trim().toLowerCase() : null;
  if (emailNorm) {
    const existing = await findByEmail(emailNorm);
    if (existing && existing.id !== id) throw new Error('Já existe um cliente com este e-mail.');
  }
  const foneVal = data.fone !== undefined ? data.fone : current.fone;
  const foneDigits = foneVal != null && String(foneVal).trim() !== '' ? normalizeDigits(foneVal) : null;
  if (foneDigits && foneDigits.length >= 10) {
    const existing = await findByFoneNormalized(foneDigits);
    if (existing && existing.id !== id) throw new Error('Já existe um cliente com este telefone/WhatsApp.');
  }
  const { rows } = await pool.query<Cliente>(
    `UPDATE clientes SET nome = COALESCE($2, nome), cpf = $3, cnpj = $4, fone = COALESCE($5, fone), email = COALESCE($6, email),
      cep = COALESCE($7, cep), endereco_entrega = COALESCE($8, endereco_entrega), tipo = COALESCE($9, tipo), observacoes = COALESCE($10, observacoes), updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, cpf, cnpj, fone, email, cep, endereco_entrega, tipo, observacoes, created_at, updated_at`,
    [id, data.nome ?? null, cpfNorm, cnpjNorm, data.fone ?? null, data.email ?? null, data.cep ?? null, data.endereco_entrega ?? null, tipo, data.observacoes ?? null]
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
