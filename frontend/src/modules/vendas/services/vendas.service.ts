import { apiClient } from '../../../shared/lib/api-client';
import type {
  PedidoVendaComCliente,
  PedidoVendaComItens,
  CreatePedidoVendaRequest,
} from '../types/vendas.types';

export async function listPedidosVenda(
  token: string,
  params?: { status?: string; data_inicio?: string; data_fim?: string }
): Promise<PedidoVendaComCliente[]> {
  const q = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
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
