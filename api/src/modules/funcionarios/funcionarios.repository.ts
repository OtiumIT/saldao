import { getPool } from '../../db/client.js';

export interface Funcionario {
  id: string;
  nome: string;
  salario: number;
  dia_pagamento: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PagamentoFuncionario {
  id: string;
  funcionario_id: string;
  ano: number;
  mes: number;
  valor_pago: number;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface PagamentoComFuncionario extends PagamentoFuncionario {
  funcionario_nome: string;
  funcionario_salario: number;
  funcionario_dia_pagamento: number;
}

export async function listFuncionarios(apenasAtivos?: boolean): Promise<Funcionario[]> {
  const pool = getPool();
  if (!pool) return [];
  const where = apenasAtivos ? 'WHERE ativo = true' : '';
  const { rows } = await pool.query<Funcionario & { salario: string }>(
    `SELECT id, nome, salario::numeric, dia_pagamento, ativo, created_at, updated_at FROM funcionarios ${where} ORDER BY nome`
  );
  return rows.map((r) => ({ ...r, salario: Number(r.salario) }));
}

export async function findFuncionarioById(id: string): Promise<Funcionario | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<Funcionario & { salario: string }>(
    'SELECT id, nome, salario::numeric, dia_pagamento, ativo, created_at, updated_at FROM funcionarios WHERE id = $1',
    [id]
  );
  const r = rows[0];
  return r ? { ...r, salario: Number(r.salario) } : null;
}

export async function createFuncionario(data: {
  nome: string;
  salario: number;
  dia_pagamento?: number;
  ativo?: boolean;
}): Promise<Funcionario> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const dia_pagamento = Math.min(28, Math.max(1, data.dia_pagamento ?? 5));
  const ativo = data.ativo ?? true;
  const { rows } = await pool.query<Funcionario & { salario: string }>(
    `INSERT INTO funcionarios (nome, salario, dia_pagamento, ativo)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, salario::numeric, dia_pagamento, ativo, created_at, updated_at`,
    [data.nome, data.salario, dia_pagamento, ativo]
  );
  return { ...rows[0], salario: Number(rows[0].salario) };
}

export async function updateFuncionario(
  id: string,
  data: { nome?: string; salario?: number; dia_pagamento?: number; ativo?: boolean }
): Promise<Funcionario | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const current = await findFuncionarioById(id);
  if (!current) return null;
  const nome = data.nome ?? current.nome;
  const salario = data.salario ?? current.salario;
  const dia_pagamento = data.dia_pagamento !== undefined ? Math.min(28, Math.max(1, data.dia_pagamento)) : current.dia_pagamento;
  const ativo = data.ativo !== undefined ? data.ativo : current.ativo;
  const { rows } = await pool.query<Funcionario & { salario: string }>(
    `UPDATE funcionarios SET nome = $2, salario = $3, dia_pagamento = $4, ativo = $5, updated_at = NOW()
     WHERE id = $1 RETURNING id, nome, salario::numeric, dia_pagamento, ativo, created_at, updated_at`,
    [id, nome, salario, dia_pagamento, ativo]
  );
  const r = rows[0];
  return r ? { ...r, salario: Number(r.salario) } : null;
}

export async function removeFuncionario(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM funcionarios WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

export async function listPagamentosPorPeriodo(ano: number, mes: number): Promise<PagamentoComFuncionario[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<
    PagamentoFuncionario & { funcionario_nome: string; funcionario_salario: string; funcionario_dia_pagamento: number; valor_pago: string }
  >(
    `SELECT p.id, p.funcionario_id, p.ano, p.mes, p.valor_pago::numeric, p.observacao, p.created_at, p.updated_at,
      f.nome AS funcionario_nome, f.salario::numeric AS funcionario_salario, f.dia_pagamento AS funcionario_dia_pagamento
     FROM pagamentos_funcionarios p
     JOIN funcionarios f ON f.id = p.funcionario_id
     WHERE p.ano = $1 AND p.mes = $2
     ORDER BY f.nome`,
    [ano, mes]
  );
  return rows.map((r) => ({
    ...r,
    valor_pago: Number(r.valor_pago),
    funcionario_salario: Number(r.funcionario_salario),
  }));
}

/** Retorna totais de pagamentos por período (inclui funcionários ativos sem registro: usa salário base). */
export async function getFolhaPeriodo(ano: number, mes: number): Promise<{
  pagamentos: PagamentoComFuncionario[];
  total: number;
}> {
  const funcionarios = await listFuncionarios(true);
  const existentes = await listPagamentosPorPeriodo(ano, mes);
  const byFuncId = new Map(existentes.map((p) => [p.funcionario_id, p]));
  const pagamentos: PagamentoComFuncionario[] = funcionarios.map((f) => {
    const p = byFuncId.get(f.id);
    if (p) return p;
    return {
      id: '',
      funcionario_id: f.id,
      ano,
      mes,
      valor_pago: f.salario,
      observacao: null,
      created_at: '',
      updated_at: '',
      funcionario_nome: f.nome,
      funcionario_salario: f.salario,
      funcionario_dia_pagamento: f.dia_pagamento,
    };
  });
  const total = pagamentos.reduce((s, p) => s + p.valor_pago, 0);
  return { pagamentos, total };
}

export async function upsertPagamento(
  funcionarioId: string,
  ano: number,
  mes: number,
  valorPago: number,
  observacao: string | null
): Promise<PagamentoComFuncionario | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const funcionario = await findFuncionarioById(funcionarioId);
  if (!funcionario) return null;
  const { rows } = await pool.query<
    PagamentoFuncionario & { funcionario_nome: string; funcionario_salario: string; funcionario_dia_pagamento: number; valor_pago: string }
  >(
    `INSERT INTO pagamentos_funcionarios (funcionario_id, ano, mes, valor_pago, observacao)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (funcionario_id, ano, mes)
     DO UPDATE SET valor_pago = EXCLUDED.valor_pago, observacao = EXCLUDED.observacao, updated_at = NOW()
     RETURNING id, funcionario_id, ano, mes, valor_pago::numeric, observacao, created_at, updated_at`,
    [funcionarioId, ano, mes, valorPago, observacao ?? null]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    ...r,
    valor_pago: Number(r.valor_pago),
    funcionario_nome: funcionario.nome,
    funcionario_salario: funcionario.salario,
    funcionario_dia_pagamento: funcionario.dia_pagamento,
  };
}

export async function totalFolhaMes(ano: number, mes: number): Promise<number> {
  const { total } = await getFolhaPeriodo(ano, mes);
  return total;
}
