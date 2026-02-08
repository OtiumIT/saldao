/**
 * Repository de Vendas usando Supabase Data API (sem policies)
 * Substitui vendas.repository.ts quando usando Data API
 * 
 * NOTA: Sem transações explícitas - operações são feitas sequencialmente
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type {
  PedidoVenda,
  PedidoVendaComCliente,
  ItemPedidoVenda,
  ItemPedidoVendaComProduto,
  TipoEntrega,
  PrecoSugerido,
  ItemSugerido,
} from './vendas.repository.js';
import * as movimentacoesRepo from '../estoque/movimentacoes.repository.supabase.js';

export async function list(
  env: Env,
  filtros?: { status?: string; data_inicio?: string; data_fim?: string }
): Promise<PedidoVendaComCliente[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (filtros?.status) filters.status = filtros.status;
  if (filtros?.data_inicio) filters.data_pedido = `>=${filtros.data_inicio}`;
  if (filtros?.data_fim) filters.data_pedido = `<=${filtros.data_fim}`;

  const pedidos = await db.select<PedidoVenda>(client, 'pedidos_venda', {
    filters,
    orderBy: { column: 'data_pedido', ascending: false },
  });

  const clienteIds = [...new Set(pedidos.map((p) => p.cliente_id).filter((id): id is string => id !== null))];
  const clientes = clienteIds.length > 0
    ? await db.select<{ id: string; nome: string }>(client, 'clientes', {
        filters: { id: clienteIds },
      })
    : [];

  const clientesMap = new Map(clientes.map((c) => [c.id, c]));

  return pedidos.map((p) => ({
    ...p,
    cliente_nome: p.cliente_id ? clientesMap.get(p.cliente_id)?.nome ?? null : null,
  }));
}

export async function findById(env: Env, id: string): Promise<PedidoVendaComCliente | null> {
  const client = getDataClient(env);
  const pedido = await db.findById<PedidoVenda>(client, 'pedidos_venda', id);
  if (!pedido) return null;

  const cliente = pedido.cliente_id
    ? await db.findById<{ nome: string }>(client, 'clientes', pedido.cliente_id)
    : null;

  return {
    ...pedido,
    cliente_nome: cliente?.nome ?? null,
  };
}

export async function listItens(env: Env, pedidoId: string): Promise<ItemPedidoVendaComProduto[]> {
  const client = getDataClient(env);
  const itens = await db.select<ItemPedidoVenda & { quantidade: string; preco_unitario: string; total_item: string }>(
    client,
    'itens_pedido_venda',
    {
      filters: { pedido_venda_id: pedidoId },
      orderBy: { column: 'created_at', ascending: true },
    }
  );

  const produtoIds = [...new Set(itens.map((i) => i.produto_id))];
  const produtos = await db.select<{ id: string; codigo: string; descricao: string; tipo: string }>(client, 'produtos', {
    filters: { id: produtoIds },
  });

  const produtosMap = new Map(produtos.map((p) => [p.id, p]));

  return itens.map((i) => {
    const produto = produtosMap.get(i.produto_id);
    return {
      ...i,
      quantidade: Number(i.quantidade),
      preco_unitario: Number(i.preco_unitario),
      total_item: Number(i.total_item),
      produto_codigo: produto?.codigo,
      produto_descricao: produto?.descricao,
      produto_tipo: produto?.tipo,
    };
  });
}

export async function create(
  env: Env,
  data: {
    cliente_id?: string | null;
    data_pedido?: string;
    tipo_entrega: TipoEntrega;
    endereco_entrega?: string | null;
    observacoes?: string | null;
    previsao_entrega_em_dias?: number | null;
    distancia_km?: number | null;
    valor_frete?: number | null;
    itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
  }
): Promise<PedidoVenda> {
  const client = getDataClient(env);
  const produtoIds = [...new Set(data.itens.map((i) => i.produto_id))];
  if (produtoIds.length > 0) {
    const produtos = await db.select<{ id: string; tipo: string; codigo: string }>(client, 'produtos', {
      filters: { id: produtoIds },
    });
    const insumos = produtos.filter((p) => p.tipo === 'insumos');
    if (insumos.length > 0) {
      throw new Error(
        `Na venda só são permitidos produtos de revenda ou fabricação. Remova os insumos: ${insumos.map((p) => p.codigo).join(', ')}`
      );
    }
  }
  const dataPedido = data.data_pedido ?? new Date().toISOString().slice(0, 10);
  const valorFrete = data.valor_frete ?? 0;

  // Criar pedido
  const pedidoResult = await db.insert<PedidoVenda>(client, 'pedidos_venda', {
    cliente_id: data.cliente_id ?? null,
    data_pedido: dataPedido,
    tipo_entrega: data.tipo_entrega,
    endereco_entrega: data.endereco_entrega ?? null,
    observacoes: data.observacoes ?? null,
    total: 0,
    previsao_entrega_em_dias: data.previsao_entrega_em_dias ?? null,
    distancia_km: data.distancia_km ?? null,
    valor_frete: valorFrete,
    status: 'rascunho',
  } as any);

  const pedido = pedidoResult[0];
  if (!pedido) throw new Error('Falha ao criar pedido');

  // Criar itens e calcular total
  let totalItens = 0;
  for (const it of data.itens) {
    const totalItem = it.quantidade * it.preco_unitario;
    totalItens += totalItem;
    await db.insert<ItemPedidoVenda>(client, 'itens_pedido_venda', {
      pedido_venda_id: pedido.id,
      produto_id: it.produto_id,
      quantidade: it.quantidade,
      preco_unitario: it.preco_unitario,
      total_item: totalItem,
    } as any);
  }

  const total = totalItens + valorFrete;
  const updated = await db.update<PedidoVenda>(client, 'pedidos_venda', pedido.id, { total } as any);
  return updated!;
}

export async function update(
  env: Env,
  id: string,
  data: {
    cliente_id?: string | null;
    data_pedido?: string;
    tipo_entrega?: TipoEntrega;
    endereco_entrega?: string | null;
    observacoes?: string | null;
    previsao_entrega_em_dias?: number | null;
    distancia_km?: number | null;
    valor_frete?: number | null;
    itens?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
  }
): Promise<PedidoVenda | null> {
  const client = getDataClient(env);
  const current = await findById(env, id);
  if (!current || current.status !== 'rascunho') return null;

  const updateData: Partial<PedidoVenda> = {};
  if (data.cliente_id !== undefined) updateData.cliente_id = data.cliente_id;
  if (data.data_pedido !== undefined) updateData.data_pedido = data.data_pedido;
  if (data.tipo_entrega !== undefined) updateData.tipo_entrega = data.tipo_entrega;
  if (data.endereco_entrega !== undefined) updateData.endereco_entrega = data.endereco_entrega;
  if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
  if (data.previsao_entrega_em_dias !== undefined) updateData.previsao_entrega_em_dias = data.previsao_entrega_em_dias;
  if (data.distancia_km !== undefined) updateData.distancia_km = data.distancia_km;
  if (data.valor_frete !== undefined) updateData.valor_frete = data.valor_frete;

  if (Object.keys(updateData).length > 0) {
    await db.update<PedidoVenda>(client, 'pedidos_venda', id, updateData as any);
  }

  if (data.itens) {
    const produtoIds = [...new Set(data.itens.map((i) => i.produto_id))];
    if (produtoIds.length > 0) {
      const produtos = await db.select<{ id: string; tipo: string; codigo: string }>(client, 'produtos', {
        filters: { id: produtoIds },
      });
      const insumos = produtos.filter((p) => p.tipo === 'insumos');
      if (insumos.length > 0) {
        throw new Error(
          `Na venda só são permitidos produtos de revenda ou fabricação. Remova os insumos: ${insumos.map((p) => p.codigo).join(', ')}`
        );
      }
    }
    // Deletar itens antigos
    const itensAntigos = await db.select<ItemPedidoVenda>(client, 'itens_pedido_venda', {
      filters: { pedido_venda_id: id },
    });
    for (const item of itensAntigos) {
      await db.remove(client, 'itens_pedido_venda', item.id);
    }

    // Criar novos itens
    let totalItens = 0;
    const valorFrete = data.valor_frete !== undefined ? data.valor_frete : (current.valor_frete ?? 0);
    for (const it of data.itens) {
      const totalItem = it.quantidade * it.preco_unitario;
      totalItens += totalItem;
      await db.insert<ItemPedidoVenda>(client, 'itens_pedido_venda', {
        pedido_venda_id: id,
        produto_id: it.produto_id,
        quantidade: it.quantidade,
        preco_unitario: it.preco_unitario,
        total_item: totalItem,
      } as any);
    }
    await db.update<PedidoVenda>(client, 'pedidos_venda', id, { total: totalItens + (valorFrete ?? 0) } as any);
  }

  const updated = await findById(env, id);
  return updated;
}

export async function confirmar(
  env: Env,
  id: string,
  options?: { previsao_entrega_em_dias?: number | null }
): Promise<{ ok: boolean; error?: string }> {
  const client = getDataClient(env);
  const pedido = await findById(env, id);
  if (!pedido) return { ok: false, error: 'Pedido não encontrado' };
  if (pedido.status !== 'rascunho') return { ok: false, error: 'Pedido já confirmado ou cancelado' };

  const itens = await listItens(env, id);

  const itensInsumos = itens.filter((it) => it.produto_tipo === 'insumos');
  if (itensInsumos.length > 0) {
    return {
      ok: false,
      error: `Na venda só são permitidos produtos de revenda ou fabricação. Remova os insumos: ${itensInsumos.map((it) => it.produto_codigo ?? it.produto_id).join(', ')}`,
    };
  }

  let temSemEstoque = false;
  const itensSemEstoqueNaoFabricado: string[] = [];

  for (const it of itens) {
    const movimentacoes = await movimentacoesRepo.list(env, { produto_id: it.produto_id });
    const saldo = movimentacoes.reduce((sum, m) => sum + m.quantidade, 0);
    if (saldo < it.quantidade) {
      temSemEstoque = true;
      if (it.produto_tipo !== 'fabricado') {
        itensSemEstoqueNaoFabricado.push(it.produto_codigo ?? it.produto_id);
      }
    }
  }

  if (temSemEstoque && itensSemEstoqueNaoFabricado.length > 0) {
    return {
      ok: false,
      error: `Apenas produtos fabricados podem ser vendidos sem estoque. Ajuste as quantidades ou remova: ${itensSemEstoqueNaoFabricado.join(', ')}`,
    };
  }

  const previsao = options?.previsao_entrega_em_dias !== undefined ? options.previsao_entrega_em_dias : pedido.previsao_entrega_em_dias;
  if (temSemEstoque && (previsao == null || previsao < 1)) {
    return {
      ok: false,
      error: 'Há itens fabricados sem estoque. Informe a previsão de entrega em dias (ex.: 7) para confirmar a venda.',
    };
  }

  try {
    if (previsao != null && previsao >= 1) {
      await db.update<PedidoVenda>(client, 'pedidos_venda', id, { previsao_entrega_em_dias: previsao } as any);
    }

    for (const it of itens) {
      await movimentacoesRepo.create(env, {
        tipo: 'saida',
        produto_id: it.produto_id,
        quantidade: -it.quantidade,
        origem_tipo: 'venda',
        origem_id: id,
        observacao: `Venda ${id.slice(0, 8)}`,
      });
    }

    await db.update<PedidoVenda>(client, 'pedidos_venda', id, { status: 'confirmado' } as any);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao confirmar' };
  }
}

/** Cancelar pedido confirmado ou entregue: devolve os itens ao estoque e marca status cancelado. */
export async function cancelar(env: Env, id: string): Promise<{ ok: boolean; error?: string }> {
  const client = getDataClient(env);
  const pedido = await db.findById<PedidoVenda>(client, 'pedidos_venda', id);
  if (!pedido) return { ok: false, error: 'Pedido não encontrado' };
  if (pedido.status !== 'confirmado' && pedido.status !== 'entregue') {
    return { ok: false, error: 'Só é possível cancelar pedido confirmado ou entregue.' };
  }
  const itens = await listItens(env, id);
  try {
    for (const it of itens) {
      await movimentacoesRepo.create(env, {
        tipo: 'entrada',
        produto_id: it.produto_id,
        quantidade: it.quantidade,
        origem_tipo: 'cancelamento_venda',
        origem_id: id,
        observacao: `Cancelamento venda ${id.slice(0, 8)}`,
      });
    }
    await db.update<PedidoVenda>(client, 'pedidos_venda', id, { status: 'cancelado' } as any);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao cancelar' };
  }
}

