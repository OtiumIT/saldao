import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './parcelamento.repository.js';
import * as repoSupabase from './parcelamento.repository.supabase.js';

export const parcelamentoService = {
  list: (env: Env) =>
    useSupabaseDataAPI(env) ? repoSupabase.list(env) : repo.list(),
  findById: (env: Env, id: string) =>
    useSupabaseDataAPI(env) ? repoSupabase.findById(env, id) : repo.findById(id),
  findByParcelas: (env: Env, parcelas: number) =>
    useSupabaseDataAPI(env) ? repoSupabase.findByParcelas(env, parcelas) : repo.findByParcelas(parcelas),
  update: (env: Env, id: string, data: { taxa_percentual: number }) =>
    useSupabaseDataAPI(env) ? repoSupabase.update(env, id, data) : repo.update(id, data),
  updateByParcelas: (env: Env, parcelas: number, taxa_percentual: number) =>
    useSupabaseDataAPI(env)
      ? repoSupabase.updateByParcelas(env, parcelas, taxa_percentual)
      : repo.updateByParcelas(parcelas, taxa_percentual),
};
