// Re-export from worker version for Cloudflare Workers compatibility
// This file now uses the Worker-compatible version
export { getEnv } from './env.worker.js';
export type { EnvConfig } from './env.worker.js';

// For backwards compatibility, export env as a getter that throws
// Routes should be updated to use getEnv(c.env) instead
export const env = new Proxy({} as ReturnType<typeof import('./env.worker.js').getEnv>, {
  get() {
    throw new Error(
      'Direct access to env is not supported in Cloudflare Workers. ' +
      'Use getEnv(c.env) from the route context instead.'
    );
  }
});
