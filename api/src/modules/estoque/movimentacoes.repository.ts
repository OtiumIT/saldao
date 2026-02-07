import { getPool } from '../../db/client.js';

export type TipoMovimentacao = 'entrada' | 'saida' | 'ajuste' | 'producao';

export interface MovimentacaoEstoque {
  id: string;
  data: string;
  tipo: TipoMovimentacao;
  produto_id: string;
  quantidade: number;
  cor_id: string | null;
  origem_tipo: string | null;
  origem_id: string | null;
  observacao: string | null;
  created_at: string;
}

export interface MovimentacaoComProduto extends MovimentacaoEstoque {
  produto_codigo?: string;
  produto_descricao?: string;
  cor_nome?: string | null;
}

export interface FiltrosMovimentacao {
  produto_id?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo?: TipoMovimentacao;
}

export async function list(filtros?: FiltrosMovimentacao): Promise<MovimentacaoComProduto[]> {
  const pool = getPool();
  if (!pool) return [];
  let sql = `SELECT m.id, m.data::text, m.tipo, m.produto_id, m.quantidade, m.cor_id, m.origem_tipo, m.origem_id, m.observacao, m.created_at,
    p.codigo AS produto_codigo, p.descricao AS produto_descricao, c.nome AS cor_nome
    FROM movimentacoes_estoque m
    JOIN produtos p ON p.id = m.produto_id
    LEFT JOIN cores c ON c.id = m.cor_id WHERE 1=1`;
  const params: unknown[] = [];
  let i = 1;
  if (filtros?.produto_id) {
    sql += ` AND m.produto_id = $${i++}`;
    params.push(filtros.produto_id);
  }
  if (filtros?.data_inicio) {
    sql += ` AND m.data >= $${i++}`;
    params.push(filtros.data_inicio);
  }
  if (filtros?.data_fim) {
    sql += ` AND m.data <= $${i++}`;
    params.push(filtros.data_fim);
  }
  if (filtros?.tipo) {
    sql += ` AND m.tipo = $${i++}`;
    params.push(filtros.tipo);
  }
  sql += ' ORDER BY m.data DESC, m.created_at DESC';
  const { rows } = await pool.query<MovimentacaoComProduto>(sql, params);
  return rows;
}

export async function create(data: {
  data?: string;
  tipo: TipoMovimentacao;
  produto_id: string;
  quantidade: number;
  cor_id?: string | null;
  origem_tipo?: string | null;
  origem_id?: string | null;
  observacao?: string | null;
}): Promise<MovimentacaoEstoque> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const dataStr = data.data ?? new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query<MovimentacaoEstoque>(
    `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, cor_id, origem_tipo, origem_id, observacao)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, data::text, tipo, produto_id, quantidade, cor_id, origem_tipo, origem_id, observacao, created_at`,
    [
      dataStr,
      data.tipo,
      data.produto_id,
      data.quantidade,
      data.cor_id ?? null,
      data.origem_tipo ?? null,
      data.origem_id ?? null,
      data.observacao ?? null,
    ]
  );
  return rows[0];
}

/** Cria um ajuste: quantidade = novo_saldo - saldo_atual (positivo ou negativo). */
export async function ajuste(
  produto_id: string,
  quantidade: number,
  observacao?: string,
  cor_id?: string | null
): Promise<MovimentacaoEstoque> {
  return create({
    tipo: 'ajuste',
    produto_id,
    quantidade,
    observacao: observacao ?? 'Ajuste manual',
    cor_id: cor_id ?? null,
  });
}

/** Conferência em lote: array de { produto_id, quantidade } onde quantidade = novo saldo. Gera ajuste por produto. */
export async function conferenciaLote(
  itens: Array<{ produto_id: string; saldo_atual: number }>
): Promise<{ processados: number; erros: string[] }> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const erros: string[] = [];
  let processados = 0;
  for (const item of itens) {
    const { rows: saldoRows } = await pool.query<{ quantidade: string }>(
      'SELECT COALESCE(SUM(quantidade), 0) AS quantidade FROM movimentacoes_estoque WHERE produto_id = $1',
      [item.produto_id]
    );
    const saldoAtual = Number(saldoRows[0]?.quantidade ?? 0);
    const diff = item.saldo_atual - saldoAtual;
    if (Math.abs(diff) < 1e-6) continue;
    try {
      await create({
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
