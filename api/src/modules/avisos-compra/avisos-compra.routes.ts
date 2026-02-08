import { Hono } from 'hono';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { avisosCompraService } from './avisos-compra.service.js';

type Ctx = { Bindings: Env };

export const avisosCompraRoutes = new Hono<Ctx>().get('/', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;
  try {
    const list = await avisosCompraService.listAbaixoMinimo(c.env);
    return c.json(list);
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar avisos' }, 500);
  }
});
