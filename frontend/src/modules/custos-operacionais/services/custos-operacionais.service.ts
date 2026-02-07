import { apiClient } from '../../../shared/lib/api-client';
import type {
  CategoriaCustoOperacional,
  CustoOperacionalComCategoria,
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
  CustosMesResponse,
  UpsertCustosMesRequest,
} from '../types/custos.types';

export async function listCategorias(token: string): Promise<CategoriaCustoOperacional[]> {
  return apiClient.get<CategoriaCustoOperacional[]>('/api/custos-operacionais/categorias', token);
}

export async function listCategoriasAtivas(token: string): Promise<CategoriaCustoOperacional[]> {
  return apiClient.get<CategoriaCustoOperacional[]>('/api/custos-operacionais/categorias/ativas', token);
}

export async function getCategoria(id: string, token: string): Promise<CategoriaCustoOperacional> {
  return apiClient.get<CategoriaCustoOperacional>(`/api/custos-operacionais/categorias/${id}`, token);
}

export async function createCategoria(data: CreateCategoriaRequest, token: string): Promise<CategoriaCustoOperacional> {
  return apiClient.post<CategoriaCustoOperacional>('/api/custos-operacionais/categorias', data, token);
}

export async function updateCategoria(id: string, data: UpdateCategoriaRequest, token: string): Promise<CategoriaCustoOperacional> {
  return apiClient.patch<CategoriaCustoOperacional>(`/api/custos-operacionais/categorias/${id}`, data, token);
}

export async function deleteCategoria(id: string, token: string): Promise<void> {
  return apiClient.delete(`/api/custos-operacionais/categorias/${id}`, token);
}

export async function getCustosMes(ano: number, mes: number, token: string): Promise<CustosMesResponse> {
  const res = await apiClient.get<{ list: CustoOperacionalComCategoria[]; totais: CustosMesResponse['totais'] }>(
    `/api/custos-operacionais/mes?ano=${ano}&mes=${mes}`,
    token
  );
  return { data: res.list, totais: res.totais };
}

export async function upsertCustosMes(body: UpsertCustosMesRequest, token: string): Promise<CustosMesResponse> {
  const res = await apiClient.post<{ list: CustoOperacionalComCategoria[]; totais: CustosMesResponse['totais'] }>(
    '/api/custos-operacionais/mes',
    body,
    token
  );
  return { data: res.list, totais: res.totais };
}
