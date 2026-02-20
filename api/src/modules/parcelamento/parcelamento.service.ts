import type { Env } from '../../types/worker-env.js';
import * as repo from './parcelamento.repository.js';

export const parcelamentoService = {
  list: (env: Env) => repo.list(),
  findById: (env: Env, id: string) => repo.findById(id),
  findByParcelas: (env: Env, parcelas: number) => repo.findByParcelas(parcelas),
  update: (env: Env, id: string, data: { taxa_percentual: number }) => repo.update(id, data),
  updateByParcelas: (env: Env, parcelas: number, taxa_percentual: number) =>
    repo.updateByParcelas(parcelas, taxa_percentual),
};
