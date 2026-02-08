import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Pool } from 'pg';
import type { Env } from './types/worker-env.js';
import { setWorkerPool, getPool } from './db/client.js';

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

// secureHeaders aplicado após CORS - não interfere nos headers CORS do Hono
// Mas vamos aplicar manualmente após garantir que CORS está presente
app.use('*', async (c, next) => {
  await next();
  // Adiciona secure headers sem remover os headers CORS existentes
  const headers = new Headers(c.res.headers);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return new Response(c.res.body, {
    status: c.res.status,
    statusText: c.res.statusText,
    headers,
  });
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

// Helper para criar resposta JSON com CORS
function jsonResponse(data: any, status = 200, origin: string): Response {
  return new Response(JSON.stringify(data), {
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

// Helper para obter origem permitida
function getAllowedOrigin(request: Request, env: Env): string {
  const allowedOrigin = env.CORS_ORIGIN || ALLOWED_ORIGIN;
  const requestOrigin = request.headers.get('Origin');
  
  if (!requestOrigin) {
    return allowedOrigin;
  }
  
  const allowedOrigins = [
    allowedOrigin,
    'http://localhost:5173',
    'http://localhost:4055',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4055',
  ];
  
  return allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigin;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = getAllowedOrigin(request, env);
    
    // Trata OPTIONS preflight diretamente aqui para garantir CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    try {
      // Inicializa pool do Hyperdrive - OBRIGATÓRIO no Workers
      if (!env.HYPERDRIVE?.connectionString) {
        console.error('HYPERDRIVE binding not found in env:', Object.keys(env));
        return jsonResponse({ 
          error: 'HYPERDRIVE binding not found',
          details: 'Check wrangler.toml configuration. HYPERDRIVE binding is required.',
          availableBindings: Object.keys(env).filter(k => k.includes('HYPER') || k.includes('DATABASE'))
        }, 500, origin);
      }
      
      let pool = getPool();
      
      // Se não há pool ou pool foi fechado, cria novo
      if (!pool || pool.ended) {
        try {
          console.log('Initializing database pool with Hyperdrive...', {
            connectionStringPrefix: env.HYPERDRIVE.connectionString.substring(0, 50) + '...',
            hasConnectionString: !!env.HYPERDRIVE.connectionString
          });
          
          pool = new Pool({
            connectionString: env.HYPERDRIVE.connectionString,
            max: 1,
            min: 0, // Permite fechar conexões quando idle
            // Configurações importantes para Workers
            statement_timeout: 20000, // 20 segundos (Workers tem limite de 30s CPU)
            query_timeout: 20000,
            connectionTimeoutMillis: 20000, // 20 segundos para Hyperdrive estabelecer conexão (aumentado para testar)
            idleTimeoutMillis: 30000,
            // SSL necessário para Hyperdrive
            ssl: {
              rejectUnauthorized: false,
            },
            // Configurações adicionais para melhorar estabilidade
            allowExitOnIdle: true,
          });
          
          // Tratamento de erros do pool
          pool.on('error', (err) => {
            console.error('Unexpected pool error:', err);
            // Reseta o pool para tentar reconectar na próxima requisição
            poolInitialized = false;
          });
          
          setWorkerPool(pool);
          poolInitialized = true;
          
          console.log('Pool initialized successfully');
        } catch (poolError) {
          console.error('Error initializing database pool:', poolError);
          poolInitialized = false;
          const errorDetails = poolError instanceof Error ? {
            message: poolError.message,
            name: poolError.name,
            stack: poolError.stack?.split('\n').slice(0, 3).join('\n')
          } : { error: String(poolError) };
          
          return jsonResponse({ 
            error: 'Database connection error', 
            details: errorDetails,
            connectionStringPrefix: env.HYPERDRIVE.connectionString.substring(0, 50) + '...'
          }, 500, origin);
        }
      }
      
      // Verifica se o pool está disponível
      if (!pool || pool.ended) {
        return jsonResponse({ 
          error: 'Database pool not available',
          details: 'Pool was closed or not initialized'
        }, 500, origin);
      }
      
      // Timeout wrapper para garantir que a requisição não trave
      const timeoutPromise = new Promise<Response>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout after 25 seconds'));
        }, 25000); // 25 segundos (antes do limite de 30s do Worker)
      });
      
      // Chama o app Hono com timeout
      const appPromise = app.fetch(request, env, ctx);
      const response = await Promise.race([appPromise, timeoutPromise]);
      
      // Garante que sempre retornamos JSON com CORS, mesmo se o Hono retornar algo inesperado
      if (!response || response instanceof Response === false) {
        return jsonResponse({ error: 'Invalid response from server' }, 500, origin);
      }
      
      // Se a resposta já tem headers CORS, retorna como está
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (corsHeader) {
        return response;
      }
      
      // Se não tem CORS, adiciona
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Credentials', 'true');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Garante Content-Type JSON se não estiver definido
      if (!headers.get('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      // Qualquer erro deve retornar JSON com CORS, nunca HTML
      console.error('Worker error:', err);
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      const details = err instanceof Error && err.stack ? err.stack.split('\n')[0] : undefined;
      
      return jsonResponse({ 
        error: message,
        ...(details && { details }),
      }, 500, origin);
    }
  },
};
