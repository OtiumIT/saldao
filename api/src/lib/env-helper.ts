/**
 * Helper para detectar o ambiente e obter configuração apropriada
 * Funciona tanto para Node.js quanto para Cloudflare Workers
 */
import type { Env } from '../types/worker-env.js';
import { env as nodeEnv } from '../config/env.js';
import { getEnv as getWorkerEnv } from '../config/env.worker.js';

/**
 * Detecta se está rodando em Cloudflare Workers
 */
export function isCloudflareWorker(): boolean {
  // Workers não têm process.env da mesma forma
  // Verificamos se temos acesso a c.env através do contexto
  return typeof globalThis !== 'undefined' && 
         'caches' in globalThis && 
         typeof caches !== 'undefined';
}

/**
 * Obtém a configuração de ambiente baseado no runtime
 */
export function getEnvConfig(workerEnv?: Env) {
  if (workerEnv) {
    return getWorkerEnv(workerEnv);
  }
  // Fallback para Node.js
  return nodeEnv;
}
