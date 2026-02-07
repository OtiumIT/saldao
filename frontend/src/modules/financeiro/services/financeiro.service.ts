import { apiClient } from '../../../shared/lib/api-client';
import type { ContaPagar, ContaReceber, ResumoFinanceiro } from '../types/financeiro.types';

export async function listContasPagar(token: string, params?: { status?: string; data_inicio?: string; data_fim?: string }): Promise<ContaPagar[]> {
  const q = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiClient.get<ContaPagar[]>(`/api/financeiro/contas-a-pagar${q ? `?${q}` : ''}`, token);
}

export async function createContaPagar(
  token: string,
  data: { descricao: string; valor: number; vencimento: string; forma_pagamento?: string | null }
): Promise<ContaPagar> {
  return apiClient.post<ContaPagar>('/api/financeiro/contas-a-pagar', data, token);
}

export async function marcarPago(token: string, id: string): Promise<ContaPagar> {
  return apiClient.post<ContaPagar>(`/api/financeiro/contas-a-pagar/${id}/pago`, {}, token);
}

export async function listContasReceber(token: string, params?: { status?: string; data_inicio?: string; data_fim?: string }): Promise<ContaReceber[]> {
  const q = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiClient.get<ContaReceber[]>(`/api/financeiro/contas-a-receber${q ? `?${q}` : ''}`, token);
}

export async function createContaReceber(
  token: string,
  data: { descricao: string; valor: number; vencimento: string; forma_pagamento?: string | null }
): Promise<ContaReceber> {
  return apiClient.post<ContaReceber>('/api/financeiro/contas-a-receber', data, token);
}

export async function marcarRecebido(token: string, id: string): Promise<ContaReceber> {
  return apiClient.post<ContaReceber>(`/api/financeiro/contas-a-receber/${id}/recebido`, {}, token);
}

export async function getResumo(token: string, data_inicio?: string, data_fim?: string): Promise<ResumoFinanceiro> {
  const params = new URLSearchParams();
  if (data_inicio) params.set('data_inicio', data_inicio);
  if (data_fim) params.set('data_fim', data_fim);
  const q = params.toString();
  return apiClient.get<ResumoFinanceiro>(`/api/financeiro/resumo${q ? `?${q}` : ''}`, token);
}
