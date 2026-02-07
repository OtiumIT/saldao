import { getPool } from '../../db/client.js';

export type StatusPedidoCompra = 'em_aberto' | 'recebido_parcial' | 'recebido';

export interface ItemPedidoCompra {
  id: string;
  pedido_compra_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  total_item: number;
  quantidade_recebida: number;
  created_at: string;
}

export type TipoPedidoCompra = 'pedido' | 'recepcao';

export interface PedidoCompra {
  id: string;
  fornecedor_id: string;
  data_pedido: string;
  status: StatusPedidoCompra;
  tipo: TipoPedidoCompra;
  data_prevista_entrega: string | null;
  observacoes: string | null;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface PedidoCompraComFornecedor extends PedidoCompra {
  fornecedor_nome?: string;
}

export interface ItemPedidoCompraComProduto extends ItemPedidoCompra {
  produto_codigo?: string;
  produto_descricao?: string;
}

export async function list(): Promise<PedidoCompraComFornecedor[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<PedidoCompraComFornecedor & { data_prevista_entrega: string | null }>(
    `SELECT p.id, p.fornecedor_id, p.data_pedido::text, p.status, p.tipo, p.data_prevista_entrega::text, p.observacoes, p.total, p.created_at, p.updated_at,
      f.nome AS fornecedor_nome
     FROM pedidos_compra p
     JOIN fornecedores f ON f.id = p.fornecedor_id
     ORDER BY p.data_pedido DESC, p.created_at DESC`
  );
  return rows.map((r) => ({ ...r, data_prevista_entrega: r.data_prevista_entrega ?? null }));
}

export async function findById(id: string): Promise<PedidoCompraComFornecedor | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<PedidoCompraComFornecedor & { data_prevista_entrega: string | null }>(
    `SELECT p.id, p.fornecedor_id, p.data_pedido::text, p.status, p.tipo, p.data_prevista_entrega::text, p.observacoes, p.total, p.created_at, p.updated_at,
      f.nome AS fornecedor_nome
     FROM pedidos_compra p
     JOIN fornecedores f ON f.id = p.fornecedor_id
     WHERE p.id = $1`,
    [id]
  );
  const row = rows[0];
  return row ? { ...row, data_prevista_entrega: row.data_prevista_entrega ?? null } : null;
}

export async function listItens(pedidoId: string): Promise<ItemPedidoCompraComProduto[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<ItemPedidoCompraComProduto & { total_item: string; preco_unitario: string; quantidade: string; quantidade_recebida: string }>(
    `SELECT i.id, i.pedido_compra_id, i.produto_id, i.quantidade::numeric, i.preco_unitario::numeric, i.total_item::numeric, i.quantidade_recebida::numeric, i.created_at,
      pr.codigo AS produto_codigo, pr.descricao AS produto_descricao
     FROM itens_pedido_compra i
     JOIN produtos pr ON pr.id = i.produto_id
     WHERE i.pedido_compra_id = $1
     ORDER BY i.created_at`,
    [pedidoId]
  );
  return rows.map((r) => ({
    ...r,
    quantidade: Number(r.quantidade),
    preco_unitario: Number(r.preco_unitario),
    total_item: Number(r.total_item),
    quantidade_recebida: Number(r.quantidade_recebida),
  }));
}

