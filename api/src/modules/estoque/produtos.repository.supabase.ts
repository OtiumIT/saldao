/**
 * Repository de Produtos usando Supabase Data API (sem policies)
 * Substitui produtos.repository.ts quando usando Data API
 * 
 * NOTA: Saldos são calculados manualmente somando movimentações (não usa view saldo_estoque)
 */
import type { Env } from '../../types/worker-env.js';
import { getDataClient, db } from '../../db/data-api.js';
import type {
  Produto,
  ProdutoComSaldo,
  FiltrosProduto,
  CreateProdutoInput,
  UpdateProdutoInput,
  SaldoPorCor,
  SugestaoEstoque,
} from './produtos.repository.js';

// Helper para calcular saldo de um produto
async function calcularSaldo(env: Env, produtoId: string): Promise<number> {
  const client = getDataClient(env);
  const movimentacoes = await db.select<{ quantidade: number }>(client, 'movimentacoes_estoque', {
    filters: { produto_id: produtoId },
  });
  return movimentacoes.reduce((sum, m) => sum + m.quantidade, 0);
}

// Helper para calcular saldo por cor
async function calcularSaldoPorCor(env: Env, produtoId: string, corId: string): Promise<number> {
  const client = getDataClient(env);
  const movimentacoes = await db.select<{ quantidade: number }>(client, 'movimentacoes_estoque', {
    filters: { produto_id: produtoId, cor_id: corId },
  });
  return movimentacoes.reduce((sum, m) => sum + m.quantidade, 0);
}

function mapProdutoRow(r: any): Produto {
  return {
    ...r,
    categoria_id: r.categoria_id ?? null,
    controlar_por_cor: r.controlar_por_cor ?? false,
    tipo_item_producao: r.tipo_item_producao === 'fabricado' || r.tipo_item_producao === 'kit' ? r.tipo_item_producao : null,
    prazo_medio_entrega_dias: r.prazo_medio_entrega_dias != null ? Number(r.prazo_medio_entrega_dias) : null,
    montado_comprimento_m: r.montado_comprimento_m != null ? Number(r.montado_comprimento_m) : null,
    montado_largura_m: r.montado_largura_m != null ? Number(r.montado_largura_m) : null,
    montado_altura_m: r.montado_altura_m != null ? Number(r.montado_altura_m) : null,
    montado_peso_kg: r.montado_peso_kg != null ? Number(r.montado_peso_kg) : null,
    desmontado_comprimento_m: r.desmontado_comprimento_m != null ? Number(r.desmontado_comprimento_m) : null,
    desmontado_largura_m: r.desmontado_largura_m != null ? Number(r.desmontado_largura_m) : null,
    desmontado_altura_m: r.desmontado_altura_m != null ? Number(r.desmontado_altura_m) : null,
    desmontado_peso_kg: r.desmontado_peso_kg != null ? Number(r.desmontado_peso_kg) : null,
  };
}

export async function list(env: Env, filtros?: FiltrosProduto): Promise<Produto[]> {
  const client = getDataClient(env);
  const filters: Record<string, unknown> = {};
  if (filtros?.tipo) filters.tipo = filtros.tipo;
  if (filtros?.categoria_id !== undefined) {
    if (filtros.categoria_id === null) {
      filters.categoria_id = null;
    } else {
      filters.categoria_id = filtros.categoria_id;
    }
  }

  let produtos = await db.select<Produto>(client, 'produtos', {
    filters,
    orderBy: { column: 'codigo', ascending: true },
  });

  // Filtrar por fornecedor se necessário
  if (filtros?.fornecedor_id) {
    const produtosFornecedor = await db.select<{ produto_id: string }>(client, 'produtos_fornecedores', {
      filters: { fornecedor_id: filtros.fornecedor_id },
    });
    const produtosFornecedorIds = new Set(produtosFornecedor.map((pf) => pf.produto_id));
    produtos = produtos.filter((p) => produtosFornecedorIds.has(p.id) || p.fornecedor_principal_id === filtros.fornecedor_id);
  }

  // Buscar fornecedores para cada produto
  const produtoIds = produtos.map((p) => p.id);
  const produtosFornecedores = await db.select<{ produto_id: string; fornecedor_id: string }>(
    client,
    'produtos_fornecedores',
    {
      filters: { produto_id: produtoIds },
    }
  );

  const fornecedoresMap = new Map<string, string[]>();
  for (const pf of produtosFornecedores) {
    const ids = fornecedoresMap.get(pf.produto_id) || [];
    ids.push(pf.fornecedor_id);
    fornecedoresMap.set(pf.produto_id, ids);
  }

  return produtos.map((p) => ({
    ...mapProdutoRow(p),
    fornecedores_ids: fornecedoresMap.get(p.id) || (p.fornecedor_principal_id ? [p.fornecedor_principal_id] : []),
  }));
}

