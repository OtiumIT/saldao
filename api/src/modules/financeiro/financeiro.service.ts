import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './financeiro.repository.js';
import * as repoSupabase from './financeiro.repository.supabase.js';

export const financeiroService = {
  listContasPagar: (env: Env, filtros?: Parameters<typeof repo.listContasPagar>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listContasPagar(env, filtros);
    }
    return repo.listContasPagar(filtros);
  },
  listContasReceber: (env: Env, filtros?: Parameters<typeof repo.listContasReceber>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listContasReceber(env, filtros);
    }
    return repo.listContasReceber(filtros);
  },
  createContaPagar: (env: Env, data: Parameters<typeof repo.createContaPagar>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createContaPagar(env, data);
    }
    return repo.createContaPagar(data);
  },
  createContaReceber: (env: Env, data: Parameters<typeof repo.createContaReceber>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createContaReceber(env, data);
    }
    return repo.createContaReceber(data);
  },
  marcarPago: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.marcarPago(env, id);
    }
    return repo.marcarPago(id);
  },
  marcarRecebido: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.marcarRecebido(env, id);
    }
    return repo.marcarRecebido(id);
  },
  resumoFinanceiro: (env: Env, periodo: Parameters<typeof repo.resumoFinanceiro>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.resumoFinanceiro(env, periodo);
    }
    return repo.resumoFinanceiro(periodo);
  },
};
