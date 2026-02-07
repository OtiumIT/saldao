import * as repo from './compras.repository.js';

export const comprasService = {
  list: repo.list,
  findById: repo.findById,
  listItens: repo.listItens,
  createPedido: repo.createPedido,
  updatePedido: repo.updatePedido,
  receber: repo.receber,
  getUltimosPrecos: repo.getUltimosPrecos,
};
