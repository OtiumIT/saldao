import { apiClient } from '../../../shared/lib/api-client';
import type { AvisoCompra } from '../types/avisos.types';

export async function listAvisosCompra(token: string): Promise<AvisoCompra[]> {
  return apiClient.get<AvisoCompra[]>('/api/avisos-compra', token);
}
