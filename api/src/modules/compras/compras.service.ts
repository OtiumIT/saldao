import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './compras.repository.js';
import * as repoSupabase from './compras.repository.supabase.js';

export const comprasService = {
  list: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.list(env);
    }
    return repo.list();
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
  createPedido: (env: Env, data: Parameters<typeof repo.createPedido>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createPedido(env, data);
    }
    return repo.createPedido(data);
  },
  updatePedido: (env: Env, id: string, data: Parameters<typeof repo.updatePedido>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.updatePedido(env, id, data);
    }
    return repo.updatePedido(id, data);
  },
  receber: (env: Env, id: string, itens: Parameters<typeof repo.receber>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.receber(env, id, itens);
    }
    return repo.receber(id, itens);
  },
  getUltimosPrecos: (env: Env, fornecedorId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getUltimosPrecos(env, fornecedorId);
    }
    return repo.getUltimosPrecos(fornecedorId);
  },
};
