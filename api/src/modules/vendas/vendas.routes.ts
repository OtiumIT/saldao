import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { getEnv } from '../../config/env.worker.js';
import { extractSaleOrderFromImage } from '../../lib/openai-helper.js';
import { vendasService } from './vendas.service.js';

type Ctx = { Bindings: Env };

const itemSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade: z.number().positive(),
  preco_unitario: z.number().min(0),
});

const createSchema = z.object({
  cliente_id: z.string().uuid().nullable().optional(),
  data_pedido: z.string().optional(),
  tipo_entrega: z.enum(['retirada', 'entrega']),
  endereco_entrega: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  previsao_entrega_em_dias: z.number().int().positive().nullable().optional(),
  distancia_km: z.number().min(0).nullable().optional(),
  valor_frete: z.number().min(0).nullable().optional(),
  itens: z.array(itemSchema).min(1, 'Pelo menos um item'),
});

const updateSchema = createSchema.partial();

const extractFromImageSchema = z.object({ imageBase64: z.string().min(1) });

export const vendasRoutes = new Hono<Ctx>()
  .post('/extract-from-image', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = extractFromImageSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const envConfig = getEnv(c.env);
    if (!envConfig.openai.apiKey) return c.json({ error: 'Extração por foto não configurada (OPENAI_API_KEY)' }, 503);
    try {
      const extracted = await extractSaleOrderFromImage(parsed.data.imageBase64, envConfig);
      return c.json(extracted);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao extrair dados da imagem' }, 400);
    }
  })
  .get('/sugestao-preco', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const produto_id = c.req.query('produto_id');
    if (!produto_id) return c.json({ error: 'produto_id obrigatório' }, 400);
    try {
      const result = await vendasService.getPrecoSugerido(c.env, produto_id);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  })
  .get('/itens-sugeridos', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const produto_id = c.req.query('produto_id');
    if (!produto_id) return c.json({ error: 'produto_id obrigatório' }, 400);
    try {
      const list = await vendasService.getItensSugeridos(c.env, produto_id);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  })
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const status = c.req.query('status');
    const data_inicio = c.req.query('data_inicio');
    const data_fim = c.req.query('data_fim');
    try {
      const list = await vendasService.list(c.env, { status, data_inicio, data_fim });
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar' }, 500);
    }
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const pedido = await vendasService.findById(c.env, id);
    if (!pedido) return c.json({ error: 'Pedido não encontrado' }, 404);
    const itens = await vendasService.listItens(c.env, id);
    return c.json({ ...pedido, itens });
  })
  .post('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const created = await vendasService.create(c.env, parsed.data);
      return c.json(created, 201);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao criar';
      const isValidation = typeof msg === 'string' && msg.includes('revenda ou fabricação');
      return c.json({ error: msg }, isValidation ? 400 : 500);
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
      const updated = await vendasService.update(c.env, id, parsed.data);
      if (!updated) return c.json({ error: 'Pedido não encontrado ou não é rascunho' }, 404);
      return c.json(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao atualizar';
      const isValidation = typeof msg === 'string' && msg.includes('revenda ou fabricação');
      return c.json({ error: msg }, isValidation ? 400 : 500);
    }
  })
  .post('/:id/confirmar', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    let previsao: number | null | undefined;
    try {
      const body = await c.req.json().catch(() => ({}));
      if (body && typeof body.previsao_entrega_em_dias === 'number') previsao = body.previsao_entrega_em_dias;
      if (body && body.previsao_entrega_em_dias === null) previsao = null;
    } catch {
      /* body vazio */
    }
    try {
      const result = await vendasService.confirmar(c.env, id, { previsao_entrega_em_dias: previsao });
      if (!result.ok) return c.json({ error: result.error ?? 'Erro' }, 400);
      const pedido = await vendasService.findById(c.env, id);
      return c.json(pedido ?? { ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  })
  .post('/:id/entregue', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const updated = await vendasService.marcarEntregue(c.env, id);
      if (!updated) return c.json({ error: 'Pedido não encontrado ou não está confirmado' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  });
