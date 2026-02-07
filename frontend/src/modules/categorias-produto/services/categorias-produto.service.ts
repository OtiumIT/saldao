import { apiClient } from '../../../shared/lib/api-client';
import type {
  CategoriaProduto,
  CreateCategoriaProdutoRequest,
  UpdateCategoriaProdutoRequest,
} from '../types/categorias-produto.types';

export async function listCategoriasProduto(token: string): Promise<CategoriaProduto[]> {
  return apiClient.get<CategoriaProduto[]>('/api/categorias-produto', token);
}

export async function getCategoriaProduto(id: string, token: string): Promise<CategoriaProduto> {
  return apiClient.get<CategoriaProduto>(`/api/categorias-produto/${id}`, token);
}

export async function createCategoriaProduto(
  data: CreateCategoriaProdutoRequest,
  token: string
): Promise<CategoriaProduto> {
  return apiClient.post<CategoriaProduto>('/api/categorias-produto', data, token);
}

export async function updateCategoriaProduto(
  id: string,
  data: UpdateCategoriaProdutoRequest,
  token: string
): Promise<CategoriaProduto> {
  return apiClient.patch<CategoriaProduto>(`/api/categorias-produto/${id}`, data, token);
}

export async function deleteCategoriaProduto(id: string, token: string): Promise<void> {
  return apiClient.delete(`/api/categorias-produto/${id}`, token);
}
