import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { getEnv } from '../../config/env.worker.js';
import { extractPurchaseOrderFromImage } from '../../lib/openai-helper.js';
import { comprasService } from './compras.service.js';

type Ctx = { Bindings: Env };

const itemSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade: z.number().positive(),
  preco_unitario: z.number().min(0),
});

const createSchema = z.object({
  fornecedor_id: z.string().uuid(),
  data_pedido: z.string().optional(),
  observacoes: z.string().nullable().optional(),
  tipo: z.enum(['pedido', 'recepcao']).optional(),
  data_prevista_entrega: z.string().nullable().optional(),
  itens: z.array(itemSchema).min(1, 'Pelo menos um item'),
});

const updateSchema = z.object({
  fornecedor_id: z.string().uuid().optional(),
  data_pedido: z.string().optional(),
  observacoes: z.string().nullable().optional(),
  data_prevista_entrega: z.string().nullable().optional(),
  itens: z.array(itemSchema).min(1).optional(),
});

const receberSchema = z.object({
  itens: z.array(z.object({
    item_id: z.string().uuid(),
    quantidade_recebida: z.number().min(0),
  })),
});

const extractFromImageSchema = z.object({ imageBase64: z.string().min(1) });

export const comprasRoutes = new Hono<Ctx>()
  .post('/extract-from-image', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = extractFromImageSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const envConfig = getEnv(c.env);
    if (!envConfig.openai.apiKey) return c.json({ error: 'Extração por foto não configurada (OPENAI_API_KEY)' }, 503);
    try {
      const extracted = await extractPurchaseOrderFromImage(parsed.data.imageBase64, envConfig);
      return c.json(extracted);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao extrair dados da imagem' }, 400);
    }
  })
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    try {
      const list = await comprasService.list();
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar pedidos' }, 500);
    }
  })
  .get('/ultimos-precos', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const fornecedor_id = c.req.query('fornecedor_id');
    if (!fornecedor_id) return c.json({ error: 'fornecedor_id é obrigatório' }, 400);
    try {
      const map = await comprasService.getUltimosPrecos(fornecedor_id);
      return c.json(map);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao buscar últimos preços' }, 500);
    }
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const pedido = await comprasService.findById(id);
    if (!pedido) return c.json({ error: 'Pedido não encontrado' }, 404);
    const itens = await comprasService.listItens(id);
    return c.json({ ...pedido, itens });
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
      const created = await comprasService.createPedido(parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar pedido' }, 500);
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
      const updated = await comprasService.updatePedido(id, parsed.data);
      if (!updated) return c.json({ error: 'Pedido não encontrado ou já recebido' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar pedido' }, 500);
    }
  })
  .post('/:id/receber', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const body = await c.req.json();
    const parsed = receberSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const result = await comprasService.receber(id, parsed.data.itens);
      if (!result.ok) return c.json({ error: result.error ?? 'Erro ao receber' }, 400);
      const pedido = await comprasService.findById(id);
      return c.json(pedido ?? { ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao receber' }, 500);
    }
  });
