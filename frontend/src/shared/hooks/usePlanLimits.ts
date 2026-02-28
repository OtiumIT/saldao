import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../../modules/auth/hooks/useAuth';

export interface PlanLimitsResponse {
  planId: 'standard' | 'pro';
  maxUsuarios: number;
  maxClientesAtivos: number;
}

export function usePlanLimits() {
  const { token } = useAuth();
  const [limits, setLimits] = useState<PlanLimitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLimits = useCallback(async () => {
    if (!token) {
      setLimits(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<PlanLimitsResponse>('/api/config/plan', token);
      setLimits(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar limites do plano'));
      setLimits(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  return { limits, loading, error, refetch: fetchLimits };
}
