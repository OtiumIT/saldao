import { apiClient } from '../../../shared/lib/api-client';
import type {
  PedidoCompraComFornecedor,
  PedidoCompraComItens,
  CreatePedidoCompraRequest,
  ReceberItemRequest,
} from '../types/compras.types';

export async function listPedidosCompra(token: string): Promise<PedidoCompraComFornecedor[]> {
  return apiClient.get<PedidoCompraComFornecedor[]>('/api/compras', token);
}

export async function getPedidoCompra(id: string, token: string): Promise<PedidoCompraComItens> {
  return apiClient.get<PedidoCompraComItens>(`/api/compras/${id}`, token);
}

export async function createPedidoCompra(data: CreatePedidoCompraRequest, token: string): Promise<PedidoCompraComFornecedor> {
  return apiClient.post<PedidoCompraComFornecedor>('/api/compras', data, token);
}

export async function updatePedidoCompra(
  id: string,
  data: Partial<CreatePedidoCompraRequest> & { itens?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }> },
  token: string
): Promise<PedidoCompraComFornecedor> {
  return apiClient.patch<PedidoCompraComFornecedor>(`/api/compras/${id}`, data, token);
}

export async function receberPedidoCompra(id: string, itens: ReceberItemRequest[], token: string): Promise<PedidoCompraComFornecedor> {
  return apiClient.post<PedidoCompraComFornecedor>(`/api/compras/${id}/receber`, { itens }, token);
}

export interface PurchaseOrderExtraction {
  fornecedor_nome?: string | null;
  data_pedido?: string | null;
  itens: Array<{ descricao?: string; codigo?: string; quantidade: number; preco_unitario: number }>;
  total?: number | null;
  observacoes?: string | null;
}

export async function extractCompraFromImage(imageBase64: string, token: string): Promise<PurchaseOrderExtraction> {
  return apiClient.post<PurchaseOrderExtraction>('/api/compras/extract-from-image', { imageBase64 }, token);
}

export async function extractCompraFromAudio(audioBase64: string, token: string): Promise<PurchaseOrderExtraction> {
  return apiClient.post<PurchaseOrderExtraction>('/api/compras/extract-from-audio', { audioBase64 }, token);
}

/** Último preço pago por produto para um fornecedor (para preencher pedido) */
export async function getUltimosPrecos(fornecedorId: string, token: string): Promise<Record<string, number>> {
  return apiClient.get<Record<string, number>>(
    `/api/compras/ultimos-precos?fornecedor_id=${encodeURIComponent(fornecedorId)}`,
    token
  );
}

export interface ImportExcelRow {
  codigo?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  preco_revenda?: number;
}

export interface ImportFromExcelResult {
  pedido_id: string;
  produtos_criados: number;
}

export async function importFromExcel(
  data: { fornecedor_id: string; data_pedido?: string; observacoes?: string | null; rows: ImportExcelRow[] },
  token: string
): Promise<ImportFromExcelResult> {
  return apiClient.post<ImportFromExcelResult>('/api/compras/import-from-excel', data, token);
}
