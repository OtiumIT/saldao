import * as repo from './financeiro.repository.js';

export const financeiroService = {
  listContasPagar: repo.listContasPagar,
  listContasReceber: repo.listContasReceber,
  createContaPagar: repo.createContaPagar,
  createContaReceber: repo.createContaReceber,
  marcarPago: repo.marcarPago,
  marcarRecebido: repo.marcarRecebido,
  resumoFinanceiro: repo.resumoFinanceiro,
};
