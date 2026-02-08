import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './avisos-compra.repository.js';
import * as repoSupabase from './avisos-compra.repository.supabase.js';

export const avisosCompraService = {
  listAbaixoMinimo: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listAbaixoMinimo(env);
    }
    return repo.listAbaixoMinimo();
  },
};
