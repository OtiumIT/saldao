import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { custosOperacionaisService } from './custos-operacionais.service.js';

type Ctx = { Bindings: Env };

const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().nullable().optional(),
  local: z.enum(['fabrica', 'loja', 'comum']).optional().default('comum'),
  ativo: z.boolean().optional().default(true),
});

const custoItemSchema = z.object({
  categoria_id: z.string().uuid(),
  valor_planejado: z.number().optional(),
  valor_realizado: z.number().nullable().optional(),
  observacao: z.string().nullable().optional(),
});

const upsertMesSchema = z.object({
  ano: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
  itens: z.array(custoItemSchema),
});

export const custosOperacionaisRoutes = new Hono<Ctx>()
  .get('/categorias', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const list = await custosOperacionaisService.listCategorias();
    return c.json(list);
  })
  .get('/categorias/ativas', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const list = await custosOperacionaisService.listCategoriasAtivas();
    return c.json(list);
  })
  .get('/categorias/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const cat = await custosOperacionaisService.findCategoriaById(id);
    if (!cat) return c.json({ error: 'Categoria não encontrada' }, 404);
    return c.json(cat);
  })
  .post('/categorias', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = categoriaSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const created = await custosOperacionaisService.createCategoria(parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar categoria' }, 500);
    }
  })
  .patch('/categorias/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = categoriaSchema.partial().safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const updated = await custosOperacionaisService.updateCategoria(id, parsed.data);
      if (!updated) return c.json({ error: 'Categoria não encontrada' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar categoria' }, 500);
    }
  })
  .delete('/categorias/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const ok = await custosOperacionaisService.removeCategoria(id);
    if (!ok) return c.json({ error: 'Categoria não encontrada' }, 404);
    return new Response(null, { status: 204 });
  })
  .get('/mes', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const ano = c.req.query('ano');
    const mes = c.req.query('mes');
    if (!ano || !mes) return c.json({ error: 'ano e mes são obrigatórios' }, 400);
    const anoN = parseInt(ano, 10);
    const mesN = parseInt(mes, 10);
    if (isNaN(anoN) || isNaN(mesN) || mesN < 1 || mesN > 12) return c.json({ error: 'ano/mes inválidos' }, 400);
    const list = await custosOperacionaisService.listCustosByPeriodo(anoN, mesN);
    const totais = await custosOperacionaisService.totalCustosMes(anoN, mesN);
    return c.json({ data: { list, totais } });
  })
  .post('/mes', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = upsertMesSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const result = await custosOperacionaisService.upsertCustosMes(
        parsed.data.ano,
        parsed.data.mes,
        parsed.data.itens
      );
      const totais = await custosOperacionaisService.totalCustosMes(parsed.data.ano, parsed.data.mes);
      return c.json({ data: { list: result, totais } });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao salvar custos' }, 500);
    }
  });
