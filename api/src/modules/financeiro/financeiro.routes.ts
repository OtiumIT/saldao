import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { financeiroService } from './financeiro.service.js';

type Ctx = { Bindings: Env };

const contaPagarSchema = z.object({
  descricao: z.string().min(1),
  valor: z.number(),
  vencimento: z.string(),
  forma_pagamento: z.string().nullable().optional(),
  pedido_compra_id: z.string().uuid().nullable().optional(),
  parcela_numero: z.number().nullable().optional(),
});

const contaReceberSchema = z.object({
  descricao: z.string().min(1),
  valor: z.number(),
  vencimento: z.string(),
  forma_pagamento: z.string().nullable().optional(),
  pedido_venda_id: z.string().uuid().nullable().optional(),
  parcela_numero: z.number().nullable().optional(),
});

export const financeiroRoutes = new Hono<Ctx>()
  .get('/contas-a-pagar', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const status = c.req.query('status');
    const data_inicio = c.req.query('data_inicio');
    const data_fim = c.req.query('data_fim');
    const list = await financeiroService.listContasPagar(c.env, { status, data_inicio, data_fim });
    return c.json(list);
  })
  .post('/contas-a-pagar', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = contaPagarSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const created = await financeiroService.createContaPagar(c.env, parsed.data);
    return c.json(created, 201);
  })
  .post('/contas-a-pagar/:id/pago', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const updated = await financeiroService.marcarPago(c.env, id);
    if (!updated) return c.json({ error: 'Conta não encontrada ou já paga' }, 404);
    return c.json(updated);
  })
  .get('/contas-a-receber', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const status = c.req.query('status');
    const data_inicio = c.req.query('data_inicio');
    const data_fim = c.req.query('data_fim');
    const list = await financeiroService.listContasReceber(c.env, { status, data_inicio, data_fim });
    return c.json(list);
  })
  .post('/contas-a-receber', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = contaReceberSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const created = await financeiroService.createContaReceber(c.env, parsed.data);
    return c.json(created, 201);
  })
  .post('/contas-a-receber/:id/recebido', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const updated = await financeiroService.marcarRecebido(c.env, id);
    if (!updated) return c.json({ error: 'Conta não encontrada ou já recebida' }, 404);
    return c.json(updated);
  })
  .get('/resumo', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const data_inicio = c.req.query('data_inicio') ?? new Date().toISOString().slice(0, 7) + '-01';
    const data_fim = c.req.query('data_fim') ?? new Date().toISOString().slice(0, 10);
    const resumo = await financeiroService.resumoFinanceiro(c.env, { data_inicio, data_fim });
    return c.json(resumo);
  });
