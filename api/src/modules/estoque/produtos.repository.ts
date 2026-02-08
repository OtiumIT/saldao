import { getPool } from '../../db/client.js';

export type TipoProduto = 'revenda' | 'insumos' | 'fabricado';

export interface Produto {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  tipo: TipoProduto;
  preco_compra: number;
  preco_venda: number;
  estoque_minimo: number;
  estoque_maximo: number | null;
  fornecedor_principal_id: string | null;
  /** IDs dos fornecedores vinculados (quando retornado pela API) */
  fornecedores_ids?: string[];
  categoria_id: string | null;
  /** Dimensões montado (para roteirização) */
  montado_comprimento_m: number | null;
  montado_largura_m: number | null;
  montado_altura_m: number | null;
  montado_peso_kg: number | null;
  /** Dimensões desmontado / em caixas (para roteirização) */
  desmontado_comprimento_m: number | null;
  desmontado_largura_m: number | null;
  desmontado_altura_m: number | null;
  desmontado_peso_kg: number | null;
  controlar_por_cor: boolean;
  tipo_item_producao: 'fabricado' | 'kit' | null;
  /** Média de dias para entrega quando produto está sem estoque (sugestão na venda) */
  prazo_medio_entrega_dias: number | null;
  created_at: string;
  updated_at: string;
}

export interface FiltrosProduto {
  tipo?: TipoProduto;
  categoria_id?: string | null;
  fornecedor_id?: string;
}

export interface ProdutoComSaldo extends Produto {
  saldo: number;
}

const CAT_COL = 'categoria_id';
const DIM_COLS = 'montado_comprimento_m::numeric, montado_largura_m::numeric, montado_altura_m::numeric, montado_peso_kg::numeric, desmontado_comprimento_m::numeric, desmontado_largura_m::numeric, desmontado_altura_m::numeric, desmontado_peso_kg::numeric';
const DIM_COLS_P = 'p.montado_comprimento_m::numeric, p.montado_largura_m::numeric, p.montado_altura_m::numeric, p.montado_peso_kg::numeric, p.desmontado_comprimento_m::numeric, p.desmontado_largura_m::numeric, p.desmontado_altura_m::numeric, p.desmontado_peso_kg::numeric';
const EXTRA_COLS = 'controlar_por_cor, tipo_item_producao, prazo_medio_entrega_dias';
const SELECT_COLS = `id, codigo, descricao, unidade, tipo, preco_compra, preco_venda, estoque_minimo, estoque_maximo, fornecedor_principal_id, ${CAT_COL}, ${DIM_COLS}, ${EXTRA_COLS}, created_at, updated_at`;
const SELECT_COLS_P = `p.id, p.codigo, p.descricao, p.unidade, p.tipo, p.preco_compra, p.preco_venda, p.estoque_minimo, p.estoque_maximo, p.fornecedor_principal_id, p.${CAT_COL}, ${DIM_COLS_P}, p.controlar_por_cor, p.tipo_item_producao, p.prazo_medio_entrega_dias, p.created_at, p.updated_at`;

type ProdutoRow = Produto & Record<string, unknown>;

function mapProdutoRow(r: ProdutoRow): Produto {
  return {
    ...r,
    categoria_id: r.categoria_id ?? null,
    controlar_por_cor: r.controlar_por_cor ?? false,
    tipo_item_producao: r.tipo_item_producao === 'fabricado' || r.tipo_item_producao === 'kit' ? r.tipo_item_producao : null,
    prazo_medio_entrega_dias: r.prazo_medio_entrega_dias != null ? Number(r.prazo_medio_entrega_dias) : null,
    montado_comprimento_m: r.montado_comprimento_m != null ? Number(r.montado_comprimento_m) : null,
    montado_largura_m: r.montado_largura_m != null ? Number(r.montado_largura_m) : null,
    montado_altura_m: r.montado_altura_m != null ? Number(r.montado_altura_m) : null,
    montado_peso_kg: r.montado_peso_kg != null ? Number(r.montado_peso_kg) : null,
    desmontado_comprimento_m: r.desmontado_comprimento_m != null ? Number(r.desmontado_comprimento_m) : null,
    desmontado_largura_m: r.desmontado_largura_m != null ? Number(r.desmontado_largura_m) : null,
    desmontado_altura_m: r.desmontado_altura_m != null ? Number(r.desmontado_altura_m) : null,
    desmontado_peso_kg: r.desmontado_peso_kg != null ? Number(r.desmontado_peso_kg) : null,
  };
}

