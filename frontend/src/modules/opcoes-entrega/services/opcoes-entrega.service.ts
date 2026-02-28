import { apiClient } from '../../../shared/lib/api-client';
import type { OpcaoEntrega, CreateOpcaoEntregaRequest, UpdateOpcaoEntregaRequest } from '../types/opcoes-entrega.types';

const BASE = '/api/opcoes-entrega';

export async function list(token: string): Promise<OpcaoEntrega[]> {
  return apiClient.get<OpcaoEntrega[]>(BASE, token);
}

export async function getById(id: string, token: string): Promise<OpcaoEntrega | null> {
  try {
    return await apiClient.get<OpcaoEntrega>(`${BASE}/${id}`, token);
  } catch {
    return null;
  }
}

export async function create(data: CreateOpcaoEntregaRequest, token: string): Promise<OpcaoEntrega> {
  return apiClient.post<OpcaoEntrega>(BASE, data, token);
}

export async function update(id: string, data: UpdateOpcaoEntregaRequest, token: string): Promise<OpcaoEntrega> {
  return apiClient.patch<OpcaoEntrega>(`${BASE}/${id}`, data, token);
}

export async function remove(id: string, token: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`, token);
}

export async function getConfig(chave: string, token: string): Promise<string | null> {
  const res = await apiClient.get<{ chave: string; valor: string | null }>(`${BASE}/config/${chave}`, token);
  return res.valor ?? null;
}

export async function setConfig(chave: string, valor: string | null, token: string): Promise<void> {
  await apiClient.put(`${BASE}/config/${chave}`, { valor }, token);
}
