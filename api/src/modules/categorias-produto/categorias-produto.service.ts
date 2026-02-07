import * as repo from './categorias-produto.repository.js';

export const categoriasProdutoService = {
  list: repo.list,
  findById: repo.findById,
  create: repo.create,
  update: repo.update,
  remove: repo.remove,
};