export async function marcarEntregue(env: Env, id: string): Promise<PedidoVenda | null> {
  const client = getDataClient(env);
  const pedido = await db.findById<PedidoVenda>(client, 'pedidos_venda', id);
  if (!pedido || pedido.status !== 'confirmado') return null;

  const updated = await db.update<PedidoVenda>(client, 'pedidos_venda', id, { status: 'entregue' } as any);
  return updated;
}

export async function getPrecoSugerido(env: Env, produtoId: string): Promise<PrecoSugerido> {
  const client = getDataClient(env);
  // Buscar itens de pedidos confirmados/entregues
  const itens = await db.select<ItemPedidoVenda & { preco_unitario: string }>(client, 'itens_pedido_venda', {
    filters: { produto_id: produtoId },
  });

  const pedidoIds = [...new Set(itens.map((i) => i.pedido_venda_id))];
  const pedidos = await db.select<{ id: string; status: string; data_pedido: string }>(client, 'pedidos_venda', {
    filters: { id: pedidoIds, status: ['confirmado', 'entregue'] },
  });

  const pedidosValidosIds = new Set(pedidos.map((p) => p.id));
  const precosValidos = itens
    .filter((i) => pedidosValidosIds.has(i.pedido_venda_id))
    .map((i) => Number(i.preco_unitario))
    .sort((a, b) => a - b);

  if (precosValidos.length > 0) {
    const mediana = precosValidos[Math.floor(precosValidos.length / 2)];
    if (mediana > 0) return { preco_sugerido: mediana, origem: 'mediana' };
  }

  // Último preço
  if (precosValidos.length > 0) {
    return { preco_sugerido: precosValidos[precosValidos.length - 1], origem: 'ultimo_pedido' };
  }

  // Preço do cadastro
  const produto = await db.findById<{ preco_venda: number }>(client, 'produtos', produtoId);
  return { preco_sugerido: produto?.preco_venda ?? 0, origem: 'cadastro' };
}

