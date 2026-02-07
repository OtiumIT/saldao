import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { coresService } from './cores.service.js';

type Ctx = { Bindings: Env };

const createCorSchema = z.object({
  nome: z.string().min(1).max(100),
  codigo: z.string().max(20).nullable().optional(),
});

const updateCorSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  codigo: z.string().max(20).nullable().optional(),
});

export const coresRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    try {
      const list = await coresService.list();
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar cores' }, 500);
    }
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const cor = await coresService.findById(id);
    if (!cor) return c.json({ error: 'Cor não encontrada' }, 404);
    return c.json(cor);
  })
  .post('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = createCorSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const created = await coresService.create(parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar cor' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateCorSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const updated = await coresService.update(id, parsed.data);
    if (!updated) return c.json({ error: 'Cor não encontrada' }, 404);
    return c.json(updated);
  })
  .delete('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const ok = await coresService.remove(id);
    if (!ok) return c.json({ error: 'Cor não encontrada' }, 404);
    return new Response(null, { status: 204 });
  });
