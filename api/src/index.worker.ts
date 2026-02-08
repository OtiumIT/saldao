import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { Pool } from 'pg';
import type { Env } from './types/worker-env.js';
import { getEnv } from './config/env.worker.js';
import { setWorkerPool } from './db/client.js';

import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { usersRoutes } from './routes/users.routes.js';
import { clientesRoutes } from './modules/clientes/clientes.routes.js';
import { fornecedoresRoutes } from './modules/fornecedores/fornecedores.routes.js';
import { produtosRoutes } from './modules/estoque/produtos.routes.js';
import { movimentacoesRoutes } from './modules/estoque/movimentacoes.routes.js';
import { comprasRoutes } from './modules/compras/compras.routes.js';
import { avisosCompraRoutes } from './modules/avisos-compra/avisos-compra.routes.js';
import { producaoRoutes } from './modules/producao/producao.routes.js';
import { vendasRoutes } from './modules/vendas/vendas.routes.js';
import { financeiroRoutes } from './modules/financeiro/financeiro.routes.js';
import { roteirizacaoRoutes } from './modules/roteirizacao/roteirizacao.routes.js';
import { custosOperacionaisRoutes } from './modules/custos-operacionais/custos-operacionais.routes.js';
import { categoriasProdutoRoutes } from './modules/categorias-produto/categorias-produto.routes.js';
import { funcionariosRoutes } from './modules/funcionarios/funcionarios.routes.js';
import { coresRoutes } from './modules/cores/cores.routes.js';

type WorkerContext = {
  Bindings: Env;
};

const ALLOWED_ORIGIN = 'https://gestao.saldaomoveisjerusalem.com.br';

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

const app = new Hono<WorkerContext>();

// Garante CORS em toda resposta (Response.headers é read-only, criamos nova Response)
app.use('*', async (c, next) => {
  await next();
  const origin = c.env.CORS_ORIGIN || ALLOWED_ORIGIN;
  const res = c.res;
  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
});

app.use('*', logger());
app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));

app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    const origin = c.env.CORS_ORIGIN || ALLOWED_ORIGIN;
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(origin),
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  try {
    const env = getEnv(c.env);
    return cors({
      origin: env.server.corsOrigin,
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    })(c, next);
  } catch {
    return cors({
      origin: ALLOWED_ORIGIN,
      credentials: true,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    })(c, next);
  }
});

app.route('/health', healthRoutes);
app.route('/api/auth', authRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/clientes', clientesRoutes);
app.route('/api/fornecedores', fornecedoresRoutes);
app.route('/api/produtos', produtosRoutes);
app.route('/api/categorias-produto', categoriasProdutoRoutes);
app.route('/api/movimentacoes-estoque', movimentacoesRoutes);
app.route('/api/compras', comprasRoutes);
app.route('/api/avisos-compra', avisosCompraRoutes);
app.route('/api/producao', producaoRoutes);
app.route('/api/vendas', vendasRoutes);
app.route('/api/financeiro', financeiroRoutes);
app.route('/api/roteirizacao', roteirizacaoRoutes);
app.route('/api/custos-operacionais', custosOperacionaisRoutes);
app.route('/api/funcionarios', funcionariosRoutes);
app.route('/api/cores', coresRoutes);

app.get('/', (c) => {
  return c.json({
    message: 'API Saldão de Móveis Jerusalém',
    version: '1.0.0',
    status: 'running',
    platform: 'cloudflare-workers',
  });
});

app.onError((err, c) => {
  const origin = c.env.CORS_ORIGIN || ALLOWED_ORIGIN;
  const res = c.json({ error: err.message || 'Internal Server Error' }, 500);
  const headers = new Headers(res.headers);
  Object.entries(corsHeaders(origin)).forEach(([k, v]) => headers.set(k, v));
  return new Response(res.body, { status: res.status, headers });
});

let poolInitialized = false;

function corsErrorResponse(origin: string, message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = env.CORS_ORIGIN || ALLOWED_ORIGIN;
    try {
      if (env.HYPERDRIVE?.connectionString && !poolInitialized) {
        const pool = new Pool({
          connectionString: env.HYPERDRIVE.connectionString,
          max: 1,
        });
        setWorkerPool(pool);
        poolInitialized = true;
      }
      const res = await app.fetch(request, env, ctx).catch((err) => {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return corsErrorResponse(origin, message);
      });
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return corsErrorResponse(origin, message);
    }
  },
};
