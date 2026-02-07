import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as clientesService from '../services/clientes.service';
import type { Cliente, CreateClienteRequest, UpdateClienteRequest } from '../types/clients.types';

export function useClients() {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchClientes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await clientesService.listClientes(token);
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar clientes'));
    } finally {
      setLoading(false);
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
      setClientes(prev => [...prev, created]);
      return created;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao criar cliente');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateCliente = useCallback(async (id: string, data: UpdateClienteRequest): Promise<Cliente> => {
    if (!token) throw new Error('Não autenticado');
    setLoading(true);
    setError(null);
    try {
      const updated = await clientesService.updateCliente(id, data, token);
      setClientes(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Erro ao atualizar cliente');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}
