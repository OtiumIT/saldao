import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as categoriasService from '../services/categorias-produto.service';
import type { CategoriaProduto } from '../types/categorias-produto.types';

export function useCategoriasProduto() {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategorias = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await categoriasService.listCategoriasProduto(token);
      setCategorias(list);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar categorias'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loading, error, fetchCategorias };
}