function buildWhereClause(filtros: FiltrosProduto | undefined, params: unknown[], idxRef: { idx: number }, tablePrefix = ''): string {
  const conditions: string[] = [];
  const p = tablePrefix ? `${tablePrefix}.` : '';
  if (filtros?.tipo) {
    conditions.push(`${p}tipo = $${idxRef.idx++}`);
    params.push(filtros.tipo);
  }
  if (filtros?.categoria_id !== undefined && filtros?.categoria_id !== null && filtros.categoria_id !== '') {
    conditions.push(`${p}categoria_id = $${idxRef.idx++}`);
    params.push(filtros.categoria_id);
  } else if (filtros?.categoria_id === null) {
    conditions.push(`${p}categoria_id IS NULL`);
  }
  if (filtros?.fornecedor_id) {
    const fid = idxRef.idx++;
    conditions.push(`(EXISTS (SELECT 1 FROM produtos_fornecedores pf WHERE pf.produto_id = ${p}id AND pf.fornecedor_id = $${fid}) OR ${p}fornecedor_principal_id = $${fid})`);
    params.push(filtros.fornecedor_id);
  }
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

export async function list(filtros?: FiltrosProduto): Promise<Produto[]> {
  const pool = getPool();
  if (!pool) return [];
  const params: unknown[] = [];
  const idxRef = { idx: 1 };
  const where = buildWhereClause(filtros, params, idxRef);
  const { rows } = await pool.query<ProdutoRow>(
    `SELECT ${SELECT_COLS} FROM produtos ${where} ORDER BY codigo`,
    params
  );
  return rows.map(mapProdutoRow);
}

export async function listComSaldos(filtros?: FiltrosProduto): Promise<ProdutoComSaldo[]> {
  const pool = getPool();
  if (!pool) {
    throw new Error('Database pool not available');
  }
  
  try {
    const params: unknown[] = [];
    const idxRef = { idx: 1 };
    const where = buildWhereClause(filtros, params, idxRef, 'p');
    const { rows } = await pool.query<ProdutoRow & { saldo: string }>(
      `SELECT ${SELECT_COLS_P}, COALESCE(s.quantidade, 0)::numeric AS saldo
       FROM produtos p
       LEFT JOIN saldo_estoque s ON s.produto_id = p.id
       ${where}
       ORDER BY p.codigo`,
      params
    );
    return rows.map((r) => ({ ...mapProdutoRow(r), saldo: Number(r.saldo) }));
  } catch (error) {
    // Log detalhado do erro para debug
    console.error('Error in listComSaldos:', {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      syscall: (error as any)?.syscall,
    });
    throw error;
  }
}

export async function findById(id: string): Promise<Produto | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<ProdutoRow>(
    `SELECT ${SELECT_COLS} FROM produtos WHERE id = $1`,
    [id]
  );
  const prod = rows[0] ? mapProdutoRow(rows[0]) : null;
  if (prod) {
    const { rows: pfRows } = await pool.query<{ fornecedor_id: string }>(
      'SELECT fornecedor_id FROM produtos_fornecedores WHERE produto_id = $1 ORDER BY created_at',
      [id]
    );
    prod.fornecedores_ids = pfRows.map((r) => r.fornecedor_id);
  }
  return prod;
}

export async function getFornecedoresIds(produtoId: string): Promise<string[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<{ fornecedor_id: string }>(
    'SELECT fornecedor_id FROM produtos_fornecedores WHERE produto_id = $1 ORDER BY created_at',
    [produtoId]
  );
  return rows.map((r) => r.fornecedor_id);
}

