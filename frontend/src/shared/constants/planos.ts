/**
 * Planos disponíveis para exibição e validação de limites.
 * Apenas Standard e Pro. Enterprise e Customizado foram removidos.
 * Itens internos (SPED, ECD, PGDAS, Analytics, etc.) não são exibidos.
 */

export type PlanoId = 'standard' | 'pro';

export interface Plano {
  id: PlanoId;
  nome: string;
  maxUsuarios: number;
  maxClientesAtivos: number;
}

export const PLANOS: Plano[] = [
  {
    id: 'standard',
    nome: 'Standard',
    maxUsuarios: 3,
    maxClientesAtivos: 5,
  },
  {
    id: 'pro',
    nome: 'Pro',
    maxUsuarios: 15,
    maxClientesAtivos: 50,
  },
];

export function getPlano(id: PlanoId): Plano | undefined {
  return PLANOS.find((p) => p.id === id);
}
