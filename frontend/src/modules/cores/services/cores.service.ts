import { apiClient } from '../../../shared/lib/api-client';
import type { Cor, CreateCorRequest, UpdateCorRequest } from '../types/cores.types';

export async function listCores(token: string): Promise<Cor[]> {
  return apiClient.get<Cor[]>('/api/cores', token);
}

export async function getCor(id: string, token: string): Promise<Cor> {
  return apiClient.get<Cor>(`/api/cores/${id}`, token);
}

export async function createCor(token: string, data: CreateCorRequest): Promise<Cor> {
  return apiClient.post<Cor>('/api/cores', data, token);
}

export async function updateCor(token: string, id: string, data: UpdateCorRequest): Promise<Cor> {
  return apiClient.patch<Cor>(`/api/cores/${id}`, data, token);
}

export async function deleteCor(token: string, id: string): Promise<void> {
  return apiClient.delete(`/api/cores/${id}`, token);
}
