import type { Env } from '../../types/worker-env.js';
import { getEnv } from '../../config/env.worker.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import { calcularDistanciaKm } from '../../lib/google-maps.js';
import * as repo from './vendas.repository.js';
import * as repoSupabase from './vendas.repository.supabase.js';
import { opcoesEntregaService } from '../opcoes-entrega/opcoes-entrega.service.js';

type CreateData = Parameters<typeof repo.create>[0] & {
  opcoes_entrega_selecionadas?: Array<{ opcao_id: string; andar?: number }>;
  valor_extras_livre?: number | null;
};

async function computeValorExtrasEntrega(
  env: Env,
  selecionadas: Array<{ opcao_id: string; andar?: number }>
): Promise<number> {
  let total = 0;
  for (const s of selecionadas) {
    const opcao = await opcoesEntregaService.findById(env, s.opcao_id);
    if (!opcao || !opcao.ativo) continue;
    if (opcao.tipo === 'fixo' && opcao.valor_fixo != null) {
      total += Number(opcao.valor_fixo);
    } else if (opcao.tipo === 'por_andar' && opcao.valor_por_andar != null) {
      const andar = s.andar ?? 0;
      total += Number(opcao.valor_por_andar) * Math.max(0, andar);
    }
  }
  return Math.round(total * 100) / 100;
}

export const vendasService = {
  list: (env: Env, filtros?: Parameters<typeof repo.list>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.list(env, filtros);
    }
    return repo.list(filtros);
  },
  getTotais: (env: Env) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getTotais(env);
    }
    return repo.getTotais();
  },
  findById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findById(env, id);
    }
    return repo.findById(id);
  },
  listItens: (env: Env, pedidoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listItens(env, pedidoId);
    }
    return repo.listItens(pedidoId);
  },
  create: async (env: Env, data: CreateData) => {
    const valorExtras =
      data.opcoes_entrega_selecionadas && data.opcoes_entrega_selecionadas.length > 0
        ? await computeValorExtrasEntrega(env, data.opcoes_entrega_selecionadas)
        : 0;
    const payload = {
      ...data,
      valor_extras_entrega: valorExtras,
      valor_extras_livre: data.valor_extras_livre ?? null,
      opcoes_entrega_selecionadas: data.opcoes_entrega_selecionadas ?? null,
    };
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.create(env, payload);
    }
    return repo.create(payload);
  },
  update: (env: Env, id: string, data: Parameters<typeof repo.update>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.update(env, id, data);
    }
    return repo.update(id, data);
  },
  confirmar: (env: Env, id: string, options?: Parameters<typeof repo.confirmar>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.confirmar(env, id, options);
    }
    return repo.confirmar(id, options);
  },
  marcarEntregue: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.marcarEntregue(env, id);
    }
    return repo.marcarEntregue(id);
  },
  cancelar: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.cancelar(env, id);
    }
    return repo.cancelar(id);
  },
  getPrecoSugerido: (env: Env, produtoId: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getPrecoSugerido(env, produtoId);
    }
    return repo.getPrecoSugerido(produtoId);
  },
  getItensSugeridos: (env: Env, produtoId: string, limit?: number) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getItensSugeridos(env, produtoId, limit);
    }
    return repo.getItensSugeridos(produtoId, limit);
  },
  getRelatorioVendas: (env: Env, filtros: Parameters<typeof repo.getRelatorioVendas>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getRelatorioVendas(env, filtros);
    }
    return repo.getRelatorioVendas(filtros);
  },
  async calcularDistancia(env: Env, enderecoDestino: string): Promise<{ km: number }> {
    const config = getEnv(env);
    if (!config.googleMaps.apiKey || !config.googleMaps.enderecoOrigemLoja) {
      throw new Error('Distância por endereço não configurada. Configure GOOGLE_MAPS_API_KEY e ENDERECO_ORIGEM_LOJA na API.');
    }
    const { km } = await calcularDistanciaKm(
      config.googleMaps.apiKey,
      config.googleMaps.enderecoOrigemLoja,
      enderecoDestino
    );
    return { km };
  },
};
