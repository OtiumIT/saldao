import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './produtos.repository.js';
import * as repoSupabase from './produtos.repository.supabase.js';
import type { FiltrosProduto } from './produtos.repository.js';

export const produtosService = {
  list: (env: Env, filtros?: FiltrosProduto) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.list(env, filtros);
    }
    return repo.list(filtros);
  },
  listComSaldos: (env: Env, filtros?: FiltrosProduto) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listComSaldos(env, filtros);
    }
    return repo.listComSaldos(filtros);
  },
  findById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findById(env, id);
    }
    return repo.findById(id);
  },
  findByCodigo: (env: Env, codigo: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findByCodigo(env, codigo);
    }
    return repo.findByCodigo(codigo);
  },
  create: (env: Env, data: Parameters<typeof repo.create>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.create(env, data);
    }
    return repo.create(data);
  },
  update: (env: Env, id: string, data: Parameters<typeof repo.update>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.update(env, id, data);
    }
    return repo.update(id, data);
  },
  remove: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.remove(env, id);
    }
    return repo.remove(id);
  },
  createMany: (env: Env, items: Parameters<typeof repo.createMany>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createMany(env, items);
    }
    return repo.createMany(items);
  },
  getSugestaoEstoque: (env: Env, produtoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getSugestaoEstoque(env, produtoId);
    }
    return repo.getSugestaoEstoque(produtoId);
  },
  getSaldosPorCor: (env: Env, produtoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getSaldosPorCor(env, produtoId);
    }
    return repo.getSaldosPorCor(produtoId);
  },
};
