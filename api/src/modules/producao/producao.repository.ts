import { getPool } from '../../db/client.js';

export interface BomRow {
  id: string;
  produto_fabricado_id: string;
  produto_insumo_id: string;
  quantidade_por_unidade: number;
  created_at: string;
}

export interface BomComInsumo extends BomRow {
  insumo_codigo?: string;
  insumo_descricao?: string;
  controlar_por_cor?: boolean;
}

export interface OrdemProducao {
  id: string;
  produto_fabricado_id: string;
  quantidade: number;
  data_ordem: string;
  status: 'pendente' | 'concluida';
  observacao: string | null;
  cor_id: string | null;
  created_at: string;
}

export interface OrdemComProduto extends OrdemProducao {
  produto_codigo?: string;
  produto_descricao?: string;
  cor_nome?: string | null;
}

export interface OrdemProducaoItem {
  id: string;
  ordem_id: string;
  produto_id: string;
  tipo: 'fabricado' | 'kit';
  quantidade: number;
  created_at: string;
  produto_codigo?: string;
  produto_descricao?: string;
}

export async function listBomByFabricado(produtoFabricadoId: string): Promise<BomComInsumo[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<BomComInsumo & { quantidade_por_unidade: string; controlar_por_cor: boolean | null }>(
    `SELECT b.id, b.produto_fabricado_id, b.produto_insumo_id, b.quantidade_por_unidade::numeric, b.created_at,
      p.codigo AS insumo_codigo, p.descricao AS insumo_descricao, p.controlar_por_cor
     FROM bom b
     JOIN produtos p ON p.id = b.produto_insumo_id
     WHERE b.produto_fabricado_id = $1
     ORDER BY p.codigo`,
    [produtoFabricadoId]
  );
  return rows.map((r) => ({
    ...r,
    quantidade_por_unidade: Number(r.quantidade_por_unidade),
    controlar_por_cor: r.controlar_por_cor ?? false,
  }));
}

export async function saveBomItem(data: {
  produto_fabricado_id: string;
  produto_insumo_id: string;
  quantidade_por_unidade: number;
}): Promise<BomRow> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<BomRow & { quantidade_por_unidade: string }>(
    `INSERT INTO bom (produto_fabricado_id, produto_insumo_id, quantidade_por_unidade)
     VALUES ($1, $2, $3)
     ON CONFLICT (produto_fabricado_id, produto_insumo_id)
     DO UPDATE SET quantidade_por_unidade = $3
     RETURNING id, produto_fabricado_id, produto_insumo_id, quantidade_por_unidade::numeric, created_at`
  , [data.produto_fabricado_id, data.produto_insumo_id, data.quantidade_por_unidade]);
  return { ...rows[0], quantidade_por_unidade: Number(rows[0].quantidade_por_unidade) };
}

export async function removeBomItem(produtoFabricadoId: string, produtoInsumoId: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query(
    'DELETE FROM bom WHERE produto_fabricado_id = $1 AND produto_insumo_id = $2',
    [produtoFabricadoId, produtoInsumoId]
  );
  return (rowCount ?? 0) > 0;
}

/** Quantidade que dá para construir do fabricado (gargalo por insumo). */
export async function quantidadePossivel(produtoFabricadoId: string): Promise<{ quantidade: number; insumo_gargalo_id: string | null; insumo_gargalo_codigo: string | null }> {
  const pool = getPool();
  if (!pool) return { quantidade: 0, insumo_gargalo_id: null, insumo_gargalo_codigo: null };
  const bom = await listBomByFabricado(produtoFabricadoId);
  if (bom.length === 0) return { quantidade: 0, insumo_gargalo_id: null, insumo_gargalo_codigo: null };

  let minQtd = Infinity;
  let gargaloId: string | null = null;
  let gargaloCodigo: string | null = null;
  for (const b of bom) {
    const { rows } = await pool.query<{ quantidade: string }>(
      'SELECT COALESCE(SUM(quantidade), 0) AS quantidade FROM movimentacoes_estoque WHERE produto_id = $1',
      [b.produto_insumo_id]
    );
    const saldo = Number(rows[0]?.quantidade ?? 0);
    const qtdPossivel = b.quantidade_por_unidade > 0 ? Math.floor(saldo / b.quantidade_por_unidade) : 0;
    if (qtdPossivel < minQtd) {
      minQtd = qtdPossivel;
      gargaloId = b.produto_insumo_id;
      gargaloCodigo = b.insumo_codigo ?? null;
    }
  }
  return {
    quantidade: minQtd === Infinity ? 0 : minQtd,
    insumo_gargalo_id: gargaloId,
    insumo_gargalo_codigo: gargaloCodigo,
  };
}