export async function listComSaldos(env: Env, filtros?: FiltrosProduto): Promise<ProdutoComSaldo[]> {
  const produtos = await list(env, filtros);
  if (produtos.length === 0) return [];

  const client = getDataClient(env);
  const produtoIds = produtos.map((p) => p.id);

  // ✅ Uma única query para todos os produtos (evita N+1)
  const movimentacoes = await db.select<{ produto_id: string; quantidade: number }>(
    client,
    'movimentacoes_estoque',
    {
      filters: { produto_id: produtoIds },
    }
  );

  // Calcular saldos em memória
  const saldosMap = new Map<string, number>();
  for (const mov of movimentacoes) {
    saldosMap.set(mov.produto_id, (saldosMap.get(mov.produto_id) || 0) + mov.quantidade);
  }

  return produtos.map((p) => ({
    ...p,
    saldo: saldosMap.get(p.id) || 0,
  }));
}

export async function findById(env: Env, id: string): Promise<Produto | null> {
  const client = getDataClient(env);
  const produto = await db.findById<Produto>(client, 'produtos', id);
  if (!produto) return null;

  const fornecedoresIds = await getFornecedoresIds(env, id);
  return {
    ...mapProdutoRow(produto),
    fornecedores_ids: fornecedoresIds.length > 0 ? fornecedoresIds : (produto.fornecedor_principal_id ? [produto.fornecedor_principal_id] : []),
  };
}

export async function getFornecedoresIds(env: Env, produtoId: string): Promise<string[]> {
  const client = getDataClient(env);
  const produtosFornecedores = await db.select<{ fornecedor_id: string }>(client, 'produtos_fornecedores', {
    filters: { produto_id: produtoId },
    orderBy: { column: 'created_at', ascending: true },
  });
  return produtosFornecedores.map((pf) => pf.fornecedor_id);
}

export async function getSaldosPorCor(env: Env, produtoId: string): Promise<SaldoPorCor[]> {
  const client = getDataClient(env);
  // Buscar todas as cores que têm movimentações para este produto
  const movimentacoes = await db.select<{ cor_id: string | null }>(client, 'movimentacoes_estoque', {
    filters: { produto_id: produtoId },
  });

  const corIds = [...new Set(movimentacoes.map((m) => m.cor_id).filter((id): id is string => id !== null))];
  if (corIds.length === 0) return [];

  const cores = await db.select<{ id: string; nome: string }>(client, 'cores', {
    filters: { id: corIds },
  });

  const saldos: SaldoPorCor[] = [];
  for (const cor of cores) {
    const quantidade = await calcularSaldoPorCor(env, produtoId, cor.id);
    if (quantidade !== 0) {
      saldos.push({
        cor_id: cor.id,
        cor_nome: cor.nome,
        quantidade,
      });
    }
  }

  return saldos.sort((a, b) => a.cor_nome.localeCompare(b.cor_nome));
}

