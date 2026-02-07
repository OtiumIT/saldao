import { getPool } from '../../db/client.js';

export interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago';
  forma_pagamento: string | null;
  pedido_compra_id: string | null;
  parcela_numero: number | null;
  created_at: string;
  updated_at: string;
  pago_em: string | null;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'recebido';
  forma_pagamento: string | null;
  pedido_venda_id: string | null;
  parcela_numero: number | null;
  created_at: string;
  updated_at: string;
  recebido_em: string | null;
}

export async function listContasPagar(filtros?: { status?: string; data_inicio?: string; data_fim?: string }): Promise<ContaPagar[]> {
  const pool = getPool();
  if (!pool) return [];
  let sql = 'SELECT id, descricao, valor::numeric, vencimento::text, status, forma_pagamento, pedido_compra_id, parcela_numero, created_at, updated_at, pago_em FROM contas_a_pagar WHERE 1=1';
  const params: unknown[] = [];
  let i = 1;
  if (filtros?.status) { sql += ` AND status = $${i++}`; params.push(filtros.status); }
  if (filtros?.data_inicio) { sql += ` AND vencimento >= $${i++}`; params.push(filtros.data_inicio); }
  if (filtros?.data_fim) { sql += ` AND vencimento <= $${i++}`; params.push(filtros.data_fim); }
  sql += ' ORDER BY vencimento';
  const { rows } = await pool.query<ContaPagar & { valor: string }>(sql, params);
  return rows.map((r) => ({ ...r, valor: Number(r.valor) }));
}

export async function listContasReceber(filtros?: { status?: string; data_inicio?: string; data_fim?: string }): Promise<ContaReceber[]> {
  const pool = getPool();
  if (!pool) return [];
  let sql = 'SELECT id, descricao, valor::numeric, vencimento::text, status, forma_pagamento, pedido_venda_id, parcela_numero, created_at, updated_at, recebido_em FROM contas_a_receber WHERE 1=1';
  const params: unknown[] = [];
  let i = 1;
  if (filtros?.status) { sql += ` AND status = $${i++}`; params.push(filtros.status); }
  if (filtros?.data_inicio) { sql += ` AND vencimento >= $${i++}`; params.push(filtros.data_inicio); }
  if (filtros?.data_fim) { sql += ` AND vencimento <= $${i++}`; params.push(filtros.data_fim); }
  sql += ' ORDER BY vencimento';
  const { rows } = await pool.query<ContaReceber & { valor: string }>(sql, params);
  return rows.map((r) => ({ ...r, valor: Number(r.valor) }));
}

export async function createContaPagar(data: {
  descricao: string;
  valor: number;
  vencimento: string;
  forma_pagamento?: string | null;
  pedido_compra_id?: string | null;
  parcela_numero?: number | null;
}): Promise<ContaPagar> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<ContaPagar & { valor: string }>(
    `INSERT INTO contas_a_pagar (descricao, valor, vencimento, forma_pagamento, pedido_compra_id, parcela_numero)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, descricao, valor::numeric, vencimento::text, status, forma_pagamento, pedido_compra_id, parcela_numero, created_at, updated_at, pago_em`,
    [data.descricao, data.valor, data.vencimento, data.forma_pagamento ?? null, data.pedido_compra_id ?? null, data.parcela_numero ?? null]
  );
  return { ...rows[0], valor: Number(rows[0].valor) };
}

export async function createContaReceber(data: {
  descricao: string;
  valor: number;
  vencimento: string;
  forma_pagamento?: string | null;
  pedido_venda_id?: string | null;
  parcela_numero?: number | null;
}): Promise<ContaReceber> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<ContaReceber & { valor: string }>(
    `INSERT INTO contas_a_receber (descricao, valor, vencimento, forma_pagamento, pedido_venda_id, parcela_numero)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, descricao, valor::numeric, vencimento::text, status, forma_pagamento, pedido_venda_id, parcela_numero, created_at, updated_at, recebido_em`,
    [data.descricao, data.valor, data.vencimento, data.forma_pagamento ?? null, data.pedido_venda_id ?? null, data.parcela_numero ?? null]
  );
  return { ...rows[0], valor: Number(rows[0].valor) };
}

