import { apiClient } from '../../../shared/lib/api-client';
import type {
  BomComInsumo,
  OrdemComProduto,
  OrdemProducaoItem,
  QuantidadePossivel,
  CreateOrdemRequest,
  ConferenciaEstoquePorCorResult,
} from '../types/producao.types';

export async function listBom(produtoFabricadoId: string, token: string): Promise<BomComInsumo[]> {
  return apiClient.get<BomComInsumo[]>(`/api/producao/bom/${produtoFabricadoId}`, token);
}

export async function saveBomItem(
  token: string,
  data: { produto_fabricado_id: string; produto_insumo_id: string; quantidade_por_unidade: number }
): Promise<BomComInsumo> {
  return apiClient.post<BomComInsumo>('/api/producao/bom', data, token);
}

export async function removeBomItem(
  token: string,
  produtoFabricadoId: string,
  produtoInsumoId: string
): Promise<void> {
  return apiClient.delete(`/api/producao/bom/${produtoFabricadoId}/${produtoInsumoId}`, token);
}

export async function getQuantidadePossivel(produtoFabricadoId: string, token: string): Promise<QuantidadePossivel> {
  return apiClient.get<QuantidadePossivel>(`/api/producao/quantidade-possivel/${produtoFabricadoId}`, token);
}

export async function listOrdens(
  token: string,
  params?: { status?: string; data_inicio?: string; data_fim?: string }
): Promise<OrdemComProduto[]> {
  const q = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiClient.get<OrdemComProduto[]>(`/api/producao/ordens${q ? `?${q}` : ''}`, token);
}

export async function createOrdem(token: string, data: CreateOrdemRequest): Promise<OrdemComProduto> {
  return apiClient.post<OrdemComProduto>('/api/producao/ordens', data, token);
}

export async function listOrdensItens(token: string, ordemId: string): Promise<OrdemProducaoItem[]> {
  return apiClient.get<OrdemProducaoItem[]>(`/api/producao/ordens/${ordemId}/itens`, token);
}

export interface ConferirEstoqueParams {
  cor_id: string;
  ordem_id?: string;
  produto_fabricado_id?: string;
  quantidade?: number;
  itens?: Array<{ produto_id: string; quantidade: number }>;
}

export async function conferirEstoquePorCor(
  token: string,
  params: ConferirEstoqueParams
): Promise<ConferenciaEstoquePorCorResult> {
  return apiClient.post<ConferenciaEstoquePorCorResult>('/api/producao/conferir-estoque-por-cor', params, token);
}

export async function executarOrdem(token: string, ordemId: string): Promise<void> {
  return apiClient.post(`/api/producao/ordens/${ordemId}/executar`, {}, token);
}
