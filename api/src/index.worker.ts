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

let poolInitialized = false;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (env.HYPERDRIVE?.connectionString && !poolInitialized) {
      const pool = new Pool({
        connectionString: env.HYPERDRIVE.connectionString,
        max: 1,
      });
      setWorkerPool(pool);
      poolInitialized = true;
    }
    return app.fetch(request, env, ctx);
  },
};
