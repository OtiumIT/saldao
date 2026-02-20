import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { parcelamentoService } from './parcelamento.service.js';

type Ctx = { Bindings: Env };

const updateTaxaSchema = z.object({
  taxa_percentual: z.number().min(0).max(100),
});

export const parcelamentoRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    try {
      const list = await parcelamentoService.list(c.env);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar opções de parcelamento' }, 500);
    }
  })
  .get('/por-parcelas/:parcelas', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const parcelas = parseInt(c.req.param('parcelas'), 10);
    if (Number.isNaN(parcelas) || parcelas < 1) {
      return c.json({ error: 'parcelas inválido' }, 400);
    }
    const opcao = await parcelamentoService.findByParcelas(c.env, parcelas);
    if (!opcao) return c.json({ error: 'Opção não encontrada' }, 404);
    return c.json(opcao);
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const opcao = await parcelamentoService.findById(c.env, id);
    if (!opcao) return c.json({ error: 'Opção não encontrada' }, 404);
    return c.json(opcao);
  })
  .patch('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = updateTaxaSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const updated = await parcelamentoService.update(c.env, id, parsed.data);
    if (!updated) return c.json({ error: 'Opção não encontrada' }, 404);
    return c.json(updated);
  })
  .patch('/por-parcelas/:parcelas', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const parcelasParam = parseInt(c.req.param('parcelas'), 10);
    if (Number.isNaN(parcelasParam) || parcelasParam < 1) {
      return c.json({ error: 'parcelas inválido' }, 400);
    }
    const body = await c.req.json();
    const parsed = z.object({ taxa_percentual: z.number().min(0).max(100) }).safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const updated = await parcelamentoService.updateByParcelas(c.env, parcelasParam, parsed.data.taxa_percentual);
    if (!updated) return c.json({ error: 'Opção não encontrada' }, 404);
    return c.json(updated);
  });