export interface SaldoPorCor {
  cor_id: string;
  cor_nome: string;
  quantidade: number;
}

export async function getSaldosPorCor(produtoId: string): Promise<SaldoPorCor[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<SaldoPorCor & { quantidade: string }>(
    `SELECT s.cor_id, c.nome AS cor_nome, s.quantidade::numeric
     FROM saldo_estoque_por_cor s
     JOIN cores c ON c.id = s.cor_id
     WHERE s.produto_id = $1 AND s.cor_id IS NOT NULL AND s.quantidade <> 0
     ORDER BY c.nome`,
    [produtoId]
  );
  return rows.map((r) => ({ ...r, quantidade: Number(r.quantidade) }));
}

export async function findByCodigo(codigo: string): Promise<Produto | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<ProdutoRow>(
    `SELECT ${SELECT_COLS} FROM produtos WHERE codigo = $1`,
    [codigo]
  );
  return rows[0] ? mapProdutoRow(rows[0]) : null;
}

export interface CreateProdutoInput {
  codigo: string;
  descricao: string;
  unidade?: string;
  tipo: TipoProduto;
  preco_compra?: number;
  preco_venda?: number;
  estoque_minimo?: number;
  estoque_maximo?: number | null;
  fornecedor_principal_id?: string | null;
  /** Lista de IDs de fornecedores (substitui fornecedor_principal_id se informado) */
  fornecedores_ids?: string[] | null;
  categoria_id?: string | null;
  montado_comprimento_m?: number | null;
  montado_largura_m?: number | null;
  montado_altura_m?: number | null;
  montado_peso_kg?: number | null;
  desmontado_comprimento_m?: number | null;
  desmontado_largura_m?: number | null;
  desmontado_altura_m?: number | null;
  desmontado_peso_kg?: number | null;
  prazo_medio_entrega_dias?: number | null;
}

export async function create(data: CreateProdutoInput): Promise<Produto> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const fornecedoresIds = data.fornecedores_ids?.length ? data.fornecedores_ids : (data.fornecedor_principal_id ? [data.fornecedor_principal_id] : []);
  const fornecedorPrincipalId = fornecedoresIds[0] ?? data.fornecedor_principal_id ?? null;
  const { rows } = await pool.query<ProdutoRow>(
    `INSERT INTO produtos (codigo, descricao, unidade, tipo, preco_compra, preco_venda, estoque_minimo, estoque_maximo, fornecedor_principal_id, categoria_id,
       montado_comprimento_m, montado_largura_m, montado_altura_m, montado_peso_kg, desmontado_comprimento_m, desmontado_largura_m, desmontado_altura_m, desmontado_peso_kg, prazo_medio_entrega_dias)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     RETURNING ${SELECT_COLS}`,
    [
      data.codigo,
      data.descricao,
      data.unidade ?? 'UN',
      data.tipo,
      data.preco_compra ?? 0,
      data.preco_venda ?? 0,
      data.estoque_minimo ?? 0,
      data.estoque_maximo ?? null,
      fornecedorPrincipalId,
      data.categoria_id ?? null,
      data.montado_comprimento_m ?? null,
      data.montado_largura_m ?? null,
      data.montado_altura_m ?? null,
      data.montado_peso_kg ?? null,
      data.desmontado_comprimento_m ?? null,
      data.desmontado_largura_m ?? null,
      data.desmontado_altura_m ?? null,
      data.desmontado_peso_kg ?? null,
      data.prazo_medio_entrega_dias ?? null,
    ]
  );
  const produto = mapProdutoRow(rows[0]);
  if (fornecedoresIds.length > 0) {
    for (const fid of fornecedoresIds) {
      await pool.query(
        'INSERT INTO produtos_fornecedores (produto_id, fornecedor_id) VALUES ($1, $2) ON CONFLICT (produto_id, fornecedor_id) DO NOTHING',
        [produto.id, fid]
      );
    }
    produto.fornecedores_ids = fornecedoresIds;
  }
  return produto;
}

