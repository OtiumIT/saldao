import { getPool } from '../../db/client.js';

export type LocalCusto = 'fabrica' | 'loja' | 'comum';

export interface CategoriaCustoOperacional {
  id: string;
  nome: string;
  descricao: string | null;
  local: LocalCusto;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustoOperacional {
  id: string;
  categoria_id: string;
  ano: number;
  mes: number;
  valor_planejado: number;
  valor_realizado: number | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustoOperacionalComCategoria extends CustoOperacional {
  categoria_nome?: string;
  categoria_local?: LocalCusto;
}

export async function listCategorias(): Promise<CategoriaCustoOperacional[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<CategoriaCustoOperacional>(
    `SELECT id, nome, descricao, local, ativo, created_at, updated_at
     FROM categorias_custo_operacional ORDER BY nome`
  );
  return rows;
}

export async function listCategoriasAtivas(): Promise<CategoriaCustoOperacional[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<CategoriaCustoOperacional>(
    `SELECT id, nome, descricao, local, ativo, created_at, updated_at
     FROM categorias_custo_operacional WHERE ativo = true ORDER BY nome`
  );
  return rows;
}

export async function findCategoriaById(id: string): Promise<CategoriaCustoOperacional | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<CategoriaCustoOperacional>(
    'SELECT id, nome, descricao, local, ativo, created_at, updated_at FROM categorias_custo_operacional WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function createCategoria(data: {
  nome: string;
  descricao?: string | null;
  local?: LocalCusto;
  ativo?: boolean;
}): Promise<CategoriaCustoOperacional> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const local = data.local ?? 'comum';
  const ativo = data.ativo ?? true;
  const { rows } = await pool.query<CategoriaCustoOperacional>(
    `INSERT INTO categorias_custo_operacional (nome, descricao, local, ativo)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, descricao, local, ativo, created_at, updated_at`,
    [data.nome, data.descricao ?? null, local, ativo]
  );
  return rows[0];
}

export async function updateCategoria(
  id: string,
  data: { nome?: string; descricao?: string | null; local?: LocalCusto; ativo?: boolean }
): Promise<CategoriaCustoOperacional | null> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows } = await pool.query<CategoriaCustoOperacional>(
    `UPDATE categorias_custo_operacional
     SET nome = COALESCE($2, nome), descricao = COALESCE($3, descricao), local = COALESCE($4, local), ativo = COALESCE($5, ativo), updated_at = NOW()
     WHERE id = $1
     RETURNING id, nome, descricao, local, ativo, created_at, updated_at`,
    [id, data.nome ?? null, data.descricao ?? null, data.local ?? null, data.ativo ?? null]
  );
  return rows[0] ?? null;
}

export async function removeCategoria(id: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rowCount } = await pool.query('DELETE FROM categorias_custo_operacional WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

export async function listCustosByPeriodo(ano: number, mes: number): Promise<CustoOperacionalComCategoria[]> {
  const pool = getPool();
  if (!pool) return [];
  const { rows } = await pool.query<CustoOperacionalComCategoria & { valor_planejado: string; valor_realizado: string | null }>(
    `SELECT c.id, c.categoria_id, c.ano, c.mes, c.valor_planejado::numeric, c.valor_realizado::numeric, c.observacao, c.created_at, c.updated_at,
      cat.nome AS categoria_nome, cat.local AS categoria_local
     FROM custos_operacionais c
     JOIN categorias_custo_operacional cat ON cat.id = c.categoria_id
     WHERE c.ano = $1 AND c.mes = $2
     ORDER BY cat.nome`,
    [ano, mes]
  );
  return rows.map((r) => ({
    ...r,
    valor_planejado: Number(r.valor_planejado),
    valor_realizado: r.valor_realizado != null ? Number(r.valor_realizado) : null,
  }));
}

export async function getOrCreateCusto(categoriaId: string, ano: number, mes: number): Promise<CustoOperacional> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  const { rows: existing } = await pool.query<CustoOperacional & { valor_planejado: string; valor_realizado: string | null }>(
    'SELECT id, categoria_id, ano, mes, valor_planejado::numeric, valor_realizado::numeric, observacao, created_at, updated_at FROM custos_operacionais WHERE categoria_id = $1 AND ano = $2 AND mes = $3',
    [categoriaId, ano, mes]
  );
  if (existing.length > 0) {
    return {
      ...existing[0],
      valor_planejado: Number(existing[0].valor_planejado),
      valor_realizado: existing[0].valor_realizado != null ? Number(existing[0].valor_realizado) : null,
    };
  }
  const { rows: inserted } = await pool.query<CustoOperacional & { valor_planejado: string; valor_realizado: string | null }>(
    `INSERT INTO custos_operacionais (categoria_id, ano, mes, valor_planejado)
     VALUES ($1, $2, $3, 0)
     RETURNING id, categoria_id, ano, mes, valor_planejado::numeric, valor_realizado::numeric, observacao, created_at, updated_at`,
    [categoriaId, ano, mes]
  );
  return {
    ...inserted[0],
    valor_planejado: Number(inserted[0].valor_planejado),
    valor_realizado: inserted[0].valor_realizado != null ? Number(inserted[0].valor_realizado) : null,
  };
}

export async function upsertCustosMes(
  ano: number,
  mes: number,
  itens: Array<{ categoria_id: string; valor_planejado?: number; valor_realizado?: number | null; observacao?: string | null }>
): Promise<CustoOperacionalComCategoria[]> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL não configurada');
  for (const it of itens) {
    await pool.query(
      `INSERT INTO custos_operacionais (categoria_id, ano, mes, valor_planejado, valor_realizado, observacao)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (categoria_id, ano, mes)
       DO UPDATE SET valor_planejado = COALESCE(EXCLUDED.valor_planejado, custos_operacionais.valor_planejado),
         valor_realizado = COALESCE(EXCLUDED.valor_realizado, custos_operacionais.valor_realizado),
         observacao = COALESCE(EXCLUDED.observacao, custos_operacionais.observacao),
         updated_at = NOW()`,
      [
        it.categoria_id,
        ano,
        mes,
        it.valor_planejado ?? 0,
        it.valor_realizado ?? null,
        it.observacao ?? null,
      ]
    );
  }
  return listCustosByPeriodo(ano, mes);
}

export async function totalCustosMes(ano: number, mes: number): Promise<{ total_planejado: number; total_realizado: number | null }> {
  const pool = getPool();
  if (!pool) return { total_planejado: 0, total_realizado: null };
  const { rows } = await pool.query<{ total_planejado: string; total_realizado: string | null }>(
    `SELECT COALESCE(SUM(valor_planejado), 0)::numeric AS total_planejado,
      (SELECT SUM(valor_realizado) FROM custos_operacionais WHERE ano = $1 AND mes = $2 AND valor_realizado IS NOT NULL)::numeric AS total_realizado
     FROM custos_operacionais WHERE ano = $1 AND mes = $2`,
    [ano, mes]
  );
  const r = rows[0];
  return {
    total_planejado: Number(r?.total_planejado ?? 0),
    total_realizado: r?.total_realizado != null ? Number(r.total_realizado) : null,
  };
}
