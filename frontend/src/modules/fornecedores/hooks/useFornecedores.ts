import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as fornecedoresService from '../services/fornecedores.service';
import type { Fornecedor, CreateFornecedorRequest, UpdateFornecedorRequest, TipoFornecedor } from '../types/suppliers.types';

export function useFornecedores(filtroTipo?: TipoFornecedor | null) {
  const { token } = useAuth();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFornecedores = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fornecedoresService.listFornecedores(token, filtroTipo);
      setFornecedores(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar fornecedores'));
    } finally {
      setLoading(false);
    }
  }, [token, filtroTipo]);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  const createFornecedor = useCallback(async (data: CreateFornecedorRequest): Promise<Fornecedor> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const created = await fornecedoresService.createFornecedor(data, token);
      setFornecedores(prev => [...prev, created]);
      return created;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao criar fornecedor');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateFornecedor = useCallback(async (id: string, data: UpdateFornecedorRequest): Promise<Fornecedor> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const updated = await fornecedoresService.updateFornecedor(id, data, token);
      setFornecedores(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao atualizar fornecedor');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteFornecedor = useCallback(async (id: string): Promise<void> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      await fornecedoresService.deleteFornecedor(id, token);
      setFornecedores(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao excluir fornecedor');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    fornecedores,
    loading,
    error,
    fetchFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
  };
}
