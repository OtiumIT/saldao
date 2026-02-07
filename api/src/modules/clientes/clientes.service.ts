import * as repo from './clientes.repository.js';

export const clientesService = {
  list: repo.list,
  findById: repo.findById,
  findLoja: repo.findLoja,
  create: repo.create,
  update: repo.update,
  remove: repo.remove,
};
