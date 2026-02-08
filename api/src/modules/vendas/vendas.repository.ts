import { getPool } from '../../db/client.js';

export type TipoEntrega = 'retirada' | 'entrega';
export type StatusPedidoVenda = 'rascunho' | 'confirmado' | 'entregue' | 'cancelado';

export interface ItemPedidoVenda {
  id: string;
  pedido_venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  total_item: number;
  created_at: string;
}

export interface PedidoVenda {
  id: string;
  cliente_id: string | null;
  data_pedido: string;
  tipo_entrega: TipoEntrega;
  status: StatusPedidoVenda;
  endereco_entrega: string | null;
  observacoes: string | null;
  total: number;
  /** Promessa de entrega em X dias quando há item sem estoque */
  previsao_entrega_em_dias: number | null;
  /** Distância em km para cálculo do frete (entrega) */
  distancia_km: number | null;
  /** Valor do frete (total = itens + valor_frete) */
  valor_frete: number | null;
  created_at: string;
  updated_at: string;
}

export interface PedidoVendaComCliente extends PedidoVenda {
  cliente_nome?: string | null;
}

export interface ItemPedidoVendaComProduto extends ItemPedidoVenda {
  produto_codigo?: string;
  produto_descricao?: string;
  produto_tipo?: string;
}

export async function list(filtros?: { status?: string; data_inicio?: string; data_fim?: string }): Promise<PedidoVendaComCliente[]> {
  const pool = getPool();
  if (!pool) return [];
  let sql = `SELECT p.id, p.cliente_id, p.data_pedido::text, p.tipo_entrega, p.status, p.endereco_entrega, p.observacoes, p.total, p.previsao_entrega_em_dias, p.distancia_km::numeric, p.valor_frete::numeric, p.created_at, p.updated_at,
    c.nome AS cliente_nome FROM pedidos_venda p LEFT JOIN clientes c ON c.id = p.cliente_id WHERE 1=1`;
  const params: unknown[] = [];
  let i = 1;
  if (filtros?.status) { sql += ` AND p.status = $${i++}`; params.push(filtros.status); }
  if (filtros?.data_inicio) { sql += ` AND p.data_pedido >= $${i++}`; params.push(filtros.data_inicio); }
  if (filtros?.data_fim) { sql += ` AND p.data_pedido <= $${i++}`; params.push(filtros.data_fim); }
  sql += ' ORDER BY p.data_pedido DESC, p.created_at DESC';
  const { rows } = await pool.query<PedidoVendaComCliente>(sql, params);
  return rows;
}

