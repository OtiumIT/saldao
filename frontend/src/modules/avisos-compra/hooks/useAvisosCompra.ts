import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as avisosService from '../services/avisos-compra.service';
import type { AvisoCompra } from '../types/avisos.types';

export function useAvisosCompra() {
  const { token } = useAuth();
  const [avisos, setAvisos] = useState<AvisoCompra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvisos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await avisosService.listAvisosCompra(token);
      setAvisos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar avisos'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAvisos();
  }, [fetchAvisos]);

  return { avisos, loading, error, fetchAvisos };
}
