/**
 * Configuração do modo de acesso ao banco de dados
 * USE_SUPABASE_DATA_API=true: usa Supabase Data API (REST)
 * USE_SUPABASE_DATA_API=false ou não definido: usa PostgreSQL direto (pg)
 */
import type { Env } from '../types/worker-env.js';

export function useSupabaseDataAPI(env: Env): boolean {
  // Verifica variável de ambiente
  const useDataAPI = env.USE_SUPABASE_DATA_API;
  
  if (typeof useDataAPI === 'string') {
    return useDataAPI.toLowerCase() === 'true';
  }
  
  // Se não definido, verifica se tem SUPABASE_URL e SERVICE_ROLE_KEY
  // Se tiver ambos, assume que quer usar Data API
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    // Por padrão, usa Data API se Supabase estiver configurado
    return true;
  }
  
  return false;
}
