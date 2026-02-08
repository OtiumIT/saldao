import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { producaoService } from './producao.service.js';

type Ctx = { Bindings: Env };

const bomItemSchema = z.object({
  produto_fabricado_id: z.string().uuid(),
  produto_insumo_id: z.string().uuid(),
  quantidade_por_unidade: z.number().positive(),
});

const ordemSchema = z
  .object({
    produto_fabricado_id: z.string().uuid().optional(),
    quantidade: z.number().positive().optional(),
    data_ordem: z.string().optional(),
    observacao: z.string().nullable().optional(),
    cor_id: z.string().uuid().nullable().optional(),
    itens: z
      .array(
        z.object({
          produto_id: z.string().uuid(),
          tipo: z.enum(['fabricado', 'kit']),
          quantidade: z.number().positive(),
        })
      )
      .optional(),
  })
  .refine(
    (d) =>
      (d.itens != null && d.itens.length > 0) ||
      (d.produto_fabricado_id != null && d.quantidade != null && d.quantidade > 0),
    { message: 'Informe produto_fabricado_id e quantidade ou itens com pelo menos um item tipo fabricado' }
  );

const conferirEstoqueSchema = z.object({
  ordem_id: z.string().uuid().optional(),
  produto_fabricado_id: z.string().uuid().optional(),
  quantidade: z.number().positive().optional(),
  itens: z
    .array(z.object({ produto_id: z.string().uuid(), quantidade: z.number().positive() }))
    .optional(),
  cor_id: z.string().uuid(),
});

export const producaoRoutes = new Hono<Ctx>()
  .get('/bom/:produtoFabricadoId', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('produtoFabricadoId');
    try {
      const list = await producaoService.listBomByFabricado(c.env, id);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar BOM' }, 500);
    }
  })
  .post('/bom', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = bomItemSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const created = await producaoService.saveBomItem(c.env, parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao salvar BOM' }, 500);
    }
  })
  .delete('/bom/:produtoFabricadoId/:produtoInsumoId', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const fabricadoId = c.req.param('produtoFabricadoId');
    const insumoId = c.req.param('produtoInsumoId');
    try {
      const ok = await producaoService.removeBomItem(c.env, fabricadoId, insumoId);
      if (!ok) return c.json({ error: 'Item não encontrado' }, 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao remover' }, 500);
    }
  })
  .get('/quantidade-possivel/:produtoFabricadoId', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('produtoFabricadoId');
    try {
      const result = await producaoService.quantidadePossivel(c.env, id);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  })
  .get('/ordens', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const status = c.req.query('status');
    const data_inicio = c.req.query('data_inicio');
    const data_fim = c.req.query('data_fim');
    try {
      const list = await producaoService.listOrdens(c.env, { status, data_inicio, data_fim });
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar ordens' }, 500);
    }
  })
  .get('/ordens/:id/itens', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const itens = await producaoService.listOrdensItens(c.env, id);
      return c.json(itens);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar itens' }, 500);
    }
  })
  .post('/ordens', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = ordemSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const created = await producaoService.createOrdem(c.env, parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar ordem' }, 500);
    }
  })
  .get('/conferir-estoque-por-cor', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const ordem_id = c.req.query('ordem_id');
    const produto_fabricado_id = c.req.query('produto_fabricado_id');
    const quantidade = c.req.query('quantidade');
    const cor_id = c.req.query('cor_id');
    if (!cor_id) return c.json({ error: 'cor_id é obrigatório' }, 400);
    const parsed = conferirEstoqueSchema.safeParse({
      ordem_id: ordem_id || undefined,
      produto_fabricado_id: produto_fabricado_id || undefined,
      quantidade: quantidade != null ? Number(quantidade) : undefined,
      cor_id,
    });
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const result = await producaoService.conferirEstoquePorCor(c.env, parsed.data);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro na conferência' }, 500);
    }
  })
  .post('/conferir-estoque-por-cor', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = conferirEstoqueSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const result = await producaoService.conferirEstoquePorCor(c.env, parsed.data);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro na conferência' }, 500);
    }
  })
  .post('/ordens/:id/executar', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const result = await producaoService.executarOrdem(c.env, id);
      if (!result.ok) return c.json({ error: result.error ?? 'Erro' }, 400);
      return c.json({ ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao executar' }, 500);
    }
  });