export async function listOrdens(filtros?: { status?: string; data_inicio?: string; data_fim?: string }): Promise<OrdemComProduto[]> {
  const pool = getPool();
  if (!pool) return [];
  let sql = `SELECT o.id, o.produto_fabricado_id, o.quantidade::numeric, o.data_ordem::text, o.status, o.observacao, o.cor_id, o.created_at,
    p.codigo AS produto_codigo, p.descricao AS produto_descricao, c.nome AS cor_nome
    FROM ordens_producao o
    JOIN produtos p ON p.id = o.produto_fabricado_id
    LEFT JOIN cores c ON c.id = o.cor_id WHERE 1=1`;
  const params: unknown[] = [];
  let i = 1;
  if (filtros?.status) { sql += ` AND o.status = $${i++}`; params.push(filtros.status); }
  if (filtros?.data_inicio) { sql += ` AND o.data_ordem >= $${i++}`; params.push(filtros.data_inicio); }
  if (filtros?.data_fim) { sql += ` AND o.data_ordem <= $${i++}`; params.push(filtros.data_fim); }
  sql += ' ORDER BY o.data_ordem DESC, o.created_at DESC';
  const { rows } = await pool.query<OrdemComProduto & { quantidade: string }>(sql, params);
  return rows.map((r) => ({ ...r, quantidade: Number(r.quantidade) }));
}

export async function listOrdensItens(ordemId: string): Promise<OrdemProducaoItem[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<OrdemProducaoItem & { quantidade: string }>(
    `SELECT i.id, i.ordem_id, i.produto_id, i.tipo, i.quantidade::numeric, i.created_at,
      p.codigo AS produto_codigo, p.descricao AS produto_descricao
     FROM ordens_producao_itens i
     JOIN produtos p ON p.id = i.produto_id
     WHERE i.ordem_id = $1 ORDER BY i.created_at`,
    [ordemId]
  );
  return rows.map((r) => ({ ...r, quantidade: Number(r.quantidade) }));
}

async function getSaldoPorCor(
  pool: { query: (q: string, p: unknown[]) => Promise<{ rows: { quantidade: string }[] }> },
  produtoId: string,
  corId: string | null
): Promise<number> {
  if (corId) {
    const r = await pool.query<{ quantidade: string }>(
      'SELECT COALESCE(SUM(quantidade), 0)::text AS quantidade FROM saldo_estoque_por_cor WHERE produto_id = $1 AND cor_id = $2',
      [produtoId, corId]
    );
    return Number(r.rows[0]?.quantidade ?? 0);
  }
  const r = await pool.query<{ quantidade: string }>(
    'SELECT COALESCE(SUM(quantidade), 0)::text AS quantidade FROM movimentacoes_estoque WHERE produto_id = $1',
    [produtoId]
  );
  return Number(r.rows[0]?.quantidade ?? 0);
}

export interface ConferenciaEstoquePorCorResult {
  disponivel_na_cor: boolean;
  insumos_faltando: Array<{
    produto_id: string;
    codigo: string;
    descricao: string;
    saldo_necessario: number;
    saldo_na_cor: number;
  }>;
  cores_com_estoque: Array<{ cor_id: string; nome: string }>;
}