export async function findById(id: string): Promise<PedidoVendaComCliente | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<PedidoVendaComCliente>(
    `SELECT p.id, p.cliente_id, p.data_pedido::text, p.tipo_entrega, p.status, p.endereco_entrega, p.observacoes, p.total, p.previsao_entrega_em_dias, p.distancia_km::numeric, p.valor_frete::numeric, p.created_at, p.updated_at,
     c.nome AS cliente_nome FROM pedidos_venda p LEFT JOIN clientes c ON c.id = p.cliente_id WHERE p.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listItens(pedidoId: string): Promise<ItemPedidoVendaComProduto[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<ItemPedidoVendaComProduto & { total_item: string; preco_unitario: string; quantidade: string }>(
    `SELECT i.id, i.pedido_venda_id, i.produto_id, i.quantidade::numeric, i.preco_unitario::numeric, i.total_item::numeric, i.created_at,
     pr.codigo AS produto_codigo, pr.descricao AS produto_descricao, pr.tipo AS produto_tipo
     FROM itens_pedido_venda i JOIN produtos pr ON pr.id = i.produto_id WHERE i.pedido_venda_id = $1 ORDER BY i.created_at`,
    [pedidoId]
  );
  return rows.map((r) => ({ ...r, quantidade: Number(r.quantidade), preco_unitario: Number(r.preco_unitario), total_item: Number(r.total_item) }));
}

export async function create(data: {
  cliente_id?: string | null;
  data_pedido?: string;
  tipo_entrega: TipoEntrega;
  endereco_entrega?: string | null;
  observacoes?: string | null;
  previsao_entrega_em_dias?: number | null;
  distancia_km?: number | null;
  valor_frete?: number | null;
  itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
}): Promise<PedidoVenda> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const dataPedido = data.data_pedido ?? new Date().toISOString().slice(0, 10);
  const valorFrete = data.valor_frete ?? 0;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: pedRows } = await client.query<PedidoVenda>(
      `INSERT INTO pedidos_venda (cliente_id, data_pedido, tipo_entrega, endereco_entrega, observacoes, total, previsao_entrega_em_dias, distancia_km, valor_frete)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7, $8) RETURNING id, cliente_id, data_pedido::text, tipo_entrega, status, endereco_entrega, observacoes, total, previsao_entrega_em_dias, distancia_km::numeric, valor_frete::numeric, created_at, updated_at`,
      [data.cliente_id ?? null, dataPedido, data.tipo_entrega, data.endereco_entrega ?? null, data.observacoes ?? null, data.previsao_entrega_em_dias ?? null, data.distancia_km ?? null, valorFrete]
    );
    const pedido = pedRows[0];
    if (!pedido) throw new Error('Falha ao criar pedido');
    let totalItens = 0;
    for (const it of data.itens) {
      const totalItem = it.quantidade * it.preco_unitario;
      totalItens += totalItem;
      await client.query(
        `INSERT INTO itens_pedido_venda (pedido_venda_id, produto_id, quantidade, preco_unitario, total_item)
         VALUES ($1, $2, $3, $4, $5)`,
        [pedido.id, it.produto_id, it.quantidade, it.preco_unitario, totalItem]
      );
    }
    const total = totalItens + valorFrete;
    await client.query('UPDATE pedidos_venda SET total = $2, updated_at = NOW() WHERE id = $1', [pedido.id, total]);
    await client.query('COMMIT');
    return { ...pedido, total };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function update(id: string, data: {
  cliente_id?: string | null;
  data_pedido?: string;
  tipo_entrega?: TipoEntrega;
  endereco_entrega?: string | null;
  observacoes?: string | null;
  previsao_entrega_em_dias?: number | null;
  distancia_km?: number | null;
  valor_frete?: number | null;
  itens?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }>;
}): Promise<PedidoVenda | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const current = await findById(id);
  if (!current || current.status !== 'rascunho') return null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const previsao = data.previsao_entrega_em_dias !== undefined ? data.previsao_entrega_em_dias : current.previsao_entrega_em_dias;
    const distanciaKm = data.distancia_km !== undefined ? data.distancia_km : current.distancia_km;
    const valorFrete = data.valor_frete !== undefined ? data.valor_frete : (current.valor_frete ?? 0);
    await client.query(
      `UPDATE pedidos_venda SET cliente_id = COALESCE($2, cliente_id), data_pedido = COALESCE($3, data_pedido), tipo_entrega = COALESCE($4, tipo_entrega),
       endereco_entrega = COALESCE($5, endereco_entrega), observacoes = COALESCE($6, observacoes), previsao_entrega_em_dias = $7, distancia_km = $8, valor_frete = $9, updated_at = NOW() WHERE id = $1`,
      [id, data.cliente_id ?? null, data.data_pedido ?? null, data.tipo_entrega ?? null, data.endereco_entrega ?? null, data.observacoes ?? null, previsao, distanciaKm ?? null, valorFrete]
    );
    if (data.itens) {
      await client.query('DELETE FROM itens_pedido_venda WHERE pedido_venda_id = $1', [id]);
      let totalItens = 0;
      for (const it of data.itens) {
        const totalItem = it.quantidade * it.preco_unitario;
        totalItens += totalItem;
        await client.query(
          `INSERT INTO itens_pedido_venda (pedido_venda_id, produto_id, quantidade, preco_unitario, total_item)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, it.produto_id, it.quantidade, it.preco_unitario, totalItem]
        );
      }
      const total = totalItens + (valorFrete ?? 0);
      await client.query('UPDATE pedidos_venda SET total = $2, updated_at = NOW() WHERE id = $1', [id, total]);
    } else {
      const { rows: sumRows } = await client.query<{ sum: string }>('SELECT COALESCE(SUM(total_item), 0) AS sum FROM itens_pedido_venda WHERE pedido_venda_id = $1', [id]);
      const totalItens = Number(sumRows[0]?.sum ?? 0);
      await client.query('UPDATE pedidos_venda SET total = $2, updated_at = NOW() WHERE id = $1', [id, totalItens + (valorFrete ?? 0)]);
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

/** Confirmar pedido: baixa estoque (movimentações saida, origem venda). Quando há item sem estoque, só permite se for fabricado e exige previsao_entrega_em_dias. */
export async function confirmar(id: string, options?: { previsao_entrega_em_dias?: number | null }): Promise<{ ok: boolean; error?: string }> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const pedido = await findById(id);
  if (!pedido) return { ok: false, error: 'Pedido não encontrado' };
  if (pedido.status !== 'rascunho') return { ok: false, error: 'Pedido já confirmado ou cancelado' };
  const itens = await listItens(id);
  const client = await pool.connect();
  try {
    let temSemEstoque = false;
    const itensSemEstoqueNaoFabricado: string[] = [];
    for (const it of itens) {
      const { rows } = await client.query<{ quantidade: string }>(
        'SELECT COALESCE(SUM(quantidade), 0) AS quantidade FROM movimentacoes_estoque WHERE produto_id = $1',
        [it.produto_id]
      );
      const saldo = Number(rows[0]?.quantidade ?? 0);
      if (saldo < it.quantidade) {
        temSemEstoque = true;
        if (it.produto_tipo !== 'fabricado') {
          itensSemEstoqueNaoFabricado.push(it.produto_codigo ?? it.produto_id);
        }
      }
    }
    if (temSemEstoque && itensSemEstoqueNaoFabricado.length > 0) {
      return { ok: false, error: `Apenas produtos fabricados podem ser vendidos sem estoque. Ajuste as quantidades ou remova: ${itensSemEstoqueNaoFabricado.join(', ')}` };
    }
    const previsao = options?.previsao_entrega_em_dias !== undefined ? options.previsao_entrega_em_dias : pedido.previsao_entrega_em_dias;
    if (temSemEstoque && (previsao == null || previsao < 1)) {
      return { ok: false, error: 'Há itens fabricados sem estoque. Informe a previsão de entrega em dias (ex.: 7) para confirmar a venda.' };
    }
    await client.query('BEGIN');
    if (previsao != null && previsao >= 1) {
      await client.query('UPDATE pedidos_venda SET previsao_entrega_em_dias = $2, updated_at = NOW() WHERE id = $1', [id, previsao]);
    }
    for (const it of itens) {
      await client.query(
        `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, origem_tipo, origem_id, observacao)
         VALUES (CURRENT_DATE, 'saida', $1, $2, 'venda', $3, $4)`,
        [it.produto_id, -it.quantidade, id, `Venda ${id.slice(0, 8)}`]
      );
    }
    await client.query('UPDATE pedidos_venda SET status = $2, updated_at = NOW() WHERE id = $1', [id, 'confirmado']);
    await client.query('COMMIT');
    return { ok: true };
  } catch (e) {
    await client.query('ROLLBACK');
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao confirmar' };
  } finally {
    client.release();
  }
}

