import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import * as movimentacoesRepo from './movimentacoes.repository.js';

type Ctx = { Bindings: Env };

const tipoEnum = z.enum(['entrada', 'saida', 'ajuste', 'producao']);

const createSchema = z.object({
  data: z.string().optional(),
  tipo: tipoEnum,
  produto_id: z.string().uuid(),
  quantidade: z.number().int(),
  cor_id: z.string().uuid().nullable().optional(),
  origem_tipo: z.string().nullable().optional(),
  origem_id: z.string().uuid().nullable().optional(),
  observacao: z.string().nullable().optional(),
});

const ajusteSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade: z.number().int(),
  observacao: z.string().optional(),
  cor_id: z.string().uuid().nullable().optional(),
});

const conferenciaSchema = z.object({
  itens: z.array(z.object({
    produto_id: z.string().uuid(),
    saldo_atual: z.number().int().nonnegative(),
  })),
});

export const movimentacoesRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const produto_id = c.req.query('produto_id');
    const data_inicio = c.req.query('data_inicio');
    const data_fim = c.req.query('data_fim');
    const tipo = c.req.query('tipo');
    try {
      const list = await movimentacoesRepo.list({
        produto_id: produto_id || undefined,
        data_inicio: data_inicio || undefined,
        data_fim: data_fim || undefined,
        tipo: tipo ? (tipo as 'entrada' | 'saida' | 'ajuste' | 'producao') : undefined,
      });
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar movimentações' }, 500);
    }
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
      const created = await movimentacoesRepo.create(parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar movimentação' }, 500);
    }
  })
  .post('/ajuste', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = ajusteSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const created = await movimentacoesRepo.ajuste(
        parsed.data.produto_id,
        parsed.data.quantidade,
        parsed.data.observacao,
        parsed.data.cor_id ?? undefined
      );
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao registrar ajuste' }, 500);
    }
  })
  .post('/conferencia', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = conferenciaSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const result = await movimentacoesRepo.conferenciaLote(parsed.data.itens);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro na conferência' }, 500);
    }
  });