export interface UpdateProdutoInput {
  codigo?: string;
  descricao?: string;
  unidade?: string;
  tipo?: TipoProduto;
  preco_compra?: number;
  preco_venda?: number;
  estoque_minimo?: number;
  estoque_maximo?: number | null;
  fornecedor_principal_id?: string | null;
  fornecedores_ids?: string[] | null;
  categoria_id?: string | null;
  montado_comprimento_m?: number | null;
  montado_largura_m?: number | null;
  montado_altura_m?: number | null;
  montado_peso_kg?: number | null;
  desmontado_comprimento_m?: number | null;
  desmontado_largura_m?: number | null;
  desmontado_altura_m?: number | null;
  desmontado_peso_kg?: number | null;
  prazo_medio_entrega_dias?: number | null;
}

export async function update(id: string, data: UpdateProdutoInput): Promise<Produto | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const current = await findById(id);
  if (!current) return null;
  const codigo = data.codigo ?? current.codigo;
  const descricao = data.descricao ?? current.descricao;
  const unidade = data.unidade ?? current.unidade;
  const tipo = data.tipo ?? current.tipo;
  const preco_compra = data.preco_compra ?? current.preco_compra;
  const preco_venda = data.preco_venda ?? current.preco_venda;
  const estoque_minimo = data.estoque_minimo ?? current.estoque_minimo;
  const estoque_maximo = data.estoque_maximo !== undefined ? data.estoque_maximo : current.estoque_maximo;
  const currentFornecedoresIds = current.fornecedores_ids ?? (current.fornecedor_principal_id ? [current.fornecedor_principal_id] : []);
  const fornecedoresIds = data.fornecedores_ids !== undefined ? (data.fornecedores_ids ?? []) : currentFornecedoresIds;
  const fornecedor_principal_id = data.fornecedor_principal_id !== undefined ? data.fornecedor_principal_id : (fornecedoresIds[0] ?? current.fornecedor_principal_id);
  const categoria_id = data.categoria_id !== undefined ? data.categoria_id : current.categoria_id;
  const montado_comprimento_m = data.montado_comprimento_m !== undefined ? data.montado_comprimento_m : current.montado_comprimento_m;
  const montado_largura_m = data.montado_largura_m !== undefined ? data.montado_largura_m : current.montado_largura_m;
  const montado_altura_m = data.montado_altura_m !== undefined ? data.montado_altura_m : current.montado_altura_m;
  const montado_peso_kg = data.montado_peso_kg !== undefined ? data.montado_peso_kg : current.montado_peso_kg;
  const desmontado_comprimento_m = data.desmontado_comprimento_m !== undefined ? data.desmontado_comprimento_m : current.desmontado_comprimento_m;
  const desmontado_largura_m = data.desmontado_largura_m !== undefined ? data.desmontado_largura_m : current.desmontado_largura_m;
  const desmontado_altura_m = data.desmontado_altura_m !== undefined ? data.desmontado_altura_m : current.desmontado_altura_m;
  const desmontado_peso_kg = data.desmontado_peso_kg !== undefined ? data.desmontado_peso_kg : current.desmontado_peso_kg;
  const prazo_medio_entrega_dias = data.prazo_medio_entrega_dias !== undefined ? data.prazo_medio_entrega_dias : current.prazo_medio_entrega_dias;
  const { rows } = await pool.query<ProdutoRow>(
    `UPDATE produtos SET codigo = $2, descricao = $3, unidade = $4, tipo = $5, preco_compra = $6, preco_venda = $7, estoque_minimo = $8, estoque_maximo = $9, fornecedor_principal_id = $10, categoria_id = $11,
     montado_comprimento_m = $12, montado_largura_m = $13, montado_altura_m = $14, montado_peso_kg = $15,
     desmontado_comprimento_m = $16, desmontado_largura_m = $17, desmontado_altura_m = $18, desmontado_peso_kg = $19, prazo_medio_entrega_dias = $20, updated_at = NOW()
     WHERE id = $1 RETURNING ${SELECT_COLS}`,
    [id, codigo, descricao, unidade, tipo, preco_compra, preco_venda, estoque_minimo, estoque_maximo ?? null, fornecedor_principal_id ?? null, categoria_id ?? null, montado_comprimento_m ?? null, montado_largura_m ?? null, montado_altura_m ?? null, montado_peso_kg ?? null, desmontado_comprimento_m ?? null, desmontado_largura_m ?? null, desmontado_altura_m ?? null, desmontado_peso_kg ?? null, prazo_medio_entrega_dias ?? null]
  );
  const updated = rows[0] ? mapProdutoRow(rows[0]) : null;
  if (updated && data.fornecedores_ids !== undefined) {
    await pool.query('DELETE FROM produtos_fornecedores WHERE produto_id = $1', [id]);
    for (const fid of fornecedoresIds) {
      await pool.query(
        'INSERT INTO produtos_fornecedores (produto_id, fornecedor_id) VALUES ($1, $2) ON CONFLICT (produto_id, fornecedor_id) DO NOTHING',
        [id, fid]
      );
    }
    updated.fornecedores_ids = fornecedoresIds;
  }
  return updated;
}