export async function findByCodigo(env: Env, codigo: string): Promise<Produto | null> {
  const client = getDataClient(env);
  const produtos = await db.select<Produto>(client, 'produtos', {
    filters: { codigo },
    limit: 1,
  });
  if (produtos.length === 0) return null;

  const produto = produtos[0];
  const fornecedoresIds = await getFornecedoresIds(env, produto.id);
  return {
    ...mapProdutoRow(produto),
    fornecedores_ids: fornecedoresIds.length > 0 ? fornecedoresIds : (produto.fornecedor_principal_id ? [produto.fornecedor_principal_id] : []),
  };
}

export async function create(env: Env, data: CreateProdutoInput): Promise<Produto> {
  const client = getDataClient(env);
  const fornecedoresIds = data.fornecedores_ids?.length ? data.fornecedores_ids : (data.fornecedor_principal_id ? [data.fornecedor_principal_id] : []);
  const fornecedorPrincipalId = fornecedoresIds[0] ?? data.fornecedor_principal_id ?? null;

  const produtoResult = await db.insert<Produto>(client, 'produtos', {
    codigo: data.codigo,
    descricao: data.descricao,
    unidade: data.unidade ?? 'UN',
    tipo: data.tipo,
    preco_compra: data.preco_compra ?? 0,
    preco_venda: data.preco_venda ?? 0,
    estoque_minimo: data.estoque_minimo ?? 0,
    estoque_maximo: data.estoque_maximo ?? null,
    fornecedor_principal_id: fornecedorPrincipalId,
    categoria_id: data.categoria_id ?? null,
    montado_comprimento_m: data.montado_comprimento_m ?? null,
    montado_largura_m: data.montado_largura_m ?? null,
    montado_altura_m: data.montado_altura_m ?? null,
    montado_peso_kg: data.montado_peso_kg ?? null,
    desmontado_comprimento_m: data.desmontado_comprimento_m ?? null,
    desmontado_largura_m: data.desmontado_largura_m ?? null,
    desmontado_altura_m: data.desmontado_altura_m ?? null,
    desmontado_peso_kg: data.desmontado_peso_kg ?? null,
    prazo_medio_entrega_dias: data.prazo_medio_entrega_dias ?? null,
    controlar_por_cor: false,
    tipo_item_producao: null,
  } as any);

  const produto = mapProdutoRow(produtoResult[0]);

  // Criar relações com fornecedores
  if (fornecedoresIds.length > 0) {
    for (const fid of fornecedoresIds) {
      try {
        await db.insert(client, 'produtos_fornecedores', {
          produto_id: produto.id,
          fornecedor_id: fid,
        } as any);
      } catch (e) {
        // Ignorar conflitos
      }
    }
    produto.fornecedores_ids = fornecedoresIds;
  }

  return produto;
}

