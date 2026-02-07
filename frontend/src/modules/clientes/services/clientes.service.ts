import { apiClient } from '../../../shared/lib/api-client';
import type { Cliente, CreateClienteRequest, UpdateClienteRequest } from '../types/clients.types';

export async function listClientes(token: string): Promise<Cliente[]> {
  return apiClient.get<Cliente[]>('/api/clientes', token);
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
