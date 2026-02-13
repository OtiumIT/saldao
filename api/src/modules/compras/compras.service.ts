import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './compras.repository.js';
import * as repoSupabase from './compras.repository.supabase.js';
import { produtosService } from '../estoque/produtos.service.js';

export interface ImportExcelRow {
  codigo?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  preco_revenda?: number;
}

export const comprasService = {
  list: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.list(env);
    }
    return repo.list();
  },
  findById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findById(env, id);
    }
    return repo.findById(id);
  },
  listItens: (env: Env, pedidoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listItens(env, pedidoId);
    }
    return repo.listItens(pedidoId);
  },
  createPedido: (env: Env, data: Parameters<typeof repo.createPedido>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createPedido(env, data);
    }
    return repo.createPedido(data);
  },
  updatePedido: (env: Env, id: string, data: Parameters<typeof repo.updatePedido>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.updatePedido(env, id, data);
    }
    return repo.updatePedido(id, data);
  },
  receber: (env: Env, id: string, itens: Parameters<typeof repo.receber>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.receber(env, id, itens);
    }
    return repo.receber(id, itens);
  },
  getUltimosPrecos: (env: Env, fornecedorId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getUltimosPrecos(env, fornecedorId);
    }
    return repo.getUltimosPrecos(fornecedorId);
  },

  /**
   * Importa planilha: para cada linha encontra ou cria o produto, depois cria o pedido de compra.
   */
  async importFromExcel(
    env: Env,
    data: {
      fornecedor_id: string;
      data_pedido?: string;
      observacoes?: string | null;
      rows: ImportExcelRow[];
    }
  ): Promise<{ pedido_id: string; produtos_criados: number }> {
    const itens: Array<{ produto_id: string; quantidade: number; preco_unitario: number }> = [];
    let produtosCriados = 0;
    const produtosDoFornecedor = await produtosService.list(env, { fornecedor_id: data.fornecedor_id });

    for (let i = 0; i < data.rows.length; i++) {
      const row = data.rows[i];
      const desc = (row.descricao ?? '').toString().trim();
      const qtd = Number(row.quantidade) || 0;
      if (!desc || qtd <= 0) continue;

      const valorUnit = Number(row.valor_unitario) || 0;
      const precoRevenda = row.preco_revenda != null ? Number(row.preco_revenda) : undefined;
      let produtoId: string | null = null;

      const codigo = row.codigo?.trim();
      if (codigo) {
        const byCodigo = await produtosService.findByCodigo(env, codigo);
        if (byCodigo) produtoId = byCodigo.id;
      }
      if (!produtoId) {
        const descNorm = desc.toLowerCase();
        const byDesc = produtosDoFornecedor.find(
          (p) => p.descricao?.toLowerCase() === descNorm || (p.descricao?.toLowerCase().includes(descNorm) && descNorm.length > 5)
        );
        if (byDesc) produtoId = byDesc.id;
      }

      if (!produtoId) {
        const codigoNovo = codigo || `IMP-${Date.now()}-${i}`;
        const existente = await produtosService.findByCodigo(env, codigoNovo);
        const codigoFinal = existente ? `IMP-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}` : codigoNovo;
        const criado = await produtosService.create(env, {
          codigo: codigoFinal,
          descricao: desc,
          unidade: 'UN',
          tipo: 'revenda',
          preco_compra: valorUnit,
          preco_venda: precoRevenda ?? valorUnit * 1.5,
          estoque_minimo: 0,
          estoque_maximo: null,
          fornecedor_principal_id: data.fornecedor_id,
          fornecedores_ids: [data.fornecedor_id],
        });
        produtoId = criado.id;
        produtosCriados++;
        produtosDoFornecedor.push(criado);
      }

      itens.push({
        produto_id: produtoId,
        quantidade: qtd,
        preco_unitario: valorUnit,
      });
    }

    if (itens.length === 0) throw new Error('Nenhum item válido na planilha (é necessário descrição e quantidade > 0).');

    const createData = {
      fornecedor_id: data.fornecedor_id,
      data_pedido: data.data_pedido,
      observacoes: data.observacoes ?? null,
      tipo: 'recepcao' as const,
      itens,
    };
    const pedido = await this.createPedido(env, createData);
    return { pedido_id: pedido.id, produtos_criados: produtosCriados };
  },
};