/** Conferência: para a ordem (itens ou produto+quantidade) e cor, verifica se há estoque na cor; sugere cores alternativas. */
export async function conferirEstoquePorCor(params: {
  ordem_id?: string;
  produto_fabricado_id?: string;
  quantidade?: number;
  itens?: Array<{ produto_id: string; quantidade: number }>;
  cor_id: string;
}): Promise<ConferenciaEstoquePorCorResult> {
  const pool = getPool();
  const empty: ConferenciaEstoquePorCorResult = {
    disponivel_na_cor: true,
    insumos_faltando: [],
    cores_com_estoque: [],
  };
  if (!pool) return empty;

  type InsumoNecessario = { produto_insumo_id: string; codigo: string; descricao: string; quantidade_necessaria: number };
  let insumosPorCor: InsumoNecessario[] = [];

  if (params.ordem_id) {
    const itens = await listOrdensItens(params.ordem_id);
    if (itens.length === 0) {
      const { rows: ordRows } = await pool.query<{ produto_fabricado_id: string; quantidade: string }>(
        'SELECT produto_fabricado_id, quantidade::text FROM ordens_producao WHERE id = $1',
        [params.ordem_id]
      );
      const ord = ordRows[0];
      if (ord) {
        const bom = await listBomByFabricado(ord.produto_fabricado_id);
        const qty = Number(ord.quantidade);
        insumosPorCor = bom
          .filter((b) => b.controlar_por_cor)
          .map((b) => ({
            produto_insumo_id: b.produto_insumo_id,
            codigo: b.insumo_codigo ?? '',
            descricao: b.insumo_descricao ?? '',
            quantidade_necessaria: b.quantidade_por_unidade * qty,
          }));
      }
    } else {
      const map = new Map<string, { codigo: string; descricao: string; qtd: number }>();
      for (const item of itens) {
        const bom = await listBomByFabricado(item.produto_id);
        for (const b of bom) {
          if (!b.controlar_por_cor) continue;
          const key = b.produto_insumo_id;
          const prev = map.get(key);
          const qtd = (prev?.qtd ?? 0) + b.quantidade_por_unidade * item.quantidade;
          map.set(key, { codigo: b.insumo_codigo ?? '', descricao: b.insumo_descricao ?? '', qtd });
        }
      }
      insumosPorCor = Array.from(map.entries()).map(([produto_insumo_id, v]) => ({
        produto_insumo_id,
        codigo: v.codigo,
        descricao: v.descricao,
        quantidade_necessaria: v.qtd,
      }));
    }
  } else if (params.itens && params.itens.length > 0) {
    const map = new Map<string, { codigo: string; descricao: string; qtd: number }>();
    for (const item of params.itens) {
      const bom = await listBomByFabricado(item.produto_id);
      for (const b of bom) {
        if (!b.controlar_por_cor) continue;
        const key = b.produto_insumo_id;
        const prev = map.get(key);
        const qtd = (prev?.qtd ?? 0) + b.quantidade_por_unidade * item.quantidade;
        map.set(key, { codigo: b.insumo_codigo ?? '', descricao: b.insumo_descricao ?? '', qtd });
      }
    }
    insumosPorCor = Array.from(map.entries()).map(([produto_insumo_id, v]) => ({
      produto_insumo_id,
      codigo: v.codigo,
      descricao: v.descricao,
      quantidade_necessaria: v.qtd,
    }));
  } else if (params.produto_fabricado_id && params.quantidade != null) {
    const bom = await listBomByFabricado(params.produto_fabricado_id);
    insumosPorCor = bom
      .filter((b) => b.controlar_por_cor)
      .map((b) => ({
        produto_insumo_id: b.produto_insumo_id,
        codigo: b.insumo_codigo ?? '',
        descricao: b.insumo_descricao ?? '',
        quantidade_necessaria: b.quantidade_por_unidade * params.quantidade,
      }));
  }

  if (insumosPorCor.length === 0) return { ...empty, cores_com_estoque: await listCoresComEstoqueParaInsumos(pool, []) };

  const insumos_faltando: ConferenciaEstoquePorCorResult['insumos_faltando'] = [];
  for (const ins of insumosPorCor) {
    const saldo = await getSaldoPorCor(pool, ins.produto_insumo_id, params.cor_id);
    if (saldo < ins.quantidade_necessaria) {
      insumos_faltando.push({
        produto_id: ins.produto_insumo_id,
        codigo: ins.codigo,
        descricao: ins.descricao,
        saldo_necessario: ins.quantidade_necessaria,
        saldo_na_cor: saldo,
      });
    }
  }
  const disponivel_na_cor = insumos_faltando.length === 0;
  const cores_com_estoque = await listCoresComEstoqueParaInsumos(
    pool,
    insumosPorCor.map((i) => ({ produto_id: i.produto_insumo_id, quantidade_necessaria: i.quantidade_necessaria }))
  );
  return { disponivel_na_cor, insumos_faltando, cores_com_estoque };
}

