import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { opcoesEntregaService } from './opcoes-entrega.service.js';

type Ctx = { Bindings: Env };

const createSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['fixo', 'por_andar']),
  valor_fixo: z.number().nullable().optional(),
  valor_por_andar: z.number().nullable().optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});

const updateSchema = createSchema.partial();

const configSchema = z.object({
  valor: z.string().nullable(),
});

export const opcoesEntregaRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    try {
      const list = await opcoesEntregaService.list(c.env);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar opções' }, 500);
    }
  })
  .get('/config/:chave', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const chave = c.req.param('chave');
    try {
      const valor = await opcoesEntregaService.getConfig(c.env, chave);
      return c.json({ chave, valor });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao obter config' }, 500);
    }
  })
  .put('/config/:chave', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const chave = c.req.param('chave');
    const body = await c.req.json();
    const parsed = configSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      await opcoesEntregaService.setConfig(c.env, chave, parsed.data.valor);
      return c.json({ chave, valor: parsed.data.valor });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao salvar config' }, 500);
    }
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const item = await opcoesEntregaService.findById(c.env, id);
    if (!item) return c.json({ error: 'Opção não encontrada' }, 404);
    return c.json(item);
  })
  .post('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const created = await opcoesEntregaService.create(c.env, parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar opção' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const updated = await opcoesEntregaService.update(c.env, id, parsed.data);
      if (!updated) return c.json({ error: 'Opção não encontrada' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar opção' }, 500);
    }
  })
  .delete('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const ok = await opcoesEntregaService.remove(c.env, id);
      if (!ok) return c.json({ error: 'Opção não encontrada' }, 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao excluir opção' }, 500);
    }
  });
