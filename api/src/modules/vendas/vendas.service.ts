import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './vendas.repository.js';
import * as repoSupabase from './vendas.repository.supabase.js';

export const vendasService = {
  list: (env: Env, filtros?: Parameters<typeof repo.list>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.list(env, filtros);
    }
    return repo.list(filtros);
  },
  findById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findById(env, id);
    }
    return repo.findById(id);
  },
  listItens: (env: Env, pedidoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listItens(env, pedidoId);
    }
    return repo.listItens(pedidoId);
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
  confirmar: (env: Env, id: string, options?: Parameters<typeof repo.confirmar>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.confirmar(env, id, options);
    }
    return repo.confirmar(id, options);
  },
  marcarEntregue: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.marcarEntregue(env, id);
    }
    return repo.marcarEntregue(id);
  },
  getPrecoSugerido: (env: Env, produtoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getPrecoSugerido(env, produtoId);
    }
    return repo.getPrecoSugerido(produtoId);
  },
  getItensSugeridos: (env: Env, produtoId: string, limit?: number) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getItensSugeridos(env, produtoId, limit);
    }
    return repo.getItensSugeridos(produtoId, limit);
  },
};
