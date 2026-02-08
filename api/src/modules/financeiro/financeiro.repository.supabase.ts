/**
 * Repository de Financeiro usando Supabase Data API (sem policies)
 * Substitui financeiro.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { ContaPagar, ContaReceber } from './financeiro.repository.js';

export async function listContasPagar(
  env: Env,
  filtros?: { status?: string; data_inicio?: string; data_fim?: string }
): Promise<ContaPagar[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (filtros?.status) filters.status = filtros.status;
  if (filtros?.data_inicio) filters.vencimento = `>=${filtros.data_inicio}`;
  if (filtros?.data_fim) filters.vencimento = `<=${filtros.data_fim}`;

  const results = await db.select<ContaPagar & { valor: string }>(client, 'contas_a_pagar', {
    filters,
    orderBy: { column: 'vencimento', ascending: true },
  });

  return results.map((r) => ({ ...r, valor: Number(r.valor) }));
}

export async function listContasReceber(
  env: Env,
  filtros?: { status?: string; data_inicio?: string; data_fim?: string }
): Promise<ContaReceber[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (filtros?.status) filters.status = filtros.status;
  if (filtros?.data_inicio) filters.vencimento = `>=${filtros.data_inicio}`;
  if (filtros?.data_fim) filters.vencimento = `<=${filtros.data_fim}`;

  const results = await db.select<ContaReceber & { valor: string }>(client, 'contas_a_receber', {
    filters,
    orderBy: { column: 'vencimento', ascending: true },
  });

  return results.map((r) => ({ ...r, valor: Number(r.valor) }));
}

export async function createContaPagar(
  env: Env,
  data: {
    descricao: string;
    valor: number;
    vencimento: string;
    forma_pagamento?: string | null;
    pedido_compra_id?: string | null;
    parcela_numero?: number | null;
  }
): Promise<ContaPagar> {
  const client = getDataClient(env);
  const results = await db.insert<ContaPagar & { valor: string }>(client, 'contas_a_pagar', {
    descricao: data.descricao,
    valor: data.valor,
    vencimento: data.vencimento,
    forma_pagamento: data.forma_pagamento ?? null,
    pedido_compra_id: data.pedido_compra_id ?? null,
    parcela_numero: data.parcela_numero ?? null,
    status: 'pendente',
  } as any);

  return { ...results[0], valor: Number(results[0].valor) };
}

export async function createContaReceber(
  env: Env,
  data: {
    descricao: string;
    valor: number;
    vencimento: string;
    forma_pagamento?: string | null;
    pedido_venda_id?: string | null;
    parcela_numero?: number | null;
  }
): Promise<ContaReceber> {
  const client = getDataClient(env);
  const results = await db.insert<ContaReceber & { valor: string }>(client, 'contas_a_receber', {
    descricao: data.descricao,
    valor: data.valor,
    vencimento: data.vencimento,
    forma_pagamento: data.forma_pagamento ?? null,
    pedido_venda_id: data.pedido_venda_id ?? null,
    parcela_numero: data.parcela_numero ?? null,
    status: 'pendente',
  } as any);

  return { ...results[0], valor: Number(results[0].valor) };
}

export async function marcarPago(env: Env, id: string): Promise<ContaPagar | null> {
  const client = getDataClient(env);
  const current = await db.findById<ContaPagar & { valor: string }>(client, 'contas_a_pagar', id);
  if (!current || current.status !== 'pendente') return null;

  const now = new Date().toISOString();
  const updated = await db.update<ContaPagar & { valor: string }>(
    client,
    'contas_a_pagar',
    id,
    {
      status: 'pago',
      pago_em: now,
    } as any
  );

  return updated ? { ...updated, valor: Number(updated.valor) } : null;
}

export async function marcarRecebido(env: Env, id: string): Promise<ContaReceber | null> {
  const client = getDataClient(env);
  const current = await db.findById<ContaReceber & { valor: string }>(client, 'contas_a_receber', id);
  if (!current || current.status !== 'pendente') return null;

  const now = new Date().toISOString();
  const updated = await db.update<ContaReceber & { valor: string }>(
    client,
    'contas_a_receber',
    id,
    {
      status: 'recebido',
      recebido_em: now,
    } as any
  );

  return updated ? { ...updated, valor: Number(updated.valor) } : null;
}

export async function resumoFinanceiro(
  env: Env,
  periodo: { data_inicio: string; data_fim: string }
): Promise<{
  total_a_pagar: number;
  total_a_receber: number;
  total_pago: number;
  total_recebido: number;
  pendente_pagar: number;
  pendente_receber: number;
}> {
  const client = getDataClient(env);

  // Buscar todas as contas no período e calcular totais
  const contasPagar = await db.select<ContaPagar & { valor: string }>(client, 'contas_a_pagar', {
    filters: {
      vencimento: `>=${periodo.data_inicio}`,
    },
  });
  const contasReceber = await db.select<ContaReceber & { valor: string }>(client, 'contas_a_receber', {
    filters: {
      vencimento: `>=${periodo.data_inicio}`,
    },
  });

  // Filtrar por período e status manualmente
  let total_a_pagar = 0;
  let total_a_receber = 0;
  let total_pago = 0;
  let total_recebido = 0;

  for (const cp of contasPagar) {
    const valor = Number(cp.valor);
    const vencimento = cp.vencimento;
    if (vencimento >= periodo.data_inicio && vencimento <= periodo.data_fim) {
      total_a_pagar += valor;
    }
    if (cp.status === 'pago' && cp.pago_em) {
      const pagoEm = cp.pago_em.split('T')[0];
      if (pagoEm >= periodo.data_inicio && pagoEm <= periodo.data_fim) {
        total_pago += valor;
      }
    }
  }

  for (const cr of contasReceber) {
    const valor = Number(cr.valor);
    const vencimento = cr.vencimento;
    if (vencimento >= periodo.data_inicio && vencimento <= periodo.data_fim) {
      total_a_receber += valor;
    }
    if (cr.status === 'recebido' && cr.recebido_em) {
      const recebidoEm = cr.recebido_em.split('T')[0];
      if (recebidoEm >= periodo.data_inicio && recebidoEm <= periodo.data_fim) {
        total_recebido += valor;
      }
    }
  }

  // Pendentes (todas, não filtradas por período)
  const pendentesPagar = await db.select<ContaPagar & { valor: string }>(client, 'contas_a_pagar', {
    filters: { status: 'pendente' },
  });
  const pendentesReceber = await db.select<ContaReceber & { valor: string }>(client, 'contas_a_receber', {
    filters: { status: 'pendente' },
  });

  const pendente_pagar = pendentesPagar.reduce((sum, cp) => sum + Number(cp.valor), 0);
  const pendente_receber = pendentesReceber.reduce((sum, cr) => sum + Number(cr.valor), 0);

  return {
    total_a_pagar,
    total_a_receber,
    total_pago,
    total_recebido,
    pendente_pagar,
    pendente_receber,
  };
}