export async function update(env: Env, id: string, data: UpdateProdutoInput): Promise<Produto | null> {
  const client = getDataClient(env);
  const current = await findById(env, id);
  if (!current) return null;

  const updateData: Partial<Produto> = {};
  if (data.codigo !== undefined) updateData.codigo = data.codigo;
  if (data.descricao !== undefined) updateData.descricao = data.descricao;
  if (data.unidade !== undefined) updateData.unidade = data.unidade;
  if (data.tipo !== undefined) updateData.tipo = data.tipo;
  if (data.preco_compra !== undefined) updateData.preco_compra = data.preco_compra;
  if (data.preco_venda !== undefined) updateData.preco_venda = data.preco_venda;
  if (data.estoque_minimo !== undefined) updateData.estoque_minimo = data.estoque_minimo;
  if (data.estoque_maximo !== undefined) updateData.estoque_maximo = data.estoque_maximo;
  if (data.fornecedor_principal_id !== undefined) updateData.fornecedor_principal_id = data.fornecedor_principal_id;
  if (data.categoria_id !== undefined) updateData.categoria_id = data.categoria_id;
  if (data.montado_comprimento_m !== undefined) updateData.montado_comprimento_m = data.montado_comprimento_m;
  if (data.montado_largura_m !== undefined) updateData.montado_largura_m = data.montado_largura_m;
  if (data.montado_altura_m !== undefined) updateData.montado_altura_m = data.montado_altura_m;
  if (data.montado_peso_kg !== undefined) updateData.montado_peso_kg = data.montado_peso_kg;
  if (data.desmontado_comprimento_m !== undefined) updateData.desmontado_comprimento_m = data.desmontado_comprimento_m;
  if (data.desmontado_largura_m !== undefined) updateData.desmontado_largura_m = data.desmontado_largura_m;
  if (data.desmontado_altura_m !== undefined) updateData.desmontado_altura_m = data.desmontado_altura_m;
  if (data.desmontado_peso_kg !== undefined) updateData.desmontado_peso_kg = data.desmontado_peso_kg;
  if (data.prazo_medio_entrega_dias !== undefined) updateData.prazo_medio_entrega_dias = data.prazo_medio_entrega_dias;

  const updated = await db.update<Produto>(client, 'produtos', id, updateData as any);
  if (!updated) return null;

  // Atualizar fornecedores se necessário
  if (data.fornecedores_ids !== undefined) {
    // Deletar relações antigas
    const produtosFornecedores = await db.select<{ id: string }>(client, 'produtos_fornecedores', {
      filters: { produto_id: id },
    });
    for (const pf of produtosFornecedores) {
      await db.remove(client, 'produtos_fornecedores', pf.id);
    }

    // Criar novas relações
    const fornecedoresIds = data.fornecedores_ids ?? [];
    for (const fid of fornecedoresIds) {
      try {
        await db.insert(client, 'produtos_fornecedores', {
          produto_id: id,
          fornecedor_id: fid,
        } as any);
      } catch (e) {
        // Ignorar erros
      }
    }
    updated.fornecedores_ids = fornecedoresIds;
  }

  return mapProdutoRow(updated);
}

export async function remove(env: Env, id: string): Promise<boolean> {
  const client = getDataClient(env);
  try {
    await db.remove(client, 'produtos', id);
    return true;
  } catch (error) {
    return false;
  }
}

export async function createMany(env: Env, items: CreateProdutoInput[]): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;
  for (const data of items) {
    try {
      await create(env, data);
      created++;
    } catch (e) {
      errors.push(`${data.codigo}: ${e instanceof Error ? e.message : 'Erro'}`);
    }
  }
  return { created, errors };
}

const DIAS_HISTORICO_ESTOQUE = 56;
const LEAD_TIME_DIAS = 7;
const DIAS_SEGURANCA = 7;

export async function getSugestaoEstoque(env: Env, produtoId: string): Promise<SugestaoEstoque> {
  const client = getDataClient(env);
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - DIAS_HISTORICO_ESTOQUE);

  const movimentacoes = await db.select<{ quantidade: number; tipo: string; data: string }>(
    client,
    'movimentacoes_estoque',
    {
      filters: {
        produto_id: produtoId,
        tipo: ['saida', 'producao'],
        data: `>=${dataLimite.toISOString().split('T')[0]}`,
      },
    }
  );

  const totalSaidas = movimentacoes.reduce((sum, m) => sum + Math.abs(m.quantidade), 0);
  const consumo_medio_diario = DIAS_HISTORICO_ESTOQUE > 0 ? totalSaidas / DIAS_HISTORICO_ESTOQUE : 0;

  if (totalSaidas <= 0) {
    return {
      estoque_minimo_sugerido: 0,
      estoque_maximo_sugerido: null,
      consumo_medio_diario: 0,
      dias_historico: DIAS_HISTORICO_ESTOQUE,
      mensagem: 'Sem histórico de saídas no período. Defina o mínimo manualmente.',
    };
  }

  const estoque_minimo_sugerido = Math.ceil(consumo_medio_diario * (LEAD_TIME_DIAS + DIAS_SEGURANCA));
  const estoque_maximo_sugerido = Math.ceil(estoque_minimo_sugerido * 2);

  return {
    estoque_minimo_sugerido,
    estoque_maximo_sugerido,
    consumo_medio_diario,
    dias_historico: DIAS_HISTORICO_ESTOQUE,
  };
}
