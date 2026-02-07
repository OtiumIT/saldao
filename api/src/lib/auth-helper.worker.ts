import { createClient } from '@supabase/supabase-js';
import type { Context } from 'hono';
import type { Env } from '../types/worker-env.js';
import { getEnv } from '../config/env.worker.js';
import { getFixedProfileFromToken, isFixedAuthEnabled } from './fixed-auth.js';

// Função para obter o cliente Supabase (lazy initialization) para Workers
// Quando FIXED_AUTH=true, Supabase não é usado para auth.
export function getSupabaseClient(env: Env) {
  const envConfig = getEnv(env);
  const key = envConfig.supabase.serviceRoleKey;
  if (!key || key.trim() === '') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não está configurada. Use a SERVICE ROLE KEY (não a anon key) ou ative FIXED_AUTH=true.');
  }
  
  // Verificar se não é anon key (anon key geralmente tem "anon" no payload JWT)
  // Service role key tem "service_role" no payload
  try {
    // Decodificar JWT para verificar o role (sem verificar assinatura)
    const parts = key.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.role === 'anon') {
        throw new Error('ERRO: Você está usando ANON KEY ao invés de SERVICE ROLE KEY. Configure SUPABASE_SERVICE_ROLE_KEY com a service role key no Cloudflare Workers.');
      }
      if (payload.role !== 'service_role') {
        console.warn('⚠️ A chave pode não ser uma service role key válida. Role encontrado:', payload.role);
      }
    }
  } catch (e) {
    // Se não conseguir decodificar, apenas logar warning mas continuar
    console.warn('Não foi possível validar o formato da service role key:', e instanceof Error ? e.message : String(e));
  }
  
  return createClient(envConfig.supabase.url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Middleware para verificar autenticação (Workers version)
export async function requireAuth(c: Context<{ Bindings: Env }>) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token não fornecido' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  // Autenticação fixa (JWT) – tenta primeiro quando habilitada
  if (isFixedAuthEnabled(c.env)) {
    const profile = getFixedProfileFromToken(c.env, token);
    if (profile) {
      return { user: { id: profile.user_id }, profile, supabase: null };
    }
    return c.json({ error: 'Token inválido' }, 401);
  }

  const supabase = getSupabaseClient(c.env);
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return c.json({ error: 'Token inválido' }, 401);
  }

  // Buscar perfil do usuário (tentar usar função RPC, se não existir, usar query direta)
  let profile = null;
  
  try {
    const { data: profileData, error: rpcError } = await supabase.rpc('get_profile_by_user_id', {
      target_user_id: user.id
    });
    
    if (!rpcError && profileData && profileData.length > 0) {
      profile = profileData[0];
    }
  } catch (err) {
    // Função RPC não existe, usar query direta
  }
  
  // Se não encontrou via RPC, tentar query direta
  if (!profile) {
    const { data: profileData, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (queryError || !profileData) {
      // Tentar pelo email como fallback
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email?.toLowerCase() || '')
        .maybeSingle();
      
      if (profileByEmail) {
        profile = profileByEmail;
      }
    } else {
      profile = profileData;
    }
  }

  if (!profile) {
    return c.json({ error: 'Perfil não encontrado' }, 404);
  }

  return { user, profile, supabase };
}
