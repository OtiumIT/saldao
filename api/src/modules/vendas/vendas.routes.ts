import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { getEnv } from '../../config/env.worker.js';
import { extractSaleOrderFromImage } from '../../lib/openai-helper.js';
import { vendasService } from './vendas.service.js';
import { clientesService } from '../clientes/clientes.service.js';
import { scheduleGeocodeInBackground } from '../geocode/geocode-job.js';

type Ctx = { Bindings: Env };

const itemSchema = z.object({
  produto_id: z.string().uuid(),
  quantidade: z.number().positive(),
  preco_unitario: z.number().min(0),
});

const opcaoEntregaSelecionadaSchema = z.object({
  opcao_id: z.string().uuid(),
  andar: z.number().int().min(0).optional(),
});

const baseVendaSchema = z.object({
  cliente_id: z.string().uuid().nullable().optional(),
  data_pedido: z.string().optional(),
  tipo_entrega: z.enum(['retirada', 'entrega']),
  endereco_entrega: z.string().nullable().optional(),
  /** CEP do cliente (obrigatório quando há endereço; atualiza cadastro) */
  cliente_cep: z.string().max(20).nullable().optional(),
  observacoes: z.string().nullable().optional(),
  previsao_entrega_em_dias: z.number().int().positive().nullable().optional(),
  distancia_km: z.number().min(0).nullable().optional(),
  valor_frete: z.number().min(0).nullable().optional(),
  parcelas: z.number().int().min(1).nullable().optional(),
  taxa_parcelamento_percentual: z.number().min(0).max(100).nullable().optional(),
  opcoes_entrega_selecionadas: z.array(opcaoEntregaSelecionadaSchema).optional(),
  valor_extras_livre: z.number().min(0).nullable().optional(),
  itens: z.array(itemSchema).min(1, 'Pelo menos um item'),
});

const createSchema = baseVendaSchema.refine(
  (data) =>
    !data.endereco_entrega?.trim() ||
    !data.cliente_id ||
    (data.cliente_cep && data.cliente_cep.replace(/\D/g, '').length === 8),
  { message: 'CEP é obrigatório quando há endereço (8 dígitos)', path: ['cliente_cep'] }
);

