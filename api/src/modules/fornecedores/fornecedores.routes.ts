import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../../types/worker-env.js';
import { requireAuth } from '../../lib/auth-helper.worker.js';
import { fornecedoresService } from './fornecedores.service.js';

type Ctx = { Bindings: Env };

const tipoFornecedorEnum = z.enum(['insumos', 'revenda']);

const createSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  fone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  contato: z.string().optional(),
  observacoes: z.string().optional(),
  tipo: tipoFornecedorEnum.nullable().optional(),
});

const updateSchema = createSchema.partial();

export const fornecedoresRoutes = new Hono<Ctx>()
  .get('/', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const tipo = c.req.query('tipo');
    const filtros =
      tipo === 'insumos' || tipo === 'revenda' ? { tipo: tipo as 'insumos' | 'revenda' } : undefined;
    try {
      const list = await fornecedoresService.list(filtros);
      return c.json(list);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao listar fornecedores' }, 500);
    }
  })
  .get('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    const fornecedor = await fornecedoresService.findById(id);
    if (!fornecedor) return c.json({ error: 'Fornecedor não encontrado' }, 404);
    return c.json(fornecedor);
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
      const created = await fornecedoresService.create(parsed.data);
      return c.json(created, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao criar fornecedor' }, 500);
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
      const updated = await fornecedoresService.update(id, parsed.data);
      if (!updated) return c.json({ error: 'Fornecedor não encontrado' }, 404);
      return c.json(updated);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar fornecedor' }, 500);
    }
  })
  .delete('/:id', async (c) => {
    const auth = await requireAuth(c);
    if (auth instanceof Response) return auth;
    const id = c.req.param('id');
    try {
      const ok = await fornecedoresService.remove(id);
      if (!ok) return c.json({ error: 'Fornecedor não encontrado' }, 404);
      return new Response(null, { status: 204 });
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Erro ao excluir fornecedor' }, 500);
    }
  });
