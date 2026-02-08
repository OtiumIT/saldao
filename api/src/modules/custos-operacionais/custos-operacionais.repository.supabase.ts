/**
 * Repository de Custos Operacionais usando Supabase Data API (sem policies)
 * Substitui custos-operacionais.repository.ts quando usando Data API
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type {
  CategoriaCustoOperacional,
  CustoOperacional,
  CustoOperacionalComCategoria,
  LocalCusto,
} from './custos-operacionais.repository.js';

export async function listCategorias(env: Env): Promise<CategoriaCustoOperacional[]> {
  const client = getDataClient(env);
  return db.select<CategoriaCustoOperacional>(client, 'categorias_custo_operacional', {
    orderBy: { column: 'nome', ascending: true },
  });
}

export async function listCategoriasAtivas(env: Env): Promise<CategoriaCustoOperacional[]> {
  const client = getDataClient(env);
  return db.select<CategoriaCustoOperacional>(client, 'categorias_custo_operacional', {
    filters: { ativo: true },
    orderBy: { column: 'nome', ascending: true },
  });
}

export async function findCategoriaById(env: Env, id: string): Promise<CategoriaCustoOperacional | null> {
  const client = getDataClient(env);
  return db.findById<CategoriaCustoOperacional>(client, 'categorias_custo_operacional', id);
}

export async function createCategoria(
  env: Env,
  data: {
    nome: string;
    descricao?: string | null;
    local?: LocalCusto;
    ativo?: boolean;
  }
): Promise<CategoriaCustoOperacional> {
  const client = getDataClient(env);
  const local = data.local ?? 'comum';
  const ativo = data.ativo ?? true;
  const results = await db.insert<CategoriaCustoOperacional>(client, 'categorias_custo_operacional', {
    nome: data.nome,
    descricao: data.descricao ?? null,
    local,
    ativo,
  });
  return results[0];
}

export async function updateCategoria(
  env: Env,
  id: string,
  data: { nome?: string; descricao?: string | null; local?: LocalCusto; ativo?: boolean }
): Promise<CategoriaCustoOperacional | null> {
  const client = getDataClient(env);
  const current = await findCategoriaById(env, id);
  if (!current) return null;

  const updateData: Partial<CategoriaCustoOperacional> = {};
  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.descricao !== undefined) updateData.descricao = data.descricao ?? null;
  if (data.local !== undefined) updateData.local = data.local;
  if (data.ativo !== undefined) updateData.ativo = data.ativo;

  return db.update<CategoriaCustoOperacional>(client, 'categorias_custo_operacional', id, updateData);
}

export async function removeCategoria(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    await db.remove(client, 'categorias_custo_operacional', id);
    return true;
  } catch (error) {
    return false;
  }
}

export async function listCustosByPeriodo(
  env: Env,
  ano: number,
  mes: number
): Promise<CustoOperacionalComCategoria[]> {
  const client = getDataClient(env);
  // Buscar custos do período
  const custos = await db.select<CustoOperacional & { valor_planejado: string; valor_realizado: string | null }>(
    client,
    'custos_operacionais',
    {
      filters: { ano, mes },
    }
  );

  // Buscar categorias relacionadas
  const categoriaIds = [...new Set(custos.map((c) => c.categoria_id))];
  const categorias = await db.select<CategoriaCustoOperacional>(client, 'categorias_custo_operacional', {
    filters: { id: categoriaIds },
  });

  const categoriasMap = new Map(categorias.map((c) => [c.id, c]));

  // Combinar dados
  return custos.map((c) => {
    const cat = categoriasMap.get(c.categoria_id);
    return {
      ...c,
      valor_planejado: Number(c.valor_planejado),
      valor_realizado: c.valor_realizado != null ? Number(c.valor_realizado) : null,
      categoria_nome: cat?.nome,
      categoria_local: cat?.local,
    };
  }).sort((a, b) => (a.categoria_nome || '').localeCompare(b.categoria_nome || ''));
}

export async function getOrCreateCusto(
  env: Env,
  categoriaId: string,
  ano: number,
  mes: number
): Promise<CustoOperacional> {
  const client = getDataClient(env);
  const existing = await db.select<CustoOperacional & { valor_planejado: string; valor_realizado: string | null }>(
    client,
    'custos_operacionais',
    {
      filters: { categoria_id: categoriaId, ano, mes },
      limit: 1,
    }
  );

  if (existing.length > 0) {
    return {
      ...existing[0],
      valor_planejado: Number(existing[0].valor_planejado),
      valor_realizado: existing[0].valor_realizado != null ? Number(existing[0].valor_realizado) : null,
    };
  }

  const inserted = await db.insert<CustoOperacional & { valor_planejado: string; valor_realizado: string | null }>(
    client,
    'custos_operacionais',
    {
      categoria_id: categoriaId,
      ano,
      mes,
      valor_planejado: 0,
    } as any
  );

  return {
    ...inserted[0],
    valor_planejado: Number(inserted[0].valor_planejado),
    valor_realizado: inserted[0].valor_realizado != null ? Number(inserted[0].valor_realizado) : null,
  };
}

export async function upsertCustosMes(
  env: Env,
  ano: number,
  mes: number,
  itens: Array<{
    categoria_id: string;
    valor_planejado?: number;
    valor_realizado?: number | null;
    observacao?: string | null;
  }>
): Promise<CustoOperacionalComCategoria[]> {
  const client = getDataClient(env);

  for (const it of itens) {
    // Verificar se já existe
    const existing = await db.select<CustoOperacional>(
      client,
      'custos_operacionais',
      {
        filters: { categoria_id: it.categoria_id, ano, mes },
        limit: 1,
      }
    );

    if (existing.length > 0) {
      // Update
      const updateData: Partial<CustoOperacional> = {};
      if (it.valor_planejado !== undefined) updateData.valor_planejado = it.valor_planejado;
      if (it.valor_realizado !== undefined) updateData.valor_realizado = it.valor_realizado;
      if (it.observacao !== undefined) updateData.observacao = it.observacao ?? null;

      await db.update<CustoOperacional>(client, 'custos_operacionais', existing[0].id, updateData);
    } else {
      // Insert
      await db.insert<CustoOperacional>(client, 'custos_operacionais', {
        categoria_id: it.categoria_id,
        ano,
        mes,
        valor_planejado: it.valor_planejado ?? 0,
        valor_realizado: it.valor_realizado ?? null,
        observacao: it.observacao ?? null,
      });
    }
  }

  return listCustosByPeriodo(env, ano, mes);
}

export async function totalCustosMes(
  env: Env,
  ano: number,
  mes: number
): Promise<{ total_planejado: number; total_realizado: number | null }> {
  const client = getDataClient(env);
  const custos = await db.select<CustoOperacional & { valor_planejado: string; valor_realizado: string | null }>(
    client,
    'custos_operacionais',
    {
      filters: { ano, mes },
    }
  );

  let total_planejado = 0;
  let total_realizado = 0;
  let tem_realizado = false;

  for (const c of custos) {
    total_planejado += Number(c.valor_planejado);
    if (c.valor_realizado != null) {
      total_realizado += Number(c.valor_realizado);
      tem_realizado = true;
    }
  }

  return {
    total_planejado,
    total_realizado: tem_realizado ? total_realizado : null,
  };
}