export async function createPedido(data: {
  fornecedor_id: string;
  data_pedido?: string;
  observacoes?: string | null;
  tipo?: TipoPedidoCompra;
  data_prevista_entrega?: string | null;
  itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
}): Promise<PedidoCompra> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const dataPedido = data.data_pedido ?? new Date().toISOString().slice(0, 10);
  const tipo = data.tipo ?? 'pedido';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: pedRows } = await client.query<PedidoCompra & { data_prevista_entrega: string | null }>(
      `INSERT INTO pedidos_compra (fornecedor_id, data_pedido, observacoes, total, tipo, data_prevista_entrega)
       VALUES ($1, $2, $3, 0, $4, $5)
       RETURNING id, fornecedor_id, data_pedido::text, status, tipo, data_prevista_entrega::text, observacoes, total, created_at, updated_at`,
      [data.fornecedor_id, dataPedido, data.observacoes ?? null, tipo, data.data_prevista_entrega ?? null]
    );
    const pedido = pedRows[0];
    if (!pedido) throw new Error('Falha ao criar pedido');
    let total = 0;
    const itemIds: { id: string; produto_id: string; quantidade: number }[] = [];
    for (const it of data.itens) {
      const totalItem = it.quantidade * it.preco_unitario;
      total += totalItem;
      const { rows: itemRows } = await client.query<{ id: string }>(
        `INSERT INTO itens_pedido_compra (pedido_compra_id, produto_id, quantidade, preco_unitario, total_item)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [pedido.id, it.produto_id, it.quantidade, it.preco_unitario, totalItem]
      );
      if (itemRows[0]) itemIds.push({ id: itemRows[0].id, produto_id: it.produto_id, quantidade: it.quantidade });
    }
    await client.query('UPDATE pedidos_compra SET total = $2, updated_at = NOW() WHERE id = $1', [pedido.id, total]);

    if (tipo === 'recepcao') {
      for (const it of itemIds) {
        await client.query(
          'UPDATE itens_pedido_compra SET quantidade_recebida = $2 WHERE id = $1',
          [it.id, it.quantidade]
        );
        await client.query(
          `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, origem_tipo, origem_id, observacao)
           VALUES (CURRENT_DATE, 'entrada', $1, $2, 'compra', $3, $4)`,
          [it.produto_id, it.quantidade, pedido.id, `Recepção direta ${pedido.id.slice(0, 8)}`]
        );
      }
      await client.query("UPDATE pedidos_compra SET status = 'recebido', updated_at = NOW() WHERE id = $1", [pedido.id]);
    }

    await client.query('COMMIT');
    const dataPrevista = pedido.data_prevista_entrega ?? null;
    return { ...pedido, total, data_prevista_entrega: dataPrevista };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function updatePedido(
  id: string,
  data: {
    fornecedor_id?: string;
    data_pedido?: string;
    observacoes?: string | null;
    data_prevista_entrega?: string | null;
    itens?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
  }
): Promise<PedidoCompra | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const current = await findById(id);
  if (!current || current.status !== 'em_aberto') return null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE pedidos_compra SET fornecedor_id = COALESCE($2, fornecedor_id), data_pedido = COALESCE($3, data_pedido), observacoes = COALESCE($4, observacoes), data_prevista_entrega = COALESCE($5, data_prevista_entrega), updated_at = NOW() WHERE id = $1`,
      [id, data.fornecedor_id ?? null, data.data_pedido ?? null, data.observacoes ?? null, data.data_prevista_entrega !== undefined ? data.data_prevista_entrega : current.data_prevista_entrega]
    );
    if (data.itens) {
      await client.query('DELETE FROM itens_pedido_compra WHERE pedido_compra_id = $1', [id]);
      let total = 0;
      for (const it of data.itens) {
        const totalItem = it.quantidade * it.preco_unitario;
        total += totalItem;
        await client.query(
          `INSERT INTO itens_pedido_compra (pedido_compra_id, produto_id, quantidade, preco_unitario, total_item)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, it.produto_id, it.quantidade, it.preco_unitario, totalItem]
        );
      }
      await client.query('UPDATE pedidos_compra SET total = $2, updated_at = NOW() WHERE id = $1', [id, total]);
    }
    await client.query('COMMIT');
    const updated = await findById(id);
    return updated;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** Último preço de compra por produto para um fornecedor (para preencher pedido) */
export async function getUltimosPrecos(fornecedorId: string): Promise<Record<string, number>> {
  const pool = getPool();
  if (!pool) return {};
  const { rows } = await pool.query<{ produto_id: string; preco_unitario: string }>(
    `SELECT DISTINCT ON (i.produto_id) i.produto_id, i.preco_unitario::numeric AS preco_unitario
     FROM itens_pedido_compra i
     JOIN pedidos_compra p ON p.id = i.pedido_compra_id
     WHERE p.fornecedor_id = $1
     ORDER BY i.produto_id, p.data_pedido DESC, i.created_at DESC`,
    [fornecedorId]
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.produto_id] = Number(r.preco_unitario);
  return out;
}

/** Recebimento: atualiza quantidade_recebida, gera movimentações de entrada e atualiza status. */
export async function receber(
  id: string,
  itens: Array<{ item_id: string; quantidade_recebida: number }>
): Promise<{ ok: boolean; error?: string }> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const pedido = await findById(id);
  if (!pedido) return { ok: false, error: 'Pedido não encontrado' };
  if (pedido.tipo === 'recepcao') return { ok: false, error: 'Recepção direta já foi dada entrada ao criar' };
  if (pedido.status === 'recebido') return { ok: false, error: 'Pedido já totalmente recebido' };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: itensRows } = await client.query<{ id: string; produto_id: string; quantidade: string; quantidade_recebida: string }>(
      'SELECT id, produto_id, quantidade::text, quantidade_recebida::text FROM itens_pedido_compra WHERE pedido_compra_id = $1',
      [id]
    );
    const byItemId = new Map(itensRows.map((r) => [r.id, r]));
    let allReceived = true;
    for (const rec of itens) {
      const item = byItemId.get(rec.item_id);
      if (!item) continue;
      const qtd = Number(item.quantidade);
      const jaRecebido = Number(item.quantidade_recebida);
      const novaQtdRecebida = Math.min(Math.max(0, rec.quantidade_recebida), qtd);
      const delta = novaQtdRecebida - jaRecebido;
      if (delta <= 0) continue;
      await client.query(
        'UPDATE itens_pedido_compra SET quantidade_recebida = $2 WHERE id = $1',
        [rec.item_id, novaQtdRecebida]
      );
      await client.query(
        `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, origem_tipo, origem_id, observacao)
         VALUES (CURRENT_DATE, 'entrada', $1, $2, 'compra', $3, $4)`,
        [item.produto_id, delta, id, `Recebimento pedido compra ${id.slice(0, 8)}`]
      );
      if (novaQtdRecebida < qtd) allReceived = false;
    }
    const newStatus = allReceived ? 'recebido' : 'recebido_parcial';
    await client.query('UPDATE pedidos_compra SET status = $2, updated_at = NOW() WHERE id = $1', [id, newStatus]);
    await client.query('COMMIT');
    return { ok: true };
  } catch (e) {
    await client.query('ROLLBACK');
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao receber' };
  } finally {
    client.release();
  }
}