async function listCoresComEstoqueParaInsumos(
  pool: { query: (q: string, p: unknown[]) => Promise<{ rows: { cor_id: string; cor_nome: string }[] }> },
  insumos: Array<{ produto_id: string; quantidade_necessaria: number }>
): Promise<Array<{ cor_id: string; nome: string }>> {
  if (insumos.length === 0) {
    const { rows } = await pool.query<{ id: string; nome: string }>('SELECT id, nome FROM cores ORDER BY nome', []);
    return rows.map((r) => ({ cor_id: r.id, nome: r.nome }));
  }
  const coresOk = new Map<string, string>();
  const { rows: coresRows } = await pool.query<{ id: string; nome: string }>('SELECT id, nome FROM cores ORDER BY nome', []);
  for (const cor of coresRows) {
    let ok = true;
    for (const ins of insumos) {
      const r = await pool.query<{ quantidade: string }>(
        'SELECT COALESCE(SUM(quantidade), 0)::text AS quantidade FROM saldo_estoque_por_cor WHERE produto_id = $1 AND cor_id = $2',
        [ins.produto_id, cor.id]
      );
      const saldo = Number(r.rows[0]?.quantidade ?? 0);
      if (saldo < ins.quantidade_necessaria) {
        ok = false;
        break;
      }
    }
    if (ok) coresOk.set(cor.id, cor.nome);
  }
  return Array.from(coresOk.entries()).map(([cor_id, nome]) => ({ cor_id, nome }));
}

export async function createOrdem(data: {
  produto_fabricado_id: string;
  quantidade: number;
  data_ordem?: string;
  observacao?: string | null;
  cor_id?: string | null;
  itens?: Array<{ produto_id: string; tipo: 'fabricado' | 'kit'; quantidade: number }>;
}): Promise<OrdemProducao> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const dataOrdem = data.data_ordem ?? new Date().toISOString().slice(0, 10);
  let produtoFabricadoId = data.produto_fabricado_id ?? '';
  let quantidade = data.quantidade ?? 0;
  if (data.itens && data.itens.length > 0) {
    const firstFabricado = data.itens.find((i) => i.tipo === 'fabricado');
    if (!firstFabricado) throw new Error('Ordem deve ter pelo menos um item tipo fabricado');
    produtoFabricadoId = firstFabricado.produto_id;
    quantidade = firstFabricado.quantidade;
  } else if (!produtoFabricadoId || quantidade <= 0) {
    throw new Error('Informe produto_fabricado_id e quantidade ou itens');
  }
  const { rows } = await pool.query<OrdemProducao & { quantidade: string }>(
    `INSERT INTO ordens_producao (produto_fabricado_id, quantidade, data_ordem, observacao, cor_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, produto_fabricado_id, quantidade::numeric, data_ordem::text, status, observacao, cor_id, created_at`,
    [produtoFabricadoId, quantidade, dataOrdem, data.observacao ?? null, data.cor_id ?? null]
  );
  const ordem = { ...rows[0], quantidade: Number(rows[0].quantidade) };
  if (data.itens && data.itens.length > 0) {
    for (const item of data.itens) {
      await pool.query(
        `INSERT INTO ordens_producao_itens (ordem_id, produto_id, tipo, quantidade) VALUES ($1, $2, $3, $4)`,
        [ordem.id, item.produto_id, item.tipo, item.quantidade]
      );
    }
  }
  return ordem;
}

