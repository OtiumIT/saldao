import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { roteirizacaoService, marcarVeiculoInoperante } from './roteirizacao.service.js';

type Ctx = { Bindings: Env };

const veiculoSchema = z.object({
  nome: z.string().min(1),
  placa: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
  dias_entrega: z.string().nullable().optional(),
  horario_inicio: z.string().nullable().optional(),
  horario_fim: z.string().nullable().optional(),
  capacidade_volume: z.number().nullable().optional(),
  capacidade_itens: z.number().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  motorista_whatsapp: z.string().nullable().optional(),
  inoperante: z.boolean().optional(),
  inoperante_desde: z.string().nullable().optional(),
  inoperante_motivo: z.string().nullable().optional(),
  capacidade_peso_kg: z.number().nullable().optional(),
  carga_comprimento_m: z.number().nullable().optional(),
  carga_largura_m: z.number().nullable().optional(),
  carga_altura_m: z.number().nullable().optional(),
});

const entregaSchema = z.object({
  pedido_venda_id: z.string().uuid(),
  veiculo_id: z.string().uuid().nullable().optional(),
  data_entrega_prevista: z.string().nullable().optional(),
});

export const roteirizacaoRoutes = new Hono<Ctx>()
  .get('/veiculos', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const list = await roteirizacaoService.listVeiculos(c.env);
    return c.json(list);
  })
  .get('/veiculos/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const v = await roteirizacaoService.findVeiculoById(c.env, c.req.param('id'));
    if (!v) return c.json({ error: 'Veículo não encontrado' }, 404);
    return c.json(v);
  })
  .post('/veiculos', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = veiculoSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const created = await roteirizacaoService.createVeiculo(c.env, parsed.data);
    return c.json(created, 201);
  })
  .patch('/veiculos/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = veiculoSchema.partial().safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const updated = await roteirizacaoService.updateVeiculo(c.env, c.req.param('id'), parsed.data);
    if (!updated) return c.json({ error: 'Veículo não encontrado' }, 404);
    return c.json(updated);
  })
  .get('/entregas', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const veiculo_id = c.req.query('veiculo_id');
    const data = c.req.query('data');
    const status = c.req.query('status');
    const list = await roteirizacaoService.listEntregas(c.env, { veiculo_id, data, status });
    return c.json(list);
  })
  .get('/entregas/pendentes', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const list = await roteirizacaoService.listPedidosPendentesEntrega(c.env);
    return c.json(list);
  })
  .post('/entregas', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = entregaSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const created = await roteirizacaoService.createEntrega(c.env, parsed.data);
    return c.json(created, 201);
  })
  .patch('/entregas/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = z.object({
      veiculo_id: z.string().uuid().nullable().optional(),
      data_entrega_prevista: z.string().nullable().optional(),
      ordem_na_rota: z.number().nullable().optional(),
    }).safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const updated = await roteirizacaoService.updateEntrega(c.env, c.req.param('id'), parsed.data);
    if (!updated) return c.json({ error: 'Entrega não encontrada' }, 404);
    return c.json(updated);
  })
  .post('/entregas/:id/entregue', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const updated = await roteirizacaoService.marcarEntregue(c.env, c.req.param('id'));
    if (!updated) return c.json({ error: 'Entrega não encontrada' }, 404);
    return c.json(updated);
  })
  .patch('/veiculos/:id/inoperante', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = z.object({ inoperante: z.literal(true), motivo: z.string().nullable().optional() }).safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const result = await marcarVeiculoInoperante(c.env, c.req.param('id'), parsed.data.motivo ?? null);
    if (!result.veiculo) return c.json({ error: 'Veículo não encontrado' }, 404);
    return c.json({ veiculo: result.veiculo, entregasAfetadas: result.entregasAfetadas });
  })
  .get('/entregas-afetadas-veiculo/:veiculoId', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const list = await roteirizacaoService.listEntregasAfetadasPorVeiculoInoperante(c.env, c.req.param('veiculoId'));
    return c.json(list);
  })
  .post('/reagendar-entregas', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = z.object({
      entrega_ids: z.array(z.string().uuid()).min(1),
      novo_veiculo_id: z.string().uuid().nullable().optional(),
      nova_data: z.string().nullable().optional(),
    }).safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const count = await roteirizacaoService.reagendarEntregas(
      c.env,
      parsed.data.entrega_ids,
      parsed.data.novo_veiculo_id ?? null,
      parsed.data.nova_data ?? null
    );
    return c.json({ reagendadas: count });
  })
  .post('/sugerir-ordem', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = z.object({
      veiculo_id: z.string().uuid(),
      data_entrega: z.string(),
    }).safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    const ids = await roteirizacaoService.sugerirOrdemRota(c.env, parsed.data.veiculo_id, parsed.data.data_entrega);
    return c.json({ entrega_ids: ids });
  })
  .patch('/entregas/ordem', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = z.object({ entrega_ids_ordenados: z.array(z.string().uuid()) }).safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    await roteirizacaoService.aplicarOrdemRota(c.env, parsed.data.entrega_ids_ordenados);
    return c.json({ ok: true });
  });