export async function marcarEntregue(id: string): Promise<PedidoVenda | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<PedidoVenda>(
    `UPDATE pedidos_venda SET status = 'entregue', updated_at = NOW() WHERE id = $1 AND status = 'confirmado'
     RETURNING id, cliente_id, data_pedido::text, tipo_entrega, status, endereco_entrega, observacoes, total, previsao_entrega_em_dias, distancia_km::numeric, valor_frete::numeric, created_at, updated_at`,
    [id]
  );
  return rows[0] ?? null;
}

export interface PrecoSugerido {
  preco_sugerido: number;
  origem: 'mediana' | 'ultimo_pedido' | 'cadastro';
}

export async function getPrecoSugerido(produtoId: string): Promise<PrecoSugerido> {
  const pool = getPool();
  if (!pool) return { preco_sugerido: 0, origem: 'cadastro' };
  const { rows: medianaRows } = await pool.query<{ mediana: string }>(
    `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY i.preco_unitario) AS mediana
     FROM itens_pedido_venda i
     JOIN pedidos_venda p ON p.id = i.pedido_venda_id
     WHERE i.produto_id = $1 AND p.status IN ('confirmado', 'entregue')`,
    [produtoId]
  );
  const mediana = medianaRows[0]?.mediana != null ? Number(medianaRows[0].mediana) : null;
  if (mediana != null && mediana > 0) return { preco_sugerido: mediana, origem: 'mediana' };
  const { rows: lastRows } = await pool.query<{ preco_unitario: string }>(
    `SELECT i.preco_unitario FROM itens_pedido_venda i
     JOIN pedidos_venda p ON p.id = i.pedido_venda_id
     WHERE i.produto_id = $1 AND p.status IN ('confirmado', 'entregue')
     ORDER BY p.data_pedido DESC, i.created_at DESC LIMIT 1`,
    [produtoId]
  );
  const ultimo = lastRows[0]?.preco_unitario != null ? Number(lastRows[0].preco_unitario) : null;
  if (ultimo != null && ultimo >= 0) return { preco_sugerido: ultimo, origem: 'ultimo_pedido' };
  const { rows: prodRows } = await pool.query<{ preco_venda: string }>('SELECT preco_venda FROM produtos WHERE id = $1', [produtoId]);
  const cadastro = prodRows[0]?.preco_venda != null ? Number(prodRows[0].preco_venda) : 0;
  return { preco_sugerido: cadastro, origem: 'cadastro' };
}

export interface ItemSugerido {
  produto_id: string;
  codigo: string;
  descricao: string;
  preco_venda: number;
  vezes_junto: number;
}

export async function getItensSugeridos(produtoId: string, limit = 5): Promise<ItemSugerido[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<ItemSugerido & { preco_venda: string; vezes_junto: string }>(
    `SELECT i2.produto_id, pr.codigo, pr.descricao, pr.preco_venda::numeric, COUNT(*)::int AS vezes_junto
     FROM itens_pedido_venda i1
     JOIN itens_pedido_venda i2 ON i1.pedido_venda_id = i2.pedido_venda_id AND i2.produto_id != $1
     JOIN pedidos_venda p ON p.id = i1.pedido_venda_id
     JOIN produtos pr ON pr.id = i2.produto_id
     WHERE i1.produto_id = $1 AND p.status IN ('confirmado', 'entregue')
     GROUP BY i2.produto_id, pr.codigo, pr.descricao, pr.preco_venda
     ORDER BY vezes_junto DESC
     LIMIT $2`,
    [produtoId, limit]
  );
  return rows.map((r) => ({ ...r, preco_venda: Number(r.preco_venda), vezes_junto: Number(r.vezes_junto) }));
}
