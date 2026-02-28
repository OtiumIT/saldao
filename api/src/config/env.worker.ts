/**
 * Validates and exports environment variables for Cloudflare Workers
 * This ensures all required environment variables are present at startup
 */
import type { Env } from '../types/worker-env.js';

export interface EnvConfig {
  supabase: {
    url: string;
    serviceRoleKey: string;
  };
  fixedAuth: {
    enabled: boolean;
    email: string;
    password: string;
    jwtSecret: string;
  };
  openai: {
    apiKey: string;
  };
  googleMaps: {
    apiKey: string;
    enderecoOrigemLoja: string;
  };
  email: {
    gmailUser: string;
    gmailAppPassword: string;
    contactEmail?: string;
    sendConfirmation: boolean;
  };
  server: {
    corsOrigin: string;
    frontendUrl: string;
  };
  /** Plano da conta: standard | pro. Usado para limites de usuários e clientes. */
  planId: 'standard' | 'pro';
}

function getRequiredEnv(env: Env, key: keyof Env): string {
  const value = env[key];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Please check your Cloudflare Workers environment variables.`
    );
  }
  return value.trim();
}

function getOptionalEnv(env: Env, key: keyof Env, defaultValue: string): string {
  const value = env[key];
  if (typeof value === 'string' && value) {
    return value;
  }
  return defaultValue;
}

function getOptionalBooleanEnv(env: Env, key: keyof Env, defaultValue: boolean): boolean {
  const value = env[key];
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return defaultValue;
}

export function getEnv(env: Env): EnvConfig {
  const fixedAuthEnabled = getOptionalBooleanEnv(env, 'FIXED_AUTH', false);
  try {
    return {
      supabase: {
        url: fixedAuthEnabled ? getOptionalEnv(env, 'SUPABASE_URL', '') : getRequiredEnv(env, 'SUPABASE_URL'),
        serviceRoleKey: fixedAuthEnabled ? getOptionalEnv(env, 'SUPABASE_SERVICE_ROLE_KEY', '') : getRequiredEnv(env, 'SUPABASE_SERVICE_ROLE_KEY'),
      },
      fixedAuth: {
        enabled: fixedAuthEnabled,
        email: getOptionalEnv(env, 'FIXED_AUTH_EMAIL', 'admin@saldao.local'),
        password: getOptionalEnv(env, 'FIXED_AUTH_PASSWORD', 'senha123'),
        jwtSecret: getOptionalEnv(env, 'JWT_SECRET', 'saldao-jwt-secret-change-in-production'),
      },
      openai: {
        apiKey: getOptionalEnv(env, 'OPENAI_API_KEY', ''),
      },
      googleMaps: {
        apiKey: getOptionalEnv(env, 'GOOGLE_MAPS_API_KEY', ''),
        enderecoOrigemLoja: getOptionalEnv(env, 'ENDERECO_ORIGEM_LOJA', ''),
      },
      email: {
        gmailUser: getOptionalEnv(env, 'GMAIL_USER', ''),
        gmailAppPassword: getOptionalEnv(env, 'GMAIL_APP_PASSWORD', ''),
        contactEmail: typeof env.CONTACT_EMAIL === 'string' ? env.CONTACT_EMAIL : undefined,
        sendConfirmation: getOptionalBooleanEnv(env, 'SEND_CONFIRMATION_EMAIL', false),
      },
      server: {
        corsOrigin: getOptionalEnv(env, 'CORS_ORIGIN', 'https://your-frontend-domain.pages.dev'),
        frontendUrl: getOptionalEnv(env, 'FRONTEND_URL', 'https://your-frontend-domain.pages.dev'),
      },
      planId: (() => {
        const v = (env.PLANO ?? '').toLowerCase().trim();
        return v === 'standard' ? 'standard' : 'pro';
      })(),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Environment validation failed:', error.message);
      console.error('Please check your Cloudflare Workers environment variables');
    }
    throw error;
  }
}
