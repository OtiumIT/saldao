import { getPool } from '../../db/client.js';

const SEMANAS_HISTORICO = 8;
const DIAS_HISTORICO = SEMANAS_HISTORICO * 7;
const SEMANAS_COBERTURA = 2;

export interface AvisoCompra {
  id: string;
  codigo: string;
  descricao: string;
  tipo: string;
  saldo: number;
  estoque_minimo: number;
  estoque_maximo: number | null;
  quantidade_sugerida: number;
  quantidade_sugerida_ia: number;
  consumo_medio_periodo: number;
  preco_compra: number;
  fornecedor_principal_id: string | null;
}

/** Produtos (revenda ou insumos) com saldo <= estoque_minimo.
 * quantidade_sugerida = repor até o mínimo (limitado por máximo se houver).
 * quantidade_sugerida_ia = max(quantidade_sugerida, consumo_medio_semanal * SEMANAS_COBERTURA), limitado por estoque_maximo.
 */
export async function listAbaixoMinimo(): Promise<AvisoCompra[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<
    AvisoCompra & { saldo: string; quantidade_sugerida: string; estoque_maximo: string | null; total_saidas: string }
  >(
    `WITH consumo AS (
       SELECT produto_id, COALESCE(SUM(ABS(quantidade)), 0)::numeric AS total_saidas
       FROM movimentacoes_estoque
       WHERE tipo IN ('saida', 'producao') AND data >= CURRENT_DATE - $1::int
       GROUP BY produto_id
     )
     SELECT p.id, p.codigo, p.descricao, p.tipo,
       COALESCE(s.quantidade, 0)::numeric AS saldo,
       p.estoque_minimo,
       p.estoque_maximo::numeric,
       (CASE
         WHEN p.estoque_maximo IS NOT NULL AND (COALESCE(s.quantidade, 0) < p.estoque_maximo) THEN
           LEAST(GREATEST(0, p.estoque_minimo - COALESCE(s.quantidade, 0)), GREATEST(0, p.estoque_maximo - COALESCE(s.quantidade, 0)))
         ELSE GREATEST(0, p.estoque_minimo - COALESCE(s.quantidade, 0))
        END)::numeric AS quantidade_sugerida,
       COALESCE(c.total_saidas, 0)::numeric AS total_saidas,
       p.preco_compra,
       p.fornecedor_principal_id
     FROM produtos p
     LEFT JOIN saldo_estoque s ON s.produto_id = p.id
     LEFT JOIN consumo c ON c.produto_id = p.id
     WHERE p.tipo IN ('revenda', 'insumos')
       AND (COALESCE(s.quantidade, 0) <= p.estoque_minimo)
     ORDER BY (p.estoque_minimo - COALESCE(s.quantidade, 0)) DESC`,
    [DIAS_HISTORICO]
  );
  return rows.map((r) => {
    const saldo = Number(r.saldo);
    const quantidade_sugerida = Number(r.quantidade_sugerida);
    const total_saidas = Number(r.total_saidas);
    const consumo_medio_periodo = total_saidas / SEMANAS_HISTORICO;
    const consumo_medio_semanal = total_saidas / SEMANAS_HISTORICO;
    let quantidade_sugerida_ia = Math.max(quantidade_sugerida, Math.ceil(consumo_medio_semanal * SEMANAS_COBERTURA));
    if (r.estoque_maximo != null) {
      const maximo = Number(r.estoque_maximo);
      quantidade_sugerida_ia = Math.min(quantidade_sugerida_ia, Math.max(0, maximo - saldo));
    }
    return {
      ...r,
      saldo,
      estoque_maximo: r.estoque_maximo != null ? Number(r.estoque_maximo) : null,
      quantidade_sugerida,
      quantidade_sugerida_ia,
      consumo_medio_periodo,
      preco_compra: Number(r.preco_compra),
    };
  });
}
