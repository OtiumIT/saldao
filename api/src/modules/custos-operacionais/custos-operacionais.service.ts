import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './custos-operacionais.repository.js';
import * as repoSupabase from './custos-operacionais.repository.supabase.js';

export const custosOperacionaisService = {
  listCategorias: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listCategorias(env);
    }
    return repo.listCategorias();
  },
  listCategoriasAtivas: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listCategoriasAtivas(env);
    }
    return repo.listCategoriasAtivas();
  },
  findCategoriaById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findCategoriaById(env, id);
    }
    return repo.findCategoriaById(id);
  },
  createCategoria: (env: Env, data: Parameters<typeof repo.createCategoria>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createCategoria(env, data);
    }
    return repo.createCategoria(data);
  },
  updateCategoria: (env: Env, id: string, data: Parameters<typeof repo.updateCategoria>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.updateCategoria(env, id, data);
    }
    return repo.updateCategoria(id, data);
  },
  removeCategoria: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.removeCategoria(env, id);
    }
    return repo.removeCategoria(id);
  },
  listCustosByPeriodo: (env: Env, ano: number, mes: number) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listCustosByPeriodo(env, ano, mes);
    }
    return repo.listCustosByPeriodo(ano, mes);
  },
  getOrCreateCusto: (env: Env, categoriaId: string, ano: number, mes: number) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getOrCreateCusto(env, categoriaId, ano, mes);
    }
    return repo.getOrCreateCusto(categoriaId, ano, mes);
  },
  upsertCustosMes: (env: Env, ano: number, mes: number, itens: Parameters<typeof repo.upsertCustosMes>[2]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.upsertCustosMes(env, ano, mes, itens);
    }
    return repo.upsertCustosMes(ano, mes, itens);
  },
  totalCustosMes: (env: Env, ano: number, mes: number) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.totalCustosMes(env, ano, mes);
    }
    return repo.totalCustosMes(ano, mes);
  },
};
