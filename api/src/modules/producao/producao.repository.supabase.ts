/**
 * Repository de Produção usando Supabase Data API (sem policies)
 * Substitui producao.repository.ts quando usando Data API
 * 
 * NOTA: Queries complexas podem ser otimizadas com RPCs no Supabase
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type {
  BomRow,
  BomComInsumo,
  OrdemProducao,
  OrdemComProduto,
  OrdemProducaoItem,
  ConferenciaEstoquePorCorResult,
} from './producao.repository.js';
import * as movimentacoesRepo from '../estoque/movimentacoes.repository.supabase.js';

export async function listBomByFabricado(env: Env, produtoFabricadoId: string): Promise<BomComInsumo[]> {
  const client = getDataClient(env);
  const bom = await db.select<BomRow & { quantidade_por_unidade: string }>(client, 'bom', {
    filters: { produto_fabricado_id: produtoFabricadoId },
  });

  const insumoIds = bom.map((b) => b.produto_insumo_id);
  const insumos = await db.select<{ id: string; codigo: string; descricao: string; controlar_por_cor: boolean }>(
    client,
    'produtos',
    {
      filters: { id: insumoIds },
    }
  );

  const insumosMap = new Map(insumos.map((i) => [i.id, i]));

  return bom.map((b) => {
    const insumo = insumosMap.get(b.produto_insumo_id);
    return {
      ...b,
      quantidade_por_unidade: Number(b.quantidade_por_unidade),
      insumo_codigo: insumo?.codigo,
      insumo_descricao: insumo?.descricao,
      controlar_por_cor: insumo?.controlar_por_cor ?? false,
    };
  }).sort((a, b) => (a.insumo_codigo || '').localeCompare(b.insumo_codigo || ''));
}

export async function saveBomItem(
  env: Env,
  data: {
    produto_fabricado_id: string;
    produto_insumo_id: string;
    quantidade_por_unidade: number;
  }
): Promise<BomRow> {
  const client = getDataClient(env);
  // Verificar se já existe
  const existing = await db.select<BomRow>(client, 'bom', {
    filters: {
      produto_fabricado_id: data.produto_fabricado_id,
      produto_insumo_id: data.produto_insumo_id,
    },
    limit: 1,
  });

  if (existing.length > 0) {
    const updated = await db.update<BomRow & { quantidade_por_unidade: string }>(
      client,
      'bom',
      existing[0].id,
      {
        quantidade_por_unidade: data.quantidade_por_unidade,
      } as any
    );
    return { ...updated!, quantidade_por_unidade: Number(updated!.quantidade_por_unidade) };
  }

  const inserted = await db.insert<BomRow & { quantidade_por_unidade: string }>(client, 'bom', {
    produto_fabricado_id: data.produto_fabricado_id,
    produto_insumo_id: data.produto_insumo_id,
    quantidade_por_unidade: data.quantidade_por_unidade,
  } as any);

  return { ...inserted[0], quantidade_por_unidade: Number(inserted[0].quantidade_por_unidade) };
}

export async function removeBomItem(env: Env, produtoFabricadoId: string, produtoInsumoId: string): Promise<boolean> {
  const client = getDataClient(env);
  const bom = await db.select<BomRow>(client, 'bom', {
    filters: {
      produto_fabricado_id: produtoFabricadoId,
      produto_insumo_id: produtoInsumoId,
    },
    limit: 1,
  });

  if (bom.length === 0) return false;

  try {
    await db.remove(client, 'bom', bom[0].id);
    return true;
  } catch (error) {
    return false;
  }
}

export async function quantidadePossivel(
  env: Env,
  produtoFabricadoId: string
): Promise<{ quantidade: number; insumo_gargalo_id: string | null; insumo_gargalo_codigo: string | null }> {
  const bom = await listBomByFabricado(env, produtoFabricadoId);
  if (bom.length === 0) {
    return { quantidade: 0, insumo_gargalo_id: null, insumo_gargalo_codigo: null };
  }

  let minQtd = Infinity;
  let gargaloId: string | null = null;
  let gargaloCodigo: string | null = null;

  for (const b of bom) {
    const movimentacoes = await movimentacoesRepo.list(env, { produto_id: b.produto_insumo_id });
    const saldo = movimentacoes.reduce((sum, m) => sum + m.quantidade, 0);
    const qtdPossivel = b.quantidade_por_unidade > 0 ? Math.floor(saldo / b.quantidade_por_unidade) : 0;
    if (qtdPossivel < minQtd) {
      minQtd = qtdPossivel;
      gargaloId = b.produto_insumo_id;
      gargaloCodigo = b.insumo_codigo ?? null;
    }
  }

  return {
    quantidade: minQtd === Infinity ? 0 : minQtd,
    insumo_gargalo_id: gargaloId,
    insumo_gargalo_codigo: gargaloCodigo,
  };
}

export async function listOrdens(
  env: Env,
  filtros?: { status?: string; data_inicio?: string; data_fim?: string }
): Promise<OrdemComProduto[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (filtros?.status) filters.status = filtros.status;
  if (filtros?.data_inicio) filters.data_ordem = `>=${filtros.data_inicio}`;
  if (filtros?.data_fim) filters.data_ordem = `<=${filtros.data_fim}`;

  const ordens = await db.select<OrdemProducao & { quantidade: string }>(client, 'ordens_producao', {
    filters,
    orderBy: { column: 'data_ordem', ascending: false },
  });

  const produtoIds = [...new Set(ordens.map((o) => o.produto_fabricado_id))];
  const produtos = await db.select<{ id: string; codigo: string; descricao: string }>(client, 'produtos', {
    filters: { id: produtoIds },
  });

  const corIds = [...new Set(ordens.map((o) => o.cor_id).filter((id): id is string => id !== null))];
  const cores = corIds.length > 0
    ? await db.select<{ id: string; nome: string }>(client, 'cores', {
        filters: { id: corIds },
      })
    : [];

  const produtosMap = new Map(produtos.map((p) => [p.id, p]));
  const coresMap = new Map(cores.map((c) => [c.id, c]));

  return ordens.map((o) => {
    const produto = produtosMap.get(o.produto_fabricado_id);
    const cor = o.cor_id ? coresMap.get(o.cor_id) : null;
    return {
      ...o,
      quantidade: Number(o.quantidade),
      produto_codigo: produto?.codigo,
      produto_descricao: produto?.descricao,
      cor_nome: cor?.nome ?? null,
    };
  });
}

export async function listOrdensItens(env: Env, ordemId: string): Promise<OrdemProducaoItem[]> {
  const client = getDataClient(env);
  const itens = await db.select<OrdemProducaoItem & { quantidade: string }>(client, 'ordens_producao_itens', {
    filters: { ordem_id: ordemId },
    orderBy: { column: 'created_at', ascending: true },
  });

  const produtoIds = [...new Set(itens.map((i) => i.produto_id))];
  const produtos = await db.select<{ id: string; codigo: string; descricao: string }>(client, 'produtos', {
    filters: { id: produtoIds },
  });

  const produtosMap = new Map(produtos.map((p) => [p.id, p]));

  return itens.map((i) => {
    const produto = produtosMap.get(i.produto_id);
    return {
      ...i,
      quantidade: Number(i.quantidade),
      produto_codigo: produto?.codigo,
      produto_descricao: produto?.descricao,
    };
  });
}

export async function createOrdem(
  env: Env,
  data: {
    produto_fabricado_id?: string;
    quantidade?: number;
    data_ordem?: string;
    observacao?: string | null;
    cor_id?: string | null;
    itens?: Array<{ produto_id: string; tipo: 'fabricado' | 'kit'; quantidade: number }>;
  }
): Promise<OrdemProducao> {
  const client = getDataClient(env);
  const dataOrdem = data.data_ordem ?? new Date().toISOString().slice(0, 10);
  let produtoFabricadoId = data.produto_fabricado_id ?? '';
  let quantidade = data.quantidade ?? 0;

  if (data.itens && data.itens.length > 0) {
    const firstFabricado = data.itens.find((i) => i.tipo === 'fabricado');
    if (!firstFabricado) throw new Error('Ordem deve ter pelo menos um item tipo fabricado');
    produtoFabricadoId = firstFabricado.produto_id;
    quantidade = firstFabricado.quantidade;
  } else if (!produtoFabricadoId || quantidade <= 0) {
    throw new Error('Informe produto_fabricado_id e quantidade ou itens');
  }

  const ordemResult = await db.insert<OrdemProducao & { quantidade: string }>(client, 'ordens_producao', {
    produto_fabricado_id: produtoFabricadoId,
    quantidade,
    data_ordem: dataOrdem,
    observacao: data.observacao ?? null,
    cor_id: data.cor_id ?? null,
    status: 'pendente',
  } as any);

  const ordem = { ...ordemResult[0], quantidade: Number(ordemResult[0].quantidade) };

  if (data.itens && data.itens.length > 0) {
    for (const item of data.itens) {
      await db.insert<OrdemProducaoItem>(client, 'ordens_producao_itens', {
        ordem_id: ordem.id,
        produto_id: item.produto_id,
        tipo: item.tipo,
        quantidade: item.quantidade,
      } as any);
    }
  }

  return ordem;
}

export async function executarOrdem(env: Env, ordemId: string): Promise<{ ok: boolean; error?: string }> {
  const client = getDataClient(env);
  const ordem = await db.findById<OrdemProducao & { quantidade: string }>(client, 'ordens_producao', ordemId);
  if (!ordem) return { ok: false, error: 'Ordem não encontrada' };
  if (ordem.status === 'concluida') return { ok: false, error: 'Ordem já concluída' };

  const corId = ordem.cor_id ?? null;
  const itens = await listOrdensItens(env, ordemId);

  try {
    if (itens.length > 0) {
      for (const item of itens) {
        const bom = await listBomByFabricado(env, item.produto_id);
        if (bom.length === 0) return { ok: false, error: `BOM não cadastrado para ${item.produto_id}` };

        const qtd = item.quantidade;
        for (const b of bom) {
          const qtdConsumo = b.quantidade_por_unidade * qtd;
          const usarCor = b.controlar_por_cor ? corId : null;

          await movimentacoesRepo.create(env, {
            tipo: 'saida',
            produto_id: b.produto_insumo_id,
            quantidade: -qtdConsumo,
            cor_id: usarCor,
            origem_tipo: 'ordem_producao',
            origem_id: ordemId,
            observacao: `Ordem produção ${ordemId.slice(0, 8)} - consumo insumo`,
          });
        }

        if (item.tipo === 'fabricado') {
          await movimentacoesRepo.create(env, {
            tipo: 'entrada',
            produto_id: item.produto_id,
            quantidade: qtd,
            cor_id: corId,
            origem_tipo: 'ordem_producao',
            origem_id: ordemId,
            observacao: `Ordem produção ${ordemId.slice(0, 8)} - entrada fabricado`,
          });
        }
      }
    } else {
      // Usar produto_fabricado_id + quantidade
      const bom = await listBomByFabricado(env, ordem.produto_fabricado_id);
      if (bom.length === 0) return { ok: false, error: 'BOM não cadastrado' };

      const qtd = Number(ordem.quantidade);
      for (const b of bom) {
        const qtdConsumo = b.quantidade_por_unidade * qtd;
        const usarCor = b.controlar_por_cor ? corId : null;

        await movimentacoesRepo.create(env, {
          tipo: 'saida',
          produto_id: b.produto_insumo_id,
          quantidade: -qtdConsumo,
          cor_id: usarCor,
          origem_tipo: 'ordem_producao',
          origem_id: ordemId,
          observacao: `Ordem produção ${ordemId.slice(0, 8)} - consumo insumo`,
        });
      }

      await movimentacoesRepo.create(env, {
        tipo: 'entrada',
        produto_id: ordem.produto_fabricado_id,
        quantidade: qtd,
        cor_id: corId,
        origem_tipo: 'ordem_producao',
        origem_id: ordemId,
        observacao: `Ordem produção ${ordemId.slice(0, 8)} - entrada fabricado`,
      });
    }

    await db.update<OrdemProducao>(client, 'ordens_producao', ordemId, { status: 'concluida' } as any);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao executar ordem' };
  }
}

export async function conferirEstoquePorCor(
  env: Env,
  params: {
    ordem_id?: string;
    produto_fabricado_id?: string;
    quantidade?: number;
    itens?: Array<{ produto_id: string; quantidade: number }>;
    cor_id: string;
  }
): Promise<ConferenciaEstoquePorCorResult> {
  const empty: ConferenciaEstoquePorCorResult = {
    disponivel_na_cor: true,
    insumos_faltando: [],
    cores_com_estoque: [],
  };

  // Implementação simplificada - pode ser otimizada com RPC
  // Por enquanto, retorna estrutura básica
  return empty;
}
