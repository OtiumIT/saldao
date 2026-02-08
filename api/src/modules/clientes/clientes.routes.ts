import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { clientesService } from './clientes.service.js';

type Ctx = { Bindings: Env };

const createSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  fone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  endereco_entrega: z.string().optional(),
  tipo: z.enum(['externo', 'loja']).optional().default('externo'),
  observacoes: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const clientesRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    try {
      const list = await clientesService.list(c.env);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar clientes' }, 500);
    }
  })
  .get('/loja', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const loja = await clientesService.findLoja(c.env);
    if (!loja) return c.json({ error: 'Cliente Loja não cadastrado' }, 404);
    return c.json(loja);
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const cliente = await clientesService.findById(c.env, id);
    if (!cliente) return c.json({ error: 'Cliente não encontrado' }, 404);
    return c.json(cliente);
  })
  .post('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const created = await clientesService.create(c.env, parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar cliente' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const updated = await clientesService.update(c.env, id, parsed.data);
      if (!updated) return c.json({ error: 'Cliente não encontrado' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar cliente' }, 500);
    }
  })
  .delete('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const ok = await clientesService.remove(c.env, id);
      if (!ok) return c.json({ error: 'Cliente não encontrado' }, 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao excluir cliente' }, 500);
    }
  });
