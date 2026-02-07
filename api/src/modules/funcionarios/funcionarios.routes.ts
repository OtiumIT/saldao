import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { funcionariosService } from './funcionarios.service.js';

type Ctx = { Bindings: Env };

const createFuncionarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  salario: z.number().min(0),
  dia_pagamento: z.number().int().min(1).max(28).optional().default(5),
  ativo: z.boolean().optional().default(true),
});

const updateFuncionarioSchema = createFuncionarioSchema.partial();

const folhaItemSchema = z.object({
  funcionario_id: z.string().uuid(),
  valor_pago: z.number().min(0),
  observacao: z.string().nullable().optional(),
});

const saveFolhaSchema = z.object({
  ano: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
  itens: z.array(folhaItemSchema),
});

export const funcionariosRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const ativos = c.req.query('ativos');
    const list = await funcionariosService.listFuncionarios(ativos === '1');
    return c.json(list);
  })
  .get('/folha', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const ano = c.req.query('ano');
    const mes = c.req.query('mes');
    if (!ano || !mes) return c.json({ error: 'ano e mes são obrigatórios' }, 400);
    const anoN = parseInt(ano, 10);
    const mesN = parseInt(mes, 10);
    if (Number.isNaN(anoN) || Number.isNaN(mesN) || mesN < 1 || mesN > 12) {
      return c.json({ error: 'ano/mes inválidos' }, 400);
    }
    const folha = await funcionariosService.getFolhaPeriodo(anoN, mesN);
    return c.json(folha);
  })
  .post('/folha', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = saveFolhaSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const result = await funcionariosService.saveFolhaMes(
      parsed.data.ano,
      parsed.data.mes,
      parsed.data.itens
    );
    if (result.error) return c.json({ error: result.error }, 400);
    return c.json(result);
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const f = await funcionariosService.findFuncionarioById(c.req.param('id'));
    if (!f) return c.json({ error: 'Funcionário não encontrado' }, 404);
    return c.json(f);
  })
  .post('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = createFuncionarioSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    try {
      const created = await funcionariosService.createFuncionario(parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar funcionário' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = updateFuncionarioSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const updated = await funcionariosService.updateFuncionario(c.req.param('id'), parsed.data);
    if (!updated) return c.json({ error: 'Funcionário não encontrado' }, 404);
    return c.json(updated);
  })
  .delete('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const ok = await funcionariosService.removeFuncionario(c.req.param('id'));
    if (!ok) return c.json({ error: 'Funcionário não encontrado' }, 404);
    return new Response(null, { status: 204 });
  });
