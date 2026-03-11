import { apiClient } from '../../../shared/lib/api-client';
import type { Cliente, ClienteCompleto, CreateClienteRequest, UpdateClienteRequest } from '../types/clients.types';

export async function listClientes(token: string): Promise<Cliente[]> {
  return apiClient.get<Cliente[]>('/api/clientes', token);
}

/** Lista clientes com dados completos (última compra, total compras, total gasto). Mais lento. */
export async function listClientesCompleto(token: string): Promise<ClienteCompleto[]> {
  return apiClient.get<ClienteCompleto[]>('/api/clientes?completo=true', token);
}

/** Busca cliente por CPF (11 dígitos), CNPJ (14) ou WhatsApp/fone. Retorna um cliente ou null. */
export async function getClienteByIdentificador(identificador: string, token: string): Promise<Cliente | null> {
  const q = identificador.trim();
  if (!q) return null;
  try {
    return await apiClient.get<Cliente>(`/api/clientes?identificador=${encodeURIComponent(q)}`, token);
  } catch {
    return null;
  }
}

/** Busca clientes por qualquer texto (nome, etc.). Retorna lista (até 20). */
export async function searchClientes(busca: string, token: string): Promise<Cliente[]> {
  const q = busca.trim();
  if (!q) return [];
  try {
    return await apiClient.get<Cliente[]>(`/api/clientes?busca=${encodeURIComponent(q)}`, token);
  } catch {
    return [];
  }
}

export async function getCliente(id: string, token: string): Promise<Cliente> {
  return apiClient.get<Cliente>(`/api/clientes/${id}`, token);
}

export async function createCliente(data: CreateClienteRequest, token: string): Promise<Cliente> {
  return apiClient.post<Cliente>('/api/clientes', data, token);
}

export async function updateCliente(id: string, data: UpdateClienteRequest, token: string): Promise<Cliente> {
  return apiClient.patch<Cliente>(`/api/clientes/${id}`, data, token);
}

export async function deleteCliente(id: string, token: string): Promise<void> {
  return apiClient.delete(`/api/clientes/${id}`, token);
}
