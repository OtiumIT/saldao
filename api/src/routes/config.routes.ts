import { Hono } from 'hono';
import type { Env } from '../types/worker-env.js';
import { requireAuth } from '../lib/auth-helper.worker.js';
import { getEnv } from '../config/env.worker.js';
import { getPlanLimits } from '../lib/planos.js';

type WorkerContext = { Bindings: Env };

export const configRoutes = new Hono<WorkerContext>().get('/plan', async (c) => {
  const authResult = await requireAuth(c);
  if (authResult instanceof Response) return authResult;

  const envConfig = getEnv(c.env);
  const limits = getPlanLimits(envConfig.planId);
  return c.json({
    planId: envConfig.planId,
    maxUsuarios: limits.maxUsuarios,
    maxClientesAtivos: limits.maxClientesAtivos,
  });
});
