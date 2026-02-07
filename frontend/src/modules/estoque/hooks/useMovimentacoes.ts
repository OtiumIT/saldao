import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as estoqueService from '../services/estoque.service';
import type { MovimentacaoComProduto } from '../types/estoque.types';

export interface FiltrosMovimentacao {
  produto_id?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo?: string;
}

export function useMovimentacoes(filtros?: FiltrosMovimentacao) {
  const { token } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoComProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMovimentacoes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await estoqueService.listMovimentacoes(token, filtros);
      setMovimentacoes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar movimentações'));
    } finally {
      setLoading(false);
    }
  }, [token, filtros?.produto_id, filtros?.data_inicio, filtros?.data_fim, filtros?.tipo]);

  useEffect(() => {
    fetchMovimentacoes();
  }, [fetchMovimentacoes]);

  const criarAjuste = useCallback(
    async (produto_id: string, quantidade: number, observacao?: string, cor_id?: string | null) => {
      if (!token) throw new Error('Não autenticado');
      setLoading(true);
      setError(null);
      try {
        await estoqueService.criarAjuste(token, produto_id, quantidade, observacao, cor_id);
        await fetchMovimentacoes();
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Erro ao registrar ajuste');
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchMovimentacoes]
  );

  const conferenciaLote = useCallback(
    async (itens: Array<{ produto_id: string; saldo_atual: number }>) => {
      if (!token) throw new Error('Não autenticado');
      setLoading(true);
      setError(null);
      try {
        const result = await estoqueService.conferenciaLote(token, itens);
        await fetchMovimentacoes();
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Erro na conferência');
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchMovimentacoes]
  );

  return {
    movimentacoes,
    loading,
    error,
    fetchMovimentacoes,
    criarAjuste,
    conferenciaLote,
  };
}