/** Executa a ordem: baixa insumos (conforme BOM) e dá entrada no fabricado. Se ordem tiver itens, usa itens; senão usa produto_fabricado_id + quantidade. */
export async function executarOrdem(ordemId: string): Promise<{ ok: boolean; error?: string }> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows: ordemRows } = await pool.query<{
    id: string;
    produto_fabricado_id: string;
    quantidade: string;
    status: string;
    cor_id: string | null;
  }>(
    'SELECT id, produto_fabricado_id, quantidade::text, status, cor_id FROM ordens_producao WHERE id = $1',
    [ordemId]
  );
  const ordem = ordemRows[0];
  if (!ordem) return { ok: false, error: 'Ordem não encontrada' };
  if (ordem.status === 'concluida') return { ok: false, error: 'Ordem já concluída' };
  const corId = ordem.cor_id ?? null;
  const itens = await listOrdensItens(ordemId);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (itens.length > 0) {
      for (const item of itens) {
        const bom = await listBomByFabricado(item.produto_id);
        if (bom.length === 0) return { ok: false, error: `BOM não cadastrado para ${item.produto_id}` };
        const qtd = item.quantidade;
        for (const b of bom) {
          const qtdConsumo = b.quantidade_por_unidade * qtd;
          const usarCor = b.controlar_por_cor ? corId : null;
          await client.query(
            `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, cor_id, origem_tipo, origem_id, observacao)
             VALUES (CURRENT_DATE, 'saida', $1, $2, $3, 'ordem_producao', $4, $5)`,
            [b.produto_insumo_id, -qtdConsumo, usarCor, ordemId, `Ordem produção ${ordemId.slice(0, 8)} - consumo insumo`]
          );
        }
        if (item.tipo === 'fabricado') {
          await client.query(
            `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, origem_tipo, origem_id, observacao)
             VALUES (CURRENT_DATE, 'producao', $1, $2, 'ordem_producao', $3, $4)`,
            [item.produto_id, qtd, ordemId, `Ordem produção ${ordemId.slice(0, 8)}`]
          );
        }
      }
    } else {
      const quantidade = Number(ordem.quantidade);
      const bom = await listBomByFabricado(ordem.produto_fabricado_id);
      if (bom.length === 0) return { ok: false, error: 'BOM não cadastrado para este produto' };
      for (const b of bom) {
        const qtdConsumo = b.quantidade_por_unidade * quantidade;
        const usarCor = b.controlar_por_cor ? corId : null;
        await client.query(
          `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, cor_id, origem_tipo, origem_id, observacao)
           VALUES (CURRENT_DATE, 'saida', $1, $2, $3, 'ordem_producao', $4, $5)`,
          [b.produto_insumo_id, -qtdConsumo, usarCor, ordemId, `Ordem produção ${ordemId.slice(0, 8)} - consumo insumo`]
        );
      }
      await client.query(
        `INSERT INTO movimentacoes_estoque (data, tipo, produto_id, quantidade, origem_tipo, origem_id, observacao)
         VALUES (CURRENT_DATE, 'producao', $1, $2, 'ordem_producao', $3, $4)`,
        [ordem.produto_fabricado_id, quantidade, ordemId, `Ordem produção ${ordemId.slice(0, 8)}`]
      );
    }
    await client.query('UPDATE ordens_producao SET status = $2 WHERE id = $1', [ordemId, 'concluida']);
    await client.query('COMMIT');
    return { ok: true };
  } catch (e) {
    await client.query('ROLLBACK');
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao executar ordem' };
  } finally {
    client.release();
  }
}
