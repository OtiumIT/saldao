import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './producao.repository.js';
import * as repoSupabase from './producao.repository.supabase.js';

export const producaoService = {
  listBomByFabricado: (env: Env, produtoFabricadoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listBomByFabricado(env, produtoFabricadoId);
    }
    return repo.listBomByFabricado(produtoFabricadoId);
  },
  saveBomItem: (env: Env, data: Parameters<typeof repo.saveBomItem>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.saveBomItem(env, data);
    }
    return repo.saveBomItem(data);
  },
  removeBomItem: (env: Env, produtoFabricadoId: string, produtoInsumoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.removeBomItem(env, produtoFabricadoId, produtoInsumoId);
    }
    return repo.removeBomItem(produtoFabricadoId, produtoInsumoId);
  },
  quantidadePossivel: (env: Env, produtoFabricadoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.quantidadePossivel(env, produtoFabricadoId);
    }
    return repo.quantidadePossivel(produtoFabricadoId);
  },
  listOrdens: (env: Env, filtros?: Parameters<typeof repo.listOrdens>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listOrdens(env, filtros);
    }
    return repo.listOrdens(filtros);
  },
  listOrdensItens: (env: Env, ordemId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listOrdensItens(env, ordemId);
    }
    return repo.listOrdensItens(ordemId);
  },
  createOrdem: (env: Env, data: Parameters<typeof repo.createOrdem>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createOrdem(env, data);
    }
    return repo.createOrdem(data);
  },
  executarOrdem: (env: Env, ordemId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.executarOrdem(env, ordemId);
    }
    return repo.executarOrdem(ordemId);
  },
  conferirEstoquePorCor: (env: Env, params: Parameters<typeof repo.conferirEstoquePorCor>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.conferirEstoquePorCor(env, params);
    }
    return repo.conferirEstoquePorCor(params);
  },
};
