import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './cores.repository.js';
import * as repoSupabase from './cores.repository.supabase.js';

export const coresService = {
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
};
