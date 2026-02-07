import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as estoqueService from '../services/estoque.service';
import type { ProdutoComSaldo, CreateProdutoRequest, UpdateProdutoRequest } from '../types/estoque.types';
import type { FiltrosProduto } from '../services/estoque.service';

export function useProdutos(comSaldos = true, filtros?: FiltrosProduto) {
  const { token } = useAuth();
  const [produtos, setProdutos] = useState<ProdutoComSaldo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProdutos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await estoqueService.listProdutos(token, comSaldos, filtros);
      setProdutos((data as ProdutoComSaldo[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar produtos'));
    } finally {
      setLoading(false);
    }
  }, [token, comSaldos, filtros?.tipo, filtros?.categoria_id, filtros?.fornecedor_id]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const createProduto = useCallback(async (data: CreateProdutoRequest): Promise<ProdutoComSaldo> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const created = await estoqueService.createProduto(data, token);
      const withSaldo = { ...created, saldo: 0 };
      setProdutos((prev) => [...prev, withSaldo]);
      return withSaldo;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao criar produto');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateProduto = useCallback(async (id: string, data: UpdateProdutoRequest): Promise<ProdutoComSaldo> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const updated = await estoqueService.updateProduto(id, data, token);
      const p = produtos.find((x) => x.id === id);
      setProdutos((prev) => prev.map((x) => (x.id === id ? { ...updated, saldo: p?.saldo ?? 0 } : x)));
      return { ...updated, saldo: p?.saldo ?? 0 };
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao atualizar produto');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token, produtos]);

  const deleteProduto = useCallback(async (id: string): Promise<void> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      await estoqueService.deleteProduto(id, token);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao excluir produto');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const importProdutos = useCallback(async (items: CreateProdutoRequest[]): Promise<{ created: number; errors: string[] }> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const result = await estoqueService.importProdutos(items, token);
      await fetchProdutos();
      return result;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao importar');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token, fetchProdutos]);

  return {
    produtos,
    loading,
    error,
    fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto,
    importProdutos,
  };
}