export async function remove(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

export async function createMany(items: CreateProdutoInput[]): Promise<{ created: number; errors: string[] }> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const errors: string[] = [];
  let created = 0;
  for (const data of items) {
    try {
      await create(data);
      created++;
    } catch (e) {
      errors.push(`${data.codigo}: ${e instanceof Error ? e.message : 'Erro'}`);
    }
  }
  return { created, errors };
}

const DIAS_HISTORICO_ESTOQUE = 56;
const LEAD_TIME_DIAS = 7;
const DIAS_SEGURANCA = 7;

export interface SugestaoEstoque {
  estoque_minimo_sugerido: number;
  estoque_maximo_sugerido: number | null;
  consumo_medio_diario: number;
  dias_historico: number;
  mensagem?: string;
}

export async function getSugestaoEstoque(produtoId: string): Promise<SugestaoEstoque> {
  const pool = getPool();
  if (!pool) return { estoque_minimo_sugerido: 0, estoque_maximo_sugerido: null, consumo_medio_diario: 0, dias_historico: 0, mensagem: 'Indisponível' };
  const { rows: consumoRows } = await pool.query<{ total_saidas: string }>(
    `SELECT COALESCE(SUM(ABS(quantidade)), 0)::numeric AS total_saidas
     FROM movimentacoes_estoque
     WHERE produto_id = $1 AND tipo IN ('saida', 'producao') AND data >= CURRENT_DATE - $2::int`,
    [produtoId, DIAS_HISTORICO_ESTOQUE]
  );
  const totalSaidas = Number(consumoRows[0]?.total_saidas ?? 0);
  const consumo_medio_diario = DIAS_HISTORICO_ESTOQUE > 0 ? totalSaidas / DIAS_HISTORICO_ESTOQUE : 0;
  if (totalSaidas <= 0) {
    return {
      estoque_minimo_sugerido: 0,
      estoque_maximo_sugerido: null,
      consumo_medio_diario: 0,
      dias_historico: DIAS_HISTORICO_ESTOQUE,
      mensagem: 'Sem histórico de saídas no período. Defina o mínimo manualmente.',
    };
  }
  const estoque_minimo_sugerido = Math.ceil(consumo_medio_diario * (LEAD_TIME_DIAS + DIAS_SEGURANCA));
  const estoque_maximo_sugerido = Math.ceil(estoque_minimo_sugerido * 2);
  return {
    estoque_minimo_sugerido,
    estoque_maximo_sugerido,
    consumo_medio_diario,
    dias_historico: DIAS_HISTORICO_ESTOQUE,
  };
}
