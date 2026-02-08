/**
 * Helpers para converter queries SQL em chamadas à Data API do Supabase
 * Abstrai operações comuns: SELECT, INSERT, UPDATE, DELETE
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface QueryOptions {
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

/**
 * Executa SELECT usando Data API
 * Suporta JOINs através do select (ex: "*, tabela_relacionada(*)")
 */
export async function select<T>(
  client: SupabaseClient,
  table: string,
  options: QueryOptions = {}
): Promise<T[]> {
  // Se select não foi especificado, usa '*' ou permite JOINs
  const selectClause = options.select || '*';
  
  let query = client.from(table).select(selectClause);

  // Aplicar filtros
  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value === null) {
        query = query.is(key, null);
      } else if (value === undefined) {
        // Ignora undefined
        continue;
      } else if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (typeof value === 'string' && value.includes('%')) {
        query = query.like(key, value);
      } else if (typeof value === 'string' && (value.startsWith('<') || value.startsWith('>') || value.startsWith('<=') || value.startsWith('>='))) {
        // Suporte para operadores de comparação
        if (value.startsWith('<=')) {
          const numValue = parseFloat(value.substring(2));
          query = query.lte(key, numValue);
        } else if (value.startsWith('>=')) {
          const numValue = parseFloat(value.substring(2));
          query = query.gte(key, numValue);
        } else if (value.startsWith('<')) {
          const numValue = parseFloat(value.substring(1));
          query = query.lt(key, numValue);
        } else if (value.startsWith('>')) {
          const numValue = parseFloat(value.substring(1));
          query = query.gt(key, numValue);
        } else {
          query = query.eq(key, value);
        }
      } else {
        query = query.eq(key, value);
      }
    }
  }

  // Ordenação
  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  // Limite e offset
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 1000) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase query error: ${error.message}`);
  }

  return (data || []) as T[];
}

/**
 * Executa SELECT com COUNT
 */
export async function selectWithCount<T>(
  client: SupabaseClient,
  table: string,
  options: QueryOptions = {}
): Promise<{ data: T[]; count: number }> {
  let query = client.from(table).select(options.select || '*', { count: 'exact', head: false });

  // Aplicar filtros (mesma lógica do select)
  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value === null) {
        query = query.is(key, null);
      } else if (value === undefined) {
        continue;
      } else if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (typeof value === 'string' && value.includes('%')) {
        query = query.like(key, value);
      } else {
        query = query.eq(key, value);
      }
    }
  }

  // Ordenação
  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  // Limite e offset
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 1000) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Supabase query error: ${error.message}`);
  }

  return {
    data: (data || []) as T[],
    count: count || 0,
  };
}

/**
 * Executa INSERT
 */
export async function insert<T>(
  client: SupabaseClient,
  table: string,
  data: Partial<T> | Partial<T>[]
): Promise<T[]> {
  const { data: result, error } = await client.from(table).insert(data).select();

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }

  return (result || []) as T[];
}

/**
 * Executa UPDATE
 */
export async function update<T>(
  client: SupabaseClient,
  table: string,
  id: string,
  data: Partial<T>
): Promise<T | null> {
  const { data: result, error } = await client
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase update error: ${error.message}`);
  }

  return result as T | null;
}

/**
 * Executa DELETE
 */
export async function remove(
  client: SupabaseClient,
  table: string,
  id: string
): Promise<void> {
  const { error } = await client.from(table).delete().eq('id', id);

  if (error) {
    throw new Error(`Supabase delete error: ${error.message}`);
  }
}

/**
 * Executa SELECT por ID
 */
export async function findById<T>(
  client: SupabaseClient,
  table: string,
  id: string
): Promise<T | null> {
  const { data, error } = await client.from(table).select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Não encontrado
      return null;
    }
    throw new Error(`Supabase findById error: ${error.message}`);
  }

  return data as T | null;
}

/**
 * Executa RPC (função/stored procedure)
 */
export async function rpc<T>(
  client: SupabaseClient,
  functionName: string,
  params?: Record<string, unknown>
): Promise<T> {
  const { data, error } = await client.rpc(functionName, params || {});

  if (error) {
    throw new Error(`Supabase RPC error: ${error.message}`);
  }

  return data as T;
}
