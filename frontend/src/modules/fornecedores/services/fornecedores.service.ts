import { apiClient } from '../../../shared/lib/api-client';
import type { Fornecedor, CreateFornecedorRequest, UpdateFornecedorRequest, TipoFornecedor } from '../types/suppliers.types';

export async function listFornecedores(token: string, tipo?: TipoFornecedor | null): Promise<Fornecedor[]> {
  const params = tipo ? `?tipo=${encodeURIComponent(tipo)}` : '';
  return apiClient.get<Fornecedor[]>(`/api/fornecedores${params}`, token);
}

export async function getFornecedor(id: string, token: string): Promise<Fornecedor> {
  return apiClient.get<Fornecedor>(`/api/fornecedores/${id}`, token);
}

export async function createFornecedor(data: CreateFornecedorRequest, token: string): Promise<Fornecedor> {
  return apiClient.post<Fornecedor>('/api/fornecedores', data, token);
}

export async function updateFornecedor(id: string, data: UpdateFornecedorRequest, token: string): Promise<Fornecedor> {
  return apiClient.patch<Fornecedor>(`/api/fornecedores/${id}`, data, token);
}

export async function deleteFornecedor(id: string, token: string): Promise<void> {
  return apiClient.delete(`/api/fornecedores/${id}`, token);
}
