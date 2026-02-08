import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as vendasService from '../services/vendas.service';
import type { PedidoVendaComCliente, CreatePedidoVendaRequest } from '../types/vendas.types';

export function useVendas(params?: { status?: string; data_inicio?: string; data_fim?: string }) {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoVendaComCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPedidos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vendasService.listPedidosVenda(token, params);
      setPedidos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar vendas'));
    } finally {
      setLoading(false);
    }
  }, [token, params?.status, params?.data_inicio, params?.data_fim]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const createPedido = useCallback(async (data: CreatePedidoVendaRequest): Promise<PedidoVendaComCliente> => {
    if (!token) throw new Error('Não autenticado');
    const created = await vendasService.createPedidoVenda(data, token);
    setPedidos((prev) => [created, ...prev]);
    return created;
  }, [token]);

  const confirmar = useCallback(async (id: string, previsaoEntregaDias?: number | null): Promise<PedidoVendaComCliente> => {
    if (!token) throw new Error('Não autenticado');
    const updated = await vendasService.confirmarPedidoVenda(id, token, { previsao_entrega_em_dias: previsaoEntregaDias });
    setPedidos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, [token]);

  const marcarEntregue = useCallback(async (id: string): Promise<PedidoVendaComCliente> => {
    if (!token) throw new Error('Não autenticado');
    const updated = await vendasService.marcarEntregue(id, token);
    setPedidos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, [token]);

  const cancelar = useCallback(async (id: string): Promise<PedidoVendaComCliente> => {
    if (!token) throw new Error('Não autenticado');
    const updated = await vendasService.cancelarPedidoVenda(id, token);
    setPedidos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, [token]);

  return { pedidos, loading, error, fetchPedidos, createPedido, confirmar, marcarEntregue, cancelar };
}
