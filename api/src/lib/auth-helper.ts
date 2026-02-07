// Re-export from worker version for Cloudflare Workers compatibility
// This file now uses the Worker-compatible version
export { getSupabaseClient, requireAuth } from './auth-helper.worker.js';
