import * as repo from './funcionarios.repository.js';
import * as custosRepo from '../custos-operacionais/custos-operacionais.repository.js';

const NOME_CATEGORIA_FOLHA = 'Folha de pagamento';

export const funcionariosService = {
  listFuncionarios: repo.listFuncionarios,
  findFuncionarioById: repo.findFuncionarioById,
  createFuncionario: repo.createFuncionario,
  updateFuncionario: repo.updateFuncionario,
  removeFuncionario: repo.removeFuncionario,
  getFolhaPeriodo: repo.getFolhaPeriodo,
  totalFolhaMes: repo.totalFolhaMes,

  async upsertPagamento(
    funcionarioId: string,
    ano: number,
    mes: number,
    valorPago: number,
    observacao: string | null
  ): Promise<{ pagamento: repo.PagamentoComFuncionario | null; error?: string }> {
    const funcionario = await repo.findFuncionarioById(funcionarioId);
    if (!funcionario) return { pagamento: null, error: 'Funcionário não encontrado' };
    if (valorPago !== funcionario.salario && (observacao == null || String(observacao).trim() === '')) {
      return { pagamento: null, error: 'Quando o valor pago for diferente do salário, a observação é obrigatória (ex.: faltas, horas extras).' };
    }
    const pagamento = await repo.upsertPagamento(funcionarioId, ano, mes, valorPago, observacao?.trim() || null);
    if (pagamento) await this.syncFolhaToCustos(ano, mes);
    return { pagamento };
  },

  /** Salva vários pagamentos do mês e atualiza o custo operacional da folha. */
  async saveFolhaMes(
    ano: number,
    mes: number,
    itens: Array<{ funcionario_id: string; valor_pago: number; observacao?: string | null }>
  ): Promise<{ pagamentos: repo.PagamentoComFuncionario[]; error?: string }> {
    const funcionarios = await repo.listFuncionarios(true);
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
      await repo.upsertPagamento(it.funcionario_id, ano, mes, it.valor_pago, it.observacao?.trim() ?? null);
    }
    await this.syncFolhaToCustos(ano, mes);
    const { pagamentos } = await repo.getFolhaPeriodo(ano, mes);
    return { pagamentos };
  },

  /** Atualiza o valor da categoria "Folha de pagamento" nos custos do mês com o total dos pagamentos. */
  async syncFolhaToCustos(ano: number, mes: number): Promise<void> {
    const categorias = await custosRepo.listCategorias();
    const catFolha = categorias.find((c) => c.nome === NOME_CATEGORIA_FOLHA);
    if (!catFolha) return;
    const total = await repo.totalFolhaMes(ano, mes);
    await custosRepo.upsertCustosMes(ano, mes, [
      { categoria_id: catFolha.id, valor_planejado: total, valor_realizado: total },
    ]);
  },
};
