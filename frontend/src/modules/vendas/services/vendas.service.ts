import { apiClient } from '../../../shared/lib/api-client';
import type {
  PedidoVendaComCliente,
  PedidoVendaComItens,
  CreatePedidoVendaRequest,
} from '../types/vendas.types';

export interface ListPedidosVendaParams {
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  cliente_nome?: string | null;
  fornecedor_id?: string | null;
  produto_id?: string | null;
  incluir_cancelados?: boolean;
}

export interface TotaisVendas {
  total_dia: number;
  total_semana: number;
  total_mes: number;
}

export async function getTotaisVendas(token: string): Promise<TotaisVendas> {
  return apiClient.get<TotaisVendas>('/api/vendas/totais', token);
}

export async function listPedidosVenda(
  token: string,
  params?: ListPedidosVendaParams
): Promise<PedidoVendaComCliente[]> {
  if (!params) return apiClient.get<PedidoVendaComCliente[]>('/api/vendas', token);
  const { incluir_cancelados, ...rest } = params ?? {};
  const entries = Object.entries(rest).filter(
    (entry): entry is [string, string] => entry[1] != null && entry[1] !== ''
  );
  if (incluir_cancelados === true) {
    entries.push(['incluir_cancelados', '1']);
  }
  const q = entries.length > 0 ? new URLSearchParams(entries).toString() : '';
  return apiClient.get<PedidoVendaComCliente[]>(`/api/vendas${q ? `?${q}` : ''}`, token);
}

export async function getPedidoVenda(id: string, token: string): Promise<PedidoVendaComItens> {
  return apiClient.get<PedidoVendaComItens>(`/api/vendas/${id}`, token);
}

export async function createPedidoVenda(data: CreatePedidoVendaRequest, token: string): Promise<PedidoVendaComCliente> {
  return apiClient.post<PedidoVendaComCliente>('/api/vendas', data, token);
}

export async function updatePedidoVenda(id: string, data: Partial<CreatePedidoVendaRequest>, token: string): Promise<PedidoVendaComCliente> {
  return apiClient.patch<PedidoVendaComCliente>(`/api/vendas/${id}`, data, token);
}

export async function confirmarPedidoVenda(
  id: string,
  token: string,
  body?: { previsao_entrega_em_dias?: number | null }
): Promise<PedidoVendaComCliente> {
  return apiClient.post<PedidoVendaComCliente>(`/api/vendas/${id}/confirmar`, body ?? {}, token);
}

export async function marcarEntregue(id: string, token: string): Promise<PedidoVendaComCliente> {
  return apiClient.post<PedidoVendaComCliente>(`/api/vendas/${id}/entregue`, {}, token);
}

export async function cancelarPedidoVenda(id: string, token: string): Promise<PedidoVendaComCliente> {
  return apiClient.post<PedidoVendaComCliente>(`/api/vendas/${id}/cancelar`, {}, token);
}

export interface SaleOrderExtraction {
  cliente_nome?: string | null;
  data_pedido?: string | null;
  itens: Array<{ descricao?: string; codigo?: string; quantidade: number; preco_unitario: number }>;
  total?: number | null;
  observacoes?: string | null;
}

export async function extractVendaFromImage(imageBase64: string, token: string): Promise<SaleOrderExtraction> {
  return apiClient.post<SaleOrderExtraction>('/api/vendas/extract-from-image', { imageBase64 }, token);
}

export interface PrecoSugerido {
  preco_sugerido: number;
  origem: string;
}

export async function getSugestaoPreco(produtoId: string, token: string): Promise<PrecoSugerido> {
  return apiClient.get<PrecoSugerido>(`/api/vendas/sugestao-preco?produto_id=${encodeURIComponent(produtoId)}`, token);
}

export interface ItemSugerido {
  produto_id: string;
  codigo: string;
  descricao: string;
  preco_venda: number;
  vezes_junto: number;
}

export async function getItensSugeridos(produtoId: string, token: string): Promise<ItemSugerido[]> {
  return apiClient.get<ItemSugerido[]>(`/api/vendas/itens-sugeridos?produto_id=${encodeURIComponent(produtoId)}`, token);
}

export interface CalcularDistanciaResponse {
  km: number;
}

export async function getCalcularDistancia(endereco: string, token: string): Promise<CalcularDistanciaResponse> {
  return apiClient.get<CalcularDistanciaResponse>(
    `/api/vendas/calcular-distancia?endereco=${encodeURIComponent(endereco)}`,
    token
  );
}

export interface LinhaRelatorioVendas {
  pedido_id: string;
  data_pedido: string;
  cliente_nome: string | null;
  produto_id: string;
  produto_codigo: string;
  produto_descricao: string;
  produto_tipo: string;
  fornecedor_nome: string | null;
  quantidade: number;
  preco_unitario: number;
  total_item: number;
}

export interface RelatorioVendasResult {
  periodo: { data_inicio: string; data_fim: string };
  resumo: { total_pedidos: number; total_valor: number; total_linhas: number };
  linhas: LinhaRelatorioVendas[];
}

export interface RelatorioVendasParams {
  data_inicio: string;
  data_fim: string;
  fornecedor_id?: string | null;
  produto_id?: string | null;
  incluir_rascunho?: boolean;
}

export async function getRelatorioVendas(
  token: string,
  params: RelatorioVendasParams
): Promise<RelatorioVendasResult> {
  const q = new URLSearchParams({
    data_inicio: params.data_inicio,
    data_fim: params.data_fim,
  });
  if (params.fornecedor_id) q.set('fornecedor_id', params.fornecedor_id);
  if (params.produto_id) q.set('produto_id', params.produto_id);
  if (params.incluir_rascunho) q.set('incluir_rascunho', 'true');
  return apiClient.get<RelatorioVendasResult>(`/api/vendas/relatorio?${q.toString()}`, token);
}

export async function getRelatorioVendasPorMes(
  token: string,
  mes: string,
  params?: { fornecedor_id?: string | null; produto_id?: string | null }
): Promise<RelatorioVendasResult> {
  const q = new URLSearchParams({ mes });
  if (params?.fornecedor_id) q.set('fornecedor_id', params.fornecedor_id);
  if (params?.produto_id) q.set('produto_id', params.produto_id);
  return apiClient.get<RelatorioVendasResult>(`/api/vendas/relatorio?${q.toString()}`, token);
}
