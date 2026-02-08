import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { categoriasProdutoService } from './categorias-produto.service.js';

type Ctx = { Bindings: Env };

const createSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
});

const updateSchema = createSchema.partial();

export const categoriasProdutoRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    try {
      const list = await categoriasProdutoService.list(c.env);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar categorias' }, 500);
    }
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const cat = await categoriasProdutoService.findById(c.env, id);
    if (!cat) return c.json({ error: 'Categoria não encontrada' }, 404);
    return c.json(cat);
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
      const created = await categoriasProdutoService.create(c.env, parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar categoria' }, 500);
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
      const updated = await categoriasProdutoService.update(c.env, id, parsed.data);
      if (!updated) return c.json({ error: 'Categoria não encontrada' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar categoria' }, 500);
    }
  })
  .delete('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const ok = await categoriasProdutoService.remove(c.env, id);
      if (!ok) return c.json({ error: 'Categoria não encontrada' }, 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao excluir categoria' }, 500);
    }
  });
