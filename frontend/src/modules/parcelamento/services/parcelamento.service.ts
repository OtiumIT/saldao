import { apiClient } from '../../../shared/lib/api-client';
import type { OpcaoParcelamento, UpdateTaxaParcelamentoRequest } from '../types/parcelamento.types';

export async function listOpcoesParcelamento(token: string): Promise<OpcaoParcelamento[]> {
  return apiClient.get<OpcaoParcelamento[]>('/api/parcelamento', token);
}

export async function getOpcaoPorParcelas(parcelas: number, token: string): Promise<OpcaoParcelamento> {
  return apiClient.get<OpcaoParcelamento>(`/api/parcelamento/por-parcelas/${parcelas}`, token);
}

export async function updateTaxaParcelamento(
  id: string,
  data: UpdateTaxaParcelamentoRequest,
  token: string
): Promise<OpcaoParcelamento> {
  return apiClient.patch<OpcaoParcelamento>(`/api/parcelamento/${id}`, data, token);
}

export async function updateTaxaPorParcelas(
  parcelas: number,
  data: UpdateTaxaParcelamentoRequest,
  token: string
): Promise<OpcaoParcelamento> {
  return apiClient.patch<OpcaoParcelamento>(`/api/parcelamento/por-parcelas/${parcelas}`, data, token);
}
