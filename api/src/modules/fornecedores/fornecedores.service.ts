import * as repo from './fornecedores.repository.js';

export const fornecedoresService = {
  list: repo.list,
  findById: repo.findById,
  create: repo.create,
  update: repo.update,
  remove: repo.remove,
};
