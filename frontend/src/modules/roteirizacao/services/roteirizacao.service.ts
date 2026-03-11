import { apiClient } from '../../../shared/lib/api-client';
import type { Veiculo, EntregaComPedido } from '../types/roteirizacao.types';

export async function listVeiculos(token: string): Promise<Veiculo[]> {
  return apiClient.get<Veiculo[]>('/api/roteirizacao/veiculos', token);
}

export async function createVeiculo(token: string, data: Partial<Veiculo> & { nome: string }): Promise<Veiculo> {
  return apiClient.post<Veiculo>('/api/roteirizacao/veiculos', data, token);
}

export async function updateVeiculo(token: string, id: string, data: Partial<Veiculo>): Promise<Veiculo> {
  return apiClient.patch<Veiculo>(`/api/roteirizacao/veiculos/${id}`, data, token);
}

export async function listEntregas(
  token: string,
  params?: { veiculo_id?: string; data?: string; status?: string }
): Promise<EntregaComPedido[]> {
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== '')
      )
    : {};
  const q = Object.keys(cleanParams).length
    ? new URLSearchParams(cleanParams as Record<string, string>).toString()
    : '';
  return apiClient.get<EntregaComPedido[]>(`/api/roteirizacao/entregas${q ? `?${q}` : ''}`, token);
}

export type PendenteEntrega = {
  id: string;
  cliente_nome: string | null;
  endereco_entrega: string | null;
  zona_entrega: string | null;
  micro_regiao_entrega: string | null;
  total: number;
};

export async function listPendentesEntrega(token: string): Promise<PendenteEntrega[]> {
  return apiClient.get<PendenteEntrega[]>(`/api/roteirizacao/entregas/pendentes`, token);
}

export type PedidoParaMapa = {
  id: string;
  cliente_nome: string | null;
  endereco_entrega: string | null;
  endereco_lat: number | null;
  endereco_lon: number | null;
  data_pedido: string;
  data_entrega_prevista: string | null;
};

export async function listPedidosParaMapa(token: string): Promise<PedidoParaMapa[]> {
  return apiClient.get<PedidoParaMapa[]>(`/api/roteirizacao/entregas/mapa`, token);
}

export async function createEntrega(
  token: string,
  data: { pedido_venda_id: string; veiculo_id?: string | null; data_entrega_prevista?: string | null }
): Promise<EntregaComPedido> {
  return apiClient.post<EntregaComPedido>('/api/roteirizacao/entregas', data, token);
}

export async function updateEntrega(
  token: string,
  id: string,
  data: { veiculo_id?: string | null; data_entrega_prevista?: string | null; ordem_na_rota?: number | null }
): Promise<EntregaComPedido> {
  return apiClient.patch<EntregaComPedido>(`/api/roteirizacao/entregas/${id}`, data, token);
}

export async function marcarEntregue(token: string, id: string): Promise<EntregaComPedido> {
  return apiClient.post<EntregaComPedido>(`/api/roteirizacao/entregas/${id}/entregue`, {}, token);
}

export async function removeEntrega(token: string, id: string): Promise<void> {
  await apiClient.delete(`/api/roteirizacao/entregas/${id}`, token);
}

export interface MarcarInoperanteResponse {
  veiculo: Veiculo;
  entregasAfetadas: EntregaComPedido[];
}

export async function marcarVeiculoInoperante(token: string, veiculoId: string, motivo: string | null): Promise<MarcarInoperanteResponse> {
  return apiClient.patch<MarcarInoperanteResponse>(`/api/roteirizacao/veiculos/${veiculoId}/inoperante`, { inoperante: true, motivo }, token);
}

export async function listEntregasAfetadasVeiculo(token: string, veiculoId: string): Promise<EntregaComPedido[]> {
  return apiClient.get<EntregaComPedido[]>(`/api/roteirizacao/entregas-afetadas-veiculo/${veiculoId}`, token);
}

export async function reagendarEntregas(
  token: string,
  data: { entrega_ids: string[]; novo_veiculo_id?: string | null; nova_data?: string | null }
): Promise<{ reagendadas: number }> {
  return apiClient.post<{ reagendadas: number }>('/api/roteirizacao/reagendar-entregas', data, token);
}

export async function sugerirOrdemRota(token: string, veiculo_id: string, data_entrega: string): Promise<{ entrega_ids: string[] }> {
  return apiClient.post<{ entrega_ids: string[] }>('/api/roteirizacao/sugerir-ordem', { veiculo_id, data_entrega }, token);
}

export async function aplicarOrdemRota(token: string, entrega_ids_ordenados: string[]): Promise<void> {
  await apiClient.patch<{ ok: boolean }>('/api/roteirizacao/entregas/ordem', { entrega_ids_ordenados }, token);
}