const updateSchema = baseVendaSchema.partial().refine(
  (data) =>
    !data.endereco_entrega?.trim() ||
    !data.cliente_id ||
    (data.cliente_cep != null && data.cliente_cep.replace(/\D/g, '').length === 8),
  { message: 'CEP é obrigatório quando há endereço (8 dígitos)', path: ['cliente_cep'] }
);

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
  .get('/totais', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    try {
      const totais = await vendasService.getTotais(c.env);
      return c.json(totais);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao obter totais' }, 500);
    }
  })
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const status = c.req.query('status');
    const data_inicio = c.req.query('data_inicio');
    const data_fim = c.req.query('data_fim');
    const cliente_nome = c.req.query('cliente_nome');
    const cliente_ids = c.req.query('cliente_ids');
    const fornecedor_id = c.req.query('fornecedor_id');
    const produto_id = c.req.query('produto_id');
    const incluir_cancelados = c.req.query('incluir_cancelados') === '1' || c.req.query('incluir_cancelados') === 'true';
    const clienteIdsArr =
      cliente_ids && typeof cliente_ids === 'string'
        ? cliente_ids.split(',').map((id) => id.trim()).filter((id) => /^[0-9a-f-]{36}$/i.test(id))
        : undefined;
    try {
      const list = await vendasService.list(c.env, {
        status,
        data_inicio: data_inicio || undefined,
        data_fim: data_fim || undefined,
        cliente_nome: cliente_nome || undefined,
        cliente_ids: clienteIdsArr?.length ? clienteIdsArr : undefined,
        fornecedor_id: fornecedor_id || undefined,
        produto_id: produto_id || undefined,
        incluir_cancelados,
      });
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar' }, 500);
    }
  })
  .get('/calcular-distancia', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const endereco = c.req.query('endereco');
    if (!endereco || typeof endereco !== 'string' || !endereco.trim()) {
      return c.json({ error: 'endereco obrigatório' }, 400);
    }
    try {
      const result = await vendasService.calcularDistancia(c.env, endereco.trim());
      return c.json(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao calcular distância';
      if (typeof msg === 'string' && (msg.includes('configurad') || msg.includes('Configure'))) {
        return c.json({ error: msg }, 503);
      }
      return c.json({ error: msg }, 500);
    }
  })
  .get('/enriquecer-endereco', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const endereco = c.req.query('endereco');
    if (!endereco || typeof endereco !== 'string' || !endereco.trim()) {
      return c.json({ error: 'endereco obrigatório' }, 400);
    }
    try {
      const result = await vendasService.enriquecerEndereco(c.env, endereco.trim());
      if (!result) return c.json({ error: 'Geocoding não configurado (GOOGLE_MAPS_API_KEY)' }, 503);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao enriquecer endereço' }, 500);
    }
  })
  .get('/relatorio', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const data_inicio = c.req.query('data_inicio');
    const data_fim = c.req.query('data_fim');
    const mes = c.req.query('mes');
    const fornecedor_id = c.req.query('fornecedor_id') || undefined;
    const produto_id = c.req.query('produto_id') || undefined;
    const incluir_rascunho = c.req.query('incluir_rascunho') === 'true';
    let dataInicio: string;
    let dataFim: string;
    if (mes && /^\d{4}-\d{2}$/.test(mes)) {
      const [y, m] = mes.split('-');
      dataInicio = `${y}-${m}-01`;
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      dataFim = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
    } else if (data_inicio && data_fim) {
      dataInicio = data_inicio;
      dataFim = data_fim;
    } else {
      return c.json({ error: 'Informe data_inicio e data_fim, ou mes (YYYY-MM)' }, 400);
    }
    try {
      const result = await vendasService.getRelatorioVendas(c.env, {
        data_inicio: dataInicio,
        data_fim: dataFim,
        fornecedor_id: fornecedor_id && fornecedor_id.trim() ? fornecedor_id.trim() : null,
        produto_id: produto_id && produto_id.trim() ? produto_id.trim() : null,
        incluir_rascunho,
      });
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao gerar relatório' }, 500);
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
      const { cliente_cep, ...createPayload } = parsed.data;
      const created = await vendasService.create(c.env, createPayload);
      if (parsed.data.tipo_entrega === 'entrega' && parsed.data.endereco_entrega?.trim()) {
        scheduleGeocodeInBackground(c.env, c.executionCtx as { waitUntil?: (p: Promise<unknown>) => void } | undefined);
      }
      if (parsed.data.cliente_id && (cliente_cep != null || parsed.data.endereco_entrega?.trim())) {
        const updateData: { cep?: string | null; endereco_entrega?: string | null } = {};
        if (cliente_cep != null) updateData.cep = String(cliente_cep).trim() || null;
        if (parsed.data.endereco_entrega?.trim()) updateData.endereco_entrega = parsed.data.endereco_entrega.trim();
        if (Object.keys(updateData).length > 0) {
          await clientesService.update(c.env, parsed.data.cliente_id, updateData);
        }
      }
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
      if (updated.tipo_entrega === 'entrega' && updated.endereco_entrega?.trim()) {
        scheduleGeocodeInBackground(c.env, c.executionCtx as { waitUntil?: (p: Promise<unknown>) => void } | undefined);
      }
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
  })
  .post('/:id/cancelar', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const result = await vendasService.cancelar(c.env, id);
      if (!result.ok) return c.json({ error: result.error ?? 'Erro' }, 400);
      const pedido = await vendasService.findById(c.env, id);
      return c.json(pedido ?? { ok: true });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  });
