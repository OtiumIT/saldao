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

const app = new Hono<WorkerContext>();

app.use('*', logger());

// CORS configurado primeiro - valida origem da requisição
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigin = c.env.CORS_ORIGIN || ALLOWED_ORIGIN;
    const allowedOrigins = [
      allowedOrigin,
      'http://localhost:5173',
      'http://localhost:4055',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4055',
    ];
    
    if (!origin) {
      // Se não há Origin header (ex: mesma origem ou requisição direta), retorna a origem permitida
      return allowedOrigin;
    }
    
    // Verifica se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    
    // Retorna a origem permitida como fallback
    return allowedOrigin;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// secureHeaders aplicado após CORS para não interferir nos headers CORS
app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  // Não definir contentSecurityPolicy aqui para evitar conflitos com CORS
}));

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
  const allowedOrigin = c.env.CORS_ORIGIN || ALLOWED_ORIGIN;
  const requestOrigin = c.req.header('Origin');
  const origin = requestOrigin && (
    requestOrigin === allowedOrigin ||
    requestOrigin === 'http://localhost:5173' ||
    requestOrigin === 'http://localhost:4055'
  ) ? requestOrigin : allowedOrigin;
  
  const res = c.json({ error: err.message || 'Internal Server Error' }, 500);
  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(res.body, { status: res.status, headers });
});

let poolInitialized = false;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Inicializa pool do Hyperdrive se necessário
      if (env.HYPERDRIVE?.connectionString && !poolInitialized) {
        const pool = new Pool({
          connectionString: env.HYPERDRIVE.connectionString,
          max: 1,
        });
        setWorkerPool(pool);
        poolInitialized = true;
      }
      
      // Deixa o Hono lidar com tudo, incluindo CORS
      return await app.fetch(request, env, ctx);
    } catch (err) {
      // Fallback de erro com CORS garantido
      const allowedOrigin = env.CORS_ORIGIN || ALLOWED_ORIGIN;
      const requestOrigin = request.headers.get('Origin');
      const origin = requestOrigin && (
        requestOrigin === allowedOrigin ||
        requestOrigin === 'http://localhost:5173' ||
        requestOrigin === 'http://localhost:4055'
      ) ? requestOrigin : allowedOrigin;
      
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  },
};
