/**
 * Repository de Movimentações de Estoque usando Supabase Data API (sem policies)
 * Substitui movimentacoes.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type { MovimentacaoEstoque, MovimentacaoComProduto, FiltrosMovimentacao } from './movimentacoes.repository.js';

export async function list(env: Env, filtros?: FiltrosMovimentacao): Promise<MovimentacaoComProduto[]> {
  const client = getDataClient(env);
  
  // Buscar movimentações
  const filters: Record<string, unknown> = {};
  if (filtros?.produto_id) filters.produto_id = filtros.produto_id;
  if (filtros?.tipo) filters.tipo = filtros.tipo;
  if (filtros?.data_inicio) filters.data = `>=${filtros.data_inicio}`;
  if (filtros?.data_fim) filters.data = `<=${filtros.data_fim}`;

  const movimentacoes = await db.select<MovimentacaoEstoque>(client, 'movimentacoes_estoque', {
    filters,
    orderBy: { column: 'data', ascending: false },
  });

  // Buscar produtos e cores relacionados
  const produtoIds = [...new Set(movimentacoes.map((m) => m.produto_id))];
  const produtos = await db.select<{ id: string; codigo: string; descricao: string }>(
    client,
    'produtos',
    {
      filters: { id: produtoIds },
    }
  );

  const corIds = [...new Set(movimentacoes.map((m) => m.cor_id).filter((id): id is string => id !== null))];
  const cores = corIds.length > 0
    ? await db.select<{ id: string; nome: string }>(client, 'cores', {
        filters: { id: corIds },
      })
    : [];

  const produtosMap = new Map(produtos.map((p) => [p.id, p]));
  const coresMap = new Map(cores.map((c) => [c.id, c]));

  return movimentacoes.map((m) => {
    const produto = produtosMap.get(m.produto_id);
    const cor = m.cor_id ? coresMap.get(m.cor_id) : null;
    return {
      ...m,
      produto_codigo: produto?.codigo,
      produto_descricao: produto?.descricao,
      cor_nome: cor?.nome ?? null,
    };
  });
}

export async function create(
  env: Env,
  data: {
    data?: string;
    tipo: string;
    produto_id: string;
    quantidade: number;
    cor_id?: string | null;
    origem_tipo?: string | null;
    origem_id?: string | null;
    observacao?: string | null;
  }
): Promise<MovimentacaoEstoque> {
  const client = getDataClient(env);
  const dataStr = data.data ?? new Date().toISOString().slice(0, 10);
  
  const results = await db.insert<MovimentacaoEstoque>(client, 'movimentacoes_estoque', {
    data: dataStr,
    tipo: data.tipo,
    produto_id: data.produto_id,
    quantidade: data.quantidade,
    cor_id: data.cor_id ?? null,
    origem_tipo: data.origem_tipo ?? null,
    origem_id: data.origem_id ?? null,
    observacao: data.observacao ?? null,
  } as any);

  return results[0];
}

export async function ajuste(
  env: Env,
  produto_id: string,
  quantidade: number,
  observacao?: string,
  cor_id?: string | null
): Promise<MovimentacaoEstoque> {
  return create(env, {
    tipo: 'ajuste',
    produto_id,
    quantidade,
    observacao: observacao ?? 'Ajuste manual',
    cor_id: cor_id ?? null,
  });
}

export async function conferenciaLote(
  env: Env,
  itens: Array<{ produto_id: string; saldo_atual: number }>
): Promise<{ processados: number; erros: string[] }> {
  const client = getDataClient(env);
  const erros: string[] = [];
  let processados = 0;

  for (const item of itens) {
    // Calcular saldo atual somando todas as movimentações do produto
    const movimentacoes = await db.select<MovimentacaoEstoque>(
      client,
      'movimentacoes_estoque',
      {
        filters: { produto_id: item.produto_id },
      }
    );

    const saldoAtual = movimentacoes.reduce((sum, m) => sum + m.quantidade, 0);
    const diff = item.saldo_atual - saldoAtual;

    if (Math.abs(diff) < 1e-6) continue;

    try {
      await create(env, {
        tipo: 'ajuste',
        produto_id: item.produto_id,
        quantidade: diff,
        observacao: `Conferência: era ${saldoAtual}, ajustado para ${item.saldo_atual}`,
      });
      processados++;
    } catch (e) {
      erros.push(`${item.produto_id}: ${e instanceof Error ? e.message : 'Erro'}`);
    }
  }

  return { processados, erros };
}
