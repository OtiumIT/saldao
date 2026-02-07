import './load-env.js';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { serve } from '@hono/node-server';
import { rateLimiter } from 'hono-rate-limiter';
import type { Env } from './types/worker-env.js';
import { getEnv } from './config/env.worker.js';

const nodeEnv: Env = {
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  FIXED_AUTH: process.env.FIXED_AUTH,
  FIXED_AUTH_EMAIL: process.env.FIXED_AUTH_EMAIL,
  FIXED_AUTH_PASSWORD: process.env.FIXED_AUTH_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  GMAIL_USER: process.env.GMAIL_USER ?? '',
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ?? '',
  CONTACT_EMAIL: process.env.CONTACT_EMAIL,
  SEND_CONFIRMATION_EMAIL: process.env.SEND_CONFIRMATION_EMAIL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  FRONTEND_URL: process.env.FRONTEND_URL,
};

const serverConfig = getEnv(nodeEnv);
const PORT = Number(process.env.PORT) || 3055;

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

const app = new Hono();

app.use('*', logger());

app.use('*', secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));

app.use('*', cors({
  origin: (origin) => {
    const allowed = [
      serverConfig.server.corsOrigin,
      'http://localhost:5173',
      'http://localhost:4055',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4055',
    ].filter(Boolean);
    if (origin && allowed.includes(origin)) return origin;
    return serverConfig.server.corsOrigin;
  },
  credentials: true,
}));

app.use('*', rateLimiter({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
}));

app.use('/api/auth/*', rateLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
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
  });
});

import { logger as appLogger } from './lib/logger.js';

serve({
  fetch: (req, _env, ctx) => app.fetch(req, nodeEnv, ctx),
  port: PORT,
}, (info) => {
  appLogger.info(`Server started on port ${info.port}`);
  appLogger.info(`Health check: http://localhost:${info.port}/health`);
  appLogger.info(`API: http://localhost:${info.port}`);
});

export default app;
