/**
 * Abstração para Data API do Supabase
 * Funciona tanto em Workers quanto em Node.js
 * Usa service role key (bypassa todas as policies)
 */
import type { Env } from '../types/worker-env.js';
import { getSupabaseDataClient } from './supabase-client.js';
import * as queryHelpers from './supabase-query.js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Obtém o cliente Supabase para Data API
 * Funciona em Workers e Node.js
 */
export function getDataClient(env: Env): SupabaseClient {
  return getSupabaseDataClient(env);
}

/**
 * Helpers de query exportados
 */
export const db = {
  select: queryHelpers.select,
  selectWithCount: queryHelpers.selectWithCount,
  insert: queryHelpers.insert,
  update: queryHelpers.update,
  remove: queryHelpers.remove,
  findById: queryHelpers.findById,
  rpc: queryHelpers.rpc,
};
