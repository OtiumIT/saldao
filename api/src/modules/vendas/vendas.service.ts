import * as repo from './vendas.repository.js';

export const vendasService = {
  list: repo.list,
  findById: repo.findById,
  listItens: repo.listItens,
  create: repo.create,
  update: repo.update,
  confirmar: repo.confirmar,
  marcarEntregue: repo.marcarEntregue,
  getPrecoSugerido: repo.getPrecoSugerido,
  getItensSugeridos: repo.getItensSugeridos,
};
