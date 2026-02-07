import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as comprasService from '../services/compras.service';
import type {
  PedidoCompraComFornecedor,
  CreatePedidoCompraRequest,
  ReceberItemRequest,
} from '../types/compras.types';

export function useCompras() {
  const { token } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoCompraComFornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPedidos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await comprasService.listPedidosCompra(token);
      setPedidos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar pedidos'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const createPedido = useCallback(async (data: CreatePedidoCompraRequest): Promise<PedidoCompraComFornecedor> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const created = await comprasService.createPedidoCompra(data, token);
      setPedidos((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao criar pedido');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updatePedido = useCallback(async (id: string, data: Partial<CreatePedidoCompraRequest> & { itens?: Array<{ produto_id: string; quantidade: number; preco_unitario: number }> }): Promise<PedidoCompraComFornecedor> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const updated = await comprasService.updatePedidoCompra(id, data, token);
      setPedidos((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao atualizar pedido');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const receberPedido = useCallback(async (id: string, itens: ReceberItemRequest[]): Promise<PedidoCompraComFornecedor> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const updated = await comprasService.receberPedidoCompra(id, itens, token);
      setPedidos((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao receber pedido');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    pedidos,
    loading,
    error,
    fetchPedidos,
    createPedido,
    updatePedido,
    receberPedido,
  };
}
