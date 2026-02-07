import * as repo from './produtos.repository.js';
import type { FiltrosProduto } from './produtos.repository.js';

export const produtosService = {
  list: (filtros?: FiltrosProduto) => repo.list(filtros),
  listComSaldos: (filtros?: FiltrosProduto) => repo.listComSaldos(filtros),
  findById: repo.findById,
  findByCodigo: repo.findByCodigo,
  create: repo.create,
  update: repo.update,
  remove: repo.remove,
  createMany: repo.createMany,
  getSugestaoEstoque: repo.getSugestaoEstoque,
  getSaldosPorCor: repo.getSaldosPorCor,
};
