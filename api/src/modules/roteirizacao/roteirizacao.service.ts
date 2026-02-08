import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './roteirizacao.repository.js';
import * as repoSupabase from './roteirizacao.repository.supabase.js';

export const roteirizacaoService = {
  listVeiculos: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listVeiculos(env);
    }
    return repo.listVeiculos();
  },
  findVeiculoById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findVeiculoById(env, id);
    }
    return repo.findVeiculoById(id);
  },
  createVeiculo: (env: Env, data: Parameters<typeof repo.createVeiculo>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createVeiculo(env, data);
    }
    return repo.createVeiculo(data);
  },
  updateVeiculo: (env: Env, id: string, data: Parameters<typeof repo.updateVeiculo>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.updateVeiculo(env, id, data);
    }
    return repo.updateVeiculo(id, data);
  },
  listEntregas: (env: Env, filtros?: Parameters<typeof repo.listEntregas>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listEntregas(env, filtros);
    }
    return repo.listEntregas(filtros);
  },
  listPedidosPendentesEntrega: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listPedidosPendentesEntrega(env);
    }
    return repo.listPedidosPendentesEntrega();
  },
  createEntrega: (env: Env, data: Parameters<typeof repo.createEntrega>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createEntrega(env, data);
    }
    return repo.createEntrega(data);
  },
  updateEntrega: (env: Env, id: string, data: Parameters<typeof repo.updateEntrega>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.updateEntrega(env, id, data);
    }
    return repo.updateEntrega(id, data);
  },
  marcarEntregue: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.marcarEntregue(env, id);
    }
    return repo.marcarEntregue(id);
  },
  listEntregasAfetadasPorVeiculoInoperante: (env: Env, veiculoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listEntregasAfetadasPorVeiculoInoperante(env, veiculoId);
    }
    return repo.listEntregasAfetadasPorVeiculoInoperante(veiculoId);
  },
  reagendarEntregas: (env: Env, entregaIds: string[], novoVeiculoId: string | null, novaData: string | null) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.reagendarEntregas(env, entregaIds, novoVeiculoId, novaData);
    }
    return repo.reagendarEntregas(entregaIds, novoVeiculoId, novaData);
  },
  sugerirOrdemRota: (env: Env, veiculoId: string, dataEntrega: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.sugerirOrdemRota(env, veiculoId, dataEntrega);
    }
    return repo.sugerirOrdemRota(veiculoId, dataEntrega);
  },
  aplicarOrdemRota: (env: Env, entregaIdsOrdenados: string[]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.aplicarOrdemRota(env, entregaIdsOrdenados);
    }
    return repo.aplicarOrdemRota(entregaIdsOrdenados);
  },
};

/** Marca veículo como inoperante e retorna as entregas afetadas. */
export async function marcarVeiculoInoperante(
  env: Env,
  veiculoId: string,
  motivo: string | null
): Promise<{ veiculo: repo.Veiculo | null; entregasAfetadas: repo.EntregaComPedido[] }> {
  const veiculo = useSupabaseDataAPI(env)
    ? await repoSupabase.updateVeiculo(env, veiculoId, {
        inoperante: true,
        inoperante_desde: new Date().toISOString(),
        inoperante_motivo: motivo ?? null,
      })
    : await repo.updateVeiculo(veiculoId, {
        inoperante: true,
        inoperante_desde: new Date().toISOString(),
        inoperante_motivo: motivo ?? null,
      });
  const entregasAfetadas = veiculo
    ? useSupabaseDataAPI(env)
      ? await repoSupabase.listEntregasAfetadasPorVeiculoInoperante(env, veiculoId)
      : await repo.listEntregasAfetadasPorVeiculoInoperante(veiculoId)
    : [];
  return { veiculo: veiculo ?? null, entregasAfetadas };
}
