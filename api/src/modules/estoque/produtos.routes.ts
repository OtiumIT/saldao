import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { produtosService } from './produtos.service.js';

type Ctx = { Bindings: Env };

const tipoEnum = z.enum(['revenda', 'insumos', 'fabricado']);

const createSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  unidade: z.string().optional().default('UN'),
  tipo: tipoEnum,
  preco_compra: z.number().optional().default(0),
  preco_venda: z.number().optional().default(0),
  estoque_minimo: z.number().optional().default(0),
  estoque_maximo: z.number().nullable().optional(),
  fornecedor_principal_id: z.string().uuid().nullable().optional(),
  fornecedores_ids: z.array(z.string().uuid()).optional().nullable(),
  categoria_id: z.string().uuid().nullable().optional(),
  montado_comprimento_m: z.number().nullable().optional(),
  montado_largura_m: z.number().nullable().optional(),
  montado_altura_m: z.number().nullable().optional(),
  montado_peso_kg: z.number().nullable().optional(),
  desmontado_comprimento_m: z.number().nullable().optional(),
  desmontado_largura_m: z.number().nullable().optional(),
  desmontado_altura_m: z.number().nullable().optional(),
  desmontado_peso_kg: z.number().nullable().optional(),
});

const updateSchema = createSchema.partial();

const bulkSchema = z.array(createSchema);

export const produtosRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const comSaldos = c.req.query('saldos') === '1';
    const tipo = c.req.query('tipo');
    const categoria_id = c.req.query('categoria_id');
    const fornecedor_id = c.req.query('fornecedor_id');
    const filtros =
      tipo || categoria_id !== undefined || fornecedor_id
        ? {
            tipo: (tipo === 'revenda' || tipo === 'insumos' || tipo === 'fabricado' ? tipo : undefined) as 'revenda' | 'insumos' | 'fabricado' | undefined,
            categoria_id: categoria_id === '' || categoria_id === 'null' ? null : categoria_id ?? undefined,
            fornecedor_id: fornecedor_id && fornecedor_id.trim() ? fornecedor_id.trim() : undefined,
          }
        : undefined;
    try {
      const list = comSaldos ? await produtosService.listComSaldos(filtros) : await produtosService.list(filtros);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar produtos' }, 500);
    }
  })
  .get('/:id/sugestao-estoque', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const sugestao = await produtosService.getSugestaoEstoque(id);
      return c.json(sugestao);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  })
  .get('/:id/saldos-por-cor', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const saldos = await produtosService.getSaldosPorCor(id);
      return c.json(saldos);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro' }, 500);
    }
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const produto = await produtosService.findById(id);
    if (!produto) return c.json({ error: 'Produto não encontrado' }, 404);
    return c.json(produto);
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
      const existing = await produtosService.findByCodigo(parsed.data.codigo);
      if (existing) return c.json({ error: 'Código já existe' }, 400);
      const created = await produtosService.create(parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar produto' }, 500);
    }
  })
  .post('/bulk', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const body = await c.req.json();
    const parsed = bulkSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    try {
      const result = await produtosService.createMany(parsed.data);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao importar produtos' }, 500);
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
      if (parsed.data.codigo) {
        const existing = await produtosService.findByCodigo(parsed.data.codigo);
        if (existing && existing.id !== id) return c.json({ error: 'Código já existe' }, 400);
      }
      const updated = await produtosService.update(id, parsed.data);
      if (!updated) return c.json({ error: 'Produto não encontrado' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar produto' }, 500);
    }
  })
  .delete('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const ok = await produtosService.remove(id);
      if (!ok) return c.json({ error: 'Produto não encontrado' }, 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao excluir produto' }, 500);
    }
  });
