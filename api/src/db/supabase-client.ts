/**
 * Cliente Supabase para Data API (sem policies - usando service role key)
 * Substitui o Pool do pg por chamadas à REST API do Supabase
 */
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types/worker-env.js';
import { getEnv } from '../config/env.worker.js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Obtém o cliente Supabase configurado com service role key (bypassa RLS)
 */
export function getSupabaseDataClient(env: Env) {
  if (supabaseClient) {
    return supabaseClient;
  }

  const envConfig = getEnv(env);
  
  if (!envConfig.supabase.url || !envConfig.supabase.serviceRoleKey) {
    throw new Error(
      'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para usar Data API. ' +
      'Configure essas variáveis de ambiente.'
    );
  }

  // Service role key bypassa todas as policies (RLS)
  supabaseClient = createClient(envConfig.supabase.url, envConfig.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * Reseta o cliente (útil para testes ou mudança de configuração)
 */
export function resetSupabaseClient() {
  supabaseClient = null;
}
