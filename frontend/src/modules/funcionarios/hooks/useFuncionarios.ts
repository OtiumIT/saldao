import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as funcionariosService from '../services/funcionarios.service';
import type {
  Funcionario,
  CreateFuncionarioRequest,
  UpdateFuncionarioRequest,
  FolhaPeriodo,
  SaveFolhaRequest,
} from '../types/funcionarios.types';

export function useFuncionarios(apenasAtivos = false) {
  const { token } = useAuth();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFuncionarios = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await funcionariosService.listFuncionarios(token, apenasAtivos);
      setFuncionarios(list);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar funcionários'));
    } finally {
      setLoading(false);
    }
  }, [token, apenasAtivos]);

  useEffect(() => {
    fetchFuncionarios();
  }, [fetchFuncionarios]);

  const createFuncionario = useCallback(
    async (data: CreateFuncionarioRequest): Promise<Funcionario> => {
      if (!token) throw new Error('Não autenticado');
      const created = await funcionariosService.createFuncionario(data, token);
      setFuncionarios((prev) => [...prev, created]);
      return created;
    },
    [token]
  );

  const updateFuncionario = useCallback(
    async (id: string, data: UpdateFuncionarioRequest): Promise<Funcionario> => {
      if (!token) throw new Error('Não autenticado');
      const updated = await funcionariosService.updateFuncionario(id, data, token);
      setFuncionarios((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    },
    [token]
  );

  const deleteFuncionario = useCallback(
    async (id: string): Promise<void> => {
      if (!token) throw new Error('Não autenticado');
      await funcionariosService.deleteFuncionario(id, token);
      setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    },
    [token]
  );

  return {
    funcionarios,
    loading,
    error,
    fetchFuncionarios,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
  };
}

export function useFolhaMes(ano: number, mes: number) {
  const { token } = useAuth();
  const [folha, setFolha] = useState<FolhaPeriodo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFolha = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await funcionariosService.getFolhaPeriodo(ano, mes, token);
      setFolha(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar folha'));
    } finally {
      setLoading(false);
    }
  }, [token, ano, mes]);

  useEffect(() => {
    fetchFolha();
  }, [fetchFolha]);

  const saveFolha = useCallback(
    async (data: SaveFolhaRequest): Promise<void> => {
      if (!token) throw new Error('Não autenticado');
      const result = await funcionariosService.saveFolhaMes(data, token);
      setFolha((prev) => (prev ? { ...prev, pagamentos: result.pagamentos } : null));
    },
    [token]
  );

  return { folha, loading, error, fetchFolha, saveFolha };
}