export async function marcarPago(id: string): Promise<ContaPagar | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<ContaPagar & { valor: string }>(
    `UPDATE contas_a_pagar SET status = 'pago', pago_em = NOW(), updated_at = NOW() WHERE id = $1 AND status = 'pendente'
     RETURNING id, descricao, valor::numeric, vencimento::text, status, forma_pagamento, pedido_compra_id, parcela_numero, created_at, updated_at, pago_em`,
    [id]
  );
  return rows[0] ? { ...rows[0], valor: Number(rows[0].valor) } : null;
}

export async function marcarRecebido(id: string): Promise<ContaReceber | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<ContaReceber & { valor: string }>(
    `UPDATE contas_a_receber SET status = 'recebido', recebido_em = NOW(), updated_at = NOW() WHERE id = $1 AND status = 'pendente'
     RETURNING id, descricao, valor::numeric, vencimento::text, status, forma_pagamento, pedido_venda_id, parcela_numero, created_at, updated_at, recebido_em`,
    [id]
  );
  return rows[0] ? { ...rows[0], valor: Number(rows[0].valor) } : null;
}

export async function resumoFinanceiro(periodo: { data_inicio: string; data_fim: string }): Promise<{
  total_a_pagar: number;
  total_a_receber: number;
  total_pago: number;
  total_recebido: number;
  pendente_pagar: number;
  pendente_receber: number;
}> {
  const pool = getPool();
  if (!pool) return { total_a_pagar: 0, total_a_receber: 0, total_pago: 0, total_recebido: 0, pendente_pagar: 0, pendente_receber: 0 };
  const { rows: pagar } = await pool.query<{ sum: string }>(
    'SELECT COALESCE(SUM(valor), 0)::numeric AS sum FROM contas_a_pagar WHERE vencimento BETWEEN $1 AND $2',
    [periodo.data_inicio, periodo.data_fim]
  );
  const { rows: receber } = await pool.query<{ sum: string }>(
    'SELECT COALESCE(SUM(valor), 0)::numeric AS sum FROM contas_a_receber WHERE vencimento BETWEEN $1 AND $2',
    [periodo.data_inicio, periodo.data_fim]
  );
  const { rows: pago } = await pool.query<{ sum: string }>(
    'SELECT COALESCE(SUM(valor), 0)::numeric AS sum FROM contas_a_pagar WHERE status = $1 AND pago_em::date BETWEEN $2 AND $3',
    ['pago', periodo.data_inicio, periodo.data_fim]
  );
  const { rows: recebido } = await pool.query<{ sum: string }>(
    'SELECT COALESCE(SUM(valor), 0)::numeric AS sum FROM contas_a_receber WHERE status = $1 AND recebido_em::date BETWEEN $2 AND $3',
    ['recebido', periodo.data_inicio, periodo.data_fim]
  );
  const { rows: pendPagar } = await pool.query<{ sum: string }>(
    "SELECT COALESCE(SUM(valor), 0)::numeric AS sum FROM contas_a_pagar WHERE status = 'pendente'"
  );
  const { rows: pendReceber } = await pool.query<{ sum: string }>(
    "SELECT COALESCE(SUM(valor), 0)::numeric AS sum FROM contas_a_receber WHERE status = 'pendente'"
  );
  return {
    total_a_pagar: Number(pagar[0]?.sum ?? 0),
    total_a_receber: Number(receber[0]?.sum ?? 0),
    total_pago: Number(pago[0]?.sum ?? 0),
    total_recebido: Number(recebido[0]?.sum ?? 0),
    pendente_pagar: Number(pendPagar[0]?.sum ?? 0),
    pendente_receber: Number(pendReceber[0]?.sum ?? 0),
  };
}
