/**
 * Type definitions for Cloudflare Workers environment variables
 */
export interface Env {
  // Supabase (opcional quando FIXED_AUTH=true)
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  // Usar Supabase Data API em vez de PostgreSQL direto
  USE_SUPABASE_DATA_API?: string;

  // Autenticação fixa (por hora, sem Supabase)
  FIXED_AUTH?: string;
  FIXED_AUTH_EMAIL?: string;
  FIXED_AUTH_PASSWORD?: string;
  JWT_SECRET?: string;

  // PostgreSQL local
  DATABASE_URL?: string;
  
  // OpenAI
  OPENAI_API_KEY?: string;

  // Google Maps (distância para frete)
  GOOGLE_MAPS_API_KEY?: string;
  /** Endereço da loja (origem para cálculo de distância) */
  ENDERECO_ORIGEM_LOJA?: string;
  
  // Email (Gmail)
  GMAIL_USER: string;
  GMAIL_APP_PASSWORD: string;
  CONTACT_EMAIL?: string;
  SEND_CONFIRMATION_EMAIL?: string;
  
  // Server config
  CORS_ORIGIN?: string;
  FRONTEND_URL?: string;

  /** Plano da conta: standard (até 3 usuários, 5 clientes) ou pro (15 usuários, 50 clientes). Default: pro */
  PLANO?: string;
  
  // KV Namespaces (opcional, para rate limiting)
  RATE_LIMIT?: KVNamespace;
  
  // Email Workers (opcional, se usar Cloudflare Email Workers)
  EMAIL_WORKER?: string;

  // Hyperdrive (PostgreSQL no Workers) — binding com .connectionString
  HYPERDRIVE?: HyperdriveBinding;
}

export interface HyperdriveBinding {
  connectionString: string;
}
