import { apiClient } from '../../../shared/lib/api-client';
import type {
  Funcionario,
  FolhaPeriodo,
  CreateFuncionarioRequest,
  UpdateFuncionarioRequest,
  SaveFolhaRequest,
} from '../types/funcionarios.types';

export async function listFuncionarios(token: string, apenasAtivos = false): Promise<Funcionario[]> {
  const url = apenasAtivos ? '/api/funcionarios?ativos=1' : '/api/funcionarios';
  return apiClient.get<Funcionario[]>(url, token);
}

export async function getFuncionario(id: string, token: string): Promise<Funcionario> {
  return apiClient.get<Funcionario>(`/api/funcionarios/${id}`, token);
}

export async function createFuncionario(data: CreateFuncionarioRequest, token: string): Promise<Funcionario> {
  return apiClient.post<Funcionario>('/api/funcionarios', data, token);
}

export async function updateFuncionario(id: string, data: UpdateFuncionarioRequest, token: string): Promise<Funcionario> {
  return apiClient.patch<Funcionario>(`/api/funcionarios/${id}`, data, token);
}

export async function deleteFuncionario(id: string, token: string): Promise<void> {
  return apiClient.delete(`/api/funcionarios/${id}`, token);
}

export async function getFolhaPeriodo(ano: number, mes: number, token: string): Promise<FolhaPeriodo> {
  return apiClient.get<FolhaPeriodo>(`/api/funcionarios/folha?ano=${ano}&mes=${mes}`, token);
}

export async function saveFolhaMes(data: SaveFolhaRequest, token: string): Promise<{ pagamentos: FolhaPeriodo['pagamentos'] }> {
  return apiClient.post<{ pagamentos: FolhaPeriodo['pagamentos'] }>('/api/funcionarios/folha', data, token);
}
