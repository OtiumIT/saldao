import type { Env } from '../../types/worker-env.js';
import { useSupabaseDataAPI } from '../../config/db-mode.js';
import * as repo from './funcionarios.repository.js';
import * as repoSupabase from './funcionarios.repository.supabase.js';
import { custosOperacionaisService } from '../custos-operacionais/custos-operacionais.service.js';

const NOME_CATEGORIA_FOLHA = 'Folha de pagamento';

export const funcionariosService = {
  listFuncionarios: (env: Env, apenasAtivos?: boolean) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.listFuncionarios(env, apenasAtivos);
    }
    return repo.listFuncionarios(apenasAtivos);
  },
  findFuncionarioById: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.findFuncionarioById(env, id);
    }
    return repo.findFuncionarioById(id);
  },
  createFuncionario: (env: Env, data: Parameters<typeof repo.createFuncionario>[0]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.createFuncionario(env, data);
    }
    return repo.createFuncionario(data);
  },
  updateFuncionario: (env: Env, id: string, data: Parameters<typeof repo.updateFuncionario>[1]) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.updateFuncionario(env, id, data);
    }
    return repo.updateFuncionario(id, data);
  },
  removeFuncionario: (env: Env, id: string) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.removeFuncionario(env, id);
    }
    return repo.removeFuncionario(id);
  },
  getFolhaPeriodo: (env: Env, ano: number, mes: number) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.getFolhaPeriodo(env, ano, mes);
    }
    return repo.getFolhaPeriodo(ano, mes);
  },
  totalFolhaMes: (env: Env, ano: number, mes: number) => {
    if (useSupabaseDataAPI(env)) {
      return repoSupabase.totalFolhaMes(env, ano, mes);
    }
    return repo.totalFolhaMes(ano, mes);
  },

  async upsertPagamento(
    env: Env,
    funcionarioId: string,
    ano: number,
    mes: number,
    valorPago: number,
    observacao: string | null
  ): Promise<{ pagamento: repo.PagamentoComFuncionario | null; error?: string }> {
    const funcionario = useSupabaseDataAPI(env)
      ? await repoSupabase.findFuncionarioById(env, funcionarioId)
      : await repo.findFuncionarioById(funcionarioId);
    if (!funcionario) return { pagamento: null, error: 'Funcionário não encontrado' };
    if (valorPago !== funcionario.salario && (observacao == null || String(observacao).trim() === '')) {
      return { pagamento: null, error: 'Quando o valor pago for diferente do salário, a observação é obrigatória (ex.: faltas, horas extras).' };
    }
    const pagamento = useSupabaseDataAPI(env)
      ? await repoSupabase.upsertPagamento(env, funcionarioId, ano, mes, valorPago, observacao?.trim() || null)
      : await repo.upsertPagamento(funcionarioId, ano, mes, valorPago, observacao?.trim() || null);
    if (pagamento) await this.syncFolhaToCustos(env, ano, mes);
    return { pagamento };
  },

  /** Salva vários pagamentos do mês e atualiza o custo operacional da folha. */
  async saveFolhaMes(
    env: Env,
    ano: number,
    mes: number,
    itens: Array<{ funcionario_id: string; valor_pago: number; observacao?: string | null }>
  ): Promise<{ pagamentos: repo.PagamentoComFuncionario[]; error?: string }> {
    const funcionarios = useSupabaseDataAPI(env)
      ? await repoSupabase.listFuncionarios(env, true)
      : await repo.listFuncionarios(true);
    const byId = new Map(funcionarios.map((f) => [f.id, f]));
    for (const it of itens) {
      const f = byId.get(it.funcionario_id);
      if (!f) continue;
      if (it.valor_pago !== f.salario && (it.observacao == null || String(it.observacao).trim() === '')) {
        return {
          pagamentos: [],
          error: `Funcionário "${f.nome}": valor pago diferente do salário exige observação (faltas, horas extras, etc.).`,
        };
      }
    }
    for (const it of itens) {
      if (useSupabaseDataAPI(env)) {
        await repoSupabase.upsertPagamento(env, it.funcionario_id, ano, mes, it.valor_pago, it.observacao?.trim() ?? null);
      } else {
        await repo.upsertPagamento(it.funcionario_id, ano, mes, it.valor_pago, it.observacao?.trim() ?? null);
      }
    }
    await this.syncFolhaToCustos(env, ano, mes);
    const { pagamentos } = useSupabaseDataAPI(env)
      ? await repoSupabase.getFolhaPeriodo(env, ano, mes)
      : await repo.getFolhaPeriodo(ano, mes);
    return { pagamentos };
  },

  /** Atualiza o valor da categoria "Folha de pagamento" nos custos do mês com o total dos pagamentos. */
  async syncFolhaToCustos(env: Env, ano: number, mes: number): Promise<void> {
    const categorias = await custosOperacionaisService.listCategorias(env);
    const catFolha = categorias.find((c) => c.nome === NOME_CATEGORIA_FOLHA);
    if (!catFolha) return;
    const total = useSupabaseDataAPI(env)
      ? await repoSupabase.totalFolhaMes(env, ano, mes)
      : await repo.totalFolhaMes(ano, mes);
    await custosOperacionaisService.upsertCustosMes(env, ano, mes, [
      { categoria_id: catFolha.id, valor_planejado: total, valor_realizado: total },
    ]);
  },
};
