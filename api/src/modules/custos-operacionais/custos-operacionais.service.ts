import * as repo from './custos-operacionais.repository.js';

export const custosOperacionaisService = {
  listCategorias: repo.listCategorias,
  listCategoriasAtivas: repo.listCategoriasAtivas,
  findCategoriaById: repo.findCategoriaById,
  createCategoria: repo.createCategoria,
  updateCategoria: repo.updateCategoria,
  removeCategoria: repo.removeCategoria,
  listCustosByPeriodo: repo.listCustosByPeriodo,
  getOrCreateCusto: repo.getOrCreateCusto,
  upsertCustosMes: repo.upsertCustosMes,
  totalCustosMes: repo.totalCustosMes,
};
