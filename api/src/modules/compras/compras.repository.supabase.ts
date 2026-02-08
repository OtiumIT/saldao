/**
 * Repository de Compras usando Supabase Data API (sem policies)
 * Substitui compras.repository.ts quando usando Data API
 * 
 * NOTA: Sem transações explícitas - operações são feitas sequencialmente
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type {
  PedidoCompra,
  PedidoCompraComFornecedor,
  ItemPedidoCompra,
  ItemPedidoCompraComProduto,
  TipoPedidoCompra,
} from './compras.repository.js';
import * as movimentacoesRepo from '../estoque/movimentacoes.repository.supabase.js';

export async function list(env: Env): Promise<PedidoCompraComFornecedor[]> {
  const client = getDataClient(env);
  const pedidos = await db.select<PedidoCompra>(client, 'pedidos_compra', {
    orderBy: { column: 'data_pedido', ascending: false },
  });

  const fornecedorIds = [...new Set(pedidos.map((p) => p.fornecedor_id))];
  const fornecedores = await db.select<{ id: string; nome: string }>(client, 'fornecedores', {
    filters: { id: fornecedorIds },
  });

  const fornecedoresMap = new Map(fornecedores.map((f) => [f.id, f]));

  return pedidos.map((p) => ({
    ...p,
    fornecedor_nome: fornecedoresMap.get(p.fornecedor_id)?.nome,
  }));
}

export async function findById(env: Env, id: string): Promise<PedidoCompraComFornecedor | null> {
  const client = getDataClient(env);
  const pedido = await db.findById<PedidoCompra>(client, 'pedidos_compra', id);
  if (!pedido) return null;

  const fornecedor = await db.findById<{ nome: string }>(client, 'fornecedores', pedido.fornecedor_id);
  return {
    ...pedido,
    fornecedor_nome: fornecedor?.nome,
  };
}

export async function listItens(env: Env, pedidoId: string): Promise<ItemPedidoCompraComProduto[]> {
  const client = getDataClient(env);
  const itens = await db.select<ItemPedidoCompra & { quantidade: string; preco_unitario: string; total_item: string; quantidade_recebida: string }>(
    client,
    'itens_pedido_compra',
    {
      filters: { pedido_compra_id: pedidoId },
      orderBy: { column: 'created_at', ascending: true },
    }
  );

  const produtoIds = [...new Set(itens.map((i) => i.produto_id))];
  const produtos = await db.select<{ id: string; codigo: string; descricao: string }>(client, 'produtos', {
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
      quantidade_recebida: Number(i.quantidade_recebida),
      produto_codigo: produto?.codigo,
      produto_descricao: produto?.descricao,
    };
  });
}

export async function createPedido(
  env: Env,
  data: {
    fornecedor_id: string;
    data_pedido?: string;
    observacoes?: string | null;
    tipo?: TipoPedidoCompra;
    data_prevista_entrega?: string | null;
    itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
  }
): Promise<PedidoCompra> {
  const client = getDataClient(env);
  const dataPedido = data.data_pedido ?? new Date().toISOString().slice(0, 10);
  const tipo = data.tipo ?? 'pedido';

  // Criar pedido
  const pedidoResult = await db.insert<PedidoCompra>(client, 'pedidos_compra', {
    fornecedor_id: data.fornecedor_id,
    data_pedido: dataPedido,
    observacoes: data.observacoes ?? null,
    total: 0,
    tipo,
    data_prevista_entrega: data.data_prevista_entrega ?? null,
    status: 'em_aberto',
  } as any);

  const pedido = pedidoResult[0];
  if (!pedido) throw new Error('Falha ao criar pedido');

  // Criar itens e calcular total
  let total = 0;
  const itemIds: { id: string; produto_id: string; quantidade: number }[] = [];

  for (const it of data.itens) {
    const totalItem = it.quantidade * it.preco_unitario;
    total += totalItem;
    const itemResult = await db.insert<ItemPedidoCompra>(client, 'itens_pedido_compra', {
      pedido_compra_id: pedido.id,
      produto_id: it.produto_id,
      quantidade: it.quantidade,
      preco_unitario: it.preco_unitario,
      total_item: totalItem,
      quantidade_recebida: 0,
    } as any);
    if (itemResult[0]) {
      itemIds.push({ id: itemResult[0].id, produto_id: it.produto_id, quantidade: it.quantidade });
    }
  }

  // Atualizar total do pedido
  await db.update<PedidoCompra>(client, 'pedidos_compra', pedido.id, { total } as any);

  // Se for recepção direta, processar recebimento
  if (tipo === 'recepcao') {
    for (const it of itemIds) {
      await db.update<ItemPedidoCompra>(client, 'itens_pedido_compra', it.id, {
        quantidade_recebida: it.quantidade,
      } as any);

      await movimentacoesRepo.create(env, {
        tipo: 'entrada',
        produto_id: it.produto_id,
        quantidade: it.quantidade,
        origem_tipo: 'compra',
        origem_id: pedido.id,
        observacao: `Recepção direta ${pedido.id.slice(0, 8)}`,
      });
    }
    await db.update<PedidoCompra>(client, 'pedidos_compra', pedido.id, { status: 'recebido' } as any);
  }

  const updated = await db.findById<PedidoCompra>(client, 'pedidos_compra', pedido.id);
  return updated!;
}

export async function updatePedido(
  env: Env,
  id: string,
  data: {
    fornecedor_id?: string;
    data_pedido?: string;
    observacoes?: string | null;
    data_prevista_entrega?: string | null;
    itens?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
  }
): Promise<PedidoCompra | null> {
  const client = getDataClient(env);
  const current = await findById(env, id);
  if (!current || current.status !== 'em_aberto') return null;

  const updateData: Partial<PedidoCompra> = {};
  if (data.fornecedor_id !== undefined) updateData.fornecedor_id = data.fornecedor_id;
  if (data.data_pedido !== undefined) updateData.data_pedido = data.data_pedido;
  if (data.observacoes !== undefined) updateData.observacoes = data.observacoes ?? null;
  if (data.data_prevista_entrega !== undefined) {
    updateData.data_prevista_entrega = data.data_prevista_entrega ?? null;
  }

  if (Object.keys(updateData).length > 0) {
    await db.update<PedidoCompra>(client, 'pedidos_compra', id, updateData as any);
  }

  if (data.itens) {
    // Deletar itens antigos
    const itensAntigos = await db.select<ItemPedidoCompra>(client, 'itens_pedido_compra', {
      filters: { pedido_compra_id: id },
    });
    for (const item of itensAntigos) {
      await db.remove(client, 'itens_pedido_compra', item.id);
    }

    // Criar novos itens
    let total = 0;
    for (const it of data.itens) {
      const totalItem = it.quantidade * it.preco_unitario;
      total += totalItem;
      await db.insert<ItemPedidoCompra>(client, 'itens_pedido_compra', {
        pedido_compra_id: id,
        produto_id: it.produto_id,
        quantidade: it.quantidade,
        preco_unitario: it.preco_unitario,
        total_item: totalItem,
        quantidade_recebida: 0,
      } as any);
    }
    await db.update<PedidoCompra>(client, 'pedidos_compra', id, { total } as any);
  }

  const updated = await findById(env, id);
  return updated;
}

export async function getUltimosPrecos(env: Env, fornecedorId: string): Promise<Record<string, number>> {
  const client = getDataClient(env);
  // Buscar pedidos do fornecedor ordenados por data
  const pedidos = await db.select<{ id: string; data_pedido: string }>(client, 'pedidos_compra', {
    filters: { fornecedor_id: fornecedorId },
    orderBy: { column: 'data_pedido', ascending: false },
  });

  const pedidoIds = pedidos.map((p) => p.id);
  const itens = await db.select<ItemPedidoCompra & { preco_unitario: string }>(
    client,
    'itens_pedido_compra',
    {
      filters: { pedido_compra_id: pedidoIds },
    }
  );

  // Agrupar por produto e pegar o último preço
  const precos: Record<string, number> = {};
  const produtosProcessados = new Set<string>();

  for (const pedido of pedidos) {
    const itensPedido = itens.filter((i) => i.pedido_compra_id === pedido.id);
    for (const item of itensPedido) {
      if (!produtosProcessados.has(item.produto_id)) {
        precos[item.produto_id] = Number(item.preco_unitario);
        produtosProcessados.add(item.produto_id);
      }
    }
  }

  return precos;
}

export async function receber(
  env: Env,
  id: string,
  itens: Array<{ item_id: string; quantidade_recebida: number }>
): Promise<{ ok: boolean; error?: string }> {
  const client = getDataClient(env);
  const pedido = await findById(env, id);
  if (!pedido) return { ok: false, error: 'Pedido não encontrado' };
  if (pedido.tipo === 'recepcao') return { ok: false, error: 'Recepção direta já foi dada entrada ao criar' };
  if (pedido.status === 'recebido') return { ok: false, error: 'Pedido já totalmente recebido' };

  const itensPedido = await db.select<ItemPedidoCompra & { quantidade: string; quantidade_recebida: string }>(
    client,
    'itens_pedido_compra',
    {
      filters: { pedido_compra_id: id },
    }
  );

  const byItemId = new Map(itensPedido.map((r) => [r.id, r]));
  let allReceived = true;

  for (const rec of itens) {
    const item = byItemId.get(rec.item_id);
    if (!item) continue;
    const qtd = Number(item.quantidade);
    const jaRecebido = Number(item.quantidade_recebida);
    const novaQtdRecebida = Math.min(Math.max(0, rec.quantidade_recebida), qtd);
    const delta = novaQtdRecebida - jaRecebido;
    if (delta <= 0) continue;

    await db.update<ItemPedidoCompra>(client, 'itens_pedido_compra', rec.item_id, {
      quantidade_recebida: novaQtdRecebida,
    } as any);

    await movimentacoesRepo.create(env, {
      tipo: 'entrada',
      produto_id: item.produto_id,
      quantidade: delta,
      origem_tipo: 'compra',
      origem_id: id,
      observacao: `Recebimento pedido compra ${id.slice(0, 8)}`,
    });

    if (novaQtdRecebida < qtd) allReceived = false;
  }

  const newStatus = allReceived ? 'recebido' : 'recebido_parcial';
  await db.update<PedidoCompra>(client, 'pedidos_compra', id, { status: newStatus } as any);

  return { ok: true };
}
