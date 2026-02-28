import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './opcoes-entrega.repository.js';
import * as repoSupabase from './opcoes-entrega.repository.supabase.js';

export const opcoesEntregaService = {
  list: (env: Env) => {
    if (useSupabaseDataAPI(env)) return repoSupabase.list(env);
    return repo.list();
  },
  findById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) return repoSupabase.findById(env, id);
    return repo.findById(id);
  },
  create: (env: Env, data: repo.CreateOpcaoEntregaData) => {
    if (useSupabaseDataAPI(env)) return repoSupabase.create(env, data);
    return repo.create(data);
  },
  update: (env: Env, id: string, data: Partial<repo.CreateOpcaoEntregaData>) => {
    if (useSupabaseDataAPI(env)) return repoSupabase.update(env, id, data);
    return repo.update(id, data);
  },
  remove: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) return repoSupabase.remove(env, id);
    return repo.remove(id);
  },
  getConfig: (env: Env, chave: string) => {
    if (useSupabaseDataAPI(env)) return repoSupabase.getConfig(env, chave);
    return repo.getConfig(chave);
  },
  setConfig: (env: Env, chave: string, valor: string | null) => {
    if (useSupabaseDataAPI(env)) return repoSupabase.setConfig(env, chave, valor);
    return repo.setConfig(chave, valor);
  },
};
