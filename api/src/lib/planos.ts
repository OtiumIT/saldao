/**
 * Limites por plano (Standard / Pro).
 * Usado na API para validar criação de usuários e clientes.
 */

export type PlanId = 'standard' | 'pro';

export interface PlanLimits {
  maxUsuarios: number;
  maxClientesAtivos: number;
}

const LIMITS: Record<PlanId, PlanLimits> = {
  standard: { maxUsuarios: 3, maxClientesAtivos: 5 },
  pro: { maxUsuarios: 15, maxClientesAtivos: 50 },
};

export function getPlanLimits(planId: PlanId): PlanLimits {
  return LIMITS[planId];
}
