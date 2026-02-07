import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './types/worker-env.js';

import { getEnv } from './config/env.worker.js';

import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { usersRoutes } from './routes/users.routes.js';

type WorkerContext = {
  Bindings: Env;
};

const app = new Hono<WorkerContext>();

app.use('*', logger());

app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));

app.use('*', async (c, next) => {
  try {
    const env = getEnv(c.env);
    return cors({
      origin: env.server.corsOrigin,
      credentials: true,
    })(c, next);
  } catch {
    return cors({
      origin: '*',
      credentials: true,
    })(c, next);
  }
});

app.use('*', async (_c, next) => next());

app.use('/api/auth/*', async (_c, next) => next());

app.route('/health', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/users', usersRoutes);

app.get('/', (c) => {
  return c.json({
    message: 'API Saldão de Móveis Jerusalém',
    version: '1.0.0',
    status: 'running',
    platform: 'cloudflare-workers',
  });
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
