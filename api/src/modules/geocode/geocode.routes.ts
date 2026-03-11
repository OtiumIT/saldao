import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { geocodeBatch } from './geocode.service.js';

type Ctx = { Bindings: Env };

const geocodeSchema = z.object({
  addresses: z.array(z.string().min(1)).max(50),
});

export const geocodeRoutes = new Hono<Ctx>().post('/', async (c) => {
  const auth = await requireAuth(c);
  if (auth instanceof Response) return auth;

  const body = await c.req.json();
  const parsed = geocodeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
  }

  try {
    const results = await geocodeBatch(parsed.data.addresses);
    return c.json({ results });
  } catch (e) {
    return c.json(
      { error: e instanceof Error ? e.message : 'Erro ao geocodificar' },
      500
    );
  }
});
