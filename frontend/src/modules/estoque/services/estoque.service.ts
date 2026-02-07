import { apiClient } from '../../../shared/lib/api-client';
import type {
  Produto,
  ProdutoComSaldo,
  CreateProdutoRequest,
  UpdateProdutoRequest,
  MovimentacaoComProduto,
  SaldoPorCor,
  TipoProduto,
} from '../types/estoque.types';

export interface FiltrosProduto {
  tipo?: TipoProduto;
  categoria_id?: string | null;
  fornecedor_id?: string;
}

export async function listProdutos(
  token: string,
  comSaldos = true,
  filtros?: FiltrosProduto
): Promise<ProdutoComSaldo[] | Produto[]> {
  const params = new URLSearchParams();
  if (comSaldos) params.set('saldos', '1');
  if (filtros?.tipo) params.set('tipo', filtros.tipo);
  if (filtros?.categoria_id !== undefined) params.set('categoria_id', filtros.categoria_id ?? '');
  const q = params.toString();
  return apiClient.get<ProdutoComSaldo[] | Produto[]>(`/api/produtos${q ? `?${q}` : ''}`, token);
}

export async function getProduto(id: string, token: string): Promise<Produto> {
  return apiClient.get<Produto>(`/api/produtos/${id}`, token);
}

export async function createProduto(data: CreateProdutoRequest, token: string): Promise<Produto> {
  return apiClient.post<Produto>('/api/produtos', data, token);
}

export async function updateProduto(id: string, data: UpdateProdutoRequest, token: string): Promise<Produto> {
  return apiClient.patch<Produto>(`/api/produtos/${id}`, data, token);
}

export async function deleteProduto(id: string, token: string): Promise<void> {
  return apiClient.delete(`/api/produtos/${id}`, token);
}

export async function importProdutos(items: CreateProdutoRequest[], token: string): Promise<{ created: number; errors: string[] }> {
  return apiClient.post<{ created: number; errors: string[] }>('/api/produtos/bulk', items, token);
}

export interface FiltrosMovimentacao {
  produto_id?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo?: string;
}

export async function listMovimentacoes(token: string, filtros?: FiltrosMovimentacao): Promise<MovimentacaoComProduto[]> {
  const params = new URLSearchParams();
  if (filtros?.produto_id) params.set('produto_id', filtros.produto_id);
  if (filtros?.data_inicio) params.set('data_inicio', filtros.data_inicio);
  if (filtros?.data_fim) params.set('data_fim', filtros.data_fim);
  if (filtros?.tipo) params.set('tipo', filtros.tipo);
  const q = params.toString();
  return apiClient.get<MovimentacaoComProduto[]>(`/api/movimentacoes-estoque${q ? `?${q}` : ''}`, token);
}

export async function criarAjuste(
  token: string,
  produto_id: string,
  quantidade: number,
  observacao?: string,
  cor_id?: string | null
): Promise<unknown> {
  return apiClient.post(
    '/api/movimentacoes-estoque/ajuste',
    { produto_id, quantidade, observacao, cor_id: cor_id ?? undefined },
    token
  );
}

export async function conferenciaLote(
  token: string,
  itens: Array<{ produto_id: string; saldo_atual: number }>
): Promise<{ processados: number; erros: string[] }> {
  return apiClient.post<{ processados: number; erros: string[] }>(
    '/api/movimentacoes-estoque/conferencia',
    { itens },
    token
  );
}

export interface SugestaoEstoque {
  estoque_minimo_sugerido: number;
  estoque_maximo_sugerido: number | null;
  consumo_medio_diario: number;
  dias_historico: number;
  mensagem?: string;
}

export async function getSugestaoEstoque(produtoId: string, token: string): Promise<SugestaoEstoque> {
  return apiClient.get<SugestaoEstoque>(`/api/produtos/${produtoId}/sugestao-estoque`, token);
}

export async function getSaldosPorCor(produtoId: string, token: string): Promise<SaldoPorCor[]> {
  return apiClient.get<SaldoPorCor[]>(`/api/produtos/${produtoId}/saldos-por-cor`, token);
}
