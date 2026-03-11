import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as clientesService from '../services/clientes.service';
import type { Cliente, ClienteCompleto, CreateClienteRequest, UpdateClienteRequest } from '../types/clients.types';

export function useClients() {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modoCompleto, setModoCompleto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCompleto, setLoadingCompleto] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClientes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await clientesService.listClientes(token);
      setClientes(data);
      setModoCompleto(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar clientes'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchClientesCompleto = useCallback(async () => {
    if (!token) return;
    setLoadingCompleto(true);
    setError(null);
    try {
      const data = await clientesService.listClientesCompleto(token);
      setClientes(data);
      setModoCompleto(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar dados completos'));
    } finally {
      setLoadingCompleto(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const createCliente = useCallback(async (data: CreateClienteRequest): Promise<Cliente> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const created = await clientesService.createCliente(data, token);
      const toAdd = modoCompleto
        ? { ...created, data_ultima_compra: null, total_compras: 0, total_gasto: 0 }
        : created;
      setClientes(prev => [...prev, toAdd]);
      return created;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao criar cliente');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token, modoCompleto]);

  const updateCliente = useCallback(async (id: string, data: UpdateClienteRequest): Promise<Cliente> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const updated = await clientesService.updateCliente(id, data, token);
      setClientes(prev =>
        prev.map(c =>
          c.id === id
            ? modoCompleto && 'data_ultima_compra' in c
              ? { ...updated, data_ultima_compra: (c as ClienteCompleto).data_ultima_compra, total_compras: (c as ClienteCompleto).total_compras, total_gasto: (c as ClienteCompleto).total_gasto }
              : updated
            : c
        )
      );
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao atualizar cliente');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token, modoCompleto]);

  const deleteCliente = useCallback(async (id: string): Promise<void> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      await clientesService.deleteCliente(id, token);
      setClientes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao excluir cliente');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    clientes,
    modoCompleto,
    loading,
    loadingCompleto,
    error,
    fetchClientes,
    fetchClientesCompleto,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}
