/**
 * Type definitions for Cloudflare Workers environment variables
 */
export interface Env {
  // Supabase (opcional quando FIXED_AUTH=true)
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Autenticação fixa (por hora, sem Supabase)
  FIXED_AUTH?: string;
  FIXED_AUTH_EMAIL?: string;
  FIXED_AUTH_PASSWORD?: string;
  JWT_SECRET?: string;

  // PostgreSQL local
  DATABASE_URL?: string;
  
  // OpenAI
  OPENAI_API_KEY?: string;
  
  // Email (Gmail)
  GMAIL_USER: string;
  GMAIL_APP_PASSWORD: string;
  CONTACT_EMAIL?: string;
  SEND_CONFIRMATION_EMAIL?: string;
  
  // Server config
  CORS_ORIGIN?: string;
  FRONTEND_URL?: string;
  
  // KV Namespaces (opcional, para rate limiting)
  RATE_LIMIT?: KVNamespace;
  
  // Email Workers (opcional, se usar Cloudflare Email Workers)
  EMAIL_WORKER?: string;
}
