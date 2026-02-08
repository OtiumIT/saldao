/**
 * Repository de Funcionários usando Supabase Data API (sem policies)
 * Substitui funcionarios.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type {
  Funcionario,
  PagamentoFuncionario,
  PagamentoComFuncionario,
} from './funcionarios.repository.js';

export async function listFuncionarios(env: Env, apenasAtivos?: boolean): Promise<Funcionario[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (apenasAtivos) {
    filters.ativo = true;
  }
  const results = await db.select<Funcionario & { salario: string }>(
    client,
    'funcionarios',
    {
      filters,
      orderBy: { column: 'nome', ascending: true },
    }
  );
  return results.map((r) => ({ ...r, salario: Number(r.salario) }));
}

export async function findFuncionarioById(env: Env, id: string): Promise<Funcionario | null> {
  const client = getDataClient(env);
  const result = await db.findById<Funcionario & { salario: string }>(client, 'funcionarios', id);
  if (!result) return null;
  return { ...result, salario: Number(result.salario) };
}

export async function createFuncionario(
  env: Env,
  data: {
    nome: string;
    salario: number;
    dia_pagamento?: number;
    ativo?: boolean;
  }
): Promise<Funcionario> {
  const client = getDataClient(env);
  const dia_pagamento = Math.min(28, Math.max(1, data.dia_pagamento ?? 5));
  const ativo = data.ativo ?? true;
  const results = await db.insert<Funcionario & { salario: string }>(client, 'funcionarios', {
    nome: data.nome,
    salario: data.salario,
    dia_pagamento,
    ativo,
  } as any);
  return { ...results[0], salario: Number(results[0].salario) };
}

export async function updateFuncionario(
  env: Env,
  id: string,
  data: { nome?: string; salario?: number; dia_pagamento?: number; ativo?: boolean }
): Promise<Funcionario | null> {
  const client = getDataClient(env);
  const current = await findFuncionarioById(env, id);
  if (!current) return null;

  const updateData: Record<string, unknown> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.salario !== undefined) updateData.salario = data.salario;
  if (data.dia_pagamento !== undefined) {
    updateData.dia_pagamento = Math.min(28, Math.max(1, data.dia_pagamento));
  }
  if (data.ativo !== undefined) updateData.ativo = data.ativo;

  const result = await db.update<Funcionario & { salario: string }>(
    client,
    'funcionarios',
    id,
    updateData as any
  );
  if (!result) return null;
  return { ...result, salario: Number(result.salario) };
}

export async function removeFuncionario(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    await db.remove(client, 'funcionarios', id);
    return true;
  } catch (error) {
    return false;
  }
}

export async function listPagamentosPorPeriodo(
  env: Env,
  ano: number,
  mes: number
): Promise<PagamentoComFuncionario[]> {
  const client = getDataClient(env);
  // Buscar pagamentos com JOIN usando select
  const pagamentos = await db.select<PagamentoFuncionario & { valor_pago: string }>(
    client,
    'pagamentos_funcionarios',
    {
      filters: { ano, mes },
      select: '*, funcionarios!inner(nome, salario, dia_pagamento)',
      orderBy: { column: 'funcionarios.nome', ascending: true },
    }
  );

  // Como o Supabase retorna o JOIN de forma aninhada, precisamos ajustar
  // Vamos fazer duas queries separadas e combinar
  const pagamentosList = await db.select<PagamentoFuncionario & { valor_pago: string }>(
    client,
    'pagamentos_funcionarios',
    {
      filters: { ano, mes },
    }
  );

  const funcionariosIds = pagamentosList.map((p) => p.funcionario_id);
  const funcionarios = await db.select<Funcionario & { salario: string }>(
    client,
    'funcionarios',
    {
      filters: { id: funcionariosIds.length > 0 ? funcionariosIds : [] },
    }
  );

  const funcionariosMap = new Map(funcionarios.map((f) => [f.id, f]));

  return pagamentosList.map((p) => {
    const f = funcionariosMap.get(p.funcionario_id);
    if (!f) {
      throw new Error(`Funcionário ${p.funcionario_id} não encontrado`);
    }
    return {
      ...p,
      valor_pago: Number(p.valor_pago),
      funcionario_nome: f.nome,
      funcionario_salario: Number(f.salario),
      funcionario_dia_pagamento: f.dia_pagamento,
    };
  });
}

export async function getFolhaPeriodo(
  env: Env,
  ano: number,
  mes: number
): Promise<{
  pagamentos: PagamentoComFuncionario[];
  total: number;
}> {
  const funcionarios = await listFuncionarios(env, true);
  const existentes = await listPagamentosPorPeriodo(env, ano, mes);
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
  env: Env,
  funcionarioId: string,
  ano: number,
  mes: number,
  valorPago: number,
  observacao: string | null
): Promise<PagamentoComFuncionario | null> {
  const client = getDataClient(env);
  const funcionario = await findFuncionarioById(env, funcionarioId);
  if (!funcionario) return null;

  // Verificar se já existe
  const existing = await db.select<PagamentoFuncionario & { valor_pago: string }>(
    client,
    'pagamentos_funcionarios',
    {
      filters: { funcionario_id: funcionarioId, ano, mes },
      limit: 1,
    }
  );

  let result: PagamentoFuncionario & { valor_pago: string };
  if (existing.length > 0) {
    // Update
    const updated = await db.update<PagamentoFuncionario & { valor_pago: string }>(
      client,
      'pagamentos_funcionarios',
      existing[0].id,
      {
        valor_pago: valorPago,
        observacao: observacao ?? null,
      } as any
    );
    if (!updated) return null;
    result = updated;
  } else {
    // Insert
    const inserted = await db.insert<PagamentoFuncionario & { valor_pago: string }>(
      client,
      'pagamentos_funcionarios',
      {
        funcionario_id: funcionarioId,
        ano,
        mes,
        valor_pago: valorPago,
        observacao: observacao ?? null,
      } as any
    );
    result = inserted[0];
  }

  return {
    ...result,
    valor_pago: Number(result.valor_pago),
    funcionario_nome: funcionario.nome,
    funcionario_salario: funcionario.salario,
    funcionario_dia_pagamento: funcionario.dia_pagamento,
  };
}

export async function totalFolhaMes(env: Env, ano: number, mes: number): Promise<number> {
  const { total } = await getFolhaPeriodo(env, ano, mes);
  return total;
}