export async function getItensSugeridos(env: Env, produtoId: string, limit = 5): Promise<ItemSugerido[]> {
  const client = getDataClient(env);
  // Buscar pedidos que contêm este produto
  const itensProduto = await db.select<{ pedido_venda_id: string }>(client, 'itens_pedido_venda', {
    filters: { produto_id: produtoId },
  });

  const pedidoIds = [...new Set(itensProduto.map((i) => i.pedido_venda_id))];
  const pedidosValidos = await db.select<{ id: string }>(client, 'pedidos_venda', {
    filters: { id: pedidoIds, status: ['confirmado', 'entregue'] },
  });

  const pedidosValidosIds = new Set(pedidosValidos.map((p) => p.id));
  const pedidosComProduto = itensProduto.filter((i) => pedidosValidosIds.has(i.pedido_venda_id)).map((i) => i.pedido_venda_id);

  // Buscar outros produtos nesses pedidos
  const outrosItens = await db.select<{ produto_id: string; pedido_venda_id: string }>(client, 'itens_pedido_venda', {
    filters: { pedido_venda_id: pedidosComProduto },
  });

  const outrosProdutos = outrosItens.filter((i) => i.produto_id !== produtoId);
  const contagem = new Map<string, number>();
  for (const item of outrosProdutos) {
    contagem.set(item.produto_id, (contagem.get(item.produto_id) || 0) + 1);
  }

  const produtoIds = Array.from(contagem.keys()).slice(0, limit);
  const produtos = await db.select<{ id: string; codigo: string; descricao: string; preco_venda: number }>(
    client,
    'produtos',
    {
      filters: { id: produtoIds },
    }
  );

  return produtos
    .map((p) => ({
      produto_id: p.id,
      codigo: p.codigo,
      descricao: p.descricao,
      preco_venda: p.preco_venda,
      vezes_junto: contagem.get(p.id) || 0,
    }))
    .sort((a, b) => b.vezes_junto - a.vezes_junto);
}
